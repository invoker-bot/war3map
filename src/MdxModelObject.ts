/**
 * @packageDocumentation
 */

import * as assert from "assert";
import { ReadDumpObject } from "./BinaryBuffer";

export type MdxVector2 = [number, number];
export type MdxVector3 = [number, number, number];
export type MdxVector4 = [number, number, number, number];
export type MdxTrackValue = number | MdxVector3 | MdxVector4;
export type MdxTrackValueType = "event" | "float" | "uint32" | "vector3" | "vector4";

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
    animationTracks: MdxAnimationTrackInfo[];
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

export interface MdxGeosetAnimationInfo {
    inclusiveSize: number;
    alpha: number;
    flags: number;
    color: MdxVector3;
    geosetId: number;
    animationPayload: Buffer;
    animationTracks: MdxAnimationTrackInfo[];
}

export interface MdxAnimationKeyframeInfo {
    time: number;
    value?: MdxTrackValue;
    inTangent?: MdxTrackValue;
    outTangent?: MdxTrackValue;
}

export interface MdxAnimationTrackInfo {
    tag: string;
    offset: number;
    size: number;
    valueType: MdxTrackValueType;
    keyCount: number;
    interpolationType?: number;
    globalSequenceId: number;
    keyframes: MdxAnimationKeyframeInfo[];
    data: Buffer;
}

export interface MdxNodeInfo {
    inclusiveSize: number;
    name: string;
    objectId: number;
    parentId: number;
    flags: number;
    animationPayload: Buffer;
    animationTracks: MdxAnimationTrackInfo[];
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
    animationTracks: MdxAnimationTrackInfo[];
}

export interface MdxTextureAnimationInfo {
    inclusiveSize: number;
    animationPayload: Buffer;
    animationTracks: MdxAnimationTrackInfo[];
}

export interface MdxCameraInfo {
    inclusiveSize: number;
    name: string;
    position: MdxVector3;
    fieldOfView: number;
    farClippingPlane: number;
    nearClippingPlane: number;
    targetPosition: MdxVector3;
    animationPayload: Buffer;
    animationTracks: MdxAnimationTrackInfo[];
}

export interface MdxEventObjectInfo {
    node: MdxNodeInfo;
    eventTrack: MdxAnimationTrackInfo;
}

export interface MdxCollisionShapeInfo {
    node: MdxNodeInfo;
    type: number;
    vertices: MdxVector3[];
    radius?: number;
    height?: number;
    length?: number;
    width?: number;
}

export interface MdxRibbonEmitterInfo {
    inclusiveSize: number;
    node: MdxNodeInfo;
    heightAbove: number;
    heightBelow: number;
    alpha: number;
    color: MdxVector3;
    lifespan: number;
    textureSlot: number;
    emissionRate: number;
    rows: number;
    columns: number;
    materialId: number;
    gravity: number;
    animationPayload: Buffer;
    animationTracks: MdxAnimationTrackInfo[];
}

