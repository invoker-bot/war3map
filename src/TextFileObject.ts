/**
 *  @packageDocumentation
 */
import { ReadDumpObject } from "./BinaryBuffer";

/**
 * TextFileObject preserves text-based Warcraft III map files such as JASS and Lua scripts.
 */
export class TextFileObject implements ReadDumpObject {
    protected _bytes: Buffer = Buffer.alloc(0);
    protected _encoding: BufferEncoding;

    constructor(encoding: BufferEncoding = "utf8") {
        this._encoding = encoding;
    }

    public read(buffer: Buffer): void {
        this._bytes = Buffer.from(buffer);
    }

    public dump(): Buffer {
        return this.bytes;
    }

    public get text(): string {
        return this._bytes.toString(this._encoding);
    }
    public set text(text: string) {
        this._bytes = Buffer.from(text, this._encoding);
    }

    public get bytes(): Buffer {
        return Buffer.from(this._bytes);
    }
    public set bytes(bytes: Buffer) {
        this._bytes = Buffer.from(bytes);
    }

    public get encoding(): BufferEncoding {
        return this._encoding;
    }
}
