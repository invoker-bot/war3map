/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

/**
 * CustomTextTriggerObject parses "war3map.wct" custom script text and can dump it back.
 */
export class CustomTextTriggerObject implements ReadDumpObject {
    protected _fileVersion = 1;
    protected _scriptBytes: Buffer = Buffer.alloc(0);

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        this._fileVersion = reader.readInt();
        this._scriptBytes = reader.readBytes(buffer.length - 4);
        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(this._fileVersion);
        writer.writeBuffer(this._scriptBytes);
        return writer.getBuffer();
    }

    public get fileVersion(): number {
        return this._fileVersion;
    }
    public set fileVersion(fileVersion: number) {
        this._fileVersion = fileVersion;
    }

    public get scriptText(): string {
        return this._scriptBytes.toString("utf8");
    }
    public set scriptText(scriptText: string) {
        this._scriptBytes = Buffer.from(scriptText, "utf8");
    }

    public get scriptBytes(): Buffer {
        return Buffer.from(this._scriptBytes);
    }
    public set scriptBytes(scriptBytes: Buffer) {
        this._scriptBytes = Buffer.from(scriptBytes);
    }
}
