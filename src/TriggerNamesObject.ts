/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface TriggerStringReference {
    offset: number;
    value: string;
}

/**
 * TriggerNamesObject validates "war3map.wtg" and exposes its embedded strings while preserving payload bytes.
 */
export class TriggerNamesObject implements ReadDumpObject {
    protected _fileVersion = 7;
    protected _payload: Buffer = Buffer.alloc(0);
    protected _strings: TriggerStringReference[] = [];

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        const fileId = reader.readChars(4);
        assert.strictEqual(fileId, "WTG!", "File should be `wtg` format.");
        this._fileVersion = reader.readInt();
        this._payload = reader.readBytes(buffer.length - 8);
        this._strings = TriggerNamesObject.extractStrings(this._payload, 8);
        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeString("WTG!");
        writer.writeInt(this._fileVersion);
        writer.writeBuffer(this._payload);
        return writer.getBuffer();
    }

    public static extractStrings(buffer: Buffer, offsetBase = 0): TriggerStringReference[] {
        const strings: TriggerStringReference[] = [];
        let start: number | undefined;
        for (let i = 0; i < buffer.length; ++i) {
            const byte = buffer[i];
            const printable = byte >= 0x20 && byte <= 0x7e;
            if (printable && start === undefined) {
                start = i;
            } else if (!printable && start !== undefined) {
                if (i - start >= 2 && byte === 0) {
                    strings.push({ offset: offsetBase + start, value: buffer.toString("utf8", start, i) });
                }
                start = undefined;
            }
        }
        return strings;
    }

    public get fileVersion(): number {
        return this._fileVersion;
    }
    public get payload(): Buffer {
        return Buffer.from(this._payload);
    }
    public set payload(payload: Buffer) {
        this._payload = Buffer.from(payload);
        this._strings = TriggerNamesObject.extractStrings(this._payload, 8);
    }
    public get strings(): TriggerStringReference[] {
        return this._strings;
    }
}
