/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";
import { assertValidRgbaImage, RgbaImage } from "./ImageData";

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
        assert.ok(reader.isEOF(), "Not reach end of the file because of trailing data.");
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

    public toRgbaImage(): RgbaImage {
        const bytesPerPixel = this._header.pixelDepth / 8;
        assert.ok(this._header.imageType === 2 || this._header.imageType === 3, `Unsupported TGA image type:${this._header.imageType}`);
        assert.ok(bytesPerPixel === 3 || bytesPerPixel === 4 || bytesPerPixel === 1, `Unsupported TGA pixel depth:${this._header.pixelDepth}`);

        const idBytes = this._header.idLength;
        const colorMapBytes = this._header.colorMapLength * Math.ceil(this._header.colorMapEntrySize / 8);
        const imageOffset = idBytes + colorMapBytes;
        const pixelBytes = this._header.width * this._header.height * bytesPerPixel;
        assert.ok(this._payload.length >= imageOffset + pixelBytes, "TGA image payload is incomplete.");

        const image = Buffer.alloc(this._header.width * this._header.height * 4);
        const topOrigin = !!(this._header.imageDescriptor & 0x20);
        const rightOrigin = !!(this._header.imageDescriptor & 0x10);
        let sourceOffset = imageOffset;
        for (let sourceY = 0; sourceY < this._header.height; ++sourceY) {
            const y = topOrigin ? sourceY : this._header.height - 1 - sourceY;
            for (let sourceX = 0; sourceX < this._header.width; ++sourceX) {
                const x = rightOrigin ? this._header.width - 1 - sourceX : sourceX;
                const targetOffset = (y * this._header.width + x) * 4;
                if (bytesPerPixel === 1) {
                    const gray = this._payload[sourceOffset++];
                    image[targetOffset] = gray;
                    image[targetOffset + 1] = gray;
                    image[targetOffset + 2] = gray;
                    image[targetOffset + 3] = 255;
                } else {
                    image[targetOffset + 2] = this._payload[sourceOffset++];
                    image[targetOffset + 1] = this._payload[sourceOffset++];
                    image[targetOffset] = this._payload[sourceOffset++];
                    image[targetOffset + 3] = bytesPerPixel === 4 ? this._payload[sourceOffset++] : 255;
                }
            }
        }
        return { width: this._header.width, height: this._header.height, data: image };
    }

    public static fromRgbaImage(image: RgbaImage): TgaImageObject {
        assertValidRgbaImage(image);
        const object = new TgaImageObject();
        object.header = {
            idLength: 0,
            colorMapType: 0,
            imageType: 2,
            colorMapFirstEntryIndex: 0,
            colorMapLength: 0,
            colorMapEntrySize: 0,
            xOrigin: 0,
            yOrigin: 0,
            width: image.width,
            height: image.height,
            pixelDepth: 32,
            imageDescriptor: 0x28
        };

        const payload = Buffer.alloc(image.width * image.height * 4);
        for (let y = 0; y < image.height; ++y) {
            for (let x = 0; x < image.width; ++x) {
                const sourceOffset = (y * image.width + x) * 4;
                const targetOffset = sourceOffset;
                payload[targetOffset] = image.data[sourceOffset + 2];
                payload[targetOffset + 1] = image.data[sourceOffset + 1];
                payload[targetOffset + 2] = image.data[sourceOffset];
                payload[targetOffset + 3] = image.data[sourceOffset + 3];
            }
        }
        object.payload = payload;
        return object;
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
