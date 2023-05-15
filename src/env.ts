import process from "process";
import fs from "fs";

export function ENV(key: string, dfault: string | null = null): string {
  const lookup = process.env[key];
  if (lookup) {
    return lookup;
  }
  if (dfault) {
    return dfault;
  }
  throw new Error(`Environment variable ${key} required but not set`);
}

export function FILE_ENV(key: string, dfault: string | null = null) {
  return {
    get: function (): string {
      if (fs.existsSync(`${key}.txt`)) {
        return fs.readFileSync(`${key}.txt`, "utf-8").trim();
      }
      if (dfault != null) {
        return dfault;
      }
      throw new Error(
        `Configuration file ${key}.txt required but does not exist`
      );
    },
    set: function (value: string): void {
      fs.writeFileSync(`${key}.txt`, value);
    },
  };
}
