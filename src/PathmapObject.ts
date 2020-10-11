import * as  assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export class PathmapObject implements ReadDumpObject {
    protected _fileVersion=0;
    public tilesets:number[][]=[];
    public pathWidth=0;
    public pathHeight=0;
    read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        const header=reader.readChars(4);
        assert.strictEqual(header,"MP3W","File format incorrect.");
        this._fileVersion = reader.readInt();
        assert.strictEqual(this._fileVersion, 0, `Unsupport file version:${this._fileVersion}`);
        this.pathWidth=reader.readInt();
        this.pathHeight=reader.readInt();
        for(let i=0;i<this.pathWidth;++i){
            const tilesetsX:number[]=[];
            for(let j=0;j<this.pathHeight;++j){
                tilesetsX.push(reader.readByte());
            }
            this.tilesets.push(tilesetsX);
        }
        assert.ok(reader.isEOF(),"Not reach end of the file because of unknown data.");
    }
    dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeString("MP3W",false);
        writer.writeInt(this._fileVersion);
        writer.writeInt(this.pathWidth);
        writer.writeInt(this.pathHeight);
        this.tilesets.forEach((tilesetsX)=>{
            tilesetsX.forEach((tileset)=>{
                writer.writeByte(tileset);
            });
        });
        return writer.getBuffer();
    }

}