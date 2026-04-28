/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import { readFileSync } from "fs";
import {
    BlpImageObject,
    DdsImageObject,
    readPngImage,
    RgbaImage,
    TgaImageObject,
    writePngImage
} from "../src/index";

function createTestImage(): RgbaImage {
    return {
        width: 2,
        height: 2,
        data: Buffer.from([
            255, 0, 0, 255,
            0, 255, 0, 255,
            0, 0, 255, 255,
            255, 255, 255, 128
        ])
    };
}

function assertClose(actual: number, expected: number, tolerance: number): void {
    assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} to be within ${tolerance} of ${expected}`);
}

function buildBlp2(width: number, height: number, compression: number, alphaBits: number, alphaEncoding: number, payload: Buffer): Buffer {
    const headerSize = 1172;
    const buffer = Buffer.alloc(headerSize + payload.length);
    buffer.write("BLP2", 0, "ascii");
    buffer.writeInt32LE(1, 4);
    buffer[8] = compression;
    buffer[9] = alphaBits;
    buffer[10] = alphaEncoding;
    buffer[11] = 0;
    buffer.writeInt32LE(width, 12);
    buffer.writeInt32LE(height, 16);
    buffer.writeInt32LE(headerSize, 20);
    buffer.writeInt32LE(payload.length, 84);
    payload.copy(buffer, headerSize);
    return buffer;
}

describe("image conversion", () => {
    it("should convert RGBA images to PNG and back", () => {
        const image = createTestImage();
        const png = writePngImage(image);
        const reread = readPngImage(png);

        assert.strictEqual(reread.width, image.width);
        assert.strictEqual(reread.height, image.height);
        assert.deepStrictEqual(reread.data, image.data);
    });

    it("should convert RGBA images to TGA and back", () => {
        const image = createTestImage();
        const tga = TgaImageObject.fromRgbaImage(image);
        const reread = new TgaImageObject();
        reread.read(tga.dump());

        assert.deepStrictEqual(reread.toRgbaImage(), image);
    });

    it("should convert RGBA images to BLP1 JPEG and back", () => {
        const image: RgbaImage = {
            width: 8,
            height: 8,
            data: Buffer.alloc(8 * 8 * 4)
        };
        for (let i = 0; i < image.data.length; i += 4) {
            image.data[i] = 90;
            image.data[i + 1] = 120;
            image.data[i + 2] = 200;
            image.data[i + 3] = 255;
        }

        const blp = BlpImageObject.fromRgbaImage(image, { quality: 95 });
        const reread = new BlpImageObject();
        reread.read(blp.dump());
        const decoded = reread.toRgbaImage();

        assert.strictEqual(decoded.width, image.width);
        assert.strictEqual(decoded.height, image.height);
        assertClose(decoded.data[0], 90, 3);
        assertClose(decoded.data[1], 120, 3);
        assertClose(decoded.data[2], 200, 3);
        assert.strictEqual(decoded.data[3], 255);
    });

    it("should convert fixture BLP minimaps to PNG-compatible RGBA", () => {
        const blp = new BlpImageObject();
        blp.read(readFileSync("./test/map3/war3mapMap.blp"));
        const image = blp.toRgbaImage();
        const png = writePngImage(image);
        const reread = readPngImage(png);

        assert.strictEqual(reread.width, blp.header.width);
        assert.strictEqual(reread.height, blp.header.height);
        assert.strictEqual(reread.data.length, blp.header.width * blp.header.height * 4);
    });

    it("should convert RGBA images to uncompressed BLP2 and back", () => {
        const image = createTestImage();
        const blp = BlpImageObject.fromRgbaImage(image, { version: "BLP2" });
        const reread = new BlpImageObject();
        reread.read(blp.dump());

        assert.strictEqual(reread.header.magic, "BLP2");
        assert.strictEqual(reread.header.compression, 3);
        assert.deepStrictEqual(reread.toRgbaImage(), image);
    });

    it("should decode BLP2 DXT1 images", () => {
        const dxt = Buffer.alloc(8);
        dxt.writeUInt16LE(0xf800, 0);
        dxt.writeUInt16LE(0x001f, 2);
        const blp = new BlpImageObject();
        blp.read(buildBlp2(4, 4, 2, 0, 0, dxt));
        const image = blp.toRgbaImage();

        assert.deepStrictEqual(Array.from(image.data.slice(0, 4)), [255, 0, 0, 255]);
        assert.strictEqual(image.data.length, 4 * 4 * 4);
    });

    it("should decode BLP2 DXT3 and DXT5 alpha", () => {
        const dxt3 = Buffer.alloc(16, 0xff);
        dxt3.writeUInt16LE(0xf800, 8);
        dxt3.writeUInt16LE(0x001f, 10);
        dxt3.writeUInt32LE(0, 12);
        const blpDxt3 = new BlpImageObject();
        blpDxt3.read(buildBlp2(4, 4, 2, 4, 1, dxt3));
        assert.deepStrictEqual(Array.from(blpDxt3.toRgbaImage().data.slice(0, 4)), [255, 0, 0, 255]);

        const dxt5 = Buffer.alloc(16);
        dxt5[0] = 255;
        dxt5[1] = 0;
        dxt5.writeUInt16LE(0xf800, 8);
        dxt5.writeUInt16LE(0x001f, 10);
        dxt5.writeUInt32LE(0, 12);
        const blpDxt5 = new BlpImageObject();
        blpDxt5.read(buildBlp2(4, 4, 2, 8, 7, dxt5));
        assert.deepStrictEqual(Array.from(blpDxt5.toRgbaImage().data.slice(0, 4)), [255, 0, 0, 255]);
    });

    it("should convert RGBA images to DDS and back", () => {
        const image = createTestImage();
        const dds = DdsImageObject.fromRgbaImage(image);
        const reread = new DdsImageObject();
        reread.read(dds.dump());

        assert.deepStrictEqual(reread.toRgbaImage(), image);
    });

    it("should decode DDS DXT1 images", () => {
        const dxt = Buffer.alloc(8);
        dxt.writeUInt16LE(0xf800, 0);
        dxt.writeUInt16LE(0x001f, 2);
        const dds = DdsImageObject.fromRgbaImage(createTestImage());
        dds.header = {
            ...dds.header,
            width: 4,
            height: 4,
            pitchOrLinearSize: dxt.length,
            pixelFormat: {
                ...dds.header.pixelFormat,
                flags: 0x4,
                fourCc: "DXT1",
                rgbBitCount: 0,
                redMask: 0,
                greenMask: 0,
                blueMask: 0,
                alphaMask: 0
            }
        };
        dds.payload = dxt;

        const image = dds.toRgbaImage();
        assert.deepStrictEqual(Array.from(image.data.slice(0, 4)), [255, 0, 0, 255]);
        assert.strictEqual(image.data.length, 4 * 4 * 4);
    });
});
