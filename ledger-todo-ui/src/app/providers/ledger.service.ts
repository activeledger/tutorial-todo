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
  TransactionHandler
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
        .generateKey("local", KeyType.EllipticCurve)
        .then((key: IKey) => {
          this.key = key;
          return keyHandler.onboardKey(key, conn);
        })
        .then((resp: ILedgerResponse) => {
          if (resp.$streams.new && resp.$streams.new[0]) {
            this.streamid = resp.$streams.new[0].id;

            const key = this.key;
            key.identity = resp.$streams.new[0].id;
            this.key = key;
            resolve(resp.$streams.new[0].id);
          } else {
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
   * @returns {Promise<void>}
   * @memberof LedgerService
   */
  public createTodo(data: ICreateTodo): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);
      const txHandler = new TransactionHandler();

      const transaction = new CreateTodoTx();

      transaction.$tx.$i[this.streamid] = {
        name: data.name,
        body: data.body,
        dueDate: data.dueDate
      };

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

  /**
   * Update the data of a todo item
   *
   * @param {IUpdateTodo} data
   * @returns {Promise<void>}
   * @memberof LedgerService
   */
  public updateTodo(data: IUpdateTodo): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);
      const txHandler = new TransactionHandler();

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

  /**
   * Share a todo item with another stream ID
   *
   * @param {string} recipientStream
   * @param {string} todoStream
   * @returns {Promise<void>}
   * @memberof LedgerService
   */
  public shareTodo(recipientStream: string, todoStream: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);
      const txHandler = new TransactionHandler();

      const transaction = new ShareTodoTx();

      transaction.$tx.$i[this.streamid] = {};

      transaction.$tx.$o[todoStream] = {
        stream: recipientStream
      };

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
