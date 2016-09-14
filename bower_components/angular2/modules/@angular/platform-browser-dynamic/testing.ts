/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerConfig, DirectiveResolver, NgModuleResolver, analyzeAppProvidersForDeprecatedConfiguration} from '@angular/compiler';
import {OverridingTestComponentBuilder, platformCoreDynamicTesting} from '@angular/compiler/testing';
import {COMPILER_OPTIONS, Compiler, CompilerFactory, NgModule, PlatformRef, Provider, ReflectiveInjector, Type, createPlatform, createPlatformFactory} from '@angular/core';
import {TestBed, TestComponentBuilder, TestComponentRenderer} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';

import {Console} from './core_private';
import {INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from './src/platform_providers';
import {DOMTestComponentRenderer} from './testing/dom_test_component_renderer';

export * from './private_export_testing'

/**
 * @experimental API related to bootstrapping are still under review.
 */
export const platformBrowserDynamicTesting = createPlatformFactory(
    platformCoreDynamicTesting, 'browserDynamicTesting',
    INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

/**
 * NgModule for testing.
 *
 * @stable
 */
@NgModule({
  exports: [BrowserTestingModule],
  providers: [
    {provide: TestComponentBuilder, useClass: OverridingTestComponentBuilder},
    {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
  ]
})
export class BrowserDynamicTestingModule {
}

/**
 * @deprecated Use initTestEnvironment with platformBrowserDynamicTesting instead.
 */
export const TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    // Note: This is not a real provider but a hack to still support the deprecated
    // `setBaseTestProviders` method!
    [(appProviders: any[]) => {
      const deprecatedConfiguration = analyzeAppProvidersForDeprecatedConfiguration(appProviders);
      const platformRef =
          createPlatformFactory(platformBrowserDynamicTesting, 'browserDynamicTestingDeprecated', [{
                                  provide: COMPILER_OPTIONS,
                                  useValue: deprecatedConfiguration.compilerOptions,
                                  multi: true
                                }])();

      @NgModule({
        exports: [BrowserDynamicTestingModule],
        declarations: [deprecatedConfiguration.moduleDeclarations]
      })
      class DynamicTestModule {
      }

      const testInjector = TestBed.initTestEnvironment(DynamicTestModule, platformRef);
      const console: Console = testInjector.get(Console);
      deprecatedConfiguration.deprecationMessages.forEach((msg) => console.warn(msg));
    }];

/**
 * @deprecated Use initTestEnvironment with BrowserDynamicTestingModule instead.
 */
export const TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [];
