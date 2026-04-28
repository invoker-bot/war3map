/**
 *  @packageDocumentation
 */
import { ReadDumpObject } from "./BinaryBuffer";

/**
 * RawFileObject preserves unsupported or opaque Warcraft III map files byte-for-byte.
 */
export class RawFileObject implements ReadDumpObject {
    protected _buffer: Buffer = Buffer.alloc(0);

    public read(buffer: Buffer): void {
        this._buffer = Buffer.from(buffer);
    }

    public dump(): Buffer {
        return Buffer.from(this._buffer);
    }

    public get buffer(): Buffer {
        return Buffer.from(this._buffer);
    }
    public set buffer(buffer: Buffer) {
        this._buffer = Buffer.from(buffer);
    }

    public get base64(): string {
        return this._buffer.toString("base64");
    }
    public set base64(base64: string) {
        this._buffer = Buffer.from(base64, "base64");
    }
}
