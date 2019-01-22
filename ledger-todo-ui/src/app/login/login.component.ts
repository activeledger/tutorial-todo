import { Component, OnInit } from "@angular/core";
import { LedgerService } from "../providers/ledger.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  constructor(private ledger: LedgerService, private router: Router) {}

  ngOnInit() {
    this.checkForStream();
  }

  private checkForStream(): void {
    if (this.ledger.streamid) {
      this.router.navigateByUrl("/todo/" + this.ledger.streamid);
    }
  }

  public login(): void {
    this.ledger
      .createIdentity()
      .then(() => {
        this.router.navigateByUrl("/todo/" + this.ledger.streamid);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }
}
