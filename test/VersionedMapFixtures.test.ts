/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import { existsSync, readFileSync, readdirSync } from "fs";
import * as path from "path";
import {
    BlpImageObject,
    CustomTextTriggerObject,
    InfoObject,
    MenuMinimapObject,
    ReadDumpObject,
    TextFileObject,
    TgaImageObject,
    TriggerNamesObject,
    UnitsObject
} from "../src/index";

interface FixtureManifest {
    archiveName: string;
    sourcePage: string;
    w3iVersion: number;
    unitsVersion: number | null;
    unitsSubVersion: number | null;
}

const fixtureNames = ["map3", "map4", "map5", "map6", "map7", "map8", "map9", "map10"];

const objectFactories: Record<string, () => ReadDumpObject> = {
    "war3map.w3i": () => new InfoObject(),
    "war3mapUnits.doo": () => new UnitsObject(),
    "war3map.wct": () => new CustomTextTriggerObject(),
    "war3map.wtg": () => new TriggerNamesObject(),
    "war3map.mmp": () => new MenuMinimapObject(),
    "war3map.j": () => new TextFileObject(),
    "war3map.lua": () => new TextFileObject(),
    "war3mapMap.blp": () => new BlpImageObject(),
    "war3mapMap.tga": () => new TgaImageObject(),
    "war3mapPreview.tga": () => new TgaImageObject()
};

function readManifest(fixturePath: string): FixtureManifest {
    return JSON.parse(readFileSync(path.join(fixturePath, "manifest.json"), "utf8"));
}

function readAndAssertDump(filePath: string, object: ReadDumpObject): void {
    const source = readFileSync(filePath);
    object.read(source);
    assert.deepStrictEqual(object.dump(), source);
}

describe("versioned online map fixtures", () => {
    it("should include v28, v31, and v33 war3map.w3i samples", () => {
        const versions = fixtureNames.map((fixtureName) => {
            const fixturePath = path.join(__dirname, fixtureName);
            return readManifest(fixturePath).w3iVersion;
        });

        assert.deepStrictEqual(
            versions.reduce<Record<number, number>>((counts, version) => {
                counts[version] = (counts[version] || 0) + 1;
                return counts;
            }, {}),
            { 28: 3, 31: 2, 33: 3 }
        );
    });

    fixtureNames.forEach((fixtureName) => {
        it(`should byte-preserve key files from ${fixtureName}`, () => {
            const fixturePath = path.join(__dirname, fixtureName);
            const manifest = readManifest(fixturePath);
            const fileNames = readdirSync(fixturePath).filter((fileName) => fileName !== "manifest.json");

            fileNames.forEach((fileName) => {
                const createObject = objectFactories[fileName];
                assert.ok(createObject, `Missing parser factory for ${fileName}`);
                const object = createObject();
                readAndAssertDump(path.join(fixturePath, fileName), object);

                if (fileName === "war3map.w3i") {
                    assert.strictEqual((object as InfoObject).fileVersion, manifest.w3iVersion);
                } else if (fileName === "war3mapUnits.doo") {
                    assert.strictEqual((object as UnitsObject).fileVersion, manifest.unitsVersion);
                    assert.strictEqual((object as UnitsObject).fileSubVersion, manifest.unitsSubVersion);
                }
            });

            assert.ok(existsSync(path.join(fixturePath, "war3map.w3i")));
            assert.ok(manifest.archiveName.length > 0);
            assert.ok(manifest.sourcePage.startsWith("https://www.hiveworkshop.com/"));
        });
    });
});
