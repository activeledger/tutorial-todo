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

@Injectable({
  providedIn: "root"
})
export class LedgerService {
  constructor(private router: Router) {}

  get key(): IKey {
    return JSON.parse(localStorage.getItem("keyPair")) as IKey;
  }

  set key(key: IKey) {
    localStorage.setItem("keyPair", JSON.stringify(key));
  }

  get streamid() {
    return localStorage.getItem("streamid");
  }

  set streamid(streamid: string) {
    localStorage.setItem("streamid", streamid);
  }

  public logout(): void {
    localStorage.removeItem("streamid");
    this.router.navigateByUrl("/");
  }

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
            reject("Bad ledger response");
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }

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
