import { ToastrService } from "ngx-toastr";
import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  CloudAppRestService,
  Request,
  HttpMethod,
  CloudAppConfigService,
  RestErrorResponse,
} from "@exlibris/exl-cloudapp-angular-lib";
import { switchMap } from "rxjs/operators";
import { Configuration } from "../models/configuration.model";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit {
  files: File[] = [];
  barcodes: string[] = [];
  config: Configuration;
  loadingConfig: boolean = false;
  loadingBarcode: boolean = false;
  scanInList: { title: string; additional_info: string; barcode: string }[] = [];
  errorInList: { message: string; barcode: string }[] = [];

  constructor(
    private restService: CloudAppRestService,
    private toaster: ToastrService,
    private configService: CloudAppConfigService
  ) {}

  ngOnInit() {
    this.loadingConfig = true;
    this.configService.get().subscribe({
      next: (res: Configuration) => {
        if (res && Object.keys(res).length !== 0) {
          this.config = res;
        }
        this.loadingConfig=false;
      },
      error: (err: Error) => {
        this.toaster.error(err.message);
        console.error(err.message);
        this.loadingConfig=false;
      },
    });
  }

  onSelect(event) {
    this.loadingBarcode = true;
    this.barcodes = [];
    this.files=[];
    event.addedFiles.forEach((file: File) => {
      file
        .text()
        .then<void>((barcodes: string): void => {
          this.barcodes.push(...barcodes.split(/\r?\n/).filter((e) => e));
          this.onNewBarcodes();
        })
        .catch((reason) => {
          this.toaster.error("Could not load file :" + reason);
          Promise.reject(reason);
        })
        .finally(() => {
          this.loadingBarcode = false;
        });
    });
    this.files.push(...event.addedFiles);
  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
  private onNewBarcodes() {
    for (const barcode of this.barcodes) {
      this.restService
        .call("/items?item_barcode=" + barcode)
        .pipe(
          switchMap((res) => {
            let queryParams = { op: "scan", ...this.config.mustConfig, ...this.config?.from };
            queryParams.department !== ""
              ? (queryParams = { ...queryParams, ...this.config.departmentArgs })
              : null;
            let requst: Request = {
              url: res.link,
              method: HttpMethod.POST,
              queryParams,
            };
            return this.restService.call(requst);
          })
        )
        .subscribe({
          next: (val) => {
            this.scanInList.push({
              title: val.bib_data.title,
              additional_info: val.additional_info,
              barcode: barcode,
            });
          },
          error: (error: RestErrorResponse) => {
            console.error(error.message);
            this.toaster.error("Could not load barcode: " + barcode + " Due to " + error.message);
            this.errorInList.push({
              message: error.message,
              barcode: barcode,
            });
          },
        });
    }
  }
}
