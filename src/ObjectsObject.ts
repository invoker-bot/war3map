/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 *  @packageDocumentation
 */

import * as  assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";
export interface ObjectDefination{
    originalID:string;
    newID:string;
    modifications:Modification[];
}
export interface Modification{
    id:string;
    type:number;
    value:number|string;
    levelVariation?:number;
    dataPointer?:number;
    end:number;
}
export class ObjectsObject implements ReadDumpObject {
    protected _fileVersion = 1;
    private _usesOptionalInts = false;
    public originalObjects:ObjectDefination[] =[];
    public customObjects:ObjectDefination[]=[];
    
    constructor(usesOptionalInts:boolean){
        this._usesOptionalInts=usesOptionalInts;
    }
    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        this._fileVersion = reader.readInt();
        assert.ok(this._fileVersion === 1 ||this._fileVersion===2 , `The File version \`${this._fileVersion}\` not support.`);
        this.originalObjects=this.readObjectsTable(reader);
        this.customObjects=this.readObjectsTable(reader);
        assert.ok(reader.isEOF(),"Not reach end of the file because of unknown data.");
    }
    private readObjectsTable(reader:BinaryReadBuffer):ObjectDefination[]{
        const numDefinations = reader.readInt();
        const objectDefinations:ObjectDefination[]=[];
        for (let i = 0; i < numDefinations; ++i) {
            const originalID = reader.readChars(4);
            const newID = reader.readChars(4);
            const modificationCount=reader.readInt();
            const modifications:Modification[]=[];
            let levelVariation:number|undefined;
            let dataPointer:number|undefined;
            for (let j = 0; j < modificationCount; j++) {
                const    id=reader.readChars(4);
                const    type=reader.readInt();
                let value:number|string=0;
                if(this._usesOptionalInts){
                    levelVariation=reader.readInt();
                    dataPointer=reader.readInt();
                } 
                switch (type) {
                    case 0:
                        value=reader.readInt();
                        break;
                    case 1:case 2:
                        value=reader.readFloat();break;
                    case 3:
                        value=reader.readString();break;
                    default:
                        throw new Error(`Unknown data type:${type}`);
                } 
                
                const end=reader.readInt();
                modifications.push({id,type,value,end,levelVariation,dataPointer});
            }
            objectDefinations.push({originalID,newID,modifications});
        }
        return objectDefinations;    
    }

    private writeObjectsTable(writer:BinaryWriteBuffer,table:ObjectDefination[]):void{
        writer.writeInt(table.length);
        table.forEach((obj)=>{
            writer.writeString(obj.originalID,false);
            writer.writeString(obj.newID,false);
            writer.writeInt(obj.modifications.length);
            obj.modifications.forEach((modification)=>{
                writer.writeString(modification.id,false);
                writer.writeInt(modification.type);
                if(this._usesOptionalInts){
                    writer.writeInt(modification.levelVariation!);
                    writer.writeInt(modification.dataPointer!);
                }  
                switch (modification.type) {
                    case 0:
                        writer.writeInt(modification.value as number);
                        break;
                    case 1:case 2:
                        writer.writeFloat(modification.value as number);break;
                    case 3:
                        writer.writeString(modification.value as string,true);
                } 
                writer.writeInt(modification.end);
            });
        });

    }
    public dump():Buffer{
        const writer=new BinaryWriteBuffer();
        writer.writeInt(this._fileVersion);
        this.writeObjectsTable(writer,this.originalObjects);
        this.writeObjectsTable(writer,this.customObjects);
        return writer.getBuffer();
    }
}
