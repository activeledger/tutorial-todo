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
  providedIn: "root",
})
export class DatabaseService {
  private axiosInstance = axios.create({
    baseURL: "http://localhost:4200/api",
    timeout: 10000,
  });

  constructor(private ledger: LedgerService) {}

  /**
   * Get all todos created with this stream id
   *
   * @returns {Promise<ITodo[]>}
   * @memberof DatabaseService
   */
  public async getCreatedTodos(): Promise<ITodo[]> {
    const ids = JSON.parse(localStorage.getItem("streamIds"));

    if (!ids) {
      return Promise.resolve([]);
    }

    const streamData = [];

    for (const id of ids) {
      try {
        const todo = await this.sendQuery(id);
        streamData.push({
          streamid: todo.streamid,
          name: todo.name,
          body: todo.body,
          dueDate: todo.dueDate,
          sharedWith: todo.sharedWith,
        });
      } catch (error) {
        throw error;
      }
    }

    return streamData;
  }

  /**
   * Get all Todos shared with this stream id
   *
   * @returns {Promise<ITodo[]>}
   * @memberof DatabaseService
   */
  /*  public getSharedWithTodos(): Promise<ITodo[]> {
    const query = {
      mango: {
        selector: {
          sharedWith: {
            $in: [this.ledger.streamid],
          },
        },
        fields: ["name", "_id", "body", "dueDate", "sharedWith", "owner"],
      },
    };

    return this.sendQuery(this.ledger.streamid);
  } */

  /**
   * Get the data of a specific todo
   *
   * @param {string} id
   * @returns {Promise<ITodo>}
   * @memberof DatabaseService
   */
  public findTodo(id: string): Promise<ITodo> {
    if (!id) {
      throw new Error("ID not defined");
    }

    return new Promise((resolve, reject) => {
      return this.sendQuery(id)
        .then((todo: any) => {
          // Returns Array of processed todos, we just want to return one
          resolve({
            streamid: todo.streamid,
            name: todo.name,
            body: todo.body,
            dueDate: todo.dueDate,
            sharedWith: todo.sharedWith,
            owner: todo.owner,
          });
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
  private sendQuery(id: string): Promise<ITodo> {
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .get("/stream/" + id)
        .then((resp) => {
          resolve({ streamid: id, ...resp.data.stream });
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
          body: stream.body ? stream.body : "",
          dueDate: stream.dueDate ? new Date(stream.dueDate) : undefined,
          sharedWith: stream.sharedWith ? stream.sharedWith : "",
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
