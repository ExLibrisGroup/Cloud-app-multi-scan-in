import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  CloudAppRestService,
  CloudAppEventsService,
  Request,
  HttpMethod,
  CloudAppConfigService,
} from "@exlibris/exl-cloudapp-angular-lib";
import { map, switchMap } from "rxjs/operators";
import { Configuration } from "../configuration.model";

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
          console.log(this.config);
        }
      },
      error: (err: Error) => {
        this.toaster.error(err.message);
        console.error(err.message);
      },
    });
  }

  onSelect(event) {
    this.loadingBarcode = true;
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
      //TODO Query parameters comming from configutration
      this.restService
        .call("/items?item_barcode=" + barcode)
        .pipe(
          switchMap((res) => {
            console.log("Item", res);
            let requst: Request = {
              url: res.link,
              method: HttpMethod.POST,
              queryParams: { op: "scan" ,...this.config },
            };
            console.log(requst.queryParams);
            return this.restService.call(requst);
          })
        )
        .subscribe((val) => console.log(val));
    }
  }
}
