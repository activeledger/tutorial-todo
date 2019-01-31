import { Injectable } from "@angular/core";
import {
  CreateTodoTx,
  UpdateTodoTx,
  ShareTodoTx
} from "../shared/structures/transactions.structure";
import {
  Connection,
  IKey,
  KeyHandler,
  KeyType,
  ILedgerResponse,
  TransactionHandler,
  IBaseTransaction
} from "@activeledger/sdk";
import { IUpdateTodo, ICreateTodo } from "../shared/interfaces/todos.interface";
import { Router } from "@angular/router";

/**
 * Handle sending data to the ledger
 *
 * @export
 * @class LedgerService
 */
@Injectable({
  providedIn: "root"
})
export class LedgerService {
  constructor(private router: Router) {}

  /**
   * Get the key stored in local storage
   *
   * @type {IKey}
   * @memberof LedgerService
   */
  get key(): IKey {
    return JSON.parse(localStorage.getItem("keyPair")) as IKey;
  }

  /**
   * Store the key in local storage
   *
   * @memberof LedgerService
   */
  set key(key: IKey) {
    localStorage.setItem("keyPair", JSON.stringify(key));
  }

  /**
   * Get the stream ID stored in local storage
   *
   * @memberof LedgerService
   */
  get streamid() {
    return localStorage.getItem("streamid");
  }

  /**
   * Store a stream ID in local storage
   *
   * @memberof LedgerService
   */
  set streamid(streamid: string) {
    localStorage.setItem("streamid", streamid);
  }

  /**
   * Logout of the system
   * Remove the stream ID from local storage
   * Navigate to the login page
   *
   * @memberof LedgerService
   */
  public logout(): void {
    localStorage.removeItem("streamid");
    this.router.navigateByUrl("/");
  }

  /**
   * Create a new key and identity to use for the todos
   *
   * @returns {Promise<string>}
   * @memberof LedgerService
   */
  public createIdentity(): Promise<string> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);

      const keyHandler = new KeyHandler();
      keyHandler
        // Generate the key
        .generateKey("local", KeyType.EllipticCurve)
        .then((key: IKey) => {
          // Store the key
          this.key = key;
          // Create an identity on the ledger using the key
          return keyHandler.onboardKey(key, conn);
        })
        // Check the response and get the streamid
        .then((resp: ILedgerResponse) => {
          if (resp.$streams.new && resp.$streams.new[0]) {
            // Store the streamid
            this.streamid = resp.$streams.new[0].id;

            // Add the identity to the locally stored key
            const key = this.key;
            key.identity = resp.$streams.new[0].id;
            this.key = key;

            // Send the streamid back
            resolve(resp.$streams.new[0].id);
          } else {
            // If there is nothing in $streams.new must have errored
            if ((resp.$summary as any).errors) {
              reject((resp.$summary as any).errors);
            } else {
              reject("Bad ledger response");
            }
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }

  /**
   * Send the transaction that creates a new todo item
   *
   * @param {ICreateTodo} data
   * @returns {Promise<any>}
   * @memberof LedgerService
   */
  public createTodo(data: ICreateTodo): Promise<any> {
    const transaction = new CreateTodoTx();

    transaction.$tx.$i[this.streamid] = {
      name: data.name,
      body: data.body,
      dueDate: data.dueDate
    };

    return this.signAndSendTx<CreateTodoTx>(transaction);
  }

  /**
   * Update the data of a todo item
   *
   * @param {IUpdateTodo} data
   * @returns {Promise<any>}
   * @memberof LedgerService
   */
  public updateTodo(data: IUpdateTodo): Promise<any> {
    const transaction = new UpdateTodoTx();

    transaction.$tx.$i[this.streamid] = {};

    transaction.$tx.$o[data.streamid] = {};

    if (data.name) {
      transaction.$tx.$o[data.streamid].name = data.name;
    }

    if (data.body) {
      transaction.$tx.$o[data.streamid].body = data.body;
    }

    if (data.dueDate) {
      transaction.$tx.$o[data.streamid].dueDate = data.dueDate;
    }

    return this.signAndSendTx<UpdateTodoTx>(transaction);
  }

  /**
   * Share a todo item with another stream ID
   *
   * @param {string} recipientStream
   * @param {string} todoStream
   * @returns {Promise<any>}
   * @memberof LedgerService
   */
  public shareTodo(recipientStream: string, todoStream: string): Promise<any> {
    const transaction = new ShareTodoTx();

    transaction.$tx.$i[this.streamid] = {};

    transaction.$tx.$o[todoStream] = {
      stream: recipientStream
    };

    return this.signAndSendTx<ShareTodoTx>(transaction);
  }

  /**
   * Sign and send a transaction to the ledger
   *
   * @private
   * @template T
   * @param {T} transaction
   * @returns {Promise<any>}
   * @memberof LedgerService
   */
  private signAndSendTx<T extends IBaseTransaction>(
    transaction: T
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);
      const txHandler = new TransactionHandler();

      txHandler
        .signTransaction(transaction, this.key)
        .then((signedTx: any) => {
          return txHandler.sendTransaction(signedTx, conn);
        })
        .then((ledgerResp: any) => {
          resolve(ledgerResp);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }
}
