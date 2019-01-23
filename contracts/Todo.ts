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

        if (this.transactions.$entry) {
          switch (this.transactions.$entry) {
            case "create":
              return this.verifyCreate();
            case "update":
              return this.verifyUpdate();
            case "share":
              return this.verifyShare();
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
      // Get Stream id
      this.inputStream = Object.keys(this.transactions.$i)[0];

      if (this.transactions.$o) {
        this.outputStream = Object.keys(this.transactions.$o)[0]
        // Get Stream Activity
        this.activity = this.getActivityStreams(this.outputStream);
        // Run Checks on input stream data object
        this.state = this.activity.getState();
      }

      this.data = this.transactions.$i[this.inputStream];

      switch (this.transactions.$entry) {
        case "create":
          return this.voteCreate();
        case "update":
          return this.voteUpdate();
        case "share":
          return this.voteShare();
      }

      this.ActiveLogger.debug("Voting Round - Automatic True");
      resolve(true);
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
          return this.commitCreate();
        case "update":
          return this.commitUpdate();
        case "share":
          return this.commitShare();
      }
    });
  }

  private verifyCreate(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
  }

  private verifyUpdate(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
  }

  private verifyShare(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
  }

  private voteCreate(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
  }

  private voteUpdate(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
  }

  private voteShare(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
  }

  private commitCreate(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
  }

  private commitUpdate(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
  }

  private commitShare(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

    });
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
