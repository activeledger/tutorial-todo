import { Activity, Standard } from "@activeledger/activecontracts";

/**
 * Todo Smart Contract
 *
 * @export
 * @class Todo
 * @extends {Standard}
 */
export default class Todo extends Standard {
  private activity: Activity;

  private inputStream: string;
  private outputStream: string;

  private data;
  private state;

  /**
   * Quick Transaction Check - Verify Input Properties (Known & Relevant Transaction?)
   * Signatureless - Verify if this contract is happy to run with selfsigned transactions
   *
   * @param {boolean} selfsigned
   * @returns {Promise<boolean>}
   * @memberof Todo
   */
  public verify(selfsigned: boolean): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (!selfsigned) {

        // Get the streams
        this.inputStream = Object.keys(this.transactions.$i)[0];

        // Check if the output is set
        if (this.transactions.$o) {
          this.outputStream = Object.keys(this.transactions.$o)[0];
        }

        // Data might be in $i on some update functions so set the entries where it is in $o
        const outputDataEntries = ["update", "share"];

        // Set data to $i even if it data is being sent in $o (check this next)
        this.data = this.transactions.$i[this.inputStream];

        // Check if we should be getting the data from $o
        if (outputDataEntries.indexOf(this.transactions.$entry) > -1) {
          this.data = this.transactions.$o[this.outputStream];
        }

        if (this.transactions.$entry) {
          switch (this.transactions.$entry) {
            case "create":
              this.verifyCreate(resolve, reject);
              break;
            case "update":
              this.verifyUpdate(resolve, reject);
              break;
            case "share":
              this.verifyShare(resolve, reject);
              break;
            default:
              reject("Entry not found.");
              break;
          }
        } else {
          reject("No entry found");
        }
      } else {
        reject("Identity Signatures Needed");
      }
    });
  }

  /**
   * Voting Round, Is the transaction request valid?
   *
   * @returns {Promise<boolean>}
   * @memberof Todo
   */
  public vote(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

      // Get Stream Activity and its state
      // Passed input verification so now get the Activity stream
      if (this.outputStream) {
        this.activity = this.getActivityStreams(this.outputStream);
      } else {
        this.activity = this.getActivityStreams(this.inputStream);
      }

      this.state = this.activity.getState();

      switch (this.transactions.$entry) {
        case "create":
          this.voteCreate(resolve, reject);
          break;
        case "update":
          this.voteUpdate(resolve, reject);
          break;
        case "share":
          this.voteShare(resolve, reject);
          break;

      }
    });
  }

  /**
   * Prepares the new streams state to be comitted to the ledger
   *
   * @returns {Promise<any>}
   * @memberof Todo
   */
  public commit(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // Update Activity Streams
      // Create New Activity Streams        
      switch (this.transactions.$entry) {
        case "create":
          this.commitCreate(resolve, reject);
          break;
        case "update":
          this.commitUpdate(resolve, reject);
          break;
        case "share":
          this.commitShare(resolve, reject);
          break;
      }
    });
  }

  private verifyCreate(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    if (this.data && this.data.name && this.data.dueDate && this.data.body) {
      if (this.data.name.length > 0 && this.data.body.length > 0) {
        resolve(true);
      } else {
        reject("Name and body data can't be blank");
      }
    } else {
      reject("Data is missing name, dueDate, or body");
    }
  }

  private verifyUpdate(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    if (this.data && (this.data.name || this.data.body || this.data.dueDate)) {
      resolve(true);
    } else {
      reject("No data provided");
    }
  }

  private verifyShare(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    if (this.data.stream) {
      resolve(true);
    } else {
      reject("No recipient provided");
    }
  }

  private voteCreate(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    resolve(true);
  }

  private voteUpdate(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    if (this.inputStream === this.state.owner) {
      resolve(true);
    } else {
      reject("Only owner can update");
    }
  }

  private voteShare(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    if (this.inputStream === this.state.owner) {
      resolve(true);
    } else {
      reject("Only owner can share");
    }
  }

  private commitCreate(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    const namespace = this.transactions.$namespace;

    const activity = this.newActivityStream(this.data.name);
    activity.setAuthority(
      this.getActivityStreams(this.inputStream).getAuthority(),
      this.getActivityStreams(this.inputStream).getAuthority(true),
    );

    const state = activity.getState();
    state.owner = this.inputStream;
    state.name = this.data.name;
    state.type = `${namespace}.todo`
    state.body = this.data.body;
    state.dueDate = this.data.dueDate;
    state.sharedWith = [];

    activity.setState(state);

    resolve(true);
  }

  private commitUpdate(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    if (this.data.name) {
      this.state.name = this.data.name;
    }

    if (this.data.body) {
      this.state.body = this.data.body;
    }

    if (this.data.dueDate) {
      this.state.dueDate = this.data.dueDate;
    }

    this.activity.setState(this.state);

    resolve(true);
  }

  private commitShare(resolve: (ok: boolean) => void, reject: (message: string) => void): void {
    this.state.sharedWith.push(this.data.stream);
    this.activity.setState(this.state);
    resolve(true);
  }
}

/*
#io

  {
    "$entry": "contract entry point",
    "$i": {"streamId": {} },
    "$o": {},
    "$r": {}
  }
#endio
*/
