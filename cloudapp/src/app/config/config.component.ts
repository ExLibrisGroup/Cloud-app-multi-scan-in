import { Constants } from "./../constants";
import { Library } from "./../models/library.model";
import { ToastrService } from "ngx-toastr";
import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  CloudAppConfigService,
  CloudAppRestService,
  RestErrorResponse,
} from "@exlibris/exl-cloudapp-angular-lib";
import { Configuration } from "../models/configuration.model";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent implements OnInit {
  constants: Constants = new Constants();
  config: Configuration = new Configuration();
  libraries: Library[] = [];
  loading: boolean = false;

  constructor(
    private configService: CloudAppConfigService,
    private restService: CloudAppRestService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    let rest = this.restService.call("/conf/libraries/");
    let config = this.configService.get();

    forkJoin({ rest, config }).subscribe({
      next: (value) => {
        this.libraries = value.rest.library as Library[];

        if (value.config && Object.keys(value.config).length !== 0) {
          this.config = value.config;
        }
      },
      error: (err) => {
        console.error(err.message);
        this.toastr.error(err.message);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onSubmit(form: NgForm) {
    console.log(form);
    this.configService.set(this.config).subscribe({
      next: () => this.toastr.success("Updated Successfully"),
      error: (err: RestErrorResponse) => {
        console.error(err.message);
        this.toastr.error(err.message);
      },
    }); 
  }
  onRestore() {
    this.config = new Configuration();
  }
}
