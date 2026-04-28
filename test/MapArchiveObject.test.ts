/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import { readFileSync } from "fs";
import {
    createMapFileObject,
    AiScriptObject,
    BlpImageObject,
    CustomTextTriggerObject,
    DdsImageObject,
    InfoObject,
    MapArchiveObject,
    MenuMinimapObject,
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
        assert.ok(createMapFileObject("war3mapMap.blp") instanceof BlpImageObject);
        assert.ok(createMapFileObject("war3mapMap.b00") instanceof BlpImageObject);
        assert.ok(createMapFileObject("war3mapMap.tga") instanceof TgaImageObject);
        assert.ok(createMapFileObject("war3mapPreview.tga") instanceof TgaImageObject);
        assert.ok(createMapFileObject("war3mapPreview.dds") instanceof DdsImageObject);
        assert.ok(createMapFileObject("UI\\FrameDef\\Custom.fdf") instanceof TextFileObject);
        assert.ok(createMapFileObject("Units\\CustomUnitData.slk") instanceof TextFileObject);
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
