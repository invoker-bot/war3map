/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import { readFileSync } from "fs";
import {
    createMapFileObject,
    AiScriptObject,
    AudioFileObject,
    BlpImageObject,
    CustomTextTriggerObject,
    DdsImageObject,
    InfoObject,
    MapArchiveObject,
    MenuMinimapObject,
    MdxModelObject,
    RawFileObject,
    StormArchiveEntry,
    StormArchiveModule,
    TextFileObject,
    TgaImageObject,
    TriggerNamesObject
} from "../src/index";

class FakeStormArchive implements StormArchiveModule {
    public archives: Map<string, Map<string, Buffer>> = new Map();

    constructor(archivePath: string, files: Map<string, Buffer>) {
        this.archives.set(archivePath, files);
    }

    public listFiles(archivePath: string): StormArchiveEntry[] {
        const files = this.requireArchive(archivePath);
        return Array.from(files.entries()).map(([name, buffer]) => ({ name, size: buffer.length }));
    }

    public readFile(archivePath: string, fileName: string): Buffer {
        const buffer = this.requireArchive(archivePath).get(fileName);
        if (!buffer) {
            throw new Error(`Missing file: ${fileName}`);
        }
        return Buffer.from(buffer);
    }

    public createArchive(archivePath: string): boolean {
        this.archives.set(archivePath, new Map());
        return true;
    }

    public writeFile(archivePath: string, archivedName: string, data: Buffer): boolean {
        this.requireArchive(archivePath).set(archivedName, Buffer.from(data));
        return true;
    }

    public compactArchive(): boolean {
        return true;
    }

    private requireArchive(archivePath: string): Map<string, Buffer> {
        const archive = this.archives.get(archivePath);
        if (!archive) {
            throw new Error(`Missing archive: ${archivePath}`);
        }
        return archive;
    }
}

function createMdxChunk(tag: string, data: Buffer): Buffer {
    const header = Buffer.alloc(8);
    header.write(tag, 0, 4, "ascii");
    header.writeUInt32LE(data.length, 4);
    return Buffer.concat([header, data]);
}

function createUInt32(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(value, 0);
    return buffer;
}

function createInt32(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeInt32LE(value, 0);
    return buffer;
}

function createFloat32(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeFloatLE(value, 0);
    return buffer;
}

function createFixedString(value: string, length: number): Buffer {
    const buffer = Buffer.alloc(length);
    buffer.write(value, 0, "utf8");
    return buffer;
}

function createMdxExtent(): Buffer {
    return Buffer.concat([
        createFloat32(10),
        createFloat32(-1),
        createFloat32(-2),
        createFloat32(-3),
        createFloat32(4),
        createFloat32(5),
        createFloat32(6)
    ]);
}

function createMdxVector3Chunk(tag: string, vectors: number[][]): Buffer {
    const values: Buffer[] = [];
    vectors.forEach((vector) => {
        vector.forEach((value) => values.push(createFloat32(value)));
    });
    return Buffer.concat([
        Buffer.from(tag, "ascii"),
        createUInt32(vectors.length),
        ...values
    ]);
}

function createMdxVector2Chunk(tag: string, vectors: number[][]): Buffer {
    const values: Buffer[] = [];
    vectors.forEach((vector) => {
        vector.forEach((value) => values.push(createFloat32(value)));
    });
    return Buffer.concat([
        Buffer.from(tag, "ascii"),
        createUInt32(vectors.length),
        ...values
    ]);
}

function createMdxUInt32Chunk(tag: string, values: number[]): Buffer {
    return Buffer.concat([Buffer.from(tag, "ascii"), createUInt32(values.length), ...values.map(createUInt32)]);
}

function createMdxUInt16Chunk(tag: string, values: number[]): Buffer {
    const data = Buffer.alloc(values.length * 2);
    values.forEach((value, index) => data.writeUInt16LE(value, index * 2));
    return Buffer.concat([Buffer.from(tag, "ascii"), createUInt32(values.length), data]);
}

