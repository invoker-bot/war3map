/**
 * @packageDocumentation
 */

import * as assert from "assert";
import { ReadDumpObject } from "./BinaryBuffer";

export type MdxVector2 = [number, number];
export type MdxVector3 = [number, number, number];

export interface MdxExtent {
    boundsRadius: number;
    minimumExtent: MdxVector3;
    maximumExtent: MdxVector3;
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

export interface MdxLayerInfo {
    inclusiveSize: number;
    filterMode: number;
    shadingFlags: number;
    textureId: number;
    textureAnimationId: number;
    coordId: number;
    alpha: number;
    animationPayload: Buffer;
}

export interface MdxMaterialInfo {
    inclusiveSize: number;
    priorityPlane: number;
    flags: number;
    layers: MdxLayerInfo[];
}

export interface MdxGeosetInfo {
    inclusiveSize: number;
    vertices: MdxVector3[];
    normals: MdxVector3[];
    faceTypeGroups: number[];
    faceGroups: number[];
    faceIndexes: number[];
    vertexGroups: number[];
    matrixGroups: number[];
    matrixIndexes: number[];
    materialId: number;
    selectionGroup: number;
    selectionFlags: number;
    extent: MdxExtent;
    sequenceExtents: MdxExtent[];
    textureCoordinateSets: MdxVector2[][];
    tail: Buffer;
}

export interface MdxNodeInfo {
    inclusiveSize: number;
    name: string;
    objectId: number;
    parentId: number;
    flags: number;
    animationPayload: Buffer;
}

export interface MdxBoneInfo {
    node: MdxNodeInfo;
    geosetId: number;
    geosetAnimationId: number;
}

export interface MdxAttachmentInfo {
    inclusiveSize: number;
    node: MdxNodeInfo;
    path: string;
    attachmentId: number;
    animationPayload: Buffer;
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
    protected _materials: MdxMaterialInfo[] = [];
    protected _geosets: MdxGeosetInfo[] = [];
    protected _pivots: MdxVector3[] = [];
    protected _bones: MdxBoneInfo[] = [];
    protected _helpers: MdxNodeInfo[] = [];
    protected _attachments: MdxAttachmentInfo[] = [];

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
        this._materials = [];
        this._geosets = [];
        this._pivots = [];
        this._bones = [];
        this._helpers = [];
        this._attachments = [];

