/**
 * @packageDocumentation
 */

import * as assert from "assert";
import {BinaryReadBuffer,BinaryWriteBuffer,ReadDumpObject} from "./BinaryBuffer";

/**
 * Camera represents a camera in the game.
 */
export interface Camera {
    target: {x:number;
        y:number};
    offsetZ: number;
    angleOfRotation:number;//in degrees
    angleOfAttack:number;
    distance:number;
    roll:number;
    fieldOfView:number;//in degrees
    farClipping:number;
    name:string
}
/**
 * CamerasObject parses data from "war3map.w3c" file and can dump back.
 */
export class CamerasObject implements ReadDumpObject{
    /**
     * Extends from ReadDumpObject
     */
    public dump():Buffer{
        const writer=new BinaryWriteBuffer();

        writer.writeInt(this._version);//file version
        writer.writeInt(this._cameras.length);

        this._cameras.forEach((camera)=>{
            writer.writeFloat(camera.target.x);
            writer.writeFloat(camera.target.y);
            writer.writeFloat(camera.offsetZ);
            writer.writeFloat(camera.angleOfRotation);
            writer.writeFloat(camera.angleOfAttack);
            writer.writeFloat(camera.distance);
            writer.writeFloat(camera.roll);
            writer.writeFloat(camera.fieldOfView);
            writer.writeFloat(camera.farClipping);

            writer.writeFloat(100);//unknown

            writer.writeString(camera.name,true);
        });

        return writer.getBuffer();
    }
    /**
     * Extends from ReadDumpObject
     */
    public read(buffer:Buffer):void{
        const reader=new BinaryReadBuffer(buffer);
        const fileVersion=reader.readInt();
        assert.ok(fileVersion===0,`The File version \`${fileVersion}\` not support.`) ; //version
        const camerasLength=reader.readInt();
        for(let i=0;i<camerasLength;++i){
            const x=reader.readFloat();
            const y=reader.readFloat();
            const offsetZ=reader.readFloat();
            const angleOfRotation=reader.readFloat();
            const angleOfAttack=reader.readFloat();
            const distance=reader.readFloat();
            const roll=reader.readFloat();
            const fieldOfView=reader.readFloat();
            const farClipping=reader.readFloat();
            const unknown=reader.readFloat();
            assert.strictEqual(unknown,100,"The magic number of camera should be 100");
            const name=reader.readString();
            this._cameras.push({
                target:{
                    x,
                    y
                },
                offsetZ,
                angleOfRotation:angleOfRotation,
                angleOfAttack:angleOfAttack,
                distance:distance,
                roll:roll,
                fieldOfView:fieldOfView,
                farClipping:farClipping,
                name
            });

        }
    }
    /**
     * Get the version.
     */
    public get Version():number{
        return this._version;
    }
    /**
     * Get all cameras.
     */
    public get Cameras():Camera[]{
        return this._cameras;
    }
    private _cameras:Camera[]=[];
    private _version=0;
}