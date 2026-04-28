/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import { readFileSync } from "fs";
import {
    BlpImageObject,
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
});
