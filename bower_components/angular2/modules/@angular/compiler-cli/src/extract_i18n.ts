#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Extract i18n messages from source code
 *
 * TODO(vicb): factorize code with the CodeGenerator
 */
// Must be imported first, because angular2 decorators throws on load.
import 'reflect-metadata';

import * as compiler from '@angular/compiler';
import {ComponentMetadata, NgModuleMetadata, ViewEncapsulation} from '@angular/core';
import * as path from 'path';
import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import {CompileMetadataResolver, DirectiveNormalizer, DomElementSchemaRegistry, HtmlParser, Lexer, NgModuleCompiler, Parser, StyleCompiler, TemplateParser, TypeScriptEmitter, ViewCompiler, ParseError} from './compiler_private';
import {Console} from './core_private';
import {ReflectorHost, ReflectorHostContext} from './reflector_host';
import {StaticAndDynamicReflectionCapabilities} from './static_reflection_capabilities';
import {StaticReflector, StaticSymbol} from './static_reflector';

function extract(
    ngOptions: tsc.AngularCompilerOptions, program: ts.Program, host: ts.CompilerHost) {
  const extractor = Extractor.create(ngOptions, program, host);
  const bundlePromise: Promise<compiler.i18n.MessageBundle> = extractor.extract();

  return (bundlePromise).then(messageBundle => {
    const serializer = new compiler.i18n.Xmb();
    const dstPath = path.join(ngOptions.genDir, 'messages.xmb');
    host.writeFile(dstPath, messageBundle.write(serializer), false);
  });
}

const GENERATED_FILES = /\.ngfactory\.ts$|\.css\.ts$|\.css\.shim\.ts$/;

export class Extractor {
  constructor(
      private program: ts.Program, public host: ts.CompilerHost,
      private staticReflector: StaticReflector, private messageBundle: compiler.i18n.MessageBundle,
      private reflectorHost: ReflectorHost, private metadataResolver: CompileMetadataResolver,
      private directiveNormalizer: DirectiveNormalizer,
      private compiler: compiler.OfflineCompiler) {}

  private readFileMetadata(absSourcePath: string): FileMetadata {
    const moduleMetadata = this.staticReflector.getModuleMetadata(absSourcePath);
    const result: FileMetadata = {components: [], ngModules: [], fileUrl: absSourcePath};
    if (!moduleMetadata) {
      console.log(`WARNING: no metadata found for ${absSourcePath}`);
      return result;
    }
    const metadata = moduleMetadata['metadata'];
    const symbols = metadata && Object.keys(metadata);
    if (!symbols || !symbols.length) {
      return result;
    }
    for (const symbol of symbols) {
      if (metadata[symbol] && metadata[symbol].__symbolic == 'error') {
        // Ignore symbols that are only included to record error information.
        continue;
      }
      const staticType = this.reflectorHost.findDeclaration(absSourcePath, symbol, absSourcePath);
      const annotations = this.staticReflector.annotations(staticType);
      annotations.forEach((annotation) => {
        if (annotation instanceof NgModuleMetadata) {
          result.ngModules.push(staticType);
        } else if (annotation instanceof ComponentMetadata) {
          result.components.push(staticType);
        }
      });
    }
    return result;
  }

