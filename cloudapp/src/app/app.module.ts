import { HttpClientModule } from '@angular/common/http';
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule, getTranslateModule } from "@exlibris/exl-cloudapp-angular-lib";
import { ToastrModule } from "ngx-toastr";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { MainComponent } from "./main/main.component";
import { HelpComponent } from "./help/help.component";
import { ConfigComponent } from "./config/config.component";
import { NgxDropzoneModule } from "ngx-dropzone";
import { FormsModule } from '@angular/forms';

export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: "toast-top-right",
    timeOut: 4000,
  });
}

@NgModule({
  declarations: [AppComponent, MainComponent, HelpComponent, ConfigComponent],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxDropzoneModule,
    getTranslateModule(),
    getToastrModule(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
