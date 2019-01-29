import { Injectable } from "@angular/core";
import { ITodo } from "../shared/interfaces/todos.interface";
import axios from "axios";
import { LedgerService } from "./ledger.service";

/**
 * Connect to the ledger API to retrieve data
 * NOTE: This is done for the purposes of this tutorial, in a
 * production environment a middleware API should be used.
 *
 * @export
 * @class DatabaseService
 */
@Injectable({
  providedIn: "root"
})
export class DatabaseService {
  private axiosInstance = axios.create({
    baseURL: "http://localhost:5261/api",
    timeout: 10000
  });

  constructor(private ledger: LedgerService) {}

  /**
   * Get all todos created with this stream id
   *
   * @returns {Promise<ITodo[]>}
   * @memberof DatabaseService
   */
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

  /**
   * Get all Todos shared with this stream id
   *
   * @returns {Promise<ITodo[]>}
   * @memberof DatabaseService
   */
  public getSharedWithTodos(): Promise<ITodo[]> {
    return new Promise((resolve, reject) => {
      const query = {
        mango: {
          selector: {
            sharedWith: {
              $in: [this.ledger.streamid]
            }
          },
          fields: ["name", "_id", "body", "dueDate", "sharedWith", "owner"]
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

  /**
   * Process the todo data into and array of ITodo's
   *
   * @private
   * @param {any} streams
   * @returns {Promise<ITodo[]>}
   * @memberof DatabaseService
   */
  private processTodos(streams: any): Promise<ITodo[]> {
    return new Promise((resolve, reject) => {
      const processed = [];

      let i = streams.length;
      while (i--) {
        const stream = streams[i];

        const dataHolder: ITodo = {
          streamid: stream._id,
          name: stream.name,
          body: stream.body,
          dueDate: new Date(stream.dueDate),
          sharedWith: stream.sharedWith
        };

        if (stream.owner) {
          dataHolder.owner = stream.owner;
        }

        processed.push(dataHolder);
      }

      resolve(processed);
    });
  }

  /**
   * Get the data of a specific todo
   *
   * @param {string} id
   * @returns {Promise<ITodo>}
   * @memberof DatabaseService
   */
  public findTodo(id: string): Promise<ITodo> {
    return new Promise((resolve, reject) => {
      const query = {
        mango: {
          selector: {
            _id: id
          },
          fields: ["name", "_id", "body", "dueDate", "sharedWith", "owner"]
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
            sharedWith: resp.data.streams[0].sharedWith,
            owner: resp.data.streams[0].owner
          };
          resolve(todo);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }
}
