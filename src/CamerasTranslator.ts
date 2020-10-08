import * as assert from "assert";

import {BinaryReadBuffer,BinaryWriteBuffer} from "./BinaryBuffer";
import {Translator} from './ObjectsTranslator';
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
 * The `.w3c` file
 */
export class CamerasTranslator implements Translator {
    public objectToBuffer(cameras:Camera[]):Buffer{
        const writer=new BinaryWriteBuffer();

        writer.writeInt(0);//file version
        writer.writeInt(cameras.length);

        cameras.forEach((camera)=>{
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
    public bufferToObject(buffer:Buffer):Camera[]{
        const result:Camera[]=[];
        const reader=new BinaryReadBuffer(buffer);
        const fileVersion=reader.readInt();
        assert.ok(fileVersion<=0,`The File version \`${fileVersion}\` not support.`) ; //version
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
            result.push({
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
        return result;
    }

}