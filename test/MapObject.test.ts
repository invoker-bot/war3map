/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import {ReadDumpObject} from "../src/BinaryBuffer";
import {CamerasObject} from "../src/CamerasObject";
import {EnvironmentObject} from "../src/EnvironmentObject";
import {DoodadsObject} from "../src/DoodadsObject";
import {readFileSync} from "fs";
//import {resolve} from "path";

function assertObjectReadDump<T extends ReadDumpObject>(obj1:T,obj2:T,map:string,fileType:string){
    const buff=readFileSync(`./test/${map}/war3map.${fileType}`);
    obj1.read(buff);
    const dumpBuff=obj1.dump();
    obj2.read(dumpBuff);
    assert.deepStrictEqual(obj1,obj2,"The dump and read operator should equivalent.");
}

describe("CamerasObject",()=>{
    it("should support map1",()=>{
        assertObjectReadDump(new CamerasObject(),new CamerasObject(),"map1","w3c");
    });
});

describe("EnvironmentObject",()=>{
    it("should support map1",()=>{
        assertObjectReadDump(new EnvironmentObject(),new EnvironmentObject(),"map1","w3e");
    });
});
describe("DoodadsObject",()=>{
    it("should support map1",()=>{
        assertObjectReadDump(new DoodadsObject,new DoodadsObject(),"map1","doo");
    });
});
