import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TodoComponent } from "./todo/todo.component";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
  {
    path: "todo/:streamid",
    component: TodoComponent
  },
  {
    path: "",
    component: LoginComponent
  },
  {
    path: "**",
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
