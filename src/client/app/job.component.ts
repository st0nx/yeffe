import {Component} from "@angular/core";

@Component({
  selector: 'job-app',
  template: '<h1>{{name}} {{description}} </h1>'
})
export class JobComponent {
    constructor(public name : string, public description : string){
    }
}