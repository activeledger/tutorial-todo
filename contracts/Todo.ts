import { Activity, Standard } from "@activeledger/activecontracts";

/**
 * Todo Smart Contract
 *
 * @export
 * @class Todo
 * @extends {Standard}
 */
export default class Todo extends Standard {
  /**
   * Holds the Activity stream as created or fetched
   *
   * @private
   * @type {Activity}
   * @memberof Todo
   */
  private activity: Activity;

  /**
   * The input stream id provided in the transaction
   *
   * @private
   * @type {string}
   * @memberof Todo
   */
  private inputStream: string;

  /**
   * The output stream provided in the transaction.
   * If no output stream this will not be set.
   *
   * @private
   * @type {string}
   * @memberof Todo
   */
  private outputStream: string;

  /**
   * The data provided in the transaction
   *
   * @private
   * @type {unknown}
   * @memberof Todo
   */
  private data: unknown;

  /**
   * The current data state of the stream
   *
   * @private
   * @type {unknown}
   * @memberof Todo
   */
  private state: unknown;

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

  /**
   * Verify that the create data contains the basic data,
   * name, dueDate, body, and the name and body length must not be blank
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private verifyCreate(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
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

  /**
   * Verify that the update data contains some data,
   * either name, body or dueDate, can be all or one.
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private verifyUpdate(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
    if (this.data && (this.data.name || this.data.body || this.data.dueDate)) {
      resolve(true);
    } else {
      reject("No data provided");
    }
  }

  /**
   * Verify that a stream id has been given
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private verifyShare(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
    if (this.data.stream && this.data.stream.length === 64) {
      resolve(true);
    } else {
      reject("No recipient provided");
    }
  }

  /**
   * Vote on the create data
   * In this instance no checks are needed
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private voteCreate(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
    resolve(true);
  }

  /**
   * Check that the update data has been sent by the owner
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private voteUpdate(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
    if (this.inputStream === this.state.owner) {
      resolve(true);
    } else {
      reject("Only owner can update");
    }
  }

  /**
   * Check that the share data has been sent by the owner
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private voteShare(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
    if (this.inputStream === this.state.owner) {
      resolve(true);
    } else {
      reject("Only owner can share");
    }
  }

  /**
   * Create a new todo stream in the ledger
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private commitCreate(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
    const namespace = this.transactions.$namespace;

    const activity = this.newActivityStream(this.data.name);
    activity.setAuthority(
      this.getActivityStreams(this.inputStream).getAuthority(),
      this.getActivityStreams(this.inputStream).getAuthority(true)
    );

    const state = activity.getState();
    state.owner = this.inputStream;
    state.name = this.data.name;
    state.type = `${namespace}.todo`;
    state.body = this.data.body;
    state.dueDate = this.data.dueDate;
    state.sharedWith = [];

    activity.setState(state);

    resolve(true);
  }

  /**
   * Update a todo stream on the ledger
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private commitUpdate(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
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

  /**
   * Add a stream to the shared with array of a todo stream
   *
   * @private
   * @param {(ok: boolean) => void} resolve
   * @param {(message: string) => void} reject
   * @memberof Todo
   */
  private commitShare(
    resolve: (ok: boolean) => void,
    reject: (message: string) => void
  ): void {
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
