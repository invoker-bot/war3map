import assert from "assert";

import {CamerasTranslator} from "../src/CamerasTranslator";
import {readFileSync} from "fs";
import {resolve} from "path";
describe("CamerasTranslator",()=>{

    it("should bufferToObject",()=>{
        const translator=new CamerasTranslator();
        const buff=readFileSync("./test/w3x/war3map.w3c");
        const jsonObj=JSON.parse(readFileSync("./test/json/w3c.json","utf-8"));
        const buffObj=translator.bufferToObject(buff);
        assert.deepStrictEqual(buffObj,jsonObj);
    });

    it("should objectToBuff",()=>{
        const translator=new CamerasTranslator();
        const buff=readFileSync("./test/w3x/war3map.w3c");
        const jsonObj=JSON.parse(readFileSync("./test/json/w3c.json","utf-8"));
        const jsonBuff=translator.objectToBuffer(jsonObj);
        assert.strictEqual(jsonBuff,buff);
    });

});