  extract(): Promise<compiler.i18n.MessageBundle> {
    const filePaths =
        this.program.getSourceFiles().map(sf => sf.fileName).filter(f => !GENERATED_FILES.test(f));
    const fileMetas = filePaths.map((filePath) => this.readFileMetadata(filePath));
    const ngModules = fileMetas.reduce((ngModules, fileMeta) => {
      ngModules.push(...fileMeta.ngModules);
      return ngModules;
    }, <StaticSymbol[]>[]);
    const analyzedNgModules = this.compiler.analyzeModules(ngModules);
    const errors: ParseError[] = [];

    let bundlePromise =
        Promise
            .all(fileMetas.map((fileMeta) => {
              const url = fileMeta.fileUrl;
              return Promise.all(fileMeta.components.map(compType => {
                const compMeta = this.metadataResolver.getDirectiveMetadata(<any>compType);
                const ngModule = analyzedNgModules.ngModuleByComponent.get(compType);
                if (!ngModule) {
                  throw new Error(
                      `Cannot determine the module for component ${compMeta.type.name}!`);
                }
                return Promise
                    .all([compMeta, ...ngModule.transitiveModule.directives].map(
                        dirMeta =>
                            this.directiveNormalizer.normalizeDirective(dirMeta).asyncResult))
                    .then((normalizedCompWithDirectives) => {
                      const compMeta = normalizedCompWithDirectives[0];
                      const html = compMeta.template.template;
                      const interpolationConfig =
                          compiler.InterpolationConfig.fromArray(compMeta.template.interpolation);
                      errors.push(
                          ...this.messageBundle.updateFromTemplate(html, url, interpolationConfig));
                    });
              }));
            }))
            .then(_ => this.messageBundle)
            .catch((e) => { console.error(e.stack); });

    if (errors.length) {
      throw new Error(errors.map(e => e.toString()).join('\n'));
    }

    return bundlePromise;
  }

  static create(
      options: tsc.AngularCompilerOptions, program: ts.Program, compilerHost: ts.CompilerHost,
      reflectorHostContext?: ReflectorHostContext): Extractor {
    const xhr: compiler.XHR = {
      get: (s: string) => {
        if (!compilerHost.fileExists(s)) {
          // TODO: We should really have a test for error cases like this!
          throw new Error(`Compilation failed. Resource file not found: ${s}`);
        }
        return Promise.resolve(compilerHost.readFile(s));
      }
    };

    const urlResolver: compiler.UrlResolver = compiler.createOfflineCompileUrlResolver();
    const reflectorHost = new ReflectorHost(program, compilerHost, options, reflectorHostContext);
    const staticReflector = new StaticReflector(reflectorHost);
    StaticAndDynamicReflectionCapabilities.install(staticReflector);
    const htmlParser = new HtmlParser();

    const config = new compiler.CompilerConfig({
      genDebugInfo: options.debug === true,
      defaultEncapsulation: ViewEncapsulation.Emulated,
      logBindingUpdate: false,
      useJit: false
    });

    const normalizer = new DirectiveNormalizer(xhr, urlResolver, htmlParser, config);
    const expressionParser = new Parser(new Lexer());
    const elementSchemaRegistry = new DomElementSchemaRegistry();
    const console = new Console();
    const tmplParser =
        new TemplateParser(expressionParser, elementSchemaRegistry, htmlParser, console, []);
    const resolver = new CompileMetadataResolver(
        new compiler.NgModuleResolver(staticReflector),
        new compiler.DirectiveResolver(staticReflector), new compiler.PipeResolver(staticReflector),
        config, console, elementSchemaRegistry, staticReflector);
    const offlineCompiler = new compiler.OfflineCompiler(
        resolver, normalizer, tmplParser, new StyleCompiler(urlResolver), new ViewCompiler(config),
        new NgModuleCompiler(), new TypeScriptEmitter(reflectorHost));

    // TODO(vicb): implicit tags & attributes
    let messageBundle = new compiler.i18n.MessageBundle(htmlParser, [], {});

    return new Extractor(
        program, compilerHost, staticReflector, messageBundle, reflectorHost, resolver, normalizer,
        offlineCompiler);
  }
}

interface FileMetadata {
  fileUrl: string;
  components: StaticSymbol[];
  ngModules: StaticSymbol[];
}

// Entry point
if (require.main === module) {
  const args = require('minimist')(process.argv.slice(2));
  tsc.main(args.p || args.project || '.', args.basePath, extract)
      .then(exitCode => process.exit(exitCode))
      .catch(e => {
        console.error(e.stack);
        console.error('Extraction failed');
        process.exit(1);
      });
}