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
  MatDividerModule,
  MatDialogModule,
  MatDatepickerModule
} from "@angular/material";
import { CreateTodoDialogComponent } from "./shared/dialogs/create-todo/create-todo.component";
import { ViewTodoDialogComponent } from "./shared/dialogs/view-todo/view-todo.component";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TodoComponent,
    CreateTodoDialogComponent,
    ViewTodoDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatDividerModule,
    FontAwesomeModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [CreateTodoDialogComponent, ViewTodoDialogComponent]
})
export class AppModule {}
