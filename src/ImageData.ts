/**
 *  @packageDocumentation
 */
import { PNG } from "pngjs";

export interface RgbaImage {
    width: number;
    height: number;
    data: Buffer;
}

export function assertValidRgbaImage(image: RgbaImage): void {
    if (!Number.isSafeInteger(image.width) || image.width <= 0) {
        throw new Error(`Invalid image width: ${image.width}`);
    }
    if (!Number.isSafeInteger(image.height) || image.height <= 0) {
        throw new Error(`Invalid image height: ${image.height}`);
    }
    const expectedLength = image.width * image.height * 4;
    if (image.data.length !== expectedLength) {
        throw new Error(`Invalid RGBA data length: expected ${expectedLength}, got ${image.data.length}`);
    }
}

export function readPngImage(buffer: Buffer): RgbaImage {
    const png = PNG.sync.read(buffer);
    return {
        width: png.width,
        height: png.height,
        data: Buffer.from(png.data)
    };
}

export function writePngImage(image: RgbaImage): Buffer {
    assertValidRgbaImage(image);
    const png = new PNG({ width: image.width, height: image.height });
    image.data.copy(png.data);
    return PNG.sync.write(png, { colorType: 6, inputColorType: 6, inputHasAlpha: true });
}
