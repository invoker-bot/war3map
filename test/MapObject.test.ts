/* eslint-disable jest/expect-expect */
import * as assert from "assert";

import { readFileSync } from "fs";
import {
    ReadDumpObject, CamerasObject, EnvironmentObject,
    DoodadsObject, RegionObject, PathmapObject,
    ShadowObject, ObjectsObject, ImportsObject,
    SoundsObject, StringsObject, UnitsObject,
    PlayerNumber, TargetAcquisition,
    InfoObject, MenuMinimapObject,
    GameConfigurationObject
} from "../src/index";

function assertObjectReadDump<T extends ReadDumpObject>(obj1: T, obj2: T, map: string, fileType: string) {
    const buff = readFileSync(`./test/${map}/war3map.${fileType}`);
    obj1.read(buff);
    const dumpBuff = obj1.dump();
    obj2.read(dumpBuff);
    assert.deepStrictEqual(obj1, obj2, "The dump and read operator should equivalent.");
}

describe("CamerasObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new CamerasObject(), new CamerasObject(), "map1", "w3c");
    });

    it("should preserve non-default editor values", () => {
        const camerasObject = new CamerasObject();
        camerasObject.cameras = [{
            target: { x: 128, y: 256 },
            offsetZ: 32,
            angleOfRotation: 90,
            angleOfAttack: 270,
            distance: 1650,
            roll: 0,
            fieldOfView: 70,
            farClipping: 5000,
            editorValue: 42,
            name: "Camera 001"
        }];

        const dumped = camerasObject.dump();
        const reread = new CamerasObject();
        reread.read(dumped);

        assert.strictEqual(reread.cameras[0].editorValue, 42);
        assert.deepStrictEqual(reread.dump(), dumped);
    });
});

describe("EnvironmentObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new EnvironmentObject(), new EnvironmentObject(), "map1", "w3e");
    });
    it("should support map2", () => {
        assertObjectReadDump(new EnvironmentObject(), new EnvironmentObject(), "map2", "w3e");
    });
    it("should support version 12 terrain texture flags", () => {
        const environmentObject = new EnvironmentObject();
        environmentObject.read(readFileSync("./test/map1/war3map.w3e"));
        environmentObject.fileVersion = 12;
        environmentObject.environment.tilesetsData[0][0].waterAndRampFlagAndGroundTextureType = 0x8041;

        const dumped = environmentObject.dump();
        const reread = new EnvironmentObject();
        reread.read(dumped);

        assert.strictEqual(reread.fileVersion, 12);
        assert.strictEqual(reread.environment.tilesetsData[0][0].waterAndRampFlagAndGroundTextureType, 0x8041);
        assert.deepStrictEqual(reread.dump(), dumped);
    });
});
describe("DoodadsObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new DoodadsObject(), new DoodadsObject(), "map1", "doo");
    });
});

describe("RegionObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new RegionObject(), new RegionObject(), "map1", "w3r");
    });
});

describe("ShadowObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new ShadowObject(128, 128), new ShadowObject(128, 128), "map1", "shd");
    });
    it("should support map2", () => {
        assertObjectReadDump(new ShadowObject(416, 352), new ShadowObject(416, 352), "map2", "shd");
    });
});

describe("PathmapObject", () => {
    it("should support map2", () => {
        assertObjectReadDump(new PathmapObject(), new PathmapObject(), "map2", "wpm");
    });
});

describe("InfoObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new InfoObject(), new InfoObject(), "map1", "w3i");
    });
    it("should support map2", () => {
        assertObjectReadDump(new InfoObject(), new InfoObject(), "map2", "w3i");
    });
});

describe("MenuMinimapObject", () => {
    it("should support map2", () => {
        assertObjectReadDump(new MenuMinimapObject(), new MenuMinimapObject(), "map2", "mmp");
    });
});

describe("ObjectsObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new ObjectsObject(false), new ObjectsObject(false), "map1", "w3u");
        assertObjectReadDump(new ObjectsObject(false), new ObjectsObject(false), "map1", "w3t");
        assertObjectReadDump(new ObjectsObject(false), new ObjectsObject(false), "map1", "w3b");
        assertObjectReadDump(new ObjectsObject(true), new ObjectsObject(true), "map1", "w3d");
        assertObjectReadDump(new ObjectsObject(true), new ObjectsObject(true), "map1", "w3a");
        assertObjectReadDump(new ObjectsObject(true), new ObjectsObject(true), "map1", "w3q");
        assertObjectReadDump(new ObjectsObject(false), new ObjectsObject(false), "map1", "w3h");
    });
    it("should support map2", () => {
        assertObjectReadDump(new ObjectsObject(false), new ObjectsObject(false), "map2", "w3u");
        assertObjectReadDump(new ObjectsObject(false), new ObjectsObject(false), "map2", "w3t");
        assertObjectReadDump(new ObjectsObject(true), new ObjectsObject(true), "map2", "w3d");
        assertObjectReadDump(new ObjectsObject(true), new ObjectsObject(true), "map2", "w3a");
    });

});

describe("ImportsObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new ImportsObject(), new ImportsObject(), "map1", "imp");
    });
});