export interface MdxParticleEmitter2Info {
    inclusiveSize: number;
    node: MdxNodeInfo;
    speed: number;
    variation: number;
    latitude: number;
    gravity: number;
    lifespan: number;
    emissionRate: number;
    length: number;
    width: number;
    filterMode: number;
    rows: number;
    columns: number;
    headOrTail: number;
    tailLength: number;
    time: number;
    segmentColors: [MdxVector3, MdxVector3, MdxVector3];
    segmentAlpha: [number, number, number];
    segmentScaling: [number, number, number];
    headInterval: [number, number, number];
    headDecayInterval: [number, number, number];
    tailInterval: [number, number, number];
    tailDecayInterval: [number, number, number];
    textureId: number;
    squirt: number;
    priorityPlane: number;
    replaceableId: number;
    animationPayload: Buffer;
    animationTracks: MdxAnimationTrackInfo[];
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
    protected _geosetAnimations: MdxGeosetAnimationInfo[] = [];
    protected _globalSequences: number[] = [];
    protected _textureAnimations: MdxTextureAnimationInfo[] = [];
    protected _pivots: MdxVector3[] = [];
    protected _bones: MdxBoneInfo[] = [];
    protected _helpers: MdxNodeInfo[] = [];
    protected _attachments: MdxAttachmentInfo[] = [];
    protected _cameras: MdxCameraInfo[] = [];
    protected _eventObjects: MdxEventObjectInfo[] = [];
    protected _collisionShapes: MdxCollisionShapeInfo[] = [];
    protected _ribbonEmitters: MdxRibbonEmitterInfo[] = [];
    protected _particleEmitters2: MdxParticleEmitter2Info[] = [];

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
        this._geosetAnimations = [];
        this._globalSequences = [];
        this._textureAnimations = [];
        this._pivots = [];
        this._bones = [];
        this._helpers = [];
        this._attachments = [];
        this._cameras = [];
        this._eventObjects = [];
        this._collisionShapes = [];
        this._ribbonEmitters = [];
        this._particleEmitters2 = [];

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
            } else if (chunk.tag === "GEOA") {
                this._geosetAnimations = MdxModelObject.tryRead(() => MdxModelObject.readGeosetAnimations(chunk.data), []);
            } else if (chunk.tag === "GLBS" && chunk.data.length % 4 === 0) {
                this._globalSequences = MdxModelObject.readUInt32List(chunk.data, 0, chunk.data.length / 4);
            } else if (chunk.tag === "TXAN") {
                this._textureAnimations = MdxModelObject.tryRead(() => MdxModelObject.readTextureAnimations(chunk.data), []);
            } else if (chunk.tag === "PIVT" && chunk.data.length % 12 === 0) {
                this._pivots = MdxModelObject.readVector3List(chunk.data, 0, chunk.data.length / 12);
            } else if (chunk.tag === "BONE") {
                this._bones = MdxModelObject.tryRead(() => MdxModelObject.readBones(chunk.data), []);
            } else if (chunk.tag === "HELP") {
                this._helpers = MdxModelObject.tryRead(() => MdxModelObject.readNodes(chunk.data), []);
            } else if (chunk.tag === "ATCH") {
                this._attachments = MdxModelObject.tryRead(() => MdxModelObject.readAttachments(chunk.data), []);
            } else if (chunk.tag === "CAMS") {
                this._cameras = MdxModelObject.tryRead(() => MdxModelObject.readCameras(chunk.data), []);
            } else if (chunk.tag === "EVTS") {
                this._eventObjects = MdxModelObject.tryRead(() => MdxModelObject.readEventObjects(chunk.data), []);
            } else if (chunk.tag === "CLID") {
                this._collisionShapes = MdxModelObject.tryRead(() => MdxModelObject.readCollisionShapes(chunk.data), []);
            } else if (chunk.tag === "RIBB") {
                this._ribbonEmitters = MdxModelObject.tryRead(() => MdxModelObject.readRibbonEmitters(chunk.data), []);
            } else if (chunk.tag === "PRE2") {
                this._particleEmitters2 = MdxModelObject.tryRead(() => MdxModelObject.readParticleEmitters2(chunk.data), []);
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
                    animationPayload: Buffer.from(buffer.slice(layerOffset + 28, layerEndOffset)),
                    animationTracks: MdxModelObject.readAnimationTracksSafely(buffer.slice(layerOffset + 28, layerEndOffset))
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

    protected static readGeosetAnimations(buffer: Buffer): MdxGeosetAnimationInfo[] {
        const animations: MdxGeosetAnimationInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            assert.ok(offset + 28 <= buffer.length, "MDX geoset animation header is truncated.");
            const inclusiveSize = buffer.readUInt32LE(offset);
            const endOffset = offset + inclusiveSize;
            assert.ok(inclusiveSize >= 28 && endOffset <= buffer.length, "MDX geoset animation size points outside the GEOA chunk.");
            animations.push({
                inclusiveSize,
                alpha: buffer.readFloatLE(offset + 4),
                flags: buffer.readUInt32LE(offset + 8),
                color: [
                    buffer.readFloatLE(offset + 12),
                    buffer.readFloatLE(offset + 16),
                    buffer.readFloatLE(offset + 20)
                ],
                geosetId: buffer.readInt32LE(offset + 24),
                animationPayload: Buffer.from(buffer.slice(offset + 28, endOffset)),
                animationTracks: MdxModelObject.readAnimationTracksSafely(buffer.slice(offset + 28, endOffset))
            });
            offset = endOffset;
        }
        return animations;
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
                animationPayload: Buffer.from(buffer.slice(result.nextOffset + 264, endOffset)),
                animationTracks: MdxModelObject.readAnimationTracksSafely(buffer.slice(result.nextOffset + 264, endOffset))
            });
            offset = endOffset;
        }
        return attachments;
    }

    protected static readTextureAnimations(buffer: Buffer): MdxTextureAnimationInfo[] {
        const animations: MdxTextureAnimationInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            assert.ok(offset + 4 <= buffer.length, "MDX texture animation header is truncated.");
            const inclusiveSize = buffer.readUInt32LE(offset);
            const endOffset = offset + inclusiveSize;
            assert.ok(inclusiveSize >= 4 && endOffset <= buffer.length, "MDX texture animation size points outside the TXAN chunk.");
            const animationPayload = Buffer.from(buffer.slice(offset + 4, endOffset));
            animations.push({
                inclusiveSize,
                animationPayload,
                animationTracks: MdxModelObject.readAnimationTracksSafely(animationPayload)
            });
            offset = endOffset;
        }
        return animations;
    }

    protected static readCameras(buffer: Buffer): MdxCameraInfo[] {
        const cameras: MdxCameraInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            assert.ok(offset + 120 <= buffer.length, "MDX camera data is truncated.");
            const inclusiveSize = buffer.readUInt32LE(offset);
            const endOffset = offset + inclusiveSize;
            assert.ok(inclusiveSize >= 120 && endOffset <= buffer.length, "MDX camera size points outside the CAMS chunk.");
            const animationPayload = Buffer.from(buffer.slice(offset + 120, endOffset));
            cameras.push({
                inclusiveSize,
                name: MdxModelObject.readFixedString(buffer, offset + 4, 80),
                position: MdxModelObject.readVector3(buffer, offset + 84),
                fieldOfView: buffer.readFloatLE(offset + 96),
                farClippingPlane: buffer.readFloatLE(offset + 100),
                nearClippingPlane: buffer.readFloatLE(offset + 104),
                targetPosition: MdxModelObject.readVector3(buffer, offset + 108),
                animationPayload,
                animationTracks: MdxModelObject.readAnimationTracksSafely(animationPayload)
            });
            offset = endOffset;
        }
        return cameras;
    }

    protected static readEventObjects(buffer: Buffer): MdxEventObjectInfo[] {
        const events: MdxEventObjectInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            const result = MdxModelObject.readNode(buffer, offset);
            assert.ok(result.nextOffset + 12 <= buffer.length, "MDX event track is truncated.");
            const eventTrack = MdxModelObject.readAnimationTrack(buffer, result.nextOffset);
            assert.strictEqual(eventTrack.tag, "KEVT", "MDX event object is missing KEVT data.");
            events.push({
                node: result.node,
                eventTrack
            });
            offset = result.nextOffset + eventTrack.size;
        }
        return events;
    }

    protected static readCollisionShapes(buffer: Buffer): MdxCollisionShapeInfo[] {
        const shapes: MdxCollisionShapeInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            const result = MdxModelObject.readNode(buffer, offset);
            assert.ok(result.nextOffset + 4 <= buffer.length, "MDX collision shape type is truncated.");
            const type = buffer.readUInt32LE(result.nextOffset);
            const dataOffset = result.nextOffset + 4;
            const shape: MdxCollisionShapeInfo = {
                node: result.node,
                type,
                vertices: []
            };

            if (type === 0) {
                assert.ok(dataOffset + 24 <= buffer.length, "MDX collision box is truncated.");
                shape.vertices = [
                    MdxModelObject.readVector3(buffer, dataOffset),
                    MdxModelObject.readVector3(buffer, dataOffset + 12)
                ];
                offset = dataOffset + 24;
            } else if (type === 1) {
                assert.ok(dataOffset + 20 <= buffer.length, "MDX collision cylinder is truncated.");
                shape.vertices = [MdxModelObject.readVector3(buffer, dataOffset)];
                shape.height = buffer.readFloatLE(dataOffset + 12);
                shape.radius = buffer.readFloatLE(dataOffset + 16);
                offset = dataOffset + 20;
            } else if (type === 2) {
                assert.ok(dataOffset + 16 <= buffer.length, "MDX collision sphere is truncated.");
                shape.vertices = [MdxModelObject.readVector3(buffer, dataOffset)];
                shape.radius = buffer.readFloatLE(dataOffset + 12);
                offset = dataOffset + 16;
            } else if (type === 3) {
                assert.ok(dataOffset + 8 <= buffer.length, "MDX collision plane is truncated.");
                shape.length = buffer.readFloatLE(dataOffset);
                shape.width = buffer.readFloatLE(dataOffset + 4);
                offset = dataOffset + 8;
            } else {
                throw new Error(`Unsupported MDX collision shape type: ${type}.`);
            }
            shapes.push(shape);
        }
        return shapes;
    }

    protected static readRibbonEmitters(buffer: Buffer): MdxRibbonEmitterInfo[] {
        const emitters: MdxRibbonEmitterInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            assert.ok(offset + 4 <= buffer.length, "MDX ribbon emitter header is truncated.");
            const inclusiveSize = buffer.readUInt32LE(offset);
            const endOffset = offset + inclusiveSize;
            assert.ok(inclusiveSize >= 152 && endOffset <= buffer.length, "MDX ribbon emitter size points outside the RIBB chunk.");
            const result = MdxModelObject.readNode(buffer, offset + 4);
            const fixedOffset = result.nextOffset;
            assert.ok(fixedOffset + 52 <= endOffset, "MDX ribbon emitter fields are truncated.");
            const animationPayload = Buffer.from(buffer.slice(fixedOffset + 52, endOffset));
            emitters.push({
                inclusiveSize,
                node: result.node,
                heightAbove: buffer.readFloatLE(fixedOffset),
                heightBelow: buffer.readFloatLE(fixedOffset + 4),
                alpha: buffer.readFloatLE(fixedOffset + 8),
                color: MdxModelObject.readVector3(buffer, fixedOffset + 12),
                lifespan: buffer.readFloatLE(fixedOffset + 24),
                textureSlot: buffer.readUInt32LE(fixedOffset + 28),
                emissionRate: buffer.readUInt32LE(fixedOffset + 32),
                rows: buffer.readUInt32LE(fixedOffset + 36),
                columns: buffer.readUInt32LE(fixedOffset + 40),
                materialId: buffer.readInt32LE(fixedOffset + 44),
                gravity: buffer.readFloatLE(fixedOffset + 48),
                animationPayload,
                animationTracks: MdxModelObject.readAnimationTracksSafely(animationPayload)
            });
            offset = endOffset;
        }
        return emitters;
    }

    protected static readParticleEmitters2(buffer: Buffer): MdxParticleEmitter2Info[] {
        const emitters: MdxParticleEmitter2Info[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            assert.ok(offset + 4 <= buffer.length, "MDX particle emitter 2 header is truncated.");
            const inclusiveSize = buffer.readUInt32LE(offset);
            const endOffset = offset + inclusiveSize;
            assert.ok(inclusiveSize >= 271 && endOffset <= buffer.length, "MDX particle emitter 2 size points outside the PRE2 chunk.");
            const result = MdxModelObject.readNode(buffer, offset + 4);
            const fixedOffset = result.nextOffset;
            assert.ok(fixedOffset + 171 <= endOffset, "MDX particle emitter 2 fields are truncated.");
            const animationPayload = Buffer.from(buffer.slice(fixedOffset + 171, endOffset));
            emitters.push({
                inclusiveSize,
                node: result.node,
                speed: buffer.readFloatLE(fixedOffset),
                variation: buffer.readFloatLE(fixedOffset + 4),
                latitude: buffer.readFloatLE(fixedOffset + 8),
                gravity: buffer.readFloatLE(fixedOffset + 12),
                lifespan: buffer.readFloatLE(fixedOffset + 16),
                emissionRate: buffer.readFloatLE(fixedOffset + 20),
                length: buffer.readFloatLE(fixedOffset + 24),
                width: buffer.readFloatLE(fixedOffset + 28),
                filterMode: buffer.readUInt32LE(fixedOffset + 32),
                rows: buffer.readUInt32LE(fixedOffset + 36),
                columns: buffer.readUInt32LE(fixedOffset + 40),
                headOrTail: buffer.readUInt32LE(fixedOffset + 44),
                tailLength: buffer.readFloatLE(fixedOffset + 48),
                time: buffer.readFloatLE(fixedOffset + 52),
                segmentColors: [
                    MdxModelObject.readVector3(buffer, fixedOffset + 56),
                    MdxModelObject.readVector3(buffer, fixedOffset + 68),
                    MdxModelObject.readVector3(buffer, fixedOffset + 80)
                ],
                segmentAlpha: [
                    buffer.readUInt8(fixedOffset + 92),
                    buffer.readUInt8(fixedOffset + 93),
                    buffer.readUInt8(fixedOffset + 94)
                ],
                segmentScaling: [
                    buffer.readFloatLE(fixedOffset + 95),
                    buffer.readFloatLE(fixedOffset + 99),
                    buffer.readFloatLE(fixedOffset + 103)
                ],
                headInterval: MdxModelObject.readUInt32Tuple3(buffer, fixedOffset + 107),
                headDecayInterval: MdxModelObject.readUInt32Tuple3(buffer, fixedOffset + 119),
                tailInterval: MdxModelObject.readUInt32Tuple3(buffer, fixedOffset + 131),
                tailDecayInterval: MdxModelObject.readUInt32Tuple3(buffer, fixedOffset + 143),
                textureId: buffer.readInt32LE(fixedOffset + 155),
                squirt: buffer.readUInt32LE(fixedOffset + 159),
                priorityPlane: buffer.readInt32LE(fixedOffset + 163),
                replaceableId: buffer.readInt32LE(fixedOffset + 167),
                animationPayload,
                animationTracks: MdxModelObject.readAnimationTracksSafely(animationPayload)
            });
            offset = endOffset;
        }
        return emitters;
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
                animationPayload: Buffer.from(buffer.slice(offset + 96, nextOffset)),
                animationTracks: MdxModelObject.readAnimationTracksSafely(buffer.slice(offset + 96, nextOffset))
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

    protected static readVector3(buffer: Buffer, offset: number): MdxVector3 {
        return [
            buffer.readFloatLE(offset),
            buffer.readFloatLE(offset + 4),
            buffer.readFloatLE(offset + 8)
        ];
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
            values.push(MdxModelObject.readVector3(buffer, valueOffset));
        }
        return values;
    }

    protected static readUInt32Tuple3(buffer: Buffer, offset: number): [number, number, number] {
        return [
            buffer.readUInt32LE(offset),
            buffer.readUInt32LE(offset + 4),
            buffer.readUInt32LE(offset + 8)
        ];
    }

    protected static readTaggedUInt32Array(buffer: Buffer, state: { offset: number; end: number }, tag: string): number[] {
        const count = MdxModelObject.readTaggedCount(buffer, state, tag);
        assert.ok(state.offset + count * 4 <= state.end, `MDX ${tag} data is truncated.`);
        const values = MdxModelObject.readUInt32List(buffer, state.offset, count);
        state.offset += count * 4;
        return values;
    }

    protected static readUInt32List(buffer: Buffer, offset: number, count: number): number[] {
        const values: number[] = [];
        for (let i = 0; i < count; ++i) {
            values.push(buffer.readUInt32LE(offset + i * 4));
        }
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

    protected static readAnimationTracksSafely(buffer: Buffer): MdxAnimationTrackInfo[] {
        if (buffer.length === 0) {
            return [];
        }
        return MdxModelObject.tryRead(() => MdxModelObject.readAnimationTracks(buffer), []);
    }

    protected static readAnimationTracks(buffer: Buffer): MdxAnimationTrackInfo[] {
        const tracks: MdxAnimationTrackInfo[] = [];
        let offset = 0;
        while (offset < buffer.length) {
            const track = MdxModelObject.readAnimationTrack(buffer, offset);
            tracks.push(track);
            offset += track.size;
        }
        return tracks;
    }

    protected static readAnimationTrack(buffer: Buffer, offset: number): MdxAnimationTrackInfo {
        assert.ok(offset + 12 <= buffer.length, "MDX animation track header is truncated.");
        const tag = buffer.toString("ascii", offset, offset + 4);
        const valueType = MdxModelObject.getTrackValueType(tag);
        if (tag === "KEVT" || tag === "KRTX") {
            return MdxModelObject.readSimpleAnimationTrack(buffer, offset, tag, valueType);
        }

        assert.ok(offset + 16 <= buffer.length, "MDX animation track header is truncated.");
        const keyCount = buffer.readUInt32LE(offset + 4);
        const interpolationType = buffer.readUInt32LE(offset + 8);
        const globalSequenceId = buffer.readUInt32LE(offset + 12);
        assert.ok(interpolationType <= 3, "MDX animation interpolation type is invalid.");
        const valueSize = MdxModelObject.getTrackValueSize(valueType);
        const valueCount = interpolationType > 1 ? 3 : 1;
        const keySize = 4 + valueSize * valueCount;
        const size = 16 + keyCount * keySize;
        assert.ok(offset + size <= buffer.length, `MDX ${tag} track data is truncated.`);

        const keyframes: MdxAnimationKeyframeInfo[] = [];
        let cursor = offset + 16;
        for (let i = 0; i < keyCount; ++i) {
            const time = buffer.readInt32LE(cursor);
            cursor += 4;
            const value = MdxModelObject.readTrackValue(buffer, cursor, valueType);
            cursor += valueSize;
            const keyframe: MdxAnimationKeyframeInfo = { time, value };
            if (interpolationType > 1) {
                keyframe.inTangent = MdxModelObject.readTrackValue(buffer, cursor, valueType);
                cursor += valueSize;
                keyframe.outTangent = MdxModelObject.readTrackValue(buffer, cursor, valueType);
                cursor += valueSize;
            }
            keyframes.push(keyframe);
        }

        return {
            tag,
            offset,
            size,
            valueType,
            keyCount,
            interpolationType,
            globalSequenceId,
            keyframes,
            data: Buffer.from(buffer.slice(offset, offset + size))
        };
    }

    protected static readSimpleAnimationTrack(buffer: Buffer, offset: number, tag: string, valueType: MdxTrackValueType): MdxAnimationTrackInfo {
        const keyCount = buffer.readUInt32LE(offset + 4);
        const globalSequenceId = buffer.readUInt32LE(offset + 8);
        const keySize = tag === "KEVT" ? 4 : 8;
        const size = 12 + keyCount * keySize;
        assert.ok(offset + size <= buffer.length, `MDX ${tag} track data is truncated.`);
        const keyframes: MdxAnimationKeyframeInfo[] = [];
        let cursor = offset + 12;
        for (let i = 0; i < keyCount; ++i) {
            const time = buffer.readInt32LE(cursor);
            cursor += 4;
            const keyframe: MdxAnimationKeyframeInfo = { time };
            if (tag !== "KEVT") {
                keyframe.value = buffer.readUInt32LE(cursor);
                cursor += 4;
            }
            keyframes.push(keyframe);
        }

        return {
            tag,
            offset,
            size,
            valueType,
            keyCount,
            globalSequenceId,
            keyframes,
            data: Buffer.from(buffer.slice(offset, offset + size))
        };
    }

    protected static getTrackValueType(tag: string): MdxTrackValueType {
        switch (tag) {
            case "KGRT":
            case "KTAR":
                return "vector4";
            case "KGTR":
            case "KGSC":
            case "KGAC":
            case "KLAC":
            case "KLBC":
            case "KCTR":
            case "KTTR":
            case "KTAT":
            case "KTAS":
            case "KRCO":
            case "KFC3":
                return "vector3";
            case "KMTF":
            case "KRTX":
                return "uint32";
            case "KEVT":
                return "event";
            case "KMTA":
            case "KMTE":
            case "KFCA":
            case "KFTC":
            case "KGAO":
            case "KLAS":
            case "KLAE":
            case "KLAI":
            case "KLBI":
            case "KVIS":
            case "KATV":
            case "KPEE":
            case "KPEG":
            case "KPLN":
            case "KPLT":
            case "KPEL":
            case "KPES":
            case "KPEV":
            case "KCRL":
            case "KP2S":
            case "KP2R":
            case "KP2L":
            case "KP2G":
            case "KP2E":
            case "KP2N":
            case "KP2W":
            case "KP2V":
            case "KP2Z":
            case "KRHA":
            case "KRHB":
            case "KRAL":
            case "KPPA":
            case "KPPE":
            case "KPPL":
            case "KPPS":
            case "KPPV":
                return "float";
            case "KPPC":
                return "vector3";
            default:
                throw new Error(`Unsupported MDX animation track tag: ${tag}.`);
        }
    }

    protected static getTrackValueSize(valueType: MdxTrackValueType): number {
        switch (valueType) {
            case "float":
            case "uint32":
                return 4;
            case "vector3":
                return 12;
            case "vector4":
                return 16;
            case "event":
                return 0;
            default:
                throw new Error(`Unsupported MDX animation value type: ${valueType}.`);
        }
    }

    protected static readTrackValue(buffer: Buffer, offset: number, valueType: MdxTrackValueType): MdxTrackValue {
        switch (valueType) {
            case "float":
                return buffer.readFloatLE(offset);
            case "uint32":
                return buffer.readUInt32LE(offset);
            case "vector3":
                return MdxModelObject.readVector3(buffer, offset);
            case "vector4":
                return [
                    buffer.readFloatLE(offset),
                    buffer.readFloatLE(offset + 4),
                    buffer.readFloatLE(offset + 8),
                    buffer.readFloatLE(offset + 12)
                ];
            default:
                throw new Error(`Unsupported MDX animation value type: ${valueType}.`);
        }
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

    public get geosetAnimations(): MdxGeosetAnimationInfo[] {
        return this._geosetAnimations;
    }

    public get globalSequences(): number[] {
        return this._globalSequences;
    }

    public get textureAnimations(): MdxTextureAnimationInfo[] {
        return this._textureAnimations;
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

    public get cameras(): MdxCameraInfo[] {
        return this._cameras;
    }

    public get eventObjects(): MdxEventObjectInfo[] {
        return this._eventObjects;
    }

    public get collisionShapes(): MdxCollisionShapeInfo[] {
        return this._collisionShapes;
    }

    public get ribbonEmitters(): MdxRibbonEmitterInfo[] {
        return this._ribbonEmitters;
    }

    public get particleEmitters2(): MdxParticleEmitter2Info[] {
        return this._particleEmitters2;
    }
}
