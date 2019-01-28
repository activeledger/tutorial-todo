import { Component, OnInit } from "@angular/core";
import { faPlus, faSync, faSadTear } from "@fortawesome/free-solid-svg-icons";
import { ActivatedRoute, Router } from "@angular/router";
import { LedgerService } from "../providers/ledger.service";
import { MatDialog } from "@angular/material";
import { CreateTodoDialogComponent } from "../shared/dialogs/create-todo/create-todo.component";
import { ViewTodoDialogComponent } from "../shared/dialogs/view-todo/view-todo.component";
import { DatabaseService } from "../providers/database.service";
import { ITodo } from "../shared/interfaces/todos.interface";

@Component({
  selector: "app-todo",
  templateUrl: "./todo.component.html",
  styleUrls: ["./todo.component.scss"]
})
export class TodoComponent implements OnInit {
  public plus = faPlus;
  public refresh = faSync;
  public logoutIco = faSadTear;

  public createdTodos: ITodo[] = [];
  public sharedTodos: ITodo[] = [];

  public streamid = "Checking...";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ledger: LedgerService,
    public dialog: MatDialog,
    private db: DatabaseService
  ) {}

  ngOnInit() {
    this.getStreamFromUrl();

    this.getTodos();
  }

  private getTodos(): void {
    this.db
      .getCreatedTodos()
      .then((todos: ITodo[]) => {
        this.createdTodos = todos;
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  private getStreamFromUrl(): void {
    this.route.params.subscribe((params) => {
      if (params["streamid"]) {
        this.streamid = params["streamid"];

        if (
          !this.ledger.streamid ||
          this.ledger.streamid !== this.streamid ||
          !this.ledger.key
        ) {
          this.router.navigateByUrl("/");
        }
      } else {
        this.router.navigateByUrl("/ ");
      }
    });
  }

  public create(): void {
    // this.ledger.createTodo({ name: "test", body: "body", dueDate: new Date() });
    const dialogRef = this.dialog.open(CreateTodoDialogComponent, {
      width: "500px"
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getTodos();
    });
  }

  public logout(): void {
    this.ledger.logout();
  }

  public viewTodo(id: string) {
    this.dialog.open(ViewTodoDialogComponent, {
      data: { id: id },
      width: "500px"
    });
  }
}
