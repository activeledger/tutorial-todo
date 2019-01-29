import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS
} from "@angular/material";

import * as moment from "moment";
import { FormControl } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { LedgerService } from "../../../providers/ledger.service";
import { ICreateTodo } from "../../interfaces/todos.interface";

export const DATE_FORMATS = {
  parse: {
    dateInput: "D MMM YYYY"
  },
  display: {
    dateInput: "D MMM YYYY",
    monthYearLabel: "MMM YYYY",
    dateAllyLabel: "D MM YYYY",
    monthYearAllyLabel: "MMMM YYYY"
  }
};

/**
 * Dialog for creating a new todo
 *
 * @export
 * @class CreateTodoDialogComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-create-todo",
  templateUrl: "./create-todo.component.html",
  styleUrls: ["./create-todo.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
  ]
})
export class CreateTodoDialogComponent implements OnInit {
  public dueDate = new FormControl(moment());

  public todoData: ICreateTodo = {
    name: undefined,
    body: undefined,
    dueDate: undefined
  };

  constructor(
    public dialogRef: MatDialogRef<CreateTodoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ledger: LedgerService
  ) {}

  ngOnInit() {}

  /**
   * Close the dialog with or without data
   *
   * @param {*} [data]
   * @memberof CreateTodoDialogComponent
   */
  public close(data?: any): void {
    this.dialogRef.close(data);
  }

  /**
   * Create the todo item on the ledger and close the dialog
   *
   * @memberof CreateTodoDialogComponent
   */
  public create(): void {
    this.todoData.dueDate = this.dueDate.value.format();
    this.ledger
      .createTodo(this.todoData)
      .then((response) => {
        this.close(response);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }
}
