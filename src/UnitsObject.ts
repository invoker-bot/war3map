/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export enum TargetAcquisition {
    Normal = -1,
    Camp = -2
}

export enum PlayerNumber {
    Red,
    Blue,
    Teal,
    Purple,
    Yellow,
    Orange,
    Green,
    Pink,
    Gray,
    LightBlue,
    DarkGreen,
    Brown,
    Maroon,
    Navy,
    Turquoise,
    Violet,
    Wheat,
    Peach,
    Mint,
    Lavender,
    Coal,
    Snow,
    Emerald,
    Peanut,
    NeutralHostile,
    NeutralExtra,
    NeutralVictim,
    NeutralPassive
}

export enum ItemClass {
    Any,
    Permanent,
    Charged,
    PowerUp,
    Artifact,
    Purchasable,
    Campaign,
    Miscellaneous
}

export interface RandomEntityAny {
    level: number;
    itemClass: ItemClass;
}

export interface RandomEntityGlobal {
    group: number;
    position: number;
}

export type UnitSet = Record<string, number>;
export type RandomEntity = RandomEntityAny | RandomEntityGlobal | UnitSet;

export interface UnitHero {
    level: number;
    strength: number;
    agility: number;
    intelligence: number;
}

export interface UnitInventoryItem {
    slot: number;
    type: string;
}

export interface UnitAbility {
    ability: string;
    active: boolean;
    level: number;
}

export interface UnitDefinition {
    type: string;
    variation?: number;
    skinID?: string;
    x: number;
    y: number;
    z: number;
    rotation: number;
    player: PlayerNumber;
    id: number;
    flags?: number;
    hitpoints?: number;
    mana?: number;
    randomItemSetID?: number;
    customItemSets?: UnitSet[];
    gold?: number;
    targetAcquisition?: number;
    hero?: UnitHero;
    inventory?: UnitInventoryItem[];
    abilities?: UnitAbility[];
    randomEntity?: RandomEntity;
    color?: number;
    waygateRegionID?: number;
}

function isRandomEntityAny(randomEntity: RandomEntity): randomEntity is RandomEntityAny {
    return (randomEntity as RandomEntityAny).level !== undefined && (randomEntity as RandomEntityAny).itemClass !== undefined;
}

function isRandomEntityGlobal(randomEntity: RandomEntity): randomEntity is RandomEntityGlobal {
    return (randomEntity as RandomEntityGlobal).group !== undefined && (randomEntity as RandomEntityGlobal).position !== undefined;
}

function isRandomEntityUnitSet(randomEntity: RandomEntity): randomEntity is UnitSet {
    return Object.keys(randomEntity as UnitSet).length !== 0;
}

function radToDeg(rad: number): number {
    return Math.round((rad * 180 / Math.PI) * 1000) / 1000;
}

function degToRad(deg: number): number {
    return deg * Math.PI / 180;
}

/**
 * UnitsObject parses data from "war3mapUnits.doo" file and can dump back.
 */
export class UnitsObject implements ReadDumpObject {
    protected _fileVersion = 8;
    protected _fileSubVersion = 11;
    protected _units: UnitDefinition[] = [];

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        const fileID = reader.readChars(4);
        assert.strictEqual(fileID, "W3do", "File should be `doo` format.");
        this._fileVersion = reader.readInt();
        assert.strictEqual(this._fileVersion, 8, `Unsupport file version:${this._fileVersion}`);
        this._fileSubVersion = reader.readInt();
        assert.strictEqual(this._fileSubVersion, 11, `Unsupport file sub-version:${this._fileSubVersion}`);