function createMdxUInt8Chunk(tag: string, values: number[]): Buffer {
    return Buffer.concat([Buffer.from(tag, "ascii"), createUInt32(values.length), Buffer.from(values)]);
}

function createMdxNode(name: string, objectId: number, parentId: number, flags: number, payload = Buffer.alloc(0)): Buffer {
    return Buffer.concat([
        createUInt32(96 + payload.length),
        createFixedString(name, 80),
        createInt32(objectId),
        createInt32(parentId),
        createUInt32(flags),
        payload
    ]);
}

function createWaveChunk(id: string, data: Buffer): Buffer {
    const header = Buffer.alloc(8);
    header.write(id, 0, 4, "ascii");
    header.writeUInt32LE(data.length, 4);
    return Buffer.concat([header, data, data.length % 2 === 0 ? Buffer.alloc(0) : Buffer.from([0])]);
}

describe("RawFileObject", () => {
    it("should preserve opaque binary files as base64", () => {
        const source = Buffer.from([0, 1, 2, 255]);
        const object = new RawFileObject();
        object.read(source);

        const reread = new RawFileObject();
        reread.base64 = object.base64;

        assert.deepStrictEqual(reread.dump(), source);
    });
});

describe("TextFileObject", () => {
    it("should preserve script text", () => {
        const source = "function main takes nothing returns nothing\r\nendfunction\r\n";
        const object = new TextFileObject();
        object.read(Buffer.from(source, "utf8"));

        assert.strictEqual(object.text, source);
        assert.strictEqual(object.dump().toString("utf8"), source);
    });
});

describe("CustomTextTriggerObject", () => {
    it("should preserve script bytes that are not valid utf8", () => {
        const source = Buffer.from([1, 0, 0, 0, 0xff, 0xfe, 0x00]);
        const object = new CustomTextTriggerObject();
        object.read(source);

        assert.deepStrictEqual(object.dump(), source);
    });
});

describe("createMapFileObject", () => {
    it("should support remaining text and opaque map formats", () => {
        assert.ok(createMapFileObject("war3map.j") instanceof TextFileObject);
        assert.ok(createMapFileObject("war3map.lua") instanceof TextFileObject);

        assert.ok(createMapFileObject("war3map.w3i") instanceof InfoObject);
        assert.ok(createMapFileObject("war3map.wct") instanceof CustomTextTriggerObject);
        assert.ok(createMapFileObject("war3map.wtg") instanceof TriggerNamesObject);
        assert.ok(createMapFileObject("war3map.mmp") instanceof MenuMinimapObject);
        assert.ok(createMapFileObject("war3map.wai") instanceof AiScriptObject);
        assert.ok(createMapFileObject("war3mapImported\\CustomAI.wai") instanceof AiScriptObject);
        assert.ok(createMapFileObject("war3mapImported\\LoadingScreen.mdx") instanceof MdxModelObject);
        assert.ok(createMapFileObject("war3mapImported\\LoadingScreen.mdl") instanceof TextFileObject);
        assert.ok(createMapFileObject("war3mapImported\\Music.wav") instanceof AudioFileObject);
        assert.ok(createMapFileObject("war3mapImported\\Music.mp3") instanceof AudioFileObject);
        assert.ok(createMapFileObject("war3mapMap.blp") instanceof BlpImageObject);
        assert.ok(createMapFileObject("war3mapMap.b00") instanceof BlpImageObject);
        assert.ok(createMapFileObject("war3mapMap.tga") instanceof TgaImageObject);
        assert.ok(createMapFileObject("war3mapPreview.tga") instanceof TgaImageObject);
        assert.ok(createMapFileObject("war3mapPreview.dds") instanceof DdsImageObject);
        assert.ok(createMapFileObject("UI\\FrameDef\\Custom.fdf") instanceof TextFileObject);
        assert.ok(createMapFileObject("Units\\CustomUnitData.slk") instanceof TextFileObject);
    });
});

