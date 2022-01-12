import { Constants } from "./../constants";
import { Library } from "./../models/library.model";
import { CirculationDesk } from "./../models/circulation-desk.model";
import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  AlertService,
  CloudAppRestService,
  CloudAppSettingsService,
  RestErrorResponse,
} from "@exlibris/exl-cloudapp-angular-lib";
import { Configuration } from "../models/configuration.model";
import { forkJoin } from "rxjs";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  constants: Constants = new Constants();
  config: Configuration = new Configuration();
  libraries: Library[] = [];
  circulation_desks: CirculationDesk[] = [];
  loading: boolean = false;

  constructor(
    private settingsService: CloudAppSettingsService,
    private restService: CloudAppRestService,
    private alert: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    let rest = this.restService.call("/conf/libraries/");
    let config = this.settingsService.get();

    forkJoin({ rest, config }).subscribe({
      next: (value) => {
        this.libraries = value.rest.library as Library[];
  
        let emptyLib: Library = { link:"", code:"INST_LEVEL", path:"", name:"Institution Level", description:"",
                      resource_sharing:null, campus: null, proxy:"", default_location:null};
        this.libraries.unshift(emptyLib);

        if (value.config && Object.keys(value.config).length !== 0) {
          this.config = value.config;
          this.onLibraryChange(value.config.mustConfig.library, true);
        }
      },
      error: (err) => {
        console.error(err.message);
        this.alert.error(err.message);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onSubmit(form: NgForm) {
    console.log(form);
    this.settingsService.set(this.config).subscribe({
      next: () => {
        this.alert.success("Updated Successfully", { keepAfterRouteChange: true });
        this.router.navigate([""]);   
      },
      error: (err: RestErrorResponse) => {
        console.error(err.message);
        this.alert.error(err.message);
      },
    });
  }
  onRestore() {
    this.config = new Configuration();
  }
  onLibraryChange(circ_code: string, init=false){
    this.loading = true;
    let code = circ_code;
    this.restService.call("/conf/libraries/"+code+"/circ-desks").pipe(finalize(
      () => {
        this.loading = false;
        if (!init) {
          this.config.from.circ_desk = "";
        }
      })).subscribe({
        next: (res) => {
          this.circulation_desks = res.circ_desk
        },
        error: (err: RestErrorResponse) => {
          this.circulation_desks = [];
          console.error(err.message);
        }
      });
  }
}
