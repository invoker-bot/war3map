/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface TriggerStringReference {
    offset: number;
    value: string;
}

export interface TriggerTypeInfo {
    total: number;
    deletedIds: number[];
}

export interface TriggerVariableDefinition {
    name: string;
    type: string;
    category: number;
    isArray: boolean;
    arraySize: number;
    isInitialized: boolean;
    initialValue: string;
    objectId: number;
    parentId: number;
}

export interface TriggerObjectSummary {
    objectType: number;
    offset: number;
    length?: number;
    name?: string;
    commentText?: string;
    objectId?: number;
    parentId?: number;
    isComment?: boolean;
    isExpandable?: boolean;
    isEnabled?: boolean;
    isCustomText?: boolean;
    isInitiallyOff?: boolean;
    runOnMapInitialization?: boolean;
    functionCount?: number;
    parseComplete: boolean;
}

export interface ReforgedTriggerAst {
    magicNumber: number;
    fileFormatVersion: number;
    typeInfo: TriggerTypeInfo[];
    unknown1: number;
    unknown2: number;
    triggerDefinitionVersion: number;
    variables: TriggerVariableDefinition[];
    triggerObjectCount: number;
    triggerObjects: TriggerObjectSummary[];
    triggerObjectsPayload: Buffer;
    parseError?: string;
}

/**
 * TriggerNamesObject validates "war3map.wtg" and exposes its embedded strings while preserving payload bytes.
 */
