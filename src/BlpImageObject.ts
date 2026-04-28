/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface BlpMipmap {
    offset: number;
    size: number;
}

export interface BlpHeader {
    magic: string;
    content: number;
    alphaBits: number;
    width: number;
    height: number;
    pictureType: number;
    pictureSubType: number;
    mipmaps: BlpMipmap[];
}

/**
 * BlpImageObject parses Warcraft III BLP1 image headers and preserves image payload bytes.
 */
export class BlpImageObject implements ReadDumpObject {
    protected _header: BlpHeader = {
        magic: "BLP1",
        content: 0,
        alphaBits: 0,
        width: 0,
        height: 0,
        pictureType: 0,
        pictureSubType: 0,
        mipmaps: []
    };
    protected _payload: Buffer = Buffer.alloc(0);

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        const magic = reader.readChars(4);
        assert.strictEqual(magic, "BLP1", "File should be `BLP1` image format.");
        const header: BlpHeader = {
            magic,
            content: reader.readInt(),
            alphaBits: reader.readInt(),
            width: reader.readInt(),
            height: reader.readInt(),
            pictureType: reader.readInt(),
            pictureSubType: reader.readInt(),
            mipmaps: []
        };
        const offsets: number[] = [];
        const sizes: number[] = [];
        for (let i = 0; i < 16; ++i) {
            offsets.push(reader.readInt());
        }
        for (let i = 0; i < 16; ++i) {
            sizes.push(reader.readInt());
        }
        header.mipmaps = offsets.map((offset, index) => ({ offset, size: sizes[index] }));
        this._header = header;
        this._payload = reader.readBytes(buffer.length - 156);
        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeString(this._header.magic);
        writer.writeInt(this._header.content);
        writer.writeInt(this._header.alphaBits);
        writer.writeInt(this._header.width);
        writer.writeInt(this._header.height);
        writer.writeInt(this._header.pictureType);
        writer.writeInt(this._header.pictureSubType);
        for (let i = 0; i < 16; ++i) {
            writer.writeInt(this._header.mipmaps[i] ? this._header.mipmaps[i].offset : 0);
        }
        for (let i = 0; i < 16; ++i) {
            writer.writeInt(this._header.mipmaps[i] ? this._header.mipmaps[i].size : 0);
        }
        writer.writeBuffer(this._payload);
        return writer.getBuffer();
    }

    public get header(): BlpHeader {
        return this._header;
    }
    public set header(header: BlpHeader) {
        this._header = header;
    }
    public get payload(): Buffer {
        return Buffer.from(this._payload);
    }
    public set payload(payload: Buffer) {
        this._payload = Buffer.from(payload);
    }
}