describe("SoundsObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new SoundsObject(), new SoundsObject(), "map1", "w3s");
    });

    it("should expose sound pitch and distance values as numbers", () => {
        const soundsObject = new SoundsObject();
        const source = readFileSync("./test/map1/war3map.w3s");
        soundsObject.read(source);

        const importedSound = soundsObject.sounds.find((sound) => sound.variableName === "gg_snd_02_Battle_Academy01");
        assert.ok(importedSound);
        assert.strictEqual(importedSound.pitch, 1);
        assert.strictEqual(importedSound.pitchVariance, 0);
        assert.deepStrictEqual(importedSound.distance, { min: 0, max: 10000, cutoff: 3000 });
        assert.deepStrictEqual(importedSound.editorMetadata, {
            marker1: 0,
            marker2: 0,
            marker3: 127,
            reserved1: 0,
            reserved2: 0,
            reserved3: 0
        });
        assert.deepStrictEqual(soundsObject.dump(), source);
    });
});

describe("GameConfigurationObject", () => {
    it("should read and dump World Editor game configuration files", () => {
        const gameConfigurationObject = new GameConfigurationObject();
        gameConfigurationObject.flags = GameConfigurationObject.flagsToObject(3);
        gameConfigurationObject.baseGameSpeed = 4;
        gameConfigurationObject.mapPath = "Maps\\Custom\\Smoke.w3x";
        gameConfigurationObject.players = [
            {
                slotId: 0,
                team: 0,
                race: 1,
                color: 0,
                handicap: 100,
                flags: GameConfigurationObject.playerFlagsToObject(1),
                aiDifficulty: 0,
                aiScriptPath: ""
            },
            {
                slotId: 1,
                team: 1,
                race: 2,
                color: 1,
                handicap: 90,
                flags: GameConfigurationObject.playerFlagsToObject(4),
                aiDifficulty: 2,
                aiScriptPath: "AI Scripts\\orc.ai"
            }
        ];

        const dumped = gameConfigurationObject.dump();
        const reread = new GameConfigurationObject();
        reread.read(dumped);

        assert.deepStrictEqual(reread.dump(), dumped);
        assert.strictEqual(reread.baseGameSpeed, 4);
        assert.strictEqual(reread.players[1].flags.loadCustomAi, true);
    });
});

describe("StringsObject", () => {
    it("should read and dump trigger strings", () => {
        const stringsObject = new StringsObject();
        stringsObject.strings = [
            { id: "1", comment: "// optional comment", value: "Hello world" },
            { id: "2", value: "Line 1\r\nLine 2" }
        ];
        const dumped = stringsObject.dump();
        const reread = new StringsObject();
        reread.read(dumped);
        assert.deepStrictEqual(reread.strings, stringsObject.strings);
        assert.deepStrictEqual(reread.dump(), dumped);
    });

    it("should preserve source trigger string formatting until edited", () => {
        const source = Buffer.from("STRING 1\r\n// comment\r\n{\r\nHello\r\n}\r\n\r\n// trailing note\r\n", "utf8");
        const stringsObject = new StringsObject();

        stringsObject.read(source);

        assert.deepStrictEqual(stringsObject.dump(), source);
        const string = stringsObject.getString("1");
        assert.ok(string);
        string.value = "Changed";
        assert.notDeepStrictEqual(stringsObject.dump(), source);
        assert.ok(stringsObject.dump().toString("utf8").includes("Changed"));
    });
});

describe("UnitsObject", () => {
    it("should read and dump unit placements", () => {
        const unitsObject = new UnitsObject();
        unitsObject.units = [
            {
                type: "hfoo",
                x: -256,
                y: 128,
                z: 0,
                rotation: 90,
                player: PlayerNumber.Red,
                id: 1,
                flags: 2,
                hitpoints: 75,
                mana: 0,
                targetAcquisition: TargetAcquisition.Camp,
                hero: {
                    level: 1,
                    strength: 0,
                    agility: 0,
                    intelligence: 0
                },
                inventory: [
                    { slot: 1, type: "ratf" }
                ],
                abilities: [
                    { ability: "Adef", active: true, level: 1 }
                ]
            }
        ];
        const dumped = unitsObject.dump();
        const reread = new UnitsObject();
        reread.read(dumped);
        assert.strictEqual(reread.units.length, 1);
        assert.strictEqual(reread.units[0].type, "hfoo");
        assert.strictEqual(reread.units[0].rotation, 90);
        assert.deepStrictEqual(reread.units[0].inventory, [{ slot: 1, type: "ratf" }]);
        assert.deepStrictEqual(reread.units[0].abilities, [{ ability: "Adef", active: true, level: 1 }]);
        assert.deepStrictEqual(reread.dump(), dumped);
    });

    it("should preserve version 7 units and duplicate item drops", () => {
        const unitsObject = new UnitsObject();
        unitsObject.fileVersion = 7;
        unitsObject.fileSubVersion = 9;
        unitsObject.units = [
            {
                type: "nfoo",
                x: 64,
                y: 128,
                z: 0,
                rotation: 270,
                player: PlayerNumber.NeutralPassive,
                id: 14,
                flags: 2,
                hero: {
                    level: 1,
                    strength: 0,
                    agility: 0,
                    intelligence: 0
                },
                customItemSetEntries: [[
                    { type: "YYI5", chance: 50 },
                    { type: "YYI5", chance: 50 }
                ]],
                randomFlag: -1
            }
        ];

        const dumped = unitsObject.dump();
        const reread = new UnitsObject();
        reread.read(dumped);

        assert.strictEqual(reread.fileVersion, 7);
        assert.deepStrictEqual(reread.units[0].customItemSetEntries, unitsObject.units[0].customItemSetEntries);
        assert.deepStrictEqual(reread.dump(), dumped);
    });
});
