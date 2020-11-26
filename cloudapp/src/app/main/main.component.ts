import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  CloudAppRestService,
  Request,
  HttpMethod,
  RestErrorResponse,
  AlertService,
  CloudAppSettingsService,
} from "@exlibris/exl-cloudapp-angular-lib";
import { catchError, finalize, mergeMap, scan, switchMap, tap } from "rxjs/operators";
import { Configuration } from "../models/configuration.model";
import { EMPTY, from } from "rxjs";

const MAX_PARALLEL_QUERIES: number = 10;

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit {
  @ViewChild("drop", { static: false }) dropZone: any;
  files: File[] = [];
  barcodes: string[] = [];
  config: Configuration;
  loadingConfig: boolean = false;
  loadingBarcode: boolean = false;
  scanInList: { title: string; additional_info: string; barcode: string }[] = [];
  errorInList: { message: string; barcode: string }[] = [];
  showProgress: boolean = true;
  processed: number = 0;

  constructor(
    private restService: CloudAppRestService,
    private alert: AlertService,
    private settingsService: CloudAppSettingsService
  ) {}

  ngOnInit() {
    this.loadingConfig = true;
    this.settingsService.get().subscribe({
      next: (res: Configuration) => {
        if (res && Object.keys(res).length !== 0) {
          this.config = res;
        }
        this.loadingConfig = false;
      },
      error: (err: Error) => {
        this.alert.error(err.message);
        console.error(err.message);
        this.loadingConfig = false;
      },
    });
  }

  onSelect(event) {
    this.loadingBarcode = true;
    this.onReset();
    event.addedFiles.forEach((file: File) => {
      file
        .text()
        .then<void>((barcodes: string): void => {
          this.barcodes.push(...barcodes.split(/\r?\n/).filter((e) => e));
        })
        .catch((reason) => {
          this.alert.error("Could not load file :" + reason);
          Promise.reject(reason);
        })
        .finally(() => (this.loadingBarcode = false));
    });
    this.files.push(...event.addedFiles);
  }

  onReset() {
    this.barcodes = [];
    this.scanInList=[];
    this.errorInList = [];
    this.files = [];
    this.processed = 0;
  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
  onNewBarcodes() {
    this.loadingBarcode=true;
    let allResults = [];
    let observables = Array.from(this.barcodes, (barcode) => this.getByBarcode(barcode));
    from(observables)
      .pipe(
        mergeMap((observable) => observable, MAX_PARALLEL_QUERIES),
        finalize(() => {
          this.loadingBarcode = false;
        })
      )
      .subscribe({
        next: (partialResults) => {
          allResults = allResults.concat(partialResults);
        },
        error: (err) => {
          console.error("Error", err);
        },
        complete: () => {
          console.log(allResults[0]);
          allResults.forEach((val) =>
            this.scanInList.push({
              title: val.bib_data.title,
              additional_info: val.additional_info,
              barcode: val.item_data.barcode,
            })
          );
        },
      });
  }

  private getByBarcode(barcode: string) {
    return this.restService.call("/items?item_barcode=" + barcode).pipe(
      catchError(this.barcodeErrorCallback(barcode)),
      switchMap((res) => {
        let queryParams = this.getQueryParams();
        let requst: Request = {
          url: res.link,
          method: HttpMethod.POST,
          queryParams,
        };
        return this.restService.call(requst).pipe(
          catchError(this.barcodeErrorCallback(barcode)),
          tap(() => {
            this.processed++;
          })
        );
      })
    );
  }
  private barcodeErrorCallback(barcode: string) {
    return (e: RestErrorResponse) => {
      console.error(e.message);
      this.errorInList.unshift({ barcode: barcode, message: e.message });
      this.processed++;

      return EMPTY;
    };
  }
  private getQueryParams() {
    let queryParams = { op: "scan", ...this.config.mustConfig, ...this.config?.from };
    queryParams.department !== "" ? (queryParams = { ...queryParams, ...this.config.departmentArgs }) : null;
    queryParams.circ_desk !== "" ? (queryParams = { ...queryParams, ...this.config.departmentArgs }) : null;
    return queryParams;
  }

  get percentComplete() {
    let len = this.barcodes.length !== 0 ? this.barcodes.length : this.processed;
    return Math.round((this.processed / len) * 100);
  }
}
