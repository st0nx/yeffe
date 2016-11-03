import {Component} from '@angular/core';
import {JobRESTClient} from "./job.restclient";
import {JobComponent} from "./job.component";

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
})
export class AppComponent {
    subtitle = '(v1)';

    constructor(private contactService: JobRESTClient) {
    }

    onSubmit() {
        this.contactService.getJobs().subscribe(data=> {
            console.log(data)
        })
    }
}