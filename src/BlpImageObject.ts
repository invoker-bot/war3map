/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import * as jpeg from "jpeg-js";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";
import { assertValidRgbaImage, RgbaImage } from "./ImageData";

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

export interface BlpImageWriteOptions {
    quality?: number;
    pictureType?: number;
    pictureSubType?: number;
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

    public toRgbaImage(mipmapIndex = 0): RgbaImage {
        if (this._header.content === 0) {
            return this.readJpegImage(mipmapIndex);
        }
        if (this._header.content === 1) {
            return this.readPalettedImage(mipmapIndex);
        }
        throw new Error(`Unsupported BLP1 content type:${this._header.content}`);
    }

    public static fromRgbaImage(image: RgbaImage, options: BlpImageWriteOptions = {}): BlpImageObject {
        assertValidRgbaImage(image);
        const quality = options.quality === undefined ? 90 : options.quality;
        const encoded = Buffer.from(jpeg.encode({
            width: image.width,
            height: image.height,
            data: image.data
        }, quality).data);
        const splitOffset = BlpImageObject.findJpegImageDataOffset(encoded);
        const jpegHeader = encoded.slice(0, splitOffset);
        const jpegImageData = encoded.slice(splitOffset);
        const payload = Buffer.alloc(4 + jpegHeader.length + jpegImageData.length);
        payload.writeUInt32LE(jpegHeader.length, 0);
        jpegHeader.copy(payload, 4);
        jpegImageData.copy(payload, 4 + jpegHeader.length);

        const object = new BlpImageObject();
        object.header = {
            magic: "BLP1",
            content: 0,
            alphaBits: 0,
            width: image.width,
            height: image.height,
            pictureType: options.pictureType === undefined ? 5 : options.pictureType,
            pictureSubType: options.pictureSubType === undefined ? 0 : options.pictureSubType,
            mipmaps: Array.from({ length: 16 }, (_value, index) => ({
                offset: index === 0 ? 156 + 4 + jpegHeader.length : 0,
                size: index === 0 ? jpegImageData.length : 0
            }))
        };
        object.payload = payload;
        return object;
    }

    protected readJpegImage(mipmapIndex: number): RgbaImage {
        const mipmap = this.requireMipmap(mipmapIndex);
        const jpegHeaderSize = this._payload.readUInt32LE(0);
        const jpegHeader = this._payload.slice(4, 4 + jpegHeaderSize);
        const mipmapOffset = mipmap.offset - 156;
        assert.ok(mipmapOffset >= 0 && mipmapOffset + mipmap.size <= this._payload.length, "BLP mipmap points outside the payload.");
        const jpegImage = Buffer.concat([jpegHeader, this._payload.slice(mipmapOffset, mipmapOffset + mipmap.size)]);
        const decoded = BlpImageObject.decodeJpeg(jpegImage);
        return {
            width: decoded.width,
            height: decoded.height,
            data: Buffer.from(decoded.data)
        };
    }

    protected readPalettedImage(mipmapIndex: number): RgbaImage {
        const mipmap = this.requireMipmap(mipmapIndex);
        assert.ok(this._payload.length >= 1024, "BLP paletted image is missing its color table.");
        const width = Math.max(1, this._header.width >> mipmapIndex);
        const height = Math.max(1, this._header.height >> mipmapIndex);
        const pixelCount = width * height;
        const mipmapOffset = mipmap.offset - 156;
        assert.ok(mipmapOffset >= 1024 && mipmapOffset + pixelCount <= this._payload.length, "BLP mipmap points outside the payload.");
        const alphaOffset = mipmapOffset + pixelCount;
        const image = Buffer.alloc(pixelCount * 4);
        for (let i = 0; i < pixelCount; ++i) {
            const paletteIndex = this._payload[mipmapOffset + i];
            const paletteOffset = paletteIndex * 4;
            image[i * 4] = this._payload[paletteOffset + 2];
            image[i * 4 + 1] = this._payload[paletteOffset + 1];
            image[i * 4 + 2] = this._payload[paletteOffset];
            image[i * 4 + 3] = this.readPaletteAlpha(alphaOffset, i, mipmap.size, pixelCount);
        }
        return { width, height, data: image };
    }

    protected readPaletteAlpha(alphaOffset: number, index: number, mipmapSize: number, pixelCount: number): number {
        if (this._header.alphaBits === 0) {
            return 255;
        }
        if (this._header.alphaBits === 8 && mipmapSize >= pixelCount * 2 && alphaOffset + index < this._payload.length) {
            return this._payload[alphaOffset + index];
        }
        if (this._header.alphaBits === 1 && mipmapSize >= pixelCount + Math.ceil(pixelCount / 8)) {
            const byte = this._payload[alphaOffset + Math.floor(index / 8)];
            return (byte & (1 << (index % 8))) !== 0 ? 255 : 0;
        }
        return 255;
    }

    protected requireMipmap(mipmapIndex: number): BlpMipmap {
        assert.ok(mipmapIndex >= 0 && mipmapIndex < this._header.mipmaps.length, `Invalid BLP mipmap index:${mipmapIndex}`);
        const mipmap = this._header.mipmaps[mipmapIndex];
        assert.ok(mipmap.offset > 0 && mipmap.size > 0, `Missing BLP mipmap:${mipmapIndex}`);
        return mipmap;
    }

    protected static findJpegImageDataOffset(buffer: Buffer): number {
        for (let offset = 2; offset + 1 < buffer.length;) {
            if (buffer[offset] !== 0xff) {
                ++offset;
                continue;
            }
            while (buffer[offset] === 0xff) {
                ++offset;
            }
            const marker = buffer[offset++];
            if (marker === 0xc0 || marker === 0xc2) {
                return offset - 2;
            }
            if (marker === 0xda || marker === 0xd9) {
                return offset - 2;
            }
            if (marker >= 0xd0 && marker <= 0xd7) {
                continue;
            }
            if (offset + 2 > buffer.length) {
                break;
            }
            const segmentLength = buffer.readUInt16BE(offset);
            offset += segmentLength;
        }
        throw new Error("Cannot find JPEG image data marker.");
    }

    protected static decodeJpeg(buffer: Buffer): jpeg.RawImageData<Uint8Array> {
        try {
            return jpeg.decode(buffer, { useTArray: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!message.includes("Unsupported color mode (4 components)")) {
                throw error;
            }
            return jpeg.decode(BlpImageObject.withAdobeCmykMarker(buffer), { useTArray: true });
        }
    }

    protected static withAdobeCmykMarker(buffer: Buffer): Buffer {
        const app14 = Buffer.alloc(16);
        app14[0] = 0xff;
        app14[1] = 0xee;
        app14.writeUInt16BE(14, 2);
        app14.write("Adobe", 4, "ascii");
        app14.writeUInt16BE(100, 9);
        app14.writeUInt16BE(0, 11);
        app14.writeUInt16BE(0, 13);
        app14[15] = 0;
        return Buffer.concat([buffer.slice(0, 2), app14, buffer.slice(2)]);
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
