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
import { finalize, map } from "rxjs/operators";
import { Departments } from "../models/departments.model";
import { Statuses } from "../models/statuses.model";

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
  departments : Departments[] = [];
  statuses : Statuses[] = [];
  loading: boolean = false;
  work_order_types :string[] =[];

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
  
        let emptyLib: Library = { link:"", code:"", path:"", name:"Institution Level", description:"",
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
    this.work_order_types = [];
    this.statuses =[];
    if (!init) {
      this.config.from.circ_desk = "";
      this.config.from.department = "";
    }

    let rests = [this.restService.call("/conf/departments?library="+code)];
    if(code != ''){
      rests.push(this.restService.call("/conf/libraries/"+code+"/circ-desks"));
    }

    forkJoin(rests)
    .pipe(finalize(
      () => {
        this.loading = false;
        if (!init) {
          this.config.from.circ_desk = "";
        }
      }))
        .subscribe({
        next: (res ) => {
          this.departments = res[0].department;
          this.departments.unshift({name : ' ',code:'',type:{value : ' '} });
          if(res.length >1){
            this.circulation_desks = res[1].circ_desk
            this.circulation_desks.unshift({name : ' ',code:'',link:''});
          }
          
        },
        error: (err: RestErrorResponse) => {
          this.circulation_desks = [];
          this.departments = [];
          console.error(err.message);
        }
      });
      
  }

  
  onCircDeskOrDepartmentChange(circ_desk : string,department_code: string){
    this.work_order_types =[];
    this.statuses =[];
    if(circ_desk != undefined && circ_desk != ''){
      this.restService.call("/conf/departments?library="+this.config.mustConfig.library).pipe(finalize(
        () => {
          this.loading = false;
        })).subscribe({
          next: (res) => {
            res.department.forEach(department => department.circ_desk?.value === circ_desk ? this.work_order_types.push(department.type.value): '');
            this.work_order_types.unshift(' ');
          },
          error: (err: RestErrorResponse) => {
            console.error(err.message);
          }
        });
    }else if(department_code != undefined && department_code != ''){
      this.onDepartmentChange(department_code);
    }
  }

  onDepartmentChange(department_code: string){
    this.departments.forEach(d => {
      if(d.code == department_code){
        this.work_order_types = [d.type.value];
        this.onWorkOrderTypeChange(d.type.value);
        return;
      }
    });
  }

  onWorkOrderTypeChange(work_order_type: string){
    this.restService.call("/conf/mapping-tables/WorkOrderTypeStatuses?scope="+this.config.mustConfig.library).pipe(finalize(
      () => {
        this.loading = false;
      })).subscribe({
        next: (res) => {
          this.statuses = res.row.filter(row => row.column0 ==work_order_type );
          this.statuses.unshift({column2 : ' ',column1 : ' ',column0:''});
        },
        error: (err: RestErrorResponse) => {
          this.statuses = [];
          console.error(err.message);
        }
      }); 
  }

}