describe("MdxModelObject", () => {
    it("should expose stable MDX chunk metadata and preserve the model bytes", () => {
        const version = Buffer.alloc(4);
        version.writeUInt32LE(800, 0);
        const model = Buffer.alloc(372);
        model.write("LoadingScreen", 0, "utf8");
        model.writeFloatLE(128.5, 340);
        model.writeFloatLE(-1, 344);
        model.writeFloatLE(-2, 348);
        model.writeFloatLE(-3, 352);
        model.writeFloatLE(4, 356);
        model.writeFloatLE(5, 360);
        model.writeFloatLE(6, 364);
        model.writeUInt32LE(150, 368);
        const texture = Buffer.alloc(268);
        texture.writeUInt32LE(1, 0);
        texture.write("Textures\\Preview.blp", 4, "utf8");
        const layer = Buffer.concat([
            createUInt32(28),
            createUInt32(2),
            createUInt32(1),
            createInt32(0),
            createInt32(-1),
            createUInt32(0),
            createFloat32(0.75)
        ]);
        const material = Buffer.concat([
            createUInt32(20 + layer.length),
            createInt32(0),
            createUInt32(1),
            Buffer.from("LAYS", "ascii"),
            createUInt32(1),
            layer
        ]);
        const geosetBody = Buffer.concat([
            createMdxVector3Chunk("VRTX", [[1, 2, 3]]),
            createMdxVector3Chunk("NRMS", [[0, 0, 1]]),
            createMdxUInt32Chunk("PTYP", [4]),
            createMdxUInt32Chunk("PCNT", [3]),
            createMdxUInt16Chunk("PVTX", [0, 0, 0]),
            createMdxUInt8Chunk("GNDX", [0]),
            createMdxUInt32Chunk("MTGC", [1]),
            createMdxUInt32Chunk("MATS", [0]),
            createInt32(0),
            createUInt32(1),
            createUInt32(2),
            createMdxExtent(),
            createUInt32(1),
            createMdxExtent(),
            Buffer.from("UVAS", "ascii"),
            createUInt32(1),
            createMdxVector2Chunk("UVBS", [[0.25, 0.75]])
        ]);
        const geoset = Buffer.concat([createUInt32(4 + geosetBody.length), geosetBody]);
        const boneNode = createMdxNode("Bone01", 1, -1, 0, Buffer.from("KRTX", "ascii"));
        const helperNode = createMdxNode("Helper01", 2, 1, 0);
        const attachmentNode = createMdxNode("Head Ref", 3, 2, 0x800);
        const attachmentPayload = Buffer.from("KATV", "ascii");
        const attachment = Buffer.concat([
            createUInt32(4 + attachmentNode.length + 260 + 4 + attachmentPayload.length),
            attachmentNode,
            createFixedString("Objects\\Spawn.mdl", 260),
            createInt32(7),
            attachmentPayload
        ]);
        const source = Buffer.concat([
            Buffer.from("MDLX", "ascii"),
            createMdxChunk("VERS", version),
            createMdxChunk("MODL", model),
            createMdxChunk("TEXS", texture),
            createMdxChunk("MTLS", material),
            createMdxChunk("GEOS", geoset),
            createMdxChunk("PIVT", Buffer.concat([createFloat32(1), createFloat32(2), createFloat32(3)])),
            createMdxChunk("BONE", Buffer.concat([boneNode, createInt32(0), createInt32(-1)])),
            createMdxChunk("HELP", helperNode),
            createMdxChunk("ATCH", attachment)
        ]);
        const object = new MdxModelObject();

        object.read(source);

        assert.strictEqual(object.version, 800);
        assert.strictEqual(object.model?.name, "LoadingScreen");
        assert.strictEqual(object.model?.blendTime, 150);
        assert.deepStrictEqual(object.model?.extent.minimumExtent, [-1, -2, -3]);
        assert.deepStrictEqual(object.textures, [{
            replaceableId: 1,
            path: "Textures\\Preview.blp",
            flags: 0
        }]);
        assert.strictEqual(object.materials[0].layers[0].filterMode, 2);
        assert.strictEqual(object.materials[0].layers[0].textureAnimationId, -1);
        assert.strictEqual(object.materials[0].layers[0].alpha, 0.75);
        assert.deepStrictEqual(object.geosets[0].vertices, [[1, 2, 3]]);
        assert.deepStrictEqual(object.geosets[0].faceIndexes, [0, 0, 0]);
        assert.strictEqual(object.geosets[0].selectionGroup, 1);
        assert.strictEqual(object.geosets[0].selectionFlags, 2);
        assert.deepStrictEqual(object.geosets[0].textureCoordinateSets, [[[0.25, 0.75]]]);
        assert.deepStrictEqual(object.pivots, [[1, 2, 3]]);
        assert.strictEqual(object.bones[0].node.name, "Bone01");
        assert.strictEqual(object.bones[0].geosetAnimationId, -1);
        assert.strictEqual(object.helpers[0].name, "Helper01");
        assert.strictEqual(object.attachments[0].node.name, "Head Ref");
        assert.strictEqual(object.attachments[0].path, "Objects\\Spawn.mdl");
        assert.strictEqual(object.attachments[0].attachmentId, 7);
        assert.deepStrictEqual(object.dump(), source);
    });
});

