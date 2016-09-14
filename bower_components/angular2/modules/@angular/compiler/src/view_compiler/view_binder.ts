/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListWrapper} from '../facade/collection';
import {identifierToken} from '../identifiers';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';

import {CompileElement, CompileNode} from './compile_element';
import {CompileView} from './compile_view';
import {bindDirectiveOutputs, bindRenderOutputs, collectEventListeners} from './event_binder';
import {bindDirectiveAfterContentLifecycleCallbacks, bindDirectiveAfterViewLifecycleCallbacks, bindDirectiveDetectChangesLifecycleCallbacks, bindInjectableDestroyLifecycleCallbacks, bindPipeDestroyLifecycleCallbacks} from './lifecycle_binder';
import {bindDirectiveHostProps, bindDirectiveInputs, bindRenderInputs, bindRenderText} from './property_binder';

export function bindView(view: CompileView, parsedTemplate: TemplateAst[]): void {
  var visitor = new ViewBinderVisitor(view);
  templateVisitAll(visitor, parsedTemplate);
  view.pipes.forEach(
      (pipe) => { bindPipeDestroyLifecycleCallbacks(pipe.meta, pipe.instance, pipe.view); });
}

class ViewBinderVisitor implements TemplateAstVisitor {
  private _nodeIndex: number = 0;

  constructor(public view: CompileView) {}

  visitBoundText(ast: BoundTextAst, parent: CompileElement): any {
    var node = this.view.nodes[this._nodeIndex++];
    bindRenderText(ast, node, this.view);
    return null;
  }
  visitText(ast: TextAst, parent: CompileElement): any {
    this._nodeIndex++;
    return null;
  }

  visitNgContent(ast: NgContentAst, parent: CompileElement): any { return null; }

  visitElement(ast: ElementAst, parent: CompileElement): any {
    var compileElement = <CompileElement>this.view.nodes[this._nodeIndex++];
    var eventListeners = collectEventListeners(ast.outputs, ast.directives, compileElement);
    bindRenderInputs(ast.inputs, compileElement);
    bindRenderOutputs(eventListeners);
    ast.directives.forEach((directiveAst) => {
      var directiveInstance =
          compileElement.instances.get(identifierToken(directiveAst.directive.type));
      bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
      bindDirectiveDetectChangesLifecycleCallbacks(directiveAst, directiveInstance, compileElement);

      bindDirectiveHostProps(directiveAst, directiveInstance, compileElement);
      bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
    });
    templateVisitAll(this, ast.children, compileElement);
    // afterContent and afterView lifecycles need to be called bottom up
    // so that children are notified before parents
    ast.directives.forEach((directiveAst) => {
      var directiveInstance =
          compileElement.instances.get(identifierToken(directiveAst.directive.type));
      bindDirectiveAfterContentLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
      bindDirectiveAfterViewLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
    });
    ast.providers.forEach((providerAst) => {
      var providerInstance = compileElement.instances.get(providerAst.token);
      bindInjectableDestroyLifecycleCallbacks(providerAst, providerInstance, compileElement);
    });
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, parent: CompileElement): any {
    var compileElement = <CompileElement>this.view.nodes[this._nodeIndex++];
    var eventListeners = collectEventListeners(ast.outputs, ast.directives, compileElement);
    ast.directives.forEach((directiveAst) => {
      var directiveInstance =
          compileElement.instances.get(identifierToken(directiveAst.directive.type));
      bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
      bindDirectiveDetectChangesLifecycleCallbacks(directiveAst, directiveInstance, compileElement);
      bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
      bindDirectiveAfterContentLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
      bindDirectiveAfterViewLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
    });
    ast.providers.forEach((providerAst) => {
      var providerInstance = compileElement.instances.get(providerAst.token);
      bindInjectableDestroyLifecycleCallbacks(providerAst, providerInstance, compileElement);
    });
    bindView(compileElement.embeddedView, ast.children);
    return null;
  }

  visitAttr(ast: AttrAst, ctx: any): any { return null; }
  visitDirective(ast: DirectiveAst, ctx: any): any { return null; }
  visitEvent(ast: BoundEventAst, eventTargetAndNames: Map<string, BoundEventAst>): any {
    return null;
  }

  visitReference(ast: ReferenceAst, ctx: any): any { return null; }
  visitVariable(ast: VariableAst, ctx: any): any { return null; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
}
