import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { TodoComponent } from "./todo/todo.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import {
  MatCardModule,
  MatButtonModule,
  MatInputModule,
  MatDividerModule
} from "@angular/material";

@NgModule({
  declarations: [AppComponent, LoginComponent, TodoComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatDividerModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
