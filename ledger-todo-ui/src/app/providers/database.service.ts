import { Injectable } from "@angular/core";
import {
  ICreateTodo,
  ITodo,
  ITodoLedgerResponse
} from "../shared/interfaces/todos.interface";
import axios from "axios";
import { LedgerService } from "./ledger.service";
import { IUpdateTodo } from "../shared/interfaces/todos.interface";

@Injectable({
  providedIn: "root"
})
export class DatabaseService {
  private axiosInstance = axios.create({
    baseURL: "http://localhost:5261/api",
    timeout: 10000
  });

  constructor(private ledger: LedgerService) {}

  public getCreatedTodos(): Promise<ITodo[]> {
    return new Promise((resolve, reject) => {
      const query = {
        mango: {
          selector: {
            owner: this.ledger.streamid
          },
          fields: ["name", "_id", "body", "dueDate", "sharedWith"]
        }
      };

      this.axiosInstance
        .post("/stream/search", query)
        .then((resp) => {
          return this.processTodos(resp.data.streams);
        })
        .then((processedTodos: ITodo[]) => {
          resolve(processedTodos);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }

  private processTodos(streams: ITodoLedgerResponse[]): Promise<ITodo[]> {
    return new Promise((resolve, reject) => {
      const processed = [];

      let i = streams.length;
      while (i--) {
        const stream = streams[i];
        processed.push({
          streamid: stream._id,
          name: stream.name,
          body: stream.body,
          dueDate: stream.dueDate,
          sharedWith: stream.sharedWith
        });
      }

      resolve(processed);
    });
  }

  public findTodo(id: string): Promise<ITodo> {
    return new Promise((resolve, reject) => {
      const query = {
        mango: {
          selector: {
            _id:
              "d5f3e3106f2843a50b05fc1d1ffbe0a0711a39084a44546799ab1c0ca90f2406"
          },
          fields: ["name", "_id", "body", "dueDate", "sharedWith"]
        }
      };

      this.axiosInstance
        .post("/stream/search", query)
        .then((resp) => {
          const todo: ITodo = {
            streamid: resp.data.streams[0]._id,
            name: resp.data.streams[0].name,
            body: resp.data.streams[0].body,
            dueDate: resp.data.streams[0].dueDate,
            sharedWith: resp.data.streams[0].sharedWith
          };
          resolve(todo);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }
}
