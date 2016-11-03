import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }   from './app.component';
import {TitleComponent} from "./title.component";
import {HighlightDirective} from "./highlight.directive";
import {JobComponent} from "./job.component";
import {FormsModule} from "@angular/forms";
import {JobRESTClient} from "./job.restclient";
import {HttpModule, JsonpModule} from "@angular/http";

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule, JsonpModule ],
  declarations: [ AppComponent, TitleComponent, HighlightDirective, JobComponent ],
  bootstrap:    [ AppComponent ],
  providers: [ JobRESTClient ]
})
export class AppModule {
}