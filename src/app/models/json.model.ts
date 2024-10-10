export class JSONModel {
  private data: any;

  constructor(jsonData: any) {
    this.data = jsonData;
  }

  get(path: string, defaultValue: any = undefined): any {
    return path.split('.').reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : defaultValue;
    }, this.data);
  }

  set(path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => {
      if (acc[part] === undefined) {
        acc[part] = {};
      }
      return acc[part];
    }, this.data);
    if (last) {
      target[last] = value;
    }
  }

  delete(path: string): void {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, this.data);
    if (target && last) {
      delete target[last];
    }
  }

  has(path: string): boolean {
    return this.get(path) !== undefined;
  }

  keys(): string[] {
    return Object.keys(this.data);
  }

  values(): any[] {
    return Object.values(this.data);
  }

  entries(): [string, any][] {
    return Object.entries(this.data);
  }

  toJSON(): any {
    return JSON.parse(JSON.stringify(this.data));
  }

  toString(): string {
    return JSON.stringify(this.data);
  }

  forEach(callback: (key: string, value: any) => void): void {
    Object.entries(this.data).forEach(([key, value]) => callback(key, value));
  }

  map<T>(callback: (key: string, value: any) => T): T[] {
    return Object.entries(this.data).map(([key, value]) =>
      callback(key, value),
    );
  }

  filter(predicate: (key: string, value: any) => boolean): JSONModel {
    const filteredData = Object.entries(this.data)
      .filter(([key, value]) => predicate(key, value))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    return new JSONModel(filteredData);
  }

  merge(other: JSONModel | object): JSONModel {
    const otherData = other instanceof JSONModel ? other.toJSON() : other;
    return new JSONModel({ ...this.data, ...otherData });
  }

  clone(): JSONModel {
    return new JSONModel(this.toJSON());
  }
}
