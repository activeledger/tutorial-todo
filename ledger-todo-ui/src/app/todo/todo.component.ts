import { Component, OnInit } from "@angular/core";
import { faPlus, faSync, faSadTear } from "@fortawesome/free-solid-svg-icons";
import { ActivatedRoute, Router } from "@angular/router";
import { LedgerService } from "../providers/ledger.service";
import { MatDialog } from "@angular/material/dialog";
import { CreateTodoDialogComponent } from "../shared/dialogs/create-todo/create-todo.component";
import { ViewTodoDialogComponent } from "../shared/dialogs/view-todo/view-todo.component";
import { DatabaseService } from "../providers/database.service";
import { ITodo } from "../shared/interfaces/todos.interface";

/**
 * Todo list
 *
 * @export
 * @class TodoComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-todo",
  templateUrl: "./todo.component.html",
  styleUrls: ["./todo.component.scss"],
})
export class TodoComponent implements OnInit {
  public plus = faPlus;
  public refreshIco = faSync;
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

  /**
   * Get a list of todos created by this stream id
   * and a list of todos shared with this stream id
   *
   * @private
   * @memberof TodoComponent
   */
  private getTodos(): void {
    const streamIds = JSON.parse(localStorage.getItem("streamIds"));

    this.db
      .getCreatedTodos()
      .then((todos: ITodo[]) => {
        this.createdTodos = todos;
      })
      .catch((err: unknown) => {
        console.error(err);
      });

    /* this.db
      .getSharedWithTodos()
      .then((sharedTodos: ITodo[]) => {
        this.sharedTodos = sharedTodos;
      })
      .catch((err: unknown) => {
        console.error(err);
      }); */
  }

  /**
   * Get the users stream id from the url
   * Check that it is the same one that's stored in
   * local storage
   *
   * @private
   * @memberof TodoComponent
   */
  private getStreamFromUrl(): void {
    this.route.params.subscribe((params) => {
      if (params["streamid"]) {
        this.streamid = params["streamid"];

        // Check that streamid and key are stored and that the streamid
        // in the url matches the one in the local storage
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

  /**
   * Open the create todo dialog box
   *
   * @memberof TodoComponent
   */
  public create(): void {
    const dialogRef = this.dialog.open(CreateTodoDialogComponent, {
      width: "500px",
    });

    dialogRef.afterClosed().subscribe((streamData) => {
      let streamIds = JSON.parse(localStorage.getItem("streamIds"));
      if (!streamIds) {
        streamIds = [];
      }

      streamIds.push(streamData.$streams.new[0].id);

      localStorage.setItem("streamIds", JSON.stringify(streamIds));
      this.getTodos();
    });
  }

  /**
   * Logout the user and drop all data
   *
   * @memberof TodoComponent
   */
  public logout(): void {
    this.ledger.logout();
  }

  /**
   * Open the view todo dialog box
   *
   * @param {string} id
   * @memberof TodoComponent
   */
  public async viewTodo(id: string) {
    const dialog = this.dialog.open(ViewTodoDialogComponent, {
      data: { id },
      width: "500px",
    });

    await dialog.afterClosed().toPromise();
    this.getTodos();
  }

  /**
   * Check for new todos
   *
   * @memberof TodoComponent
   */
  public refresh(): void {
    this.getTodos();
  }
}
