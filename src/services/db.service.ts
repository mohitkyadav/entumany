import {AppOptions, Language, WordEntry} from 'types/db';
import {v4 as uuidv4} from 'uuid';

const defaultAppOptions: AppOptions = {
  language1: Language.ENGLISH,
  language2: Language.HINDI,
  perQuestionAllowedTimeInSec: 0,
};
class Database {
  database: Record<string, any> = {};

  wordIndex: Record<string, string> = {};

  appOptions: AppOptions = defaultAppOptions;

  public get(key: string): any {
    return this.database[key];
  }

  public set(key: string, value: any): void {
    this.database[key] = value;
  }
}

export class EntumanyDB extends Database {
  private static instance: EntumanyDB;

  private getWordIndex(e: WordEntry) {
    return `${e.word.toLowerCase()}|||${e.language}`;
  }

  private generateId(): string {
    return uuidv4();
  }

  private mergeEntries(idA: string, idB: string): void {
    const newId = this.generateId();

    this.database[newId] = {...this.database[idA], ...this.database[idB]};
    delete this.database[idA];
    delete this.database[idB];

    Object.entries<any>(this.database[newId]).map(([language, word]) => {
      const idx = this.getWordIndex({language: language as Language, word});
      this.wordIndex[idx] = newId;
    });
  }

  public static getInstance(): EntumanyDB {
    if (!EntumanyDB.instance) {
      EntumanyDB.instance = new EntumanyDB();
    }

    return EntumanyDB.instance;
  }

  public saveToLocalStorage(): void {
    localStorage.setItem('database', JSON.stringify(this.database));
    localStorage.setItem('wordIndex', JSON.stringify(this.wordIndex));
    localStorage.setItem('appOptions', JSON.stringify(this.appOptions));
  }

  public populateFromLocalStorage(): void {
    this.database = JSON.parse(localStorage.getItem('database') || '{}');
    this.wordIndex = JSON.parse(localStorage.getItem('wordIndex') || '{}');
    this.appOptions = JSON.parse(localStorage.getItem('appOptions') || '{}');
  }

  public addWords(a: WordEntry, b: WordEntry): void {
    const aIndex = this.getWordIndex(a); // For eg: "hello|||en"
    const bIndex = this.getWordIndex(b); // For eg: "Hellu|||de"

    const idA = this.wordIndex[aIndex];
    const idB = this.wordIndex[bIndex];

    if (idA && idB) {
      this.mergeEntries(idA, idB);
      return;
    }

    const id = idA || idB || this.generateId();

    if (!this.database[id]) {
      this.database[id] = {};
    }

    this.database[id][a.language] = a.word;
    this.database[id][b.language] = b.word;
    this.wordIndex[aIndex] = id;
    this.wordIndex[bIndex] = id;
  }

  public clearDB(): void {
    this.database = {};
    this.wordIndex = {};
    this.appOptions = defaultAppOptions;
  }

  public getState(): void {
    console.log('💿', this.database);
    console.log('💿', this.wordIndex);
    console.log('💿', this.appOptions);
  }
}
