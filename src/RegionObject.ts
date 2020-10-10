/**
 *  @packageDocumentation
 */
import * as  assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";
export interface RegionDefinition {
    left: number;
    right: number;
    bottom: number;
    top: number;
    name: string;
    index: number;
    weatherEffectID: string;
    ambientSound: string;
    regionColor: number;
    end: number;
}
/**
 * war3map.w3r
 */
export class RegionObject implements ReadDumpObject {
    protected _fileVersion = 5;
    protected _regions: RegionDefinition[] = [];
    read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        this._fileVersion=reader.readInt();
        assert.strictEqual(this._fileVersion, 5, `Unsupport file version:${this._fileVersion}`);
        const numberOfRgionDefinitions = reader.readInt();
        for (let i = 0; i < numberOfRgionDefinitions; ++i) {
            const left = reader.readFloat();
            const right = reader.readFloat();
            const bottom = reader.readFloat();
            const top = reader.readFloat();
            const name = reader.readString();
            const index = reader.readInt();
            const weatherEffectID = reader.readChars(4);
            const ambientSound = reader.readString();
            const regionColor = reader.readColor();
            const end = reader.readByte();
            this._regions.push({
                left,
                right,
                bottom,
                top,
                name,
                index,
                weatherEffectID,
                ambientSound,
                regionColor,
                end
            });
        }
        assert.ok(reader.isEOF(),"Not reach end of the file because of unknown data.");
    }
    dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(this._fileVersion);
        writer.writeInt(this._regions.length);
        this._regions.forEach((region)=>{
            writer.writeFloat(region.left);
            writer.writeFloat(region.right );
            writer.writeFloat(region.bottom);
            writer.writeFloat(region.top);
            writer.writeString(region.name,true );
            writer.writeInt(region.index);
            writer.writeString(region.weatherEffectID,false);
            writer.writeString(region.ambientSound,true);
            writer.writeColor(region.regionColor);
            writer.writeByte(region.end);
        });
        
        return writer.getBuffer();
    }


}
