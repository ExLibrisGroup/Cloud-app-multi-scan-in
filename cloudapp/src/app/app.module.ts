import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule, CloudAppTranslateModule, AlertModule } from "@exlibris/exl-cloudapp-angular-lib";
import { ToastrModule } from "ngx-toastr";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { MainComponent } from "./main/main.component";
import { HelpComponent } from "./help/help.component";
import { NgxDropzoneModule } from "ngx-dropzone";
import { FormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SettingsComponent } from "./settings/settings.component";
import { FromvalidatorDirective } from "./settings/fromvalidator.directive";


export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: "toast-top-right",
    timeOut: 4000,
  });
}

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HelpComponent,
    SettingsComponent,
    FromvalidatorDirective,
  ],
  imports: [AlertModule,
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTooltipModule,
    MatRadioModule,
    MatSlideToggleModule,
    NgxDropzoneModule,
    CloudAppTranslateModule.forRoot(),
    getToastrModule(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