        this._chunks.forEach((chunk) => {
            if (chunk.tag === "VERS" && chunk.data.length >= 4) {
                this._version = chunk.data.readUInt32LE(0);
            } else if (chunk.tag === "MODL" && chunk.data.length >= 372) {
                this._model = MdxModelObject.readModelInfo(chunk.data);
            } else if (chunk.tag === "SEQS" && chunk.data.length % 132 === 0) {
                this._sequences = MdxModelObject.readSequences(chunk.data);
            } else if (chunk.tag === "TEXS" && chunk.data.length % 268 === 0) {
                this._textures = MdxModelObject.readTextures(chunk.data);
            } else if (chunk.tag === "MTLS") {
                this._materials = MdxModelObject.tryRead(() => MdxModelObject.readMaterials(chunk.data), []);
            } else if (chunk.tag === "GEOS") {
                this._geosets = MdxModelObject.tryRead(() => MdxModelObject.readGeosets(chunk.data), []);
            } else if (chunk.tag === "PIVT" && chunk.data.length % 12 === 0) {
                this._pivots = MdxModelObject.readVector3List(chunk.data, 0, chunk.data.length / 12);
            } else if (chunk.tag === "BONE") {
                this._bones = MdxModelObject.tryRead(() => MdxModelObject.readBones(chunk.data), []);
            } else if (chunk.tag === "HELP") {
                this._helpers = MdxModelObject.tryRead(() => MdxModelObject.readNodes(chunk.data), []);
            } else if (chunk.tag === "ATCH") {
                this._attachments = MdxModelObject.tryRead(() => MdxModelObject.readAttachments(chunk.data), []);
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

    protected static readMaterials(buffer: Buffer): MdxMaterialInfo[] {
        const materials: MdxMaterialInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            assert.ok(offset + 20 <= buffer.length, "MDX material header is truncated.");
            const inclusiveSize = buffer.readUInt32LE(offset);
            const endOffset = offset + inclusiveSize;
            assert.ok(inclusiveSize >= 20 && endOffset <= buffer.length, "MDX material size points outside the MTLS chunk.");
            assert.strictEqual(buffer.toString("ascii", offset + 12, offset + 16), "LAYS", "MDX material is missing LAYS data.");
            const layerCount = buffer.readUInt32LE(offset + 16);
            const layers: MdxLayerInfo[] = [];
            let layerOffset = offset + 20;
            for (let i = 0; i < layerCount; ++i) {
                assert.ok(layerOffset + 28 <= endOffset, "MDX layer header is truncated.");
                const layerSize = buffer.readUInt32LE(layerOffset);
                const layerEndOffset = layerOffset + layerSize;
                assert.ok(layerSize >= 28 && layerEndOffset <= endOffset, "MDX layer size points outside the material.");
                layers.push({
                    inclusiveSize: layerSize,
                    filterMode: buffer.readUInt32LE(layerOffset + 4),
                    shadingFlags: buffer.readUInt32LE(layerOffset + 8),
                    textureId: buffer.readInt32LE(layerOffset + 12),
                    textureAnimationId: buffer.readInt32LE(layerOffset + 16),
                    coordId: buffer.readUInt32LE(layerOffset + 20),
                    alpha: buffer.readFloatLE(layerOffset + 24),
                    animationPayload: Buffer.from(buffer.slice(layerOffset + 28, layerEndOffset))
                });
                layerOffset = layerEndOffset;
            }
            assert.strictEqual(layerOffset, endOffset, "MDX material has trailing layer data.");
            materials.push({
                inclusiveSize,
                priorityPlane: buffer.readInt32LE(offset + 4),
                flags: buffer.readUInt32LE(offset + 8),
                layers
            });
            offset = endOffset;
        }
        return materials;
    }

    protected static readGeosets(buffer: Buffer): MdxGeosetInfo[] {
        const geosets: MdxGeosetInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            assert.ok(offset + 4 <= buffer.length, "MDX geoset header is truncated.");
            const inclusiveSize = buffer.readUInt32LE(offset);
            const endOffset = offset + inclusiveSize;
            assert.ok(inclusiveSize >= 4 && endOffset <= buffer.length, "MDX geoset size points outside the GEOS chunk.");
            const state = { offset: offset + 4, end: endOffset };
            const vertices = MdxModelObject.readTaggedVector3Array(buffer, state, "VRTX");
            const normals = MdxModelObject.readTaggedVector3Array(buffer, state, "NRMS");
            const faceTypeGroups = MdxModelObject.readTaggedUInt32Array(buffer, state, "PTYP");
            const faceGroups = MdxModelObject.readTaggedUInt32Array(buffer, state, "PCNT");
            const faceIndexes = MdxModelObject.readTaggedUInt16Array(buffer, state, "PVTX");
            const vertexGroups = MdxModelObject.readTaggedUInt8Array(buffer, state, "GNDX");
            const matrixGroups = MdxModelObject.readTaggedUInt32Array(buffer, state, "MTGC");
            const matrixIndexes = MdxModelObject.readTaggedUInt32Array(buffer, state, "MATS");

            assert.ok(state.offset + 44 <= state.end, "MDX geoset metadata is truncated.");
            const materialId = buffer.readInt32LE(state.offset);
            const selectionGroup = buffer.readUInt32LE(state.offset + 4);
            const selectionFlags = buffer.readUInt32LE(state.offset + 8);
            const extent = MdxModelObject.readExtent(buffer, state.offset + 12);
            state.offset += 40;

            const sequenceExtentCount = buffer.readUInt32LE(state.offset);
            state.offset += 4;
            assert.ok(state.offset + sequenceExtentCount * 28 <= state.end, "MDX geoset sequence extents are truncated.");
            const sequenceExtents: MdxExtent[] = [];
            for (let i = 0; i < sequenceExtentCount; ++i) {
                sequenceExtents.push(MdxModelObject.readExtent(buffer, state.offset));
                state.offset += 28;
            }

            const textureCoordinateSets = MdxModelObject.readTextureCoordinateSets(buffer, state);
            const tail = Buffer.from(buffer.slice(state.offset, state.end));
            geosets.push({
                inclusiveSize,
                vertices,
                normals,
                faceTypeGroups,
                faceGroups,
                faceIndexes,
                vertexGroups,
                matrixGroups,
                matrixIndexes,
                materialId,
                selectionGroup,
                selectionFlags,
                extent,
                sequenceExtents,
                textureCoordinateSets,
                tail
            });
            offset = endOffset;
        }
        return geosets;
    }

    protected static readNodes(buffer: Buffer): MdxNodeInfo[] {
        const nodes: MdxNodeInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            const result = MdxModelObject.readNode(buffer, offset);
            nodes.push(result.node);
            offset = result.nextOffset;
        }
        return nodes;
    }

