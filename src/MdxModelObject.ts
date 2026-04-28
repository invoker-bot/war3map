/**
 * @packageDocumentation
 */

import * as assert from "assert";
import { ReadDumpObject } from "./BinaryBuffer";

export interface MdxExtent {
    boundsRadius: number;
    minimumExtent: [number, number, number];
    maximumExtent: [number, number, number];
}

export interface MdxChunk {
    tag: string;
    offset: number;
    size: number;
    data: Buffer;
}

export interface MdxModelInfo {
    name: string;
    animationFileName: string;
    extent: MdxExtent;
    blendTime: number;
}

export interface MdxSequenceInfo {
    name: string;
    intervalStart: number;
    intervalEnd: number;
    moveSpeed: number;
    flags: number;
    rarity: number;
    syncPoint: number;
    extent: MdxExtent;
}

export interface MdxTextureInfo {
    replaceableId: number;
    path: string;
    flags: number;
}

/**
 * MdxModelObject parses Warcraft III binary model chunk metadata and preserves
 * the chunk payloads byte-for-byte.
 */
export class MdxModelObject implements ReadDumpObject {
    protected _chunks: MdxChunk[] = [];
    protected _version: number | undefined;
    protected _model: MdxModelInfo | undefined;
    protected _sequences: MdxSequenceInfo[] = [];
    protected _textures: MdxTextureInfo[] = [];

    public read(buffer: Buffer): void {
        assert.ok(buffer.length >= 4, "MDX model is too short.");
        assert.strictEqual(buffer.toString("ascii", 0, 4), "MDLX", "File should be `MDLX` model format.");

        const chunks: MdxChunk[] = [];
        let offset = 4;
        while (offset < buffer.length) {
            assert.ok(offset + 8 <= buffer.length, "MDX chunk header is truncated.");
            const tag = buffer.toString("ascii", offset, offset + 4);
            const size = buffer.readUInt32LE(offset + 4);
            const dataOffset = offset + 8;
            assert.ok(dataOffset + size <= buffer.length, `MDX ${tag} chunk payload is truncated.`);
            chunks.push({
                tag,
                offset,
                size,
                data: Buffer.from(buffer.slice(dataOffset, dataOffset + size))
            });
            offset = dataOffset + size;
        }

        this._chunks = chunks;
        this.parseKnownChunks();
    }

    public dump(): Buffer {
        const buffers = [Buffer.from("MDLX", "ascii")];
        this._chunks.forEach((chunk) => {
            const header = Buffer.alloc(8);
            header.write(chunk.tag, 0, 4, "ascii");
            header.writeUInt32LE(chunk.data.length, 4);
            buffers.push(header, Buffer.from(chunk.data));
        });
        return Buffer.concat(buffers);
    }

    protected parseKnownChunks(): void {
        this._version = undefined;
        this._model = undefined;
        this._sequences = [];
        this._textures = [];

        this._chunks.forEach((chunk) => {
            if (chunk.tag === "VERS" && chunk.data.length >= 4) {
                this._version = chunk.data.readUInt32LE(0);
            } else if (chunk.tag === "MODL" && chunk.data.length >= 372) {
                this._model = MdxModelObject.readModelInfo(chunk.data);
            } else if (chunk.tag === "SEQS" && chunk.data.length % 132 === 0) {
                this._sequences = MdxModelObject.readSequences(chunk.data);
            } else if (chunk.tag === "TEXS" && chunk.data.length % 268 === 0) {
                this._textures = MdxModelObject.readTextures(chunk.data);
            }
        });
    }

    protected static readModelInfo(buffer: Buffer): MdxModelInfo {
        return {
            name: MdxModelObject.readFixedString(buffer, 0, 80),
            animationFileName: MdxModelObject.readFixedString(buffer, 80, 260),
            extent: MdxModelObject.readExtent(buffer, 340),
            blendTime: buffer.readUInt32LE(368)
        };
    }

    protected static readSequences(buffer: Buffer): MdxSequenceInfo[] {
        const sequences: MdxSequenceInfo[] = [];
        for (let offset = 0; offset < buffer.length; offset += 132) {
            sequences.push({
                name: MdxModelObject.readFixedString(buffer, offset, 80),
                intervalStart: buffer.readUInt32LE(offset + 80),
                intervalEnd: buffer.readUInt32LE(offset + 84),
                moveSpeed: buffer.readFloatLE(offset + 88),
                flags: buffer.readUInt32LE(offset + 92),
                rarity: buffer.readFloatLE(offset + 96),
                syncPoint: buffer.readUInt32LE(offset + 100),
                extent: MdxModelObject.readExtent(buffer, offset + 104)
            });
        }
        return sequences;
    }

    protected static readTextures(buffer: Buffer): MdxTextureInfo[] {
        const textures: MdxTextureInfo[] = [];
        for (let offset = 0; offset < buffer.length; offset += 268) {
            textures.push({
                replaceableId: buffer.readUInt32LE(offset),
                path: MdxModelObject.readFixedString(buffer, offset + 4, 260),
                flags: buffer.readUInt32LE(offset + 264)
            });
        }
        return textures;
    }

    protected static readExtent(buffer: Buffer, offset: number): MdxExtent {
        return {
            boundsRadius: buffer.readFloatLE(offset),
            minimumExtent: [
                buffer.readFloatLE(offset + 4),
                buffer.readFloatLE(offset + 8),
                buffer.readFloatLE(offset + 12)
            ],
            maximumExtent: [
                buffer.readFloatLE(offset + 16),
                buffer.readFloatLE(offset + 20),
                buffer.readFloatLE(offset + 24)
            ]
        };
    }

    protected static readFixedString(buffer: Buffer, offset: number, length: number): string {
        const endOffset = offset + length;
        const nullOffset = buffer.indexOf(0, offset);
        const stringEnd = nullOffset >= offset && nullOffset < endOffset ? nullOffset : endOffset;
        return buffer.toString("utf8", offset, stringEnd);
    }

    public get chunks(): MdxChunk[] {
        return this._chunks.map((chunk) => ({
            ...chunk,
            data: Buffer.from(chunk.data)
        }));
    }
    public set chunks(chunks: MdxChunk[]) {
        this._chunks = chunks.map((chunk) => ({
            ...chunk,
            data: Buffer.from(chunk.data),
            size: chunk.data.length
        }));
        this.parseKnownChunks();
    }

    public get version(): number | undefined {
        return this._version;
    }

    public get model(): MdxModelInfo | undefined {
        return this._model;
    }

    public get sequences(): MdxSequenceInfo[] {
        return this._sequences;
    }

    public get textures(): MdxTextureInfo[] {
        return this._textures;
    }
}