        this._units = [];
        const numberOfUnits = reader.readInt();
        for (let i = 0; i < numberOfUnits; ++i) {
            const type = reader.readChars(4);
            const variation = reader.readInt();
            const x = reader.readFloat();
            const y = reader.readFloat();
            const z = reader.readFloat();
            const rotation = radToDeg(reader.readFloat());
            reader.readFloat();
            reader.readFloat();
            reader.readFloat();
            const skinID = reader.readChars(4);
            const flags = reader.readByte();
            const player = reader.readInt();
            reader.readByte();
            reader.readByte();
            const hitpoints = reader.readInt();
            const mana = reader.readInt();
            const randomItemSetID = reader.readInt();
            const numberOfItemSets = reader.readInt();
            const customItemSets: UnitSet[] = [];
            for (let j = 0; j < numberOfItemSets; ++j) {
                const itemSet: UnitSet = {};
                const numberOfItems = reader.readInt();
                for (let k = 0; k < numberOfItems; ++k) {
                    const itemID = reader.readChars(4);
                    itemSet[itemID] = reader.readInt();
                }
                customItemSets.push(itemSet);
            }

            const gold = reader.readInt();
            const targetAcquisition = reader.readFloat();
            const hero = {
                level: reader.readInt(),
                strength: reader.readInt(),
                agility: reader.readInt(),
                intelligence: reader.readInt()
            };

            const inventory: UnitInventoryItem[] = [];
            const numberOfInventoryItems = reader.readInt();
            for (let j = 0; j < numberOfInventoryItems; ++j) {
                inventory.push({
                    slot: reader.readInt() + 1,
                    type: reader.readChars(4)
                });
            }

            const abilities: UnitAbility[] = [];
            const numberOfAbilities = reader.readInt();
            for (let j = 0; j < numberOfAbilities; ++j) {
                abilities.push({
                    ability: reader.readChars(4),
                    active: reader.readInt() === 1,
                    level: reader.readInt()
                });
            }

            let randomEntity: RandomEntity | undefined;
            const randomFlag = reader.readInt();
            if (randomFlag === 0) {
                const level = reader.readInt24();
                const itemClass = reader.readByte();
                if (type === "uDNR" || type === "iDNR") {
                    randomEntity = { level, itemClass };
                }
            } else if (randomFlag === 1) {
                randomEntity = {
                    group: reader.readInt(),
                    position: reader.readInt()
                };
            } else if (randomFlag === 2) {
                const unitSet: UnitSet = {};
                const numberOfRandomUnits = reader.readInt();
                for (let j = 0; j < numberOfRandomUnits; ++j) {
                    const id = reader.readChars(4);
                    unitSet[id] = reader.readInt();
                }
                randomEntity = unitSet;
            }

            const color = reader.readInt();
            const waygateRegionID = reader.readInt();
            const id = reader.readInt();

            const unit: UnitDefinition = {
                type,
                x,
                y,
                z,
                rotation,
                player,
                id,
                flags
            };
            if (variation !== 0) unit.variation = variation;
            if (skinID !== type) unit.skinID = skinID;
            if (hitpoints !== -1) unit.hitpoints = hitpoints;
            if (mana !== -1) unit.mana = mana;
            if (randomItemSetID !== -1) unit.randomItemSetID = randomItemSetID;
            if (customItemSets.length > 0) unit.customItemSets = customItemSets;
            if (type === "ngol") unit.gold = gold;
            if (targetAcquisition !== TargetAcquisition.Normal) unit.targetAcquisition = targetAcquisition;
            unit.hero = hero;
            if (inventory.length > 0) unit.inventory = inventory;
            if (abilities.length > 0) unit.abilities = abilities;
            if (randomEntity) unit.randomEntity = randomEntity;
            if (color !== -1) unit.color = color;
            if (waygateRegionID !== -1) unit.waygateRegionID = waygateRegionID;
            this._units.push(unit);
        }

        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeString("W3do", false);
        writer.writeInt(this._fileVersion);
        writer.writeInt(this._fileSubVersion);
        writer.writeInt(this._units.length);
        this._units.forEach((unit) => {
            writer.writeString(unit.type, false);
            writer.writeInt(unit.variation || 0);
            writer.writeFloat(unit.x);
            writer.writeFloat(unit.y);
            writer.writeFloat(unit.z);
            writer.writeFloat(degToRad(unit.rotation || 0));
            writer.writeFloat(1);
            writer.writeFloat(1);
            writer.writeFloat(1);
            writer.writeString(unit.skinID || unit.type, false);
            writer.writeByte(unit.flags === undefined ? 2 : unit.flags);
            writer.writeInt(unit.player);
            writer.writeByte(0);
            writer.writeByte(0);
            writer.writeInt(unit.hitpoints === undefined ? -1 : unit.hitpoints);
            writer.writeInt(unit.mana === undefined ? -1 : unit.mana);
            writer.writeInt(unit.randomItemSetID !== undefined && unit.randomItemSetID >= 0 ? unit.randomItemSetID : -1);

            if (unit.customItemSets && (unit.randomItemSetID === undefined || unit.randomItemSetID === -1)) {
                writer.writeInt(unit.customItemSets.length);
                unit.customItemSets.forEach((itemSet) => {
                    writer.writeInt(Object.keys(itemSet).length);
                    Object.keys(itemSet).forEach((itemID) => {
                        writer.writeString(itemID, false);
                        writer.writeInt(itemSet[itemID]);
                    });
                });
            } else {
                writer.writeInt(0);
            }

            const unitsWithZeroGold = ["sloc", "iDNR"];
            writer.writeInt(unitsWithZeroGold.includes(unit.type) ? 0 : (unit.gold || 12500));
            writer.writeFloat(unit.targetAcquisition !== undefined ? unit.targetAcquisition : TargetAcquisition.Normal);

            const hero = unit.hero || { level: 1, strength: 0, agility: 0, intelligence: 0 };
            writer.writeInt(hero.level);
            writer.writeInt(hero.strength);
            writer.writeInt(hero.agility);
            writer.writeInt(hero.intelligence);

            writer.writeInt(unit.inventory ? unit.inventory.length : 0);
            if (unit.inventory) {
                unit.inventory.forEach((item) => {
                    writer.writeInt(item.slot - 1);
                    writer.writeString(item.type, false);
                });
            }

            writer.writeInt(unit.abilities ? unit.abilities.length : 0);
            if (unit.abilities) {
                unit.abilities.forEach((ability) => {
                    writer.writeString(ability.ability, false);
                    writer.writeInt(ability.active ? 1 : 0);
                    writer.writeInt(ability.level);
                });
            }

            if (!["uDNR", "iDNR"].includes(unit.type)) {
                writer.writeInt(0);
                writer.writeInt(1);
            } else if (unit.randomEntity) {
                if (isRandomEntityAny(unit.randomEntity)) {
                    writer.writeInt(0);
                    writer.writeInt24(unit.randomEntity.level);
                    writer.writeByte(unit.type === "iDNR" ? unit.randomEntity.itemClass : 0);
                } else if (isRandomEntityGlobal(unit.randomEntity)) {
                    writer.writeInt(1);
                    writer.writeInt(unit.randomEntity.group);
                    writer.writeInt(unit.randomEntity.position);
                } else if (isRandomEntityUnitSet(unit.randomEntity)) {
                    writer.writeInt(2);
                    writer.writeInt(Object.keys(unit.randomEntity).length);
                    Object.keys(unit.randomEntity).forEach((id) => {
                        writer.writeString(id, false);
                        writer.writeInt((unit.randomEntity as UnitSet)[id]);
                    });
                }
            } else {
                writer.writeInt(0);
                writer.writeInt24(-1);
                writer.writeByte(0);
            }

            writer.writeInt(unit.color === undefined ? -1 : unit.color);
            writer.writeInt(unit.waygateRegionID === undefined ? -1 : unit.waygateRegionID);
            writer.writeInt(unit.id);
        });
        return writer.getBuffer();
    }

    public get units(): UnitDefinition[] {
        return this._units;
    }
    public set units(_units: UnitDefinition[]) {
        this._units = _units;
    }
}
