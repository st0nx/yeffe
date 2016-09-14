/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, beforeEach, beforeEachProviders, ddescribe, xdescribe, describe, expect, iit, inject, it, xit,} from '@angular/core/testing/testing_internal';
import {TestComponentBuilder, ComponentFixture} from '@angular/core/testing';

import {Component} from '@angular/core';

import {NgStyle} from '@angular/common/src/directives/ng_style';

function expectNativeEl(fixture: ComponentFixture<any>) {
  return <any>expect(fixture.debugElement.children[0].nativeElement);
}

export function main() {
  describe('binding to CSS styles', () => {

    it('should add styles specified in an object literal',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = `<div [ngStyle]="{'max-width': '40px'}"></div>`;

             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

                   async.done();
                 });
           }));

    it('should add and change styles specified in an object expression',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = `<div [ngStyle]="expr"></div>`;

             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   var expr: Map<string, any>;

                   fixture.debugElement.componentInstance.expr = {'max-width': '40px'};
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

                   expr = fixture.debugElement.componentInstance.expr;
                   (expr as any)['max-width'] = '30%';
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'max-width': '30%'});

                   async.done();
                 });
           }));

    it('should add and remove styles specified using style.unit notation',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = `<div [ngStyle]="{'max-width.px': expr}"></div>`;

             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {

                   fixture.debugElement.componentInstance.expr = '40';
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

                   fixture.debugElement.componentInstance.expr = null;
                   fixture.detectChanges();
                   expectNativeEl(fixture).not.toHaveCssStyle('max-width');

                   async.done();
                 });
           }));

    it('should update styles using style.unit notation when unit changes',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = `<div [ngStyle]="expr"></div>`;

             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {

                   fixture.debugElement.componentInstance.expr = {'max-width.px': '40'};
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

                   fixture.debugElement.componentInstance.expr = {'max-width.em': '40'};
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'max-width': '40em'});

                   async.done();
                 });
           }));

    // keyValueDiffer is sensitive to key order #9115
    it('should change styles specified in an object expression',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             const template = `<div [ngStyle]="expr"></div>`;

             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.expr = {
                     // height, width order is important here
                     height: '10px',
                     width: '10px'
                   };

                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'height': '10px', 'width': '10px'});

                   fixture.debugElement.componentInstance.expr = {
                     // width, height order is important here
                     width: '5px',
                     height: '5px',
                   };

                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'height': '5px', 'width': '5px'});

                   async.done();
                 });
           }));

    it('should remove styles when deleting a key in an object expression',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = `<div [ngStyle]="expr"></div>`;

             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.expr = {'max-width': '40px'};
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

                   delete fixture.debugElement.componentInstance.expr['max-width'];
                   fixture.detectChanges();
                   expectNativeEl(fixture).not.toHaveCssStyle('max-width');

                   async.done();
                 });
           }));

    it('should co-operate with the style attribute',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = `<div style="font-size: 12px" [ngStyle]="expr"></div>`;

             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.expr = {'max-width': '40px'};
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle(
                       {'max-width': '40px', 'font-size': '12px'});

                   delete fixture.debugElement.componentInstance.expr['max-width'];
                   fixture.detectChanges();
                   expectNativeEl(fixture).not.toHaveCssStyle('max-width');
                   expectNativeEl(fixture).toHaveCssStyle({'font-size': '12px'});

                   async.done();
                 });
           }));

    it('should co-operate with the style.[styleName]="expr" special-case in the compiler',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = `<div [style.font-size.px]="12" [ngStyle]="expr"></div>`;

             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.expr = {'max-width': '40px'};
                   fixture.detectChanges();
                   expectNativeEl(fixture).toHaveCssStyle(
                       {'max-width': '40px', 'font-size': '12px'});

                   delete fixture.debugElement.componentInstance.expr['max-width'];
                   fixture.detectChanges();
                   expectNativeEl(fixture).not.toHaveCssStyle('max-width');
                   expectNativeEl(fixture).toHaveCssStyle({'font-size': '12px'});

                   async.done();
                 });
           }));
  });
}

@Component({selector: 'test-cmp', directives: [NgStyle], template: ''})
class TestComponent {
  expr: any;
}
