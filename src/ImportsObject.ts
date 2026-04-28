/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

const CurrentPathVersion = 21;

export interface ImportedFile {
    pathVersion: number;
    path: string;
}

/**
 * ImportsObject parses data from "war3map.imp" file and can dump back.
 */
export class ImportsObject implements ReadDumpObject {
    protected _fileVersion = 1;
    protected _imports: ImportedFile[] = [];

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        this._fileVersion = reader.readInt();
        assert.strictEqual(this._fileVersion, 1, `Unsupported file version:${this._fileVersion}`);

        this._imports = [];
        const numberOfImports = reader.readInt();
        for (let i = 0; i < numberOfImports; ++i) {
            const pathVersion = reader.readByte();
            const path = reader.readString();
            this._imports.push({ pathVersion, path });
        }

        assert.ok(reader.isEOF(), "Not reach end of the file because of trailing data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(this._fileVersion);
        writer.writeInt(this._imports.length);
        this._imports.forEach((importedFile) => {
            writer.writeByte(importedFile.pathVersion);
            writer.writeString(importedFile.path, true);
        });
        return writer.getBuffer();
    }

    public get imports(): ImportedFile[] {
        return this._imports;
    }
    public set imports(_imports: ImportedFile[]) {
        this._imports = _imports.map((importedFile) => ({
            pathVersion: importedFile.pathVersion === undefined ? CurrentPathVersion : importedFile.pathVersion,
            path: importedFile.path
        }));
    }

    public get paths(): string[] {
        return this._imports.map((importedFile) => importedFile.path);
    }
    public set paths(paths: string[]) {
        this._imports = paths.map((path) => ({ pathVersion: CurrentPathVersion, path }));
    }
}
