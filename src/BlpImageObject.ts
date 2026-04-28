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
    type?: number;
    compression?: number;
    alphaEncoding?: number;
    hasMipmaps?: number;
    palette?: Buffer;
    mipmaps: BlpMipmap[];
}

export interface BlpImageWriteOptions {
    version?: "BLP1" | "BLP2";
    quality?: number;
    pictureType?: number;
    pictureSubType?: number;
}

/**
 * BlpImageObject parses Warcraft III BLP1/BLP2 image headers and preserves image payload bytes.
 */
export class BlpImageObject implements ReadDumpObject {
    protected static readonly BLP1_HEADER_SIZE = 156;
    protected static readonly BLP2_HEADER_SIZE = 1172;
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
        assert.ok(magic === "BLP1" || magic === "BLP2", "File should be `BLP1` or `BLP2` image format.");
        if (magic === "BLP2") {
            this.readBlp2(reader, magic, buffer);
            return;
        }
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
        this._payload = reader.readBytes(buffer.length - BlpImageObject.BLP1_HEADER_SIZE);
        assert.ok(reader.isEOF(), "Not reach end of the file because of trailing data.");
    }

    protected readBlp2(reader: BinaryReadBuffer, magic: string, buffer: Buffer): void {
        const type = reader.readInt();
        const compression = reader.readByte();
        const alphaBits = reader.readByte();
        const alphaEncoding = reader.readByte();
        const hasMipmaps = reader.readByte();
        const width = reader.readInt();
        const height = reader.readInt();
        const header: BlpHeader = {
            magic,
            content: 1,
            alphaBits,
            width,
            height,
            pictureType: 0,
            pictureSubType: 0,
            type,
            compression,
            alphaEncoding,
            hasMipmaps,
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
        header.palette = reader.readBytes(1024);
        this._header = header;
        this._payload = reader.readBytes(buffer.length - BlpImageObject.BLP2_HEADER_SIZE);
        assert.ok(reader.isEOF(), "Not reach end of the file because of trailing data.");
    }

    public dump(): Buffer {
        if (this._header.magic === "BLP2") {
            return this.dumpBlp2();
        }
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

    protected dumpBlp2(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeString(this._header.magic);
        writer.writeInt(this._header.type === undefined ? 1 : this._header.type);
        writer.writeByte(this._header.compression === undefined ? 1 : this._header.compression);
        writer.writeByte(this._header.alphaBits);
        writer.writeByte(this._header.alphaEncoding === undefined ? 0 : this._header.alphaEncoding);
        writer.writeByte(this._header.hasMipmaps === undefined ? 0 : this._header.hasMipmaps);
        writer.writeInt(this._header.width);
        writer.writeInt(this._header.height);
        for (let i = 0; i < 16; ++i) {
            writer.writeInt(this._header.mipmaps[i] ? this._header.mipmaps[i].offset : 0);
        }
        for (let i = 0; i < 16; ++i) {
            writer.writeInt(this._header.mipmaps[i] ? this._header.mipmaps[i].size : 0);
        }
        const palette = this._header.palette || Buffer.alloc(1024);
        assert.strictEqual(palette.length, 1024, "BLP2 palette must be 1024 bytes.");
        writer.writeBuffer(palette);
        writer.writeBuffer(this._payload);
        return writer.getBuffer();
    }

    public toRgbaImage(mipmapIndex = 0): RgbaImage {
        if (this._header.magic === "BLP2") {
            return this.readBlp2Image(mipmapIndex);
        }
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
        if (options.version === "BLP2") {
            return BlpImageObject.fromRgbaImageBlp2(image);
        }
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
                offset: index === 0 ? BlpImageObject.BLP1_HEADER_SIZE + 4 + jpegHeader.length : 0,
                size: index === 0 ? jpegImageData.length : 0
            }))
        };
        object.payload = payload;
        return object;
    }

    protected static fromRgbaImageBlp2(image: RgbaImage): BlpImageObject {
        const payload = Buffer.alloc(image.width * image.height * 4);
        for (let i = 0; i < image.width * image.height; ++i) {
            payload[i * 4] = image.data[i * 4 + 2];
            payload[i * 4 + 1] = image.data[i * 4 + 1];
            payload[i * 4 + 2] = image.data[i * 4];
            payload[i * 4 + 3] = image.data[i * 4 + 3];
        }

        const object = new BlpImageObject();
        object.header = {
            magic: "BLP2",
            content: 1,
            alphaBits: 8,
            width: image.width,
            height: image.height,
            pictureType: 0,
            pictureSubType: 0,
            type: 1,
            compression: 3,
            alphaEncoding: 8,
            hasMipmaps: 0,
            palette: Buffer.alloc(1024),
            mipmaps: Array.from({ length: 16 }, (_value, index) => ({
                offset: index === 0 ? BlpImageObject.BLP2_HEADER_SIZE : 0,
                size: index === 0 ? payload.length : 0
            }))
        };
        object.payload = payload;
        return object;
    }

    protected readJpegImage(mipmapIndex: number): RgbaImage {
        const mipmap = this.requireMipmap(mipmapIndex);
        const jpegHeaderSize = this._payload.readUInt32LE(0);
        const jpegHeader = this._payload.slice(4, 4 + jpegHeaderSize);
        const mipmapOffset = mipmap.offset - BlpImageObject.BLP1_HEADER_SIZE;
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
        const mipmapOffset = mipmap.offset - BlpImageObject.BLP1_HEADER_SIZE;
        assert.ok(mipmapOffset >= 1024 && mipmapOffset + pixelCount <= this._payload.length, "BLP mipmap points outside the payload.");
        return this.readIndexedImage(width, height, mipmapOffset, mipmap.size, this._payload.slice(0, 1024), this._payload, this._header.alphaBits);
    }

    protected readBlp2Image(mipmapIndex: number): RgbaImage {
        const compression = this._header.compression;
        if (compression === 1) {
            return this.readBlp2PalettedImage(mipmapIndex);
        }
        if (compression === 2) {
            return this.readBlp2DxtImage(mipmapIndex);
        }
        if (compression === 3) {
            return this.readBlp2BgraImage(mipmapIndex);
        }
        throw new Error(`Unsupported BLP2 compression:${compression}`);
    }

    protected readBlp2PalettedImage(mipmapIndex: number): RgbaImage {
        const mipmap = this.requireMipmap(mipmapIndex);
        const width = Math.max(1, this._header.width >> mipmapIndex);
        const height = Math.max(1, this._header.height >> mipmapIndex);
        const mipmapOffset = mipmap.offset - BlpImageObject.BLP2_HEADER_SIZE;
        const palette = this._header.palette || Buffer.alloc(1024);
        assert.ok(mipmapOffset >= 0 && mipmapOffset + mipmap.size <= this._payload.length, "BLP mipmap points outside the payload.");
        return this.readIndexedImage(width, height, mipmapOffset, mipmap.size, palette, this._payload, this._header.alphaBits);
    }

    protected readBlp2BgraImage(mipmapIndex: number): RgbaImage {
        const mipmap = this.requireMipmap(mipmapIndex);
        const width = Math.max(1, this._header.width >> mipmapIndex);
        const height = Math.max(1, this._header.height >> mipmapIndex);
        const pixelCount = width * height;
        const mipmapOffset = mipmap.offset - BlpImageObject.BLP2_HEADER_SIZE;
        assert.ok(mipmapOffset >= 0 && mipmapOffset + pixelCount * 4 <= this._payload.length, "BLP mipmap points outside the payload.");
        const image = Buffer.alloc(pixelCount * 4);
        for (let i = 0; i < pixelCount; ++i) {
            image[i * 4] = this._payload[mipmapOffset + i * 4 + 2];
            image[i * 4 + 1] = this._payload[mipmapOffset + i * 4 + 1];
            image[i * 4 + 2] = this._payload[mipmapOffset + i * 4];
            image[i * 4 + 3] = this._payload[mipmapOffset + i * 4 + 3];
        }
        return { width, height, data: image };
    }

    protected readBlp2DxtImage(mipmapIndex: number): RgbaImage {
        const mipmap = this.requireMipmap(mipmapIndex);
        const width = Math.max(1, this._header.width >> mipmapIndex);
        const height = Math.max(1, this._header.height >> mipmapIndex);
        const mipmapOffset = mipmap.offset - BlpImageObject.BLP2_HEADER_SIZE;
        assert.ok(mipmapOffset >= 0 && mipmapOffset + mipmap.size <= this._payload.length, "BLP mipmap points outside the payload.");
        const dxt = this.getBlp2DxtFormat();
        return BlpImageObject.decodeDxtImageData(this._payload.slice(mipmapOffset, mipmapOffset + mipmap.size), width, height, dxt);
    }

    protected readIndexedImage(width: number, height: number, mipmapOffset: number, mipmapSize: number, palette: Buffer, payload: Buffer, alphaBits: number): RgbaImage {
        assert.strictEqual(palette.length, 1024, "BLP palette must be 1024 bytes.");
        const pixelCount = width * height;
        const alphaOffset = mipmapOffset + pixelCount;
        assert.ok(mipmapOffset + pixelCount <= payload.length, "BLP indexed image payload is incomplete.");
        const image = Buffer.alloc(pixelCount * 4);
        for (let i = 0; i < pixelCount; ++i) {
            const paletteIndex = payload[mipmapOffset + i];
            const paletteOffset = paletteIndex * 4;
            image[i * 4] = palette[paletteOffset + 2];
            image[i * 4 + 1] = palette[paletteOffset + 1];
            image[i * 4 + 2] = palette[paletteOffset];
            image[i * 4 + 3] = this.readPaletteAlpha(payload, alphaOffset, i, mipmapSize, pixelCount, alphaBits);
        }
        return { width, height, data: image };
    }

    protected readPaletteAlpha(payload: Buffer, alphaOffset: number, index: number, mipmapSize: number, pixelCount: number, alphaBits: number): number {
        if (alphaBits === 0) {
            return 255;
        }
        if (alphaBits === 8 && mipmapSize >= pixelCount * 2 && alphaOffset + index < payload.length) {
            return payload[alphaOffset + index];
        }
        if (alphaBits === 4 && mipmapSize >= pixelCount + Math.ceil(pixelCount / 2)) {
            const byte = payload[alphaOffset + Math.floor(index / 2)];
            const nibble = index % 2 === 0 ? byte & 0x0f : byte >> 4;
            return Math.round(nibble * 255 / 15);
        }
        if (alphaBits === 1 && mipmapSize >= pixelCount + Math.ceil(pixelCount / 8)) {
            const byte = payload[alphaOffset + Math.floor(index / 8)];
            return (byte & (1 << (index % 8))) !== 0 ? 255 : 0;
        }
        return 255;
    }

    protected getBlp2DxtFormat(): "DXT1" | "DXT3" | "DXT5" {
        if (this._header.alphaEncoding === 7 || this._header.alphaEncoding === 8) {
            return "DXT5";
        }
        if (this._header.alphaEncoding === 1 || this._header.alphaBits === 4 || this._header.alphaBits === 8) {
            return "DXT3";
        }
        return "DXT1";
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

    public static decodeDxtImageData(buffer: Buffer, width: number, height: number, format: "DXT1" | "DXT3" | "DXT5"): RgbaImage {
        const image = Buffer.alloc(width * height * 4);
        const blockBytes = format === "DXT1" ? 8 : 16;
        const blockWidth = Math.ceil(width / 4);
        const blockHeight = Math.ceil(height / 4);
        assert.ok(buffer.length >= blockWidth * blockHeight * blockBytes, "DXT payload is incomplete.");
        let offset = 0;
        for (let blockY = 0; blockY < blockHeight; ++blockY) {
            for (let blockX = 0; blockX < blockWidth; ++blockX) {
                if (format === "DXT1") {
                    BlpImageObject.decodeDxtColorBlock(buffer, offset, image, width, height, blockX, blockY, true);
                } else if (format === "DXT3") {
                    BlpImageObject.decodeDxt3Block(buffer, offset, image, width, height, blockX, blockY);
                } else {
                    BlpImageObject.decodeDxt5Block(buffer, offset, image, width, height, blockX, blockY);
                }
                offset += blockBytes;
            }
        }
        return { width, height, data: image };
    }

    protected static decodeDxt3Block(buffer: Buffer, offset: number, image: Buffer, width: number, height: number, blockX: number, blockY: number): void {
        BlpImageObject.decodeDxtColorBlock(buffer, offset + 8, image, width, height, blockX, blockY, false);
        for (let i = 0; i < 16; ++i) {
            const byte = buffer[offset + Math.floor(i / 2)];
            const alpha = i % 2 === 0 ? byte & 0x0f : byte >> 4;
            BlpImageObject.writeBlockAlpha(image, width, height, blockX, blockY, i, Math.round(alpha * 255 / 15));
        }
    }

    protected static decodeDxt5Block(buffer: Buffer, offset: number, image: Buffer, width: number, height: number, blockX: number, blockY: number): void {
        const alpha0 = buffer[offset];
        const alpha1 = buffer[offset + 1];
        const alphaValues = BlpImageObject.buildDxt5AlphaTable(alpha0, alpha1);
        let alphaBits = 0;
        for (let i = 0; i < 6; ++i) {
            alphaBits += buffer[offset + 2 + i] * Math.pow(2, 8 * i);
        }
        BlpImageObject.decodeDxtColorBlock(buffer, offset + 8, image, width, height, blockX, blockY, false);
        for (let i = 0; i < 16; ++i) {
            const alphaIndex = Math.floor(alphaBits / Math.pow(2, 3 * i)) & 0x7;
            BlpImageObject.writeBlockAlpha(image, width, height, blockX, blockY, i, alphaValues[alphaIndex]);
        }
    }

    protected static buildDxt5AlphaTable(alpha0: number, alpha1: number): number[] {
        const alphaValues = [alpha0, alpha1, 0, 0, 0, 0, 0, 0];
        if (alpha0 > alpha1) {
            for (let i = 1; i <= 6; ++i) {
                alphaValues[i + 1] = Math.round(((7 - i) * alpha0 + i * alpha1) / 7);
            }
        } else {
            for (let i = 1; i <= 4; ++i) {
                alphaValues[i + 1] = Math.round(((5 - i) * alpha0 + i * alpha1) / 5);
            }
            alphaValues[6] = 0;
            alphaValues[7] = 255;
        }
        return alphaValues;
    }

    protected static decodeDxtColorBlock(buffer: Buffer, offset: number, image: Buffer, width: number, height: number, blockX: number, blockY: number, allowOneBitAlpha: boolean): void {
        const color0 = buffer.readUInt16LE(offset);
        const color1 = buffer.readUInt16LE(offset + 2);
        const colors = BlpImageObject.buildDxtColorTable(color0, color1, allowOneBitAlpha);
        const codes = buffer.readUInt32LE(offset + 4);
        for (let i = 0; i < 16; ++i) {
            const colorIndex = (codes >> (2 * i)) & 0x3;
            BlpImageObject.writeBlockColor(image, width, height, blockX, blockY, i, colors[colorIndex]);
        }
    }

    protected static buildDxtColorTable(color0: number, color1: number, allowOneBitAlpha: boolean): number[][] {
        const rgb0 = BlpImageObject.rgb565ToRgb(color0);
        const rgb1 = BlpImageObject.rgb565ToRgb(color1);
        if (color0 > color1 || !allowOneBitAlpha) {
            return [
                [rgb0[0], rgb0[1], rgb0[2], 255],
                [rgb1[0], rgb1[1], rgb1[2], 255],
                [Math.round((2 * rgb0[0] + rgb1[0]) / 3), Math.round((2 * rgb0[1] + rgb1[1]) / 3), Math.round((2 * rgb0[2] + rgb1[2]) / 3), 255],
                [Math.round((rgb0[0] + 2 * rgb1[0]) / 3), Math.round((rgb0[1] + 2 * rgb1[1]) / 3), Math.round((rgb0[2] + 2 * rgb1[2]) / 3), 255]
            ];
        }
        return [
            [rgb0[0], rgb0[1], rgb0[2], 255],
            [rgb1[0], rgb1[1], rgb1[2], 255],
            [Math.round((rgb0[0] + rgb1[0]) / 2), Math.round((rgb0[1] + rgb1[1]) / 2), Math.round((rgb0[2] + rgb1[2]) / 2), 255],
            [0, 0, 0, 0]
        ];
    }

    protected static rgb565ToRgb(color: number): number[] {
        return [
            Math.round(((color >> 11) & 0x1f) * 255 / 31),
            Math.round(((color >> 5) & 0x3f) * 255 / 63),
            Math.round((color & 0x1f) * 255 / 31)
        ];
    }

    protected static writeBlockColor(image: Buffer, width: number, height: number, blockX: number, blockY: number, pixelIndex: number, color: number[]): void {
        const x = blockX * 4 + pixelIndex % 4;
        const y = blockY * 4 + Math.floor(pixelIndex / 4);
        if (x >= width || y >= height) {
            return;
        }
        const offset = (y * width + x) * 4;
        image[offset] = color[0];
        image[offset + 1] = color[1];
        image[offset + 2] = color[2];
        image[offset + 3] = color[3];
    }

    protected static writeBlockAlpha(image: Buffer, width: number, height: number, blockX: number, blockY: number, pixelIndex: number, alpha: number): void {
        const x = blockX * 4 + pixelIndex % 4;
        const y = blockY * 4 + Math.floor(pixelIndex / 4);
        if (x >= width || y >= height) {
            return;
        }
        image[(y * width + x) * 4 + 3] = alpha;
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
