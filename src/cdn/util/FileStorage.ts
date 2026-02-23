/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Storage } from "./Storage";
import fs from "fs";
import fsp from "fs/promises";
import { join, dirname } from "path";
import { Readable } from "stream";
import ExifTransformer from "exif-be-gone";

// TODO: split stored files into separate folders named after cloned route
export class FileStorage implements Storage {
    getFsPath(path: string): string {
        // STORAGE_LOCATION has a default value in start.ts
        const root = process.env.STORAGE_LOCATION || "../";
        const filename = join(root, path);

        if (path.indexOf("\0") !== -1 || !filename.startsWith(root)) throw new Error("invalid path");
        return filename;
    }
    isFile(path: string): Promise<boolean> {
        return Promise.resolve(fs.statSync(this.getFsPath(path)).isFile());
    }

    async get(path: string): Promise<Buffer | null> {
        path = this.getFsPath(path);
        try {
            return await fsp.readFile(path);
        } catch (error) {
            try {
                console.warn("[CDN] Warning: falling back to first file in dir for path", path);
                const files = fs.readdirSync(path);
                if (!files.length) return null;
                return await fsp.readFile(join(path, files[0]));
            } catch (error) {
                return null;
            }
        }
    }

    async clone(path: string, newPath: string) {
        path = this.getFsPath(path);
        newPath = this.getFsPath(newPath);

        if (!fs.existsSync(dirname(newPath))) fs.mkdirSync(dirname(newPath), { recursive: true });

        // use reflink if possible, in order to not duplicate files at the block layer...
        fs.copyFileSync(path, newPath, fs.constants.COPYFILE_FICLONE);
    }

    async set(path: string, value: Buffer) {
        path = this.getFsPath(path);
        if (!fs.existsSync(dirname(path))) fs.mkdirSync(dirname(path), { recursive: true });

        const ret = Readable.from(value);
        const cleaned_file = fs.createWriteStream(path);

        ret.pipe(new ExifTransformer()).pipe(cleaned_file);
    }

    async delete(path: string) {
        //TODO we should delete the parent directory if empty
        fs.unlinkSync(this.getFsPath(path));
    }

    async exists(path: string) {
        return fs.existsSync(this.getFsPath(path));
    }

    async move(path: string, newPath: string) {
        path = this.getFsPath(path);
        newPath = this.getFsPath(newPath);

        if (!fs.existsSync(dirname(newPath))) fs.mkdirSync(dirname(newPath), { recursive: true });

        fs.renameSync(path, newPath);
    }
}
