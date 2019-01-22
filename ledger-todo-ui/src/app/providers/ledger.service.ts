import { Injectable } from "@angular/core";
import {
  Connection,
  IKey,
  KeyHandler,
  KeyType,
  ILedgerResponse
} from "@activeledger/sdk";

@Injectable({
  providedIn: "root"
})
export class LedgerService {
  constructor() {}

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
}
