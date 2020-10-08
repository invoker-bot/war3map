/* eslint-disable jest/expect-expect */
import * as assert from "assert";

import {CamerasObject} from "../src/CamerasObject";
import {EnvironmentObject} from "../src/EnvironmentObject";
import {readFileSync} from "fs";
//import {resolve} from "path";
describe("CamerasObject",()=>{
    it("should support map1",()=>{
        const camera=new CamerasObject();
        const buff=readFileSync("./test/map1/war3map.w3c");
        camera.read(buff);
        assert.deepStrictEqual(camera.dump(),buff);
    });
});

describe("EnvironmentObject",()=>{
    it("should support map1",()=>{
        const env=new EnvironmentObject();
        const buff=readFileSync("./test/map1/war3map.w3e");
        env.read(buff);
        assert.ok(true);
        //assert.deepStrictEqual(camera.dump(),buff);
    });
});