import lowdb from "lowdb";
import LocalStorage from "lowdb/adapters/LocalStorage";
import Memory from "lowdb/adapters/Memory";

export default class Database {
  constructor() {
    const db =
      typeof localStorage !== "undefined"
        ? lowdb(new LocalStorage("NemuDB"))
        : lowdb(new Memory());

    return db;
  }
}
