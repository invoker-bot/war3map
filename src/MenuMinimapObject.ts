/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface MenuMinimapIcon {
    type: number;
    x: number;
    y: number;
    color: number;
}

/**
 * MenuMinimapObject parses data from "war3map.mmp" and can dump it back.
 */
export class MenuMinimapObject implements ReadDumpObject {
    protected _fileVersion = 0;
    protected _icons: MenuMinimapIcon[] = [];

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        this._fileVersion = reader.readInt();
        this._icons = [];
        const numberOfIcons = reader.readInt();
        for (let i = 0; i < numberOfIcons; ++i) {
            this._icons.push({
                type: reader.readInt(),
                x: reader.readInt(),
                y: reader.readInt(),
                color: reader.readInt()
            });
        }
        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(this._fileVersion);
        writer.writeInt(this._icons.length);
        this._icons.forEach((icon) => {
            writer.writeInt(icon.type);
            writer.writeInt(icon.x);
            writer.writeInt(icon.y);
            writer.writeInt(icon.color);
        });
        return writer.getBuffer();
    }

    public get fileVersion(): number {
        return this._fileVersion;
    }
    public get icons(): MenuMinimapIcon[] {
        return this._icons;
    }
    public set icons(icons: MenuMinimapIcon[]) {
        this._icons = icons;
    }
}
