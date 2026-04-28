/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import { readFileSync } from "fs";
import { TriggerNamesObject } from "../src/index";

describe("TriggerNamesObject", () => {
    it("should expose Reforged WTG root metadata and preserve bytes", () => {
        const source = readFileSync("./test/map8/war3map.wtg");
        const object = new TriggerNamesObject();
        object.read(source);
        const ast = object.reforgedAst;

        assert.ok(ast);
        assert.strictEqual(object.fileVersionRaw, 0x80000004);
        assert.strictEqual(ast.fileFormatVersion, 7);
        assert.strictEqual(ast.variables.length, 19);
        assert.strictEqual(ast.variables[0].name, "Heroes");
        assert.strictEqual(ast.variables[0].type, "unitcode");
        assert.strictEqual(ast.triggerObjectCount, 82);
        assert.strictEqual(ast.triggerObjects[0].objectType, 1);
        assert.deepStrictEqual(object.dump(), source);
    });

    it("should summarize simple trigger tree objects before GUI function payloads", () => {
        const object = new TriggerNamesObject();
        object.read(readFileSync("./test/map6/war3map.wtg"));
        const ast = object.reforgedAst;

        assert.ok(ast);
        assert.strictEqual(ast.triggerObjectCount, 3);
        assert.strictEqual(ast.triggerObjects[0].objectType, 1);
        assert.strictEqual(ast.triggerObjects[0].objectId, 0);
        assert.ok(ast.triggerObjects[0].name?.startsWith("Untitled"));
        assert.strictEqual(ast.triggerObjects[1].objectType, 4);
        assert.strictEqual(ast.triggerObjects[2].objectType, 8);
        assert.strictEqual(ast.triggerObjects[2].name, "Melee Initialization");
    });
});
