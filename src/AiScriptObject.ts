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
    }
}
