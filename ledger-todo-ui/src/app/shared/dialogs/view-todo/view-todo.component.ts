import { Component, OnInit, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS
} from "@angular/material";
import { LedgerService } from "../../../providers/ledger.service";
import { ITodo, IUpdateTodo } from "../../interfaces/todos.interface";
import { FormControl } from "@angular/forms";
import * as moment from "moment";
import { DatabaseService } from "../../../providers/database.service";
import { MomentDateAdapter } from "@angular/material-moment-adapter";

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

@Component({
  selector: "app-view-todo",
  templateUrl: "./view-todo.component.html",
  styleUrls: ["./view-todo.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
  ]
})
export class ViewTodoDialogComponent implements OnInit {
  public dueDate = new FormControl(moment());

  public todoData: ITodo = {} as ITodo;

  public shareWith: string;
  public shared = false;

  constructor(
    public dialogRef: MatDialogRef<ViewTodoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ledger: LedgerService,
    private db: DatabaseService
  ) {}

  ngOnInit() {
    this.db.findTodo(this.data.id).then((todo) => {
      this.todoData = todo;
    });
  }

  public close(data?: any): void {
    this.dialogRef.close(data);
  }

  public update(): void {
    this.ledger
      .updateTodo(this.todoData as IUpdateTodo)
      .then((ledgerResp) => {
        console.log("ledgerResp");
        console.log(ledgerResp);
        // if (ledgerResp.)
        this.close({ updated: true });
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

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
