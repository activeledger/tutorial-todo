import { Component, OnInit, Inject } from "@angular/core";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { LedgerService } from "../../../providers/ledger.service";
import { ITodo, IUpdateTodo } from "../../interfaces/todos.interface";
import { FormControl } from "@angular/forms";
import * as moment from "moment";
import { DatabaseService } from "../../../providers/database.service";
import { MomentDateAdapter } from "@angular/material-moment-adapter";

export const DATE_FORMATS = {
  parse: {
    dateInput: "D MMM YYYY",
  },
  display: {
    dateInput: "D MMM YYYY",
    monthYearLabel: "MMM YYYY",
    dateAllyLabel: "D MM YYYY",
    monthYearAllyLabel: "MMMM YYYY",
  },
};

/**
 * Dialog for viewing more information about a todo
 *
 * @export
 * @class ViewTodoDialogComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-view-todo",
  templateUrl: "./view-todo.component.html",
  styleUrls: ["./view-todo.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
  ],
})
export class ViewTodoDialogComponent implements OnInit {
  public dueDate = new FormControl(moment());

  public todoData: ITodo = {} as ITodo;

  public shareWith: string;
  public shared = false;

  public isSharedWithMe = false;

  constructor(
    public dialogRef: MatDialogRef<ViewTodoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ledger: LedgerService,
    private db: DatabaseService
  ) {}

  ngOnInit() {
    this.db
      .findTodo(this.data.id)
      .then((todo) => {
        this.todoData = todo;
        this.isSharedWithMe = this.ledger.streamid !== this.todoData.owner;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Close the dialog with or without data
   *
   * @param {*} [data]
   * @memberof ViewTodoDialogComponent
   */
  public close(data?: any): void {
    this.dialogRef.close(data);
  }

  /**
   * Update the todo and close on success
   *
   * @memberof ViewTodoDialogComponent
   */
  public update(): void {
    this.ledger
      .updateTodo(this.todoData as IUpdateTodo)
      .then(() => {
        this.close({ updated: true });
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  /**
   * Share a todo with a stream ID
   *
   * @memberof ViewTodoDialogComponent
   */
  public share(): void {
    this.ledger
      .shareTodo(this.shareWith, this.todoData.streamid)
      .then(() => {
        this.shared = true;
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }
}
