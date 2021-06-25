import { Storage } from "./Storage";
import fs from "fs/promises";
import { join } from "path";
import "missing-native-js-functions";

export class FileStorage implements Storage {
  async get(path: string): Promise<Buffer | null> {
    path = join(process.env.STORAGE_LOCATION || "", path);
    try {
      const file = await fs.readFile(path);
      // @ts-ignore
      return file;
    } catch (error) {
      return null;
    }
  }

  async set(path: string, value: any) {
    path = join(process.env.STORAGE_LOCATION || "", path).replace(/[\\]/g, "/");
    const dir = path.split("/").slice(0, -1).join("/");
    await fs.mkdir(dir, { recursive: true }).caught();

    return fs.writeFile(path, value, { encoding: "binary" });
  }

  async delete(path: string) {
    path = join(process.env.STORAGE_LOCATION || "", path);
    await fs.unlink(path);
  }
}
