import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CloudAppConfigService } from "@exlibris/exl-cloudapp-angular-lib";
import { Configuration } from "../configuration.model";

@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent implements OnInit {
  config: Configuration;

  constructor(private configService: CloudAppConfigService,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.configService.get().subscribe({
      next: (res: Configuration) => {
        if (res && Object.keys(res).length !== 0) {
          this.config = res;
        }
      },
      error: (err: Error) => {
        console.error(err.message);
      },
    });
  }

  onSubmit(form: NgForm) {
    this.config = form.value as Configuration;
    this.configService.set(this.config).subscribe({next:()=>this.toastr.success('Updated Successfully')}); //TODO 
    form.resetForm();
  }
}