    protected static readBones(buffer: Buffer): MdxBoneInfo[] {
        const bones: MdxBoneInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            const result = MdxModelObject.readNode(buffer, offset);
            assert.ok(result.nextOffset + 8 <= buffer.length, "MDX bone geoset IDs are truncated.");
            bones.push({
                node: result.node,
                geosetId: buffer.readInt32LE(result.nextOffset),
                geosetAnimationId: buffer.readInt32LE(result.nextOffset + 4)
            });
            offset = result.nextOffset + 8;
        }
        return bones;
    }

    protected static readAttachments(buffer: Buffer): MdxAttachmentInfo[] {
        const attachments: MdxAttachmentInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            assert.ok(offset + 4 <= buffer.length, "MDX attachment header is truncated.");
            const inclusiveSize = buffer.readUInt32LE(offset);
            const endOffset = offset + inclusiveSize;
            assert.ok(inclusiveSize >= 104 && endOffset <= buffer.length, "MDX attachment size points outside the ATCH chunk.");
            const result = MdxModelObject.readNode(buffer, offset + 4);
            assert.ok(result.nextOffset + 264 <= endOffset, "MDX attachment path data is truncated.");
            attachments.push({
                inclusiveSize,
                node: result.node,
                path: MdxModelObject.readFixedString(buffer, result.nextOffset, 260),
                attachmentId: buffer.readInt32LE(result.nextOffset + 260),
                animationPayload: Buffer.from(buffer.slice(result.nextOffset + 264, endOffset))
            });
            offset = endOffset;
        }
        return attachments;
    }

    protected static readNode(buffer: Buffer, offset: number): { node: MdxNodeInfo; nextOffset: number } {
        assert.ok(offset + 96 <= buffer.length, "MDX node is truncated.");
        const inclusiveSize = buffer.readUInt32LE(offset);
        const nextOffset = offset + inclusiveSize;
        assert.ok(inclusiveSize >= 96 && nextOffset <= buffer.length, "MDX node size points outside the chunk.");
        return {
            node: {
                inclusiveSize,
                name: MdxModelObject.readFixedString(buffer, offset + 4, 80),
                objectId: buffer.readInt32LE(offset + 84),
                parentId: buffer.readInt32LE(offset + 88),
                flags: buffer.readUInt32LE(offset + 92),
                animationPayload: Buffer.from(buffer.slice(offset + 96, nextOffset))
            },
            nextOffset
        };
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

    protected static readTaggedVector3Array(buffer: Buffer, state: { offset: number; end: number }, tag: string): MdxVector3[] {
        const count = MdxModelObject.readTaggedCount(buffer, state, tag);
        assert.ok(state.offset + count * 12 <= state.end, `MDX ${tag} data is truncated.`);
        const values = MdxModelObject.readVector3List(buffer, state.offset, count);
        state.offset += count * 12;
        return values;
    }

    protected static readVector3List(buffer: Buffer, offset: number, count: number): MdxVector3[] {
        const values: MdxVector3[] = [];
        for (let i = 0; i < count; ++i) {
            const valueOffset = offset + i * 12;
            values.push([
                buffer.readFloatLE(valueOffset),
                buffer.readFloatLE(valueOffset + 4),
                buffer.readFloatLE(valueOffset + 8)
            ]);
        }
        return values;
    }

    protected static readTaggedUInt32Array(buffer: Buffer, state: { offset: number; end: number }, tag: string): number[] {
        const count = MdxModelObject.readTaggedCount(buffer, state, tag);
        assert.ok(state.offset + count * 4 <= state.end, `MDX ${tag} data is truncated.`);
        const values: number[] = [];
        for (let i = 0; i < count; ++i) {
            values.push(buffer.readUInt32LE(state.offset + i * 4));
        }
        state.offset += count * 4;
        return values;
    }

    protected static readTaggedUInt16Array(buffer: Buffer, state: { offset: number; end: number }, tag: string): number[] {
        const count = MdxModelObject.readTaggedCount(buffer, state, tag);
        assert.ok(state.offset + count * 2 <= state.end, `MDX ${tag} data is truncated.`);
        const values: number[] = [];
        for (let i = 0; i < count; ++i) {
            values.push(buffer.readUInt16LE(state.offset + i * 2));
        }
        state.offset += count * 2;
        return values;
    }

    protected static readTaggedUInt8Array(buffer: Buffer, state: { offset: number; end: number }, tag: string): number[] {
        const count = MdxModelObject.readTaggedCount(buffer, state, tag);
        assert.ok(state.offset + count <= state.end, `MDX ${tag} data is truncated.`);
        const values = Array.from(buffer.slice(state.offset, state.offset + count));
        state.offset += count;
        return values;
    }

    protected static readTextureCoordinateSets(buffer: Buffer, state: { offset: number; end: number }): MdxVector2[][] {
        if (state.offset + 8 > state.end || buffer.toString("ascii", state.offset, state.offset + 4) !== "UVAS") {
            return [];
        }
        const setCount = buffer.readUInt32LE(state.offset + 4);
        state.offset += 8;
        const sets: MdxVector2[][] = [];
        for (let setIndex = 0; setIndex < setCount; ++setIndex) {
            const count = MdxModelObject.readTaggedCount(buffer, state, "UVBS");
            assert.ok(state.offset + count * 8 <= state.end, "MDX UVBS data is truncated.");
            const values: MdxVector2[] = [];
            for (let i = 0; i < count; ++i) {
                const valueOffset = state.offset + i * 8;
                values.push([
                    buffer.readFloatLE(valueOffset),
                    buffer.readFloatLE(valueOffset + 4)
                ]);
            }
            state.offset += count * 8;
            sets.push(values);
        }
        return sets;
    }

    protected static readTaggedCount(buffer: Buffer, state: { offset: number; end: number }, tag: string): number {
        assert.ok(state.offset + 8 <= state.end, `MDX ${tag} header is truncated.`);
        assert.strictEqual(buffer.toString("ascii", state.offset, state.offset + 4), tag, `MDX data is missing ${tag}.`);
        const count = buffer.readUInt32LE(state.offset + 4);
        state.offset += 8;
        return count;
    }

    protected static readFixedString(buffer: Buffer, offset: number, length: number): string {
        const endOffset = offset + length;
        const nullOffset = buffer.indexOf(0, offset);
        const stringEnd = nullOffset >= offset && nullOffset < endOffset ? nullOffset : endOffset;
        return buffer.toString("utf8", offset, stringEnd);
    }

    protected static tryRead<T>(read: () => T, fallback: T): T {
        try {
            return read();
        } catch (_error) {
            return fallback;
        }
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

    public get materials(): MdxMaterialInfo[] {
        return this._materials;
    }

    public get geosets(): MdxGeosetInfo[] {
        return this._geosets;
    }

    public get pivots(): MdxVector3[] {
        return this._pivots;
    }

    public get bones(): MdxBoneInfo[] {
        return this._bones;
    }

    public get helpers(): MdxNodeInfo[] {
        return this._helpers;
    }

    public get attachments(): MdxAttachmentInfo[] {
        return this._attachments;
    }
}
