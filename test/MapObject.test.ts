/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import {ReadDumpObject} from "../src/BinaryBuffer";
import {CamerasObject} from "../src/CamerasObject";
import {EnvironmentObject} from "../src/EnvironmentObject";
import {readFileSync} from "fs";
//import {resolve} from "path";

function assertObjectReadDump<T extends ReadDumpObject>(obj:T,map:string,fileType:string){
    const buff=readFileSync(`./test/${map}/war3map.${fileType}`);
    obj.read(buff);
    assert.deepStrictEqual(obj.dump(),buff,"The dump and read operator should equivalent.");
}
describe("CamerasObject",()=>{
    it("should support map1",()=>{
        assertObjectReadDump(new CamerasObject(),"map1","w3c");
        /*const camera=new CamerasObject();
        const buff=readFileSync("./test/map1/war3map.w3c");
        camera.read(buff);
        assert.deepStrictEqual(camera.dump(),buff);*/
    });
});

describe("EnvironmentObject",()=>{
    it("should support map1",()=>{
        assertObjectReadDump(new EnvironmentObject(),"map1","w3e");
    });
});