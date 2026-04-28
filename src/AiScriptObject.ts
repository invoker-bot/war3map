/**
 * @packageDocumentation
 */

import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

/**
 * Header metadata from a World Editor AI script (.wai) file.
 *
 * WorldEdit reads and writes .wai through the same helper used by other map
 * subfiles. The trailing trigger/action graph is preserved as an opaque payload
 * until the full AI editor tree is modeled.
 */
export interface AiScriptHeader {
    version: number;
    name: string;
    editorFlags: number;
    gameFlags: number;
    unitIds: string[];
}

export interface AiScriptPayloadString {
    offset: number;
    text: string;
}

export interface AiScriptConditionSummary {
    id: number;
    offset: number;
    name: string;
    expressionOffset: number;
    expressionSize?: number;
}

export interface AiScriptPayloadSummary {
    rawSize: number;
    conditionCount?: number;
    conditions: AiScriptConditionSummary[];
    functions: AiScriptPayloadString[];
    strings: AiScriptPayloadString[];
    mapPaths: string[];
}

/**
 * AiScriptObject parses the stable .wai header and preserves the AI graph
 * payload byte-for-byte.
 */
export class AiScriptObject implements ReadDumpObject {
    protected _header: AiScriptHeader = {
        version: 2,
        name: "",
        editorFlags: 0,
        gameFlags: 0,
        unitIds: []
    };
    protected _payload: Buffer = Buffer.alloc(0);
    protected _summary: AiScriptPayloadSummary = AiScriptObject.createEmptySummary(0);

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        const version = reader.readInt();
        const name = reader.readString();

        assert.ok(reader.remainingBytes() >= 12, "AI script header is truncated.");

        const editorFlags = reader.readInt();
        const gameFlags = reader.readInt();
        const unitCount = reader.readInt();

        assert.ok(unitCount >= 0, `Invalid AI script unit count:${unitCount}`);
        assert.ok(reader.remainingBytes() >= unitCount * 4, "AI script unit ID table is truncated.");

        const unitIds: string[] = [];
        for (let i = 0; i < unitCount; ++i) {
            unitIds.push(reader.readChars(4));
        }

        this._header = { version, name, editorFlags, gameFlags, unitIds };
        this._payload = reader.readBytes(reader.remainingBytes());
        this._summary = AiScriptObject.summarizePayload(this._payload);
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(this._header.version);
        writer.writeString(this._header.name, true);
        writer.writeInt(this._header.editorFlags);
        writer.writeInt(this._header.gameFlags);
        writer.writeInt(this._header.unitIds.length);
        this._header.unitIds.forEach((unitId) => writer.writeString(unitId, false));
        writer.writeBuffer(this._payload);
        return writer.getBuffer();
    }

    public get header(): AiScriptHeader {
        return {
            ...this._header,
            unitIds: [...this._header.unitIds]
        };
    }
    public set header(header: AiScriptHeader) {
        this._header = {
            ...header,
            unitIds: [...header.unitIds]
        };
    }

    public get version(): number {
        return this._header.version;
    }
    public set version(version: number) {
        this._header.version = version;
    }

    public get name(): string {
        return this._header.name;
    }
    public set name(name: string) {
        this._header.name = name;
    }

    public get payload(): Buffer {
        return Buffer.from(this._payload);
    }
    public set payload(payload: Buffer) {
        this._payload = Buffer.from(payload);
        this._summary = AiScriptObject.summarizePayload(this._payload);
    }

    public get summary(): AiScriptPayloadSummary {
        return {
            ...this._summary,
            conditions: this._summary.conditions.map((condition) => ({ ...condition })),
            functions: this._summary.functions.map((entry) => ({ ...entry })),
            strings: this._summary.strings.map((entry) => ({ ...entry })),
            mapPaths: [...this._summary.mapPaths]
        };
    }

    protected static summarizePayload(payload: Buffer): AiScriptPayloadSummary {
        const summary = AiScriptObject.createEmptySummary(payload.length);
        summary.strings = AiScriptObject.extractPayloadStrings(payload);
        summary.functions = summary.strings.filter((entry) => AiScriptObject.looksLikeAiFunctionName(entry.text));
        summary.mapPaths = summary.strings
            .map((entry) => entry.text)
            .filter((text, index, values) => /\.(w3m|w3x)$/i.test(text) && values.indexOf(text) === index);

        if (payload.length < 12) {
            return summary;
        }

        const conditionCount = payload.readInt32LE(0);
        if (conditionCount < 0 || conditionCount > 256) {
            return summary;
        }
        summary.conditionCount = conditionCount;
        summary.conditions = AiScriptObject.extractConditions(payload, conditionCount);
        return summary;
    }

    protected static createEmptySummary(rawSize: number): AiScriptPayloadSummary {
        return {
            rawSize,
            conditions: [],
            functions: [],
            strings: [],
            mapPaths: []
        };
    }

    protected static extractPayloadStrings(payload: Buffer): AiScriptPayloadString[] {
        const strings: AiScriptPayloadString[] = [];
        let offset = 0;
        while (offset < payload.length) {
            const value = AiScriptObject.readPrintableString(payload, offset);
            if (value) {
                strings.push(value);
                offset = value.offset + value.text.length + 1;
                continue;
            }
            ++offset;
        }
        return strings;
    }

    protected static extractConditions(payload: Buffer, conditionCount: number): AiScriptConditionSummary[] {
        const conditions: AiScriptConditionSummary[] = [];
        let searchOffset = 8;

        for (let id = 0; id < conditionCount; ++id) {
            const condition = AiScriptObject.findCondition(payload, id, searchOffset);
            if (!condition) {
                break;
            }
            conditions.push(condition);
            searchOffset = condition.expressionOffset;
        }

        for (let i = 0; i + 1 < conditions.length; ++i) {
            conditions[i].expressionSize = conditions[i + 1].offset - conditions[i].expressionOffset;
        }
        return conditions;
    }

    protected static findCondition(payload: Buffer, id: number, startOffset: number): AiScriptConditionSummary | undefined {
        for (let offset = startOffset; offset + 5 < payload.length; ++offset) {
            if (payload.readInt32LE(offset) !== id) {
                continue;
            }
            const name = AiScriptObject.readPrintableString(payload, offset + 4);
            if (!name || AiScriptObject.looksLikeAiFunctionName(name.text)) {
                continue;
            }
            return {
                id,
                offset,
                name: name.text,
                expressionOffset: name.offset + name.text.length + 1
            };
        }
        return undefined;
    }

    protected static readPrintableString(payload: Buffer, offset: number): AiScriptPayloadString | undefined {
        let endOffset = offset;
        while (endOffset < payload.length && payload[endOffset] !== 0) {
            const byte = payload[endOffset];
            if (byte < 32 || byte > 126) {
                return undefined;
            }
            ++endOffset;
        }
        const length = endOffset - offset;
        if (length < 2 || endOffset >= payload.length) {
            return undefined;
        }
        return {
            offset,
            text: payload.toString("utf8", offset, endOffset)
        };
    }

    protected static looksLikeAiFunctionName(name: string): boolean {
        return /^(AICommand|Check|Food|Get|Operator)/.test(name) || /^\d+$/.test(name);
    }
}