describe("AudioFileObject", () => {
    it("should expose WAVE fmt metadata and preserve the audio bytes", () => {
        const fmt = Buffer.alloc(16);
        fmt.writeUInt16LE(1, 0);
        fmt.writeUInt16LE(1, 2);
        fmt.writeUInt32LE(22050, 4);
        fmt.writeUInt32LE(44100, 8);
        fmt.writeUInt16LE(2, 12);
        fmt.writeUInt16LE(16, 14);
        const data = Buffer.from([1, 2, 3, 4]);
        const waveBody = Buffer.concat([Buffer.from("WAVE", "ascii"), createWaveChunk("fmt ", fmt), createWaveChunk("data", data)]);
        const header = Buffer.alloc(8);
        header.write("RIFF", 0, "ascii");
        header.writeUInt32LE(waveBody.length, 4);
        const source = Buffer.concat([header, waveBody]);
        const object = new AudioFileObject();

        object.read(source);

        assert.strictEqual(object.kind, "WAVE");
        assert.strictEqual(object.waveFormat?.sampleRate, 22050);
        assert.strictEqual(object.waveFormat?.bitsPerSample, 16);
        assert.deepStrictEqual(object.dump(), source);
    });

    it("should expose MP3 ID3 and frame metadata while preserving the bytes", () => {
        const source = Buffer.concat([
            Buffer.from("ID3", "ascii"),
            Buffer.from([3, 0, 0, 0, 0, 0, 0]),
            Buffer.from([0xff, 0xfb, 0x90, 0x64, 0, 0, 0, 0])
        ]);
        const object = new AudioFileObject();

        object.read(source);

        assert.strictEqual(object.kind, "MP3");
        assert.deepStrictEqual(object.id3v2, {
            majorVersion: 3,
            revision: 0,
            flags: 0,
            size: 0
        });
        assert.strictEqual(object.mp3Frame?.version, "MPEG1");
        assert.strictEqual(object.mp3Frame?.layer, "Layer III");
        assert.strictEqual(object.mp3Frame?.bitrateKbps, 128);
        assert.strictEqual(object.mp3Frame?.sampleRate, 44100);
        assert.deepStrictEqual(object.dump(), source);
    });

    it("should preserve empty WAVE placeholders selected by extension", () => {
        const object = new AudioFileObject("WAVE");

        object.read(Buffer.alloc(0));

        assert.strictEqual(object.kind, "WAVE");
        assert.deepStrictEqual(object.dump(), Buffer.alloc(0));
    });
});

