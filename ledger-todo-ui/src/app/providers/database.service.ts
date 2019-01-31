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
    const query = {
      mango: {
        selector: {
          owner: this.ledger.streamid
        },
        fields: ["name", "_id", "body", "dueDate", "sharedWith"]
      }
    };

    return this.sendQuery(query);
  }

  /**
   * Get all Todos shared with this stream id
   *
   * @returns {Promise<ITodo[]>}
   * @memberof DatabaseService
   */
  public getSharedWithTodos(): Promise<ITodo[]> {
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

    return this.sendQuery(query);
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

      this.sendQuery(query)
        .then((todo: ITodo[]) => {
          // Returns Array of processed todos, we just want to return one
          resolve(todo[0]);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }

  /**
   * Send the query to Activecores search endpoint
   *
   * @private
   * @param {{}} query
   * @returns {Promise<ITodo[]>}
   * @memberof DatabaseService
   */
  private sendQuery(query: {}): Promise<ITodo[]> {
    return new Promise((resolve, reject) => {
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
   * @param {any[]} streams
   * @returns {Promise<ITodo[]>}
   * @memberof DatabaseService
   */
  private processTodos(streams: any[]): Promise<ITodo[]> {
    return new Promise((resolve) => {
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
}
