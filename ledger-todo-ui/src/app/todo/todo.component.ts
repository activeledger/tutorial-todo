import { Component, OnInit } from "@angular/core";
import { faPlus, faSync, faSadTear } from "@fortawesome/free-solid-svg-icons";
import { ActivatedRoute, Router } from "@angular/router";
import { LedgerService } from "../providers/ledger.service";

interface ITodo {
  stream: string;
  name: string;
  dueDate: Date;
  body: string;
  sharedWith: string[];
}

@Component({
  selector: "app-todo",
  templateUrl: "./todo.component.html",
  styleUrls: ["./todo.component.scss"]
})
export class TodoComponent implements OnInit {
  public plus = faPlus;
  public refresh = faSync;
  public logout = faSadTear;

  public items: ITodo[] = [];

  public streamid = "Checking...";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ledger: LedgerService
  ) {}

  ngOnInit() {
    this.getStreamFromUrl();
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
    this.ledger.createTodo({ name: "test", body: "body", dueDate: new Date() });
  }
}