export class TriggerNamesObject implements ReadDumpObject {
    protected _fileVersion = 7;
    protected _fileVersionRaw = 7;
    protected _payload: Buffer = Buffer.alloc(0);
    protected _strings: TriggerStringReference[] = [];
    protected _reforgedAst?: ReforgedTriggerAst;

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        const fileId = reader.readChars(4);
        assert.strictEqual(fileId, "WTG!", "File should be `wtg` format.");
        this._fileVersionRaw = buffer.readUInt32LE(4);
        this._fileVersion = reader.readInt();
        this._payload = reader.readBytes(buffer.length - 8);
        this._strings = TriggerNamesObject.extractStrings(this._payload, 8);
        this._reforgedAst = this._fileVersionRaw === 0x80000004 ? this.parseReforgedAst(buffer) : undefined;
        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeString("WTG!");
        writer.writeInt(this._fileVersion);
        writer.writeBuffer(this._payload);
        return writer.getBuffer();
    }

    public static extractStrings(buffer: Buffer, offsetBase = 0): TriggerStringReference[] {
        const strings: TriggerStringReference[] = [];
        let start: number | undefined;
        for (let i = 0; i < buffer.length; ++i) {
            const byte = buffer[i];
            const printable = byte >= 0x20 && byte <= 0x7e;
            if (printable && start === undefined) {
                start = i;
            } else if (!printable && start !== undefined) {
                if (i - start >= 2 && byte === 0) {
                    strings.push({ offset: offsetBase + start, value: buffer.toString("utf8", start, i) });
                }
                start = undefined;
            }
        }
        return strings;
    }

    public get fileVersion(): number {
        return this._fileVersion;
    }
    public get fileVersionRaw(): number {
        return this._fileVersionRaw;
    }
    public get payload(): Buffer {
        return Buffer.from(this._payload);
    }
    public set payload(payload: Buffer) {
        this._payload = Buffer.from(payload);
        this._strings = TriggerNamesObject.extractStrings(this._payload, 8);
        this._reforgedAst = undefined;
    }
    public get strings(): TriggerStringReference[] {
        return this._strings;
    }
    public get reforgedAst(): ReforgedTriggerAst | undefined {
        if (!this._reforgedAst) {
            return undefined;
        }
        return {
            ...this._reforgedAst,
            typeInfo: this._reforgedAst.typeInfo.map((info) => ({
                total: info.total,
                deletedIds: info.deletedIds.slice()
            })),
            variables: this._reforgedAst.variables.map((variable) => ({ ...variable })),
            triggerObjects: this._reforgedAst.triggerObjects.map((object) => ({ ...object })),
            triggerObjectsPayload: Buffer.from(this._reforgedAst.triggerObjectsPayload)
        };
    }

    protected parseReforgedAst(buffer: Buffer): ReforgedTriggerAst {
        const reader = new BinaryReadBuffer(buffer);
        reader.readChars(4);
        const magicNumber = buffer.readUInt32LE(reader.offset);
        reader.readInt();
        const fileFormatVersion = reader.readInt();
        const typeInfo = this.readReforgedTypeInfo(reader);
        const unknown1 = reader.readInt();
        const unknown2 = reader.readInt();
        const triggerDefinitionVersion = reader.readInt();
        const variables = this.readReforgedVariables(reader);
        const triggerObjectCount = reader.readInt();
        const triggerObjectsPayload = reader.readBytes(reader.remainingBytes());
        const ast: ReforgedTriggerAst = {
            magicNumber,
            fileFormatVersion,
            typeInfo,
            unknown1,
            unknown2,
            triggerDefinitionVersion,
            variables,
            triggerObjectCount,
            triggerObjects: [],
            triggerObjectsPayload
        };

        try {
            ast.triggerObjects = this.readReforgedTriggerObjectSummaries(buffer, buffer.length - triggerObjectsPayload.length, triggerObjectCount);
        } catch (error) {
            ast.parseError = error instanceof Error ? error.message : String(error);
        }
        return ast;
    }

    protected readReforgedTypeInfo(reader: BinaryReadBuffer): TriggerTypeInfo[] {
        const typeInfo: TriggerTypeInfo[] = [];
        for (let i = 0; i < 7; ++i) {
            const total = reader.readInt();
            const deletedCount = reader.readInt();
            const deletedIds: number[] = [];
            for (let deletedIndex = 0; deletedIndex < deletedCount; ++deletedIndex) {
                deletedIds.push(reader.readInt());
            }
            typeInfo.push({ total, deletedIds });
        }
        return typeInfo;
    }

    protected readReforgedVariables(reader: BinaryReadBuffer): TriggerVariableDefinition[] {
        const variableCount = reader.readInt();
        const variables: TriggerVariableDefinition[] = [];
        for (let i = 0; i < variableCount; ++i) {
            variables.push({
                name: reader.readString(),
                type: reader.readString(),
                category: reader.readInt(),
                isArray: reader.readInt() !== 0,
                arraySize: reader.readInt(),
                isInitialized: reader.readInt() !== 0,
                initialValue: reader.readString(),
                objectId: reader.readInt(),
                parentId: reader.readInt()
            });
        }
        return variables;
    }

    protected readReforgedTriggerObjectSummaries(buffer: Buffer, offset: number, count: number): TriggerObjectSummary[] {
        const reader = new BinaryReadBuffer(buffer.slice(offset));
        const objects: TriggerObjectSummary[] = [];
        for (let i = 0; i < count && reader.remainingBytes() > 0; ++i) {
            const start = offset + reader.offset;
            const objectType = reader.readInt();
            const object = this.readReforgedTriggerObjectSummary(reader, objectType, start);
            if (object.functionCount && object.functionCount > 0) {
                object.length = offset + reader.offset < buffer.length && i === count - 1 ? buffer.length - start : undefined;
                object.parseComplete = i === count - 1;
                objects.push(object);
                break;
            }
            object.length = offset + reader.offset - start;
            objects.push(object);
            if (!object.parseComplete) {
                break;
            }
        }
        return objects;
    }

    protected readReforgedTriggerObjectSummary(reader: BinaryReadBuffer, objectType: number, offset: number): TriggerObjectSummary {
        if (objectType === 1) {
            return {
                objectType,
                offset,
                objectId: reader.readInt(),
                name: reader.readString(),
                isComment: reader.readInt() !== 0,
                isExpandable: reader.readInt() !== 0,
                parentId: reader.readInt(),
                parseComplete: true
            };
        }
        if (objectType === 4) {
            return {
                objectType,
                offset,
                objectId: reader.readInt(),
                name: reader.readString(),
                isComment: reader.readInt() !== 0,
                isExpandable: reader.readInt() !== 0,
                parentId: reader.readInt(),
                parseComplete: true
            };
        }
        if (objectType === 64) {
            return {
                objectType,
                offset,
                objectId: reader.readInt(),
                name: reader.readString(),
                parentId: reader.readInt(),
                parseComplete: true
            };
        }
        if (objectType === 8 || objectType === 16 || objectType === 32) {
            return {
                objectType,
                offset,
                name: reader.readString(),
                commentText: reader.readString(),
                isComment: reader.readInt() !== 0,
                objectId: reader.readInt(),
                isEnabled: reader.readInt() !== 0,
                isCustomText: reader.readInt() !== 0,
                isInitiallyOff: reader.readInt() !== 0,
                runOnMapInitialization: reader.readInt() !== 0,
                parentId: reader.readInt(),
                functionCount: reader.readInt(),
                parseComplete: true
            };
        }
        return { objectType, offset, parseComplete: false };
    }
}
