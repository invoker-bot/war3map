import * as  assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export class ShadowObject implements ReadDumpObject {
    public width:number;
    public height:number;
    public tilesets:number[][][]=[];
    constructor(width:number,height:number){
        this.width=width;
        this.height=height;
    }
    read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        for(let i=0;i<this.width;++i){
            const tilesetsX:number[][]=[];
            for(let j=0;j<this.height;++j){
                const tilesetsY:number[]=[];
                for(let k=0;k<16;++k){
                    tilesetsY.push(reader.readByte());
                }
                tilesetsX.push(tilesetsY);
            }
            this.tilesets.push(tilesetsX);
        }
        assert.ok(reader.isEOF(),"Not reach end of the file because of unknown data.");
    }
    dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        this.tilesets.forEach((tilesetsX)=>{
            tilesetsX.forEach((tilesetY)=>{
                tilesetY.forEach((tileset)=>{
                    writer.writeByte(tileset);
                });
            });
        });
        return writer.getBuffer();
    }

}