/**
 *  @packageDocumentation
 */
import * as  assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface ItemIDAndChoice {
    itemID: string;
    percentualChance: number;
}
export interface Tree {
    treeX: number;
    treeY: number;
    treeZ: number;
    /**
     * in degrees
     */
    angleOfTree: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    /**
     * 0 - invisible and non-solid
     * 1 - visible but non-solid
     * 2 - visible and solid (normal)
     */
    flags: number;
    life: number;
    treeID: string;
    /**
     * should be unique
     */
    treeNumber: number;
    variation: number;
    randomItemSetPtr: number;
    dropItemsets?: ItemIDAndChoice[][];
}
export interface SpecialDoodad {
    doodadID: string;
    z: number;
    x: number;
    y: number;
}

/**
 * DoodadsObject parses data from "war3map.doo" file and can dump back.
 */
export class DoodadsObject implements ReadDumpObject {
    protected _fileVersion = 7;
    protected _fileSubVersion = 0x09;
    protected _trees:Tree[]=[];
    protected _specialDoodads: SpecialDoodad[]=[];
    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        const fileID = reader.readChars(4);
        assert.strictEqual(fileID, "W3do", "File should be `doo` format.");
        this._fileVersion = reader.readInt();
        assert.ok(this._fileVersion === 7 || this._fileVersion === 8, `The File version \`${this._fileVersion}\` not support.`);
        this._fileSubVersion = reader.readInt();
        if (this._fileVersion === 7) {
            assert.ok(this._fileSubVersion === 0x09 || this._fileSubVersion === 0x07, `The File version \`${this._fileVersion}.${this._fileSubVersion}\` not support.`);
        } else {
            assert.ok(this._fileSubVersion === 0x0B, `The File format is incorrect.`);
        }
        const numberOfTrees = reader.readInt();
        for (let i = 0; i < numberOfTrees; ++i) {
            const treeID = reader.readChars(4);
            const variation = reader.readInt();
            const treeX = reader.readFloat();
            const treeY = reader.readFloat();
            const treeZ = reader.readFloat();
            const angleOfTree = reader.readFloat();
            const scaleX = reader.readFloat();
            const scaleY = reader.readFloat();
            const scaleZ = reader.readFloat();
            const flags = reader.readByte();//0 invisible and non-solid , 1 visible but non-solid, 2 (visible and solid) normal
            const life = reader.readByte();
            const dropItemsets: ItemIDAndChoice[][] = [];
            let randomItemSetPtr = -1;
            if (this._fileVersion === 8) {
                randomItemSetPtr = reader.readInt();
                const numberOfItemsets = reader.readInt();

                if (numberOfItemsets > 0) {
                    assert.strictEqual(randomItemSetPtr, -1, "The File format is incorrect.");
                    for (let _i = 0; _i < numberOfItemsets; ++_i) {
                        const itemset: ItemIDAndChoice[] = [];
                        const numberOfItems = reader.readInt();
                        for (let j = 0; j < numberOfItems; ++j) {
                            const itemID = reader.readChars(4);
                            const percentualChance = reader.readInt();
                            itemset.push({ itemID, percentualChance });
                        }
                        dropItemsets.push(itemset);
                    }
                }
            }

            const treeNumber = reader.readInt();//unique
            this._trees.push({
                treeNumber: treeNumber, variation, treeX, treeY, treeZ, angleOfTree, scaleX, scaleY, scaleZ, flags, life, treeID,
                dropItemsets: dropItemsets.length === 0 ? undefined : dropItemsets, randomItemSetPtr
            });
        }

        const specialDoodadsVersion = reader.readInt();
        assert.strictEqual(specialDoodadsVersion, 0, "Special doodads version not support.");
        const numberOfSpecialDoodads = reader.readInt();
        for (let i = 0; i < numberOfSpecialDoodads; ++i) {
            const doodadID = reader.readChars(4);
            const z = reader.readInt();
            const x = reader.readInt();
            const y = reader.readInt();
            this._specialDoodads.push({ doodadID, z, x, y });
        }
        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }
    public dump(): Buffer {
            const writer = new BinaryWriteBuffer();
            writer.writeString("W3do", false);
            writer.writeInt(this._fileVersion);
            writer.writeInt(this._fileSubVersion);
            writer.writeInt(this._trees.length);
            this._trees.forEach((tree) => {
                writer.writeString(tree.treeID, false);
                writer.writeInt(tree.variation);
                writer.writeFloat(tree.treeX);
                writer.writeFloat(tree.treeY);
                writer.writeFloat(tree.treeZ);
                writer.writeFloat(tree.angleOfTree);
                writer.writeFloat(tree.scaleX);
                writer.writeFloat(tree.scaleY);
                writer.writeFloat(tree.scaleZ);
                writer.writeByte(tree.flags);
                writer.writeByte(tree.life);
                if (this._fileVersion === 8) {
                    writer.writeInt(tree.randomItemSetPtr);
                    if (tree.dropItemsets) {
                        writer.writeInt(tree.dropItemsets.length);
                        tree.dropItemsets.forEach((itemset) => {
                            writer.writeInt(itemset.length);
                            itemset.forEach((item) => {
                                writer.writeString(item.itemID, false);
                                writer.writeInt(item.percentualChance);
                            });
                        });
                    } else {
                        writer.writeInt(0);
                    }
                }

                writer.writeInt(tree.treeNumber);
            });
            writer.writeInt(0);
            writer.writeInt(this._specialDoodads.length);
            this._specialDoodads.forEach((specialDoodad) => {
                writer.writeString(specialDoodad.doodadID, false);
                writer.writeInt(specialDoodad.z);
                writer.writeInt(specialDoodad.x);
                writer.writeInt(specialDoodad.y);
            });

            return writer.getBuffer();
    }

    public get trees(): Tree[] {
        return this._trees;

    }
    public set trees(_trees: Tree[]) {
        this._trees = _trees;
    }

    public get specialDoodads(): SpecialDoodad[] {
        return this._specialDoodads;
    }
    public set specialDoodada(_specialDoodads: SpecialDoodad[]) {
        this._specialDoodads = _specialDoodads;
    }
}
/*
import {readFileSync} from "fs";
const obj=new DoodadsObject();
const buff=readFileSync(`./test/map1/war3map.doo`);
obj.read(buff);
*/    //assert.deepStrictEqual(obj.dump(),buff,"The dump and read operator should equivalent.");