/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface TgaHeader {
    idLength: number;
    colorMapType: number;
    imageType: number;
    colorMapFirstEntryIndex: number;
    colorMapLength: number;
    colorMapEntrySize: number;
    xOrigin: number;
    yOrigin: number;
    width: number;
    height: number;
    pixelDepth: number;
    imageDescriptor: number;
}

/**
 * TgaImageObject parses TGA headers and preserves image payload bytes.
 */
export class TgaImageObject implements ReadDumpObject {
    protected _header: TgaHeader = {
        idLength: 0,
        colorMapType: 0,
        imageType: 2,
        colorMapFirstEntryIndex: 0,
        colorMapLength: 0,
        colorMapEntrySize: 0,
        xOrigin: 0,
        yOrigin: 0,
        width: 0,
        height: 0,
        pixelDepth: 32,
        imageDescriptor: 0
    };
    protected _payload: Buffer = Buffer.alloc(0);

    public read(buffer: Buffer): void {
        assert.ok(buffer.length >= 18, "TGA image is too short.");
        const reader = new BinaryReadBuffer(buffer);
        this._header = {
            idLength: reader.readByte(),
            colorMapType: reader.readByte(),
            imageType: reader.readByte(),
            colorMapFirstEntryIndex: reader.readShort(),
            colorMapLength: reader.readShort(),
            colorMapEntrySize: reader.readByte(),
            xOrigin: reader.readShort(),
            yOrigin: reader.readShort(),
            width: reader.readShort(),
            height: reader.readShort(),
            pixelDepth: reader.readByte(),
            imageDescriptor: reader.readByte()
        };
        this._payload = reader.readBytes(buffer.length - 18);
        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeByte(this._header.idLength);
        writer.writeByte(this._header.colorMapType);
        writer.writeByte(this._header.imageType);
        writer.writeShort(this._header.colorMapFirstEntryIndex);
        writer.writeShort(this._header.colorMapLength);
        writer.writeByte(this._header.colorMapEntrySize);
        writer.writeShort(this._header.xOrigin);
        writer.writeShort(this._header.yOrigin);
        writer.writeShort(this._header.width);
        writer.writeShort(this._header.height);
        writer.writeByte(this._header.pixelDepth);
        writer.writeByte(this._header.imageDescriptor);
        writer.writeBuffer(this._payload);
        return writer.getBuffer();
    }

    public get header(): TgaHeader {
        return this._header;
    }
    public set header(header: TgaHeader) {
        this._header = header;
    }
    public get payload(): Buffer {
        return Buffer.from(this._payload);
    }
    public set payload(payload: Buffer) {
        this._payload = Buffer.from(payload);
    }
}
