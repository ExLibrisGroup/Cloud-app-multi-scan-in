import { Constants } from "./../constants";
import { Library } from "./../models/library.model";
import { ToastrService } from "ngx-toastr";
import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  AlertService,
  CloudAppConfigService,
  CloudAppRestService,
  CloudAppSettingsService,
  RestErrorResponse,
} from "@exlibris/exl-cloudapp-angular-lib";
import { Configuration } from "../models/configuration.model";
import { forkJoin } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  constants: Constants = new Constants();
  config: Configuration = new Configuration();
  libraries: Library[] = [];
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

        if (value.config && Object.keys(value.config).length !== 0) {
          this.config = value.config;
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
}
