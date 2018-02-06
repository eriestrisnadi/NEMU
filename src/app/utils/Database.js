import lowdb from 'lowdb';
import LocalStorage from 'lowdb/adapters/LocalStorage';

export default class Database {
  constructor() {
    const db = lowdb(new LocalStorage('NemuDB'));

    return db;
  }
}