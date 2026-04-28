/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";
import { BlpImageObject } from "./BlpImageObject";
import { assertValidRgbaImage, RgbaImage } from "./ImageData";

export interface DdsPixelFormat {
    size: number;
    flags: number;
    fourCc: string;
    rgbBitCount: number;
    redMask: number;
    greenMask: number;
    blueMask: number;
    alphaMask: number;
}

export interface DdsHeader {
    size: number;
    flags: number;
    height: number;
    width: number;
    pitchOrLinearSize: number;
    depth: number;
    mipmapCount: number;
    reserved1: Buffer;
    pixelFormat: DdsPixelFormat;
    caps: number;
    caps2: number;
    caps3: number;
    caps4: number;
    reserved2: number;
}

/**
 * DdsImageObject parses common DDS textures and converts uncompressed/DXT data to RGBA.
 */
export class DdsImageObject implements ReadDumpObject {
    protected _header: DdsHeader = DdsImageObject.createDefaultHeader(0, 0);
    protected _payload: Buffer = Buffer.alloc(0);

    public read(buffer: Buffer): void {
        assert.ok(buffer.length >= 128, "DDS image is too short.");
        const reader = new BinaryReadBuffer(buffer);
        assert.strictEqual(reader.readChars(4), "DDS ", "File should be `DDS` image format.");
        this._header = {
            size: reader.readInt(),
            flags: reader.readInt(),
            height: reader.readInt(),
            width: reader.readInt(),
            pitchOrLinearSize: reader.readInt(),
            depth: reader.readInt(),
            mipmapCount: reader.readInt(),
            reserved1: reader.readBytes(44),
            pixelFormat: {
                size: reader.readInt(),
                flags: reader.readInt(),
                fourCc: reader.readChars(4),
                rgbBitCount: reader.readInt(),
                redMask: reader.readInt(),
                greenMask: reader.readInt(),
                blueMask: reader.readInt(),
                alphaMask: reader.readInt()
            },
            caps: reader.readInt(),
            caps2: reader.readInt(),
            caps3: reader.readInt(),
            caps4: reader.readInt(),
            reserved2: reader.readInt()
        };
        assert.strictEqual(this._header.size, 124, "Unsupported DDS header size.");
        assert.strictEqual(this._header.pixelFormat.size, 32, "Unsupported DDS pixel format size.");
        this._payload = reader.readBytes(buffer.length - 128);
        assert.ok(reader.isEOF(), "Not reach end of the file because of trailing data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeString("DDS ");
        writer.writeInt(this._header.size);
        writer.writeInt(this._header.flags);
        writer.writeInt(this._header.height);
        writer.writeInt(this._header.width);
        writer.writeInt(this._header.pitchOrLinearSize);
        writer.writeInt(this._header.depth);
        writer.writeInt(this._header.mipmapCount);
        writer.writeBuffer(this._header.reserved1);
        writer.writeInt(this._header.pixelFormat.size);
        writer.writeInt(this._header.pixelFormat.flags);
        writer.writeString(this._header.pixelFormat.fourCc);
        writer.writeInt(this._header.pixelFormat.rgbBitCount);
        writer.writeInt(this._header.pixelFormat.redMask);
        writer.writeInt(this._header.pixelFormat.greenMask);
        writer.writeInt(this._header.pixelFormat.blueMask);
        writer.writeInt(this._header.pixelFormat.alphaMask);
        writer.writeInt(this._header.caps);
        writer.writeInt(this._header.caps2);
        writer.writeInt(this._header.caps3);
        writer.writeInt(this._header.caps4);
        writer.writeInt(this._header.reserved2);
        writer.writeBuffer(this._payload);
        return writer.getBuffer();
    }

    public toRgbaImage(): RgbaImage {
        const fourCc = this._header.pixelFormat.fourCc.replace(/\0/g, "");
        if (fourCc === "DXT1" || fourCc === "DXT3" || fourCc === "DXT5") {
            return BlpImageObject.decodeDxtImageData(this._payload, this._header.width, this._header.height, fourCc);
        }
        return this.readUncompressedImage();
    }

    public static fromRgbaImage(image: RgbaImage): DdsImageObject {
        assertValidRgbaImage(image);
        const object = new DdsImageObject();
        object.header = DdsImageObject.createDefaultHeader(image.width, image.height);
        const payload = Buffer.alloc(image.width * image.height * 4);
        for (let i = 0; i < image.width * image.height; ++i) {
            payload[i * 4] = image.data[i * 4 + 2];
            payload[i * 4 + 1] = image.data[i * 4 + 1];
            payload[i * 4 + 2] = image.data[i * 4];
            payload[i * 4 + 3] = image.data[i * 4 + 3];
        }
        object.payload = payload;
        return object;
    }

    protected readUncompressedImage(): RgbaImage {
        const bitCount = this._header.pixelFormat.rgbBitCount;
        assert.strictEqual(bitCount, 32, `Unsupported DDS RGB bit count:${bitCount}`);
        const pixelCount = this._header.width * this._header.height;
        assert.ok(this._payload.length >= pixelCount * 4, "DDS image payload is incomplete.");
        const image = Buffer.alloc(pixelCount * 4);
        for (let i = 0; i < pixelCount; ++i) {
            const value = this._payload.readUInt32LE(i * 4);
            image[i * 4] = DdsImageObject.readMaskedChannel(value, this._header.pixelFormat.redMask);
            image[i * 4 + 1] = DdsImageObject.readMaskedChannel(value, this._header.pixelFormat.greenMask);
            image[i * 4 + 2] = DdsImageObject.readMaskedChannel(value, this._header.pixelFormat.blueMask);
            image[i * 4 + 3] = this._header.pixelFormat.alphaMask === 0 ? 255 : DdsImageObject.readMaskedChannel(value, this._header.pixelFormat.alphaMask);
        }
        return { width: this._header.width, height: this._header.height, data: image };
    }

    protected static readMaskedChannel(value: number, mask: number): number {
        if (mask === 0) {
            return 0;
        }
        const shift = DdsImageObject.countTrailingZeroBits(mask);
        const bits = DdsImageObject.countBits(mask);
        const raw = (value & mask) >>> shift;
        return bits >= 8 ? raw >>> (bits - 8) : Math.round(raw * 255 / ((1 << bits) - 1));
    }

    protected static countTrailingZeroBits(value: number): number {
        let count = 0;
        while (((value >>> count) & 1) === 0 && count < 32) {
            ++count;
        }
        return count;
    }

    protected static countBits(value: number): number {
        let count = 0;
        for (let i = 0; i < 32; ++i) {
            if ((value & (1 << i)) !== 0) {
                ++count;
            }
        }
        return count;
    }

    protected static createDefaultHeader(width: number, height: number): DdsHeader {
        return {
            size: 124,
            flags: 0x0002100f,
            height,
            width,
            pitchOrLinearSize: width * 4,
            depth: 0,
            mipmapCount: 0,
            reserved1: Buffer.alloc(44),
            pixelFormat: {
                size: 32,
                flags: 0x41,
                fourCc: "\0\0\0\0",
                rgbBitCount: 32,
                redMask: 0x00ff0000,
                greenMask: 0x0000ff00,
                blueMask: 0x000000ff,
                alphaMask: -0x1000000
            },
            caps: 0x1000,
            caps2: 0,
            caps3: 0,
            caps4: 0,
            reserved2: 0
        };
    }

    public get header(): DdsHeader {
        return this._header;
    }
    public set header(header: DdsHeader) {
        this._header = header;
    }
    public get payload(): Buffer {
        return Buffer.from(this._payload);
    }
    public set payload(payload: Buffer) {
        this._payload = Buffer.from(payload);
    }
}
