import { Component, OnInit } from "@angular/core";
import { LedgerService } from "../providers/ledger.service";
import { Router } from "@angular/router";

/**
 * Login
 *
 * @export
 * @class LoginComponent
 * @implements {OnInit}
 */
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

  /**
   * Check that the URL contains the users stream ID
   *
   * @private
   * @memberof LoginComponent
   */
  private checkForStream(): void {
    if (this.ledger.streamid) {
      this.router.navigateByUrl("/todo/" + this.ledger.streamid);
    }
  }

  /**
   * Create a new identity and navigate to the todo list
   *
   * @memberof LoginComponent
   */
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
