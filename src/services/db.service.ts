import {WordEntry} from 'types/db';
import {v4 as uuidv4} from 'uuid';

const {REACT_APP_DB_NAME} = process.env;

class Database {
  database: Record<string, any> = {};

  wordIndex: Record<string, string> = {};

  public get(key: string): any {
    return this.database[key];
  }

  public set(key: string, value: any): void {
    this.database[key] = value;
  }

  public saveToLocalStorage(): void {
    localStorage.setItem(REACT_APP_DB_NAME || 'db', JSON.stringify(this.database));
  }
}

export class EntumanyDB extends Database {
  private static instance: EntumanyDB;

  public static getInstance(): EntumanyDB {
    if (!EntumanyDB.instance) {
      EntumanyDB.instance = new EntumanyDB();
    }
    return EntumanyDB.instance;
  }

  private getWordIndex(e: WordEntry) {
    return `${e.word.toLowerCase()}|||${e.language}`;
  }

  private generateId(): string {
    return uuidv4();
  }

  private mergeEntries() {
    // TODO: Merge entries
  }

  addWords(a: WordEntry, b: WordEntry): void {
    const aIndex = this.getWordIndex(a); // For eg: "hello|||en"
    const bIndex = this.getWordIndex(b); // For eg: "Hellu|||de"

    const id = this.wordIndex[aIndex] || this.wordIndex[bIndex] || this.generateId();

    if (!this.database[id]) {
      this.database[id] = {};
    }

    this.database[id][a.language] = a.word;
    this.database[id][b.language] = b.word;
    this.wordIndex[aIndex] = id;
    this.wordIndex[bIndex] = id;
  }

  clearDB(): void {
    this.database = {};
    this.wordIndex = {};
  }

  getState(): void {
    console.log('💿', this.database);
  }
}
