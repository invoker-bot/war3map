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

export interface UnitItemSetEntry {
    type: string;
    chance: number;
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
    rotationRadians?: number;
    scale?: [number, number, number];
    player: PlayerNumber;
    id: number;
    flags?: number;
    reservedBytes?: [number, number];
    hitpoints?: number;
    mana?: number;
    randomItemSetID?: number;
    customItemSets?: UnitSet[];
    customItemSetEntries?: UnitItemSetEntry[][];
    gold?: number;
    targetAcquisition?: number;
    hero?: UnitHero;
    inventory?: UnitInventoryItem[];
    abilities?: UnitAbility[];
    randomEntity?: RandomEntity;
    randomFlag?: number;
    randomLevel?: number;
    randomItemClass?: number;
    hasRandomData?: boolean;
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

function getDefaultGold(type: string): number {
    return ["sloc", "iDNR"].includes(type) ? 0 : 12500;
}

/**
 * UnitsObject parses data from "war3mapUnits.doo" file and can dump back.
 */
export class UnitsObject implements ReadDumpObject {
    protected _fileVersion = 8;
    protected _fileSubVersion = 11;
    protected _hasSkinID = false;
    protected _units: UnitDefinition[] = [];

    public read(buffer: Buffer): void {
        const initialReader = new BinaryReadBuffer(buffer);
        assert.strictEqual(initialReader.readChars(4), "W3do", "File should be `doo` format.");
        const fileVersion = initialReader.readInt();
        assert.ok(fileVersion === 7 || fileVersion === 8, `Unsupport file version:${fileVersion}`);

        const attempts = fileVersion === 8 ? [false, true] : [false];
        let lastError: unknown;
        for (const hasSkinID of attempts) {
            try {
                this.readWithSkinMode(buffer, hasSkinID);
                return;
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }

    protected readWithSkinMode(buffer: Buffer, hasSkinID: boolean): void {
        const reader = new BinaryReadBuffer(buffer);
        const fileID = reader.readChars(4);
        assert.strictEqual(fileID, "W3do", "File should be `doo` format.");
        this._fileVersion = reader.readInt();
        assert.ok(this._fileVersion === 7 || this._fileVersion === 8, `Unsupport file version:${this._fileVersion}`);
        this._fileSubVersion = reader.readInt();
        this._hasSkinID = hasSkinID && this._fileVersion === 8;

        this._units = [];
        const numberOfUnits = reader.readInt();
        assert.ok(numberOfUnits >= 0, "Invalid unit count.");
        for (let i = 0; i < numberOfUnits; ++i) {
            const type = reader.readChars(4);
            const variation = reader.readInt();
            const x = reader.readFloat();
            const y = reader.readFloat();
            const z = reader.readFloat();
            const rotationRadians = reader.readFloat();
            const rotation = radToDeg(rotationRadians);
            const scale: [number, number, number] = [reader.readFloat(), reader.readFloat(), reader.readFloat()];
            const skinID = this._hasSkinID ? reader.readChars(4) : undefined;
            const flags = reader.readByte();
            const player = reader.readInt();
            assert.ok(player >= 0 && player <= PlayerNumber.NeutralPassive, `Invalid unit owner:${player}`);
            const reservedBytes: [number, number] = [reader.readByte(), reader.readByte()];
            const hitpoints = reader.readInt();
            const mana = reader.readInt();
            const randomItemSetID = this._fileVersion >= 8 ? reader.readInt() : -1;
            const numberOfItemSets = reader.readInt();
            assert.ok(numberOfItemSets >= 0, "Invalid item set count.");
            const customItemSets: UnitSet[] = [];
            const customItemSetEntries: UnitItemSetEntry[][] = [];
            for (let j = 0; j < numberOfItemSets; ++j) {
                const itemSet: UnitSet = {};
                const itemSetEntries: UnitItemSetEntry[] = [];
                const numberOfItems = reader.readInt();
                assert.ok(numberOfItems >= 0, "Invalid item count.");
                for (let k = 0; k < numberOfItems; ++k) {
                    const itemID = reader.readChars(4);
                    const chance = reader.readInt();
                    itemSet[itemID] = chance;
                    itemSetEntries.push({ type: itemID, chance });
                }
                customItemSets.push(itemSet);
                customItemSetEntries.push(itemSetEntries);
            }

            const gold = reader.readInt();
            const targetAcquisition = reader.readFloat();
            const hero = {
                level: reader.readInt(),
                strength: this._fileVersion >= 8 ? reader.readInt() : 0,
                agility: this._fileVersion >= 8 ? reader.readInt() : 0,
                intelligence: this._fileVersion >= 8 ? reader.readInt() : 0
            };

            const inventory: UnitInventoryItem[] = [];
            const numberOfInventoryItems = reader.readInt();
            assert.ok(numberOfInventoryItems >= 0, "Invalid inventory item count.");
            for (let j = 0; j < numberOfInventoryItems; ++j) {
                inventory.push({
                    slot: reader.readInt() + 1,
                    type: reader.readChars(4)
                });
            }

            const abilities: UnitAbility[] = [];
            const numberOfAbilities = reader.readInt();
            assert.ok(numberOfAbilities >= 0, "Invalid ability count.");
            for (let j = 0; j < numberOfAbilities; ++j) {
                abilities.push({
                    ability: reader.readChars(4),
                    active: reader.readInt() === 1,
                    level: reader.readInt()
                });
            }

            let randomEntity: RandomEntity | undefined;
            const hasRandomData = true;
            let randomLevel: number | undefined;
            let randomItemClass: number | undefined;
            const randomFlagOrColor = reader.readInt();
            let color: number;
            if (randomFlagOrColor === -1) {
                color = reader.readInt();
            } else if (randomFlagOrColor >= 0 && randomFlagOrColor <= 2) {
                if (randomFlagOrColor === 0) {
                    const level = reader.readInt24();
                    const itemClass = reader.readByte();
                    randomLevel = level;
                    randomItemClass = itemClass;
                    if (type === "uDNR" || type === "iDNR") {
                        randomEntity = { level, itemClass };
                    }
                } else if (randomFlagOrColor === 1) {
                    randomEntity = {
                        group: reader.readInt(),
                        position: reader.readInt()
                    };
                } else if (randomFlagOrColor === 2) {
                    const unitSet: UnitSet = {};
                    const numberOfRandomUnits = reader.readInt();
                    assert.ok(numberOfRandomUnits >= 0, "Invalid random unit count.");
                    for (let j = 0; j < numberOfRandomUnits; ++j) {
                        const id = reader.readChars(4);
                        unitSet[id] = reader.readInt();
                    }
                    randomEntity = unitSet;
                }
                color = reader.readInt();
            } else {
                color = reader.readInt();
            }
            const waygateRegionID = reader.readInt();
            const id = reader.readInt();

            const unit: UnitDefinition = {
                type,
                x,
                y,
                z,
                rotation,
                rotationRadians,
                scale,
                player,
                id,
                flags,
                reservedBytes
            };
            if (variation !== 0) unit.variation = variation;
            if (skinID && skinID !== type) unit.skinID = skinID;
            if (hitpoints !== -1) unit.hitpoints = hitpoints;
            if (mana !== -1) unit.mana = mana;
            if (randomItemSetID !== -1) unit.randomItemSetID = randomItemSetID;
            if (customItemSets.length > 0) unit.customItemSets = customItemSets;
            if (customItemSetEntries.length > 0) unit.customItemSetEntries = customItemSetEntries;
            if (type === "ngol" || gold !== getDefaultGold(type)) unit.gold = gold;
            if (targetAcquisition !== TargetAcquisition.Normal) unit.targetAcquisition = targetAcquisition;
            unit.hero = hero;
            if (inventory.length > 0) unit.inventory = inventory;
            if (abilities.length > 0) unit.abilities = abilities;
            if (randomEntity) unit.randomEntity = randomEntity;
            unit.randomFlag = randomFlagOrColor;
            if (randomLevel !== undefined) unit.randomLevel = randomLevel;
            if (randomItemClass !== undefined) unit.randomItemClass = randomItemClass;
            unit.hasRandomData = hasRandomData;
            if (color !== -1) unit.color = color;
            if (waygateRegionID !== -1) unit.waygateRegionID = waygateRegionID;
            this._units.push(unit);
        }

        assert.ok(reader.isEOF(), "Not reach end of the file because of trailing data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeString("W3do", false);
        writer.writeInt(this._fileVersion);
        writer.writeInt(this._fileSubVersion);
        writer.writeInt(this._units.length);
        const hasSkinID = this._fileVersion >= 8 && (this._hasSkinID || this._units.some((unit) => unit.skinID !== undefined));
        this._units.forEach((unit) => {
            writer.writeString(unit.type, false);
            writer.writeInt(unit.variation || 0);
            writer.writeFloat(unit.x);
            writer.writeFloat(unit.y);
            writer.writeFloat(unit.z);
            writer.writeFloat(this.getRotationRadians(unit));
            const scale = unit.scale || [1, 1, 1];
            writer.writeFloat(scale[0]);
            writer.writeFloat(scale[1]);
            writer.writeFloat(scale[2]);
            if (hasSkinID) {
                writer.writeString(unit.skinID || unit.type, false);
            }
            writer.writeByte(unit.flags === undefined ? 2 : unit.flags);
            writer.writeInt(unit.player);
            const reservedBytes = unit.reservedBytes || [0, 0];
            writer.writeByte(reservedBytes[0]);
            writer.writeByte(reservedBytes[1]);
            writer.writeInt(unit.hitpoints === undefined ? -1 : unit.hitpoints);
            writer.writeInt(unit.mana === undefined ? -1 : unit.mana);
            if (this._fileVersion >= 8) {
                writer.writeInt(unit.randomItemSetID !== undefined && unit.randomItemSetID >= 0 ? unit.randomItemSetID : -1);
            }

            if (unit.customItemSetEntries && (unit.randomItemSetID === undefined || unit.randomItemSetID === -1)) {
                writer.writeInt(unit.customItemSetEntries.length);
                unit.customItemSetEntries.forEach((itemSet) => {
                    writer.writeInt(itemSet.length);
                    itemSet.forEach((item) => {
                        writer.writeString(item.type, false);
                        writer.writeInt(item.chance);
                    });
                });
            } else if (unit.customItemSets && (unit.randomItemSetID === undefined || unit.randomItemSetID === -1)) {
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

            writer.writeInt(unit.gold !== undefined ? unit.gold : getDefaultGold(unit.type));
            writer.writeFloat(unit.targetAcquisition !== undefined ? unit.targetAcquisition : TargetAcquisition.Normal);

            const hero = unit.hero || { level: 1, strength: 0, agility: 0, intelligence: 0 };
            writer.writeInt(hero.level);
            if (this._fileVersion >= 8) {
                writer.writeInt(hero.strength);
                writer.writeInt(hero.agility);
                writer.writeInt(hero.intelligence);
            }

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

            if (unit.hasRandomData !== false) {
                if (unit.randomFlag === -1) {
                    writer.writeInt(-1);
                } else if (unit.randomFlag !== undefined && unit.randomFlag !== 0 && !unit.randomEntity) {
                    writer.writeInt(unit.randomFlag);
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
                } else if (!["uDNR", "iDNR"].includes(unit.type)) {
                    writer.writeInt(0);
                    writer.writeInt24(unit.randomLevel === undefined ? 1 : unit.randomLevel);
                    writer.writeByte(unit.randomItemClass === undefined ? 0 : unit.randomItemClass);
                } else {
                    writer.writeInt(0);
                    writer.writeInt24(-1);
                    writer.writeByte(0);
                }
            }

            writer.writeInt(unit.color === undefined ? -1 : unit.color);
            writer.writeInt(unit.waygateRegionID === undefined ? -1 : unit.waygateRegionID);
            writer.writeInt(unit.id);
        });
        return writer.getBuffer();
    }

    protected getRotationRadians(unit: UnitDefinition): number {
        if (unit.rotationRadians !== undefined && radToDeg(unit.rotationRadians) === (unit.rotation || 0)) {
            return unit.rotationRadians;
        }
        return degToRad(unit.rotation || 0);
    }

    public get units(): UnitDefinition[] {
        return this._units;
    }
    public set units(_units: UnitDefinition[]) {
        this._units = _units;
    }

    public get fileVersion(): number {
        return this._fileVersion;
    }
    public set fileVersion(fileVersion: number) {
        this._fileVersion = fileVersion;
    }

    public get fileSubVersion(): number {
        return this._fileSubVersion;
    }
    public set fileSubVersion(fileSubVersion: number) {
        this._fileSubVersion = fileSubVersion;
    }
}