describe("AiScriptObject", () => {
    it("should expose the stable WAI header and preserve the AI payload", () => {
        const source = Buffer.concat([
            Buffer.from([
                2, 0, 0, 0,
                83, 97, 116, 121, 114, 32, 65, 73, 0,
                0, 0, 0, 0,
                0xff, 0x19, 0, 0,
                4, 0, 0, 0
            ]),
            Buffer.from("n008n008o008o008", "ascii"),
            Buffer.from([7, 0, 0, 0, 0, 0, 0, 0]),
            Buffer.from("Attack Enemy\0", "utf8")
        ]);
        const object = new AiScriptObject();

        object.read(source);

        assert.deepStrictEqual(object.header, {
            version: 2,
            name: "Satyr AI",
            editorFlags: 0,
            gameFlags: 6655,
            unitIds: ["n008", "n008", "o008", "o008"]
        });
        assert.deepStrictEqual(object.dump(), source);
    });
});

describe("MapArchiveObject", () => {
    it("should read and write archives through a StormLib-compatible adapter", () => {
        const inputArchive = "input.w3x";
        const outputArchive = "output.w3x";
        const sourceFiles = new Map<string, Buffer>([
            ["(listfile)", Buffer.from("war3map.j\r\nwar3map.w3i\r\n")],
            ["war3map.j", Buffer.from("function main takes nothing returns nothing\r\nendfunction\r\n")],
            ["war3map.w3i", Buffer.from([1, 2, 3, 4])],
            ["war3map.wct", Buffer.from([5, 6, 7])],
            ["war3mapMap.blp", Buffer.from([0x42, 0x4c, 0x50, 0x31])]
        ]);
        const storm = new FakeStormArchive(inputArchive, sourceFiles);
        const archive = new MapArchiveObject(storm);

        archive.readArchive(inputArchive);

        assert.ok(archive.getFile("war3map.j")?.object instanceof TextFileObject);
        assert.ok(archive.getFile("war3map.w3i")?.object instanceof RawFileObject);
        archive.writeArchive(outputArchive, { compact: false, overwrite: true });

        const outputFiles = storm.archives.get(outputArchive);
        assert.ok(outputFiles);
        sourceFiles.forEach((buffer, fileName) => {
            if (fileName === "(listfile)") {
                assert.strictEqual(outputFiles.has(fileName), false);
                return;
            }
            assert.deepStrictEqual(outputFiles.get(fileName), buffer);
        });
    });

    it("should fall back to raw when a structured parser rejects a known file", () => {
        const inputArchive = "broken.w3x";
        const sourceFiles = new Map<string, Buffer>([
            ["war3map.w3e", Buffer.from("not a valid environment", "utf8")]
        ]);
        const archive = new MapArchiveObject(new FakeStormArchive(inputArchive, sourceFiles));

        archive.readArchive(inputArchive);

        const file = archive.getFile("war3map.w3e");
        assert.ok(file?.object instanceof RawFileObject);
        assert.strictEqual(file?.raw, true);
        assert.ok(file?.parseError);
    });

    it("should size shadow maps from pathing map dimensions", () => {
        const inputArchive = "shadow.w3x";
        const sourceFiles = new Map<string, Buffer>([
            ["war3map.wpm", readFileSync("./test/map2/war3map.wpm")],
            ["war3map.shd", readFileSync("./test/map2/war3map.shd")]
        ]);
        const archive = new MapArchiveObject(new FakeStormArchive(inputArchive, sourceFiles));

        archive.readArchive(inputArchive);

        assert.strictEqual(archive.getFile("war3map.wpm")?.raw, false);
        assert.strictEqual(archive.getFile("war3map.shd")?.raw, false);
    });
});
