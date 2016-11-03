import {JobComponent} from './job.component';
import {Injectable, Inject} from '@angular/core';
import {RESTClient, DefaultHeaders, BaseUrl, GET, Query, PUT, Path, Body, DELETE} from "angular2-rest";
import {Observable} from "rxjs/Rx";
import {Response, Http} from "@angular/http";

@Injectable()
@BaseUrl("http://127.0.0.1:8000/api/jobs/")
@DefaultHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
})
export class JobRESTClient extends RESTClient {

    public constructor(@Inject(Http) protected http: Http) {
        super(http)
    }

    @GET("job/")
    public getJobs(@Query("sort") sort?: string): Observable<Response> {
        return null;
    };

    @PUT("job/{id}")
    public putJobById(@Path("id") id: string, @Body job: JobComponent): Observable<Response> {
        return null;
    };

    @DELETE("job/{id}")
    public deleteJobById(@Path("id") id: string): Observable<Response> {
        return null;
    };

}