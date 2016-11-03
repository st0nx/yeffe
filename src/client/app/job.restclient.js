"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var job_component_1 = require('./job.component');
var core_1 = require('@angular/core');
var angular2_rest_1 = require("angular2-rest");
var Rx_1 = require("rxjs/Rx");
var http_1 = require("@angular/http");
var JobRESTClient = (function (_super) {
    __extends(JobRESTClient, _super);
    function JobRESTClient(http) {
        _super.call(this, http);
        this.http = http;
    }
    JobRESTClient.prototype.getJobs = function (sort) {
        return null;
    };
    ;
    JobRESTClient.prototype.putJobById = function (id, job) {
        return null;
    };
    ;
    JobRESTClient.prototype.deleteJobById = function (id) {
        return null;
    };
    ;
    __decorate([
        angular2_rest_1.GET("job/"),
        __param(0, angular2_rest_1.Query("sort")), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [String]), 
        __metadata('design:returntype', (typeof (_a = typeof Rx_1.Observable !== 'undefined' && Rx_1.Observable) === 'function' && _a) || Object)
    ], JobRESTClient.prototype, "getJobs", null);
    __decorate([
        angular2_rest_1.PUT("job/{id}"),
        __param(0, angular2_rest_1.Path("id")),
        __param(1, angular2_rest_1.Body), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [String, job_component_1.JobComponent]), 
        __metadata('design:returntype', (typeof (_b = typeof Rx_1.Observable !== 'undefined' && Rx_1.Observable) === 'function' && _b) || Object)
    ], JobRESTClient.prototype, "putJobById", null);
    __decorate([
        angular2_rest_1.DELETE("job/{id}"),
        __param(0, angular2_rest_1.Path("id")), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [String]), 
        __metadata('design:returntype', (typeof (_c = typeof Rx_1.Observable !== 'undefined' && Rx_1.Observable) === 'function' && _c) || Object)
    ], JobRESTClient.prototype, "deleteJobById", null);
    JobRESTClient = __decorate([
        core_1.Injectable(),
        angular2_rest_1.BaseUrl("http://127.0.0.1:8000/api/jobs/"),
        angular2_rest_1.DefaultHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }),
        __param(0, core_1.Inject(http_1.Http)), 
        __metadata('design:paramtypes', [(typeof (_d = typeof http_1.Http !== 'undefined' && http_1.Http) === 'function' && _d) || Object])
    ], JobRESTClient);
    return JobRESTClient;
    var _a, _b, _c, _d;
}(angular2_rest_1.RESTClient));
exports.JobRESTClient = JobRESTClient;
//# sourceMappingURL=job.restclient.js.map