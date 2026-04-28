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

    it("should parse GUI functions when trigger data is provided", () => {
        const triggerData = [
            "MapInitializationEvent=0,nothing",
            "MeleeStartingVisibility=0,nothing",
            "MeleeStartingHeroLimit=0,nothing",
            "MeleeGrantHeroItems=0,nothing",
            "MeleeStartingResources=0,nothing",
            "MeleeClearExcessUnits=0,nothing",
            "MeleeStartingUnits=0,nothing",
            "MeleeStartingAI=0,nothing",
            "MeleeInitVictoryDefeat=0,nothing"
        ].join("\n");
        const source = readFileSync("./test/map6/war3map.wtg");
        const object = new TriggerNamesObject();
        object.read(source, { triggerData });
        const ast = object.reforgedAst;

        assert.ok(ast);
        assert.strictEqual(ast.reserved1, 0);
        assert.strictEqual(ast.reserved2, 0);
        assert.strictEqual(ast.triggerObjects.length, 3);
        const trigger = ast.triggerObjects[2];
        assert.strictEqual(trigger.functionCount, 9);
        assert.deepStrictEqual(trigger.functions?.map((func) => func.name), [
            "MapInitializationEvent",
            "MeleeStartingVisibility",
            "MeleeStartingHeroLimit",
            "MeleeGrantHeroItems",
            "MeleeStartingResources",
            "MeleeClearExcessUnits",
            "MeleeStartingUnits",
            "MeleeStartingAI",
            "MeleeInitVictoryDefeat"
        ]);
        assert.deepStrictEqual(object.dump(), source);
    });

    it("should parse triggerdata function parameter lists", () => {
        const triggerData = TriggerNamesObject.parseTriggerDataText([
            "[TriggerActions]",
            "DoNothing=0,nothing",
            "UnitDamageTargetBJ=1,unit,unit,real,attacktype,damagetype",
            "_UnitDamageTargetBJ_DisplayName=\"Damage Target\""
        ].join("\n"));

        assert.deepStrictEqual(triggerData.DoNothing.parameterTypes, []);
        assert.deepStrictEqual(triggerData.UnitDamageTargetBJ.parameterTypes, ["unit", "unit", "real", "attacktype", "damagetype"]);
    });
});
