/* eslint-disable jest/expect-expect */
import * as assert from "assert";

import { readFileSync } from "fs";
import {
    ReadDumpObject, CamerasObject, EnvironmentObject,
    DoodadsObject, RegionObject, PathmapObject,
    ShadowObject, ObjectsObject
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
});

describe("EnvironmentObject", () => {
    it("should support map1", () => {
        assertObjectReadDump(new EnvironmentObject(), new EnvironmentObject(), "map1", "w3e");
    });
    it("should support map2", () => {
        assertObjectReadDump(new EnvironmentObject(), new EnvironmentObject(), "map2", "w3e");
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