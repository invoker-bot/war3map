/**
 *  @packageDocumentation
 */
import * as  assert from "assert";
import { BinaryReadBuffer,BinaryWriteBuffer,ReadDumpObject } from "./BinaryBuffer";

/**
 * Tileset is the main-type one of the tilesets.
 */
export enum Tileset {
    Ashenvale = "A",
    Barrens = "B",
    Felwood = "C",
    Dungeon = "D",
    "Lordaeron Fall" = "F",
    Underground = "G",
    "Lordaeron Summer" = "L",
    Northrend = "N",
    "Village Fall" = "Q",
    Village = "V",
    "Lordaeron Winter" = "W",
    Dalaran = "X",
    Cityscape = "Y",
    "Sunken Ruins" = "Z",
    Icecrown = "I",
    "Dalaran Ruins" = "J",
    Outland = "O",
    "Black Citadel" = "K"
}
/**
 * TilePoint is the smallest indivisible part of the map, the size of each is 128*128.
 */
export interface TilePoint{
    groundHeight:number; //[-16384,16383] C000h - 2000h - 3FFFh
    waterLevelAndMapEdgeLevelFlag:number; // boundary flag & water level
    waterAndRampFlagAndGroundTextureType:number;
    textureDetailsType:number;
    cliffTextureTypeAndLayerHeight:number;
}
/**
 * Environment represents the environment like map ( water, cliffs, etc. ) datas in the game.
 */
export interface Environment {
    mainTileset:Tileset; //sizeof tile:128
    useCustomTilesets:boolean;
    groundTilesets:string[];//"Ldrt" "TerrainArt\Terrain.slk" 
    cliffTilesets:string[]; //"CLdi" "TerrainArt\CliffTypes.slk"
    maxX:number; //maxX=width+1
    maxY:number; //maxY=height+1
    centerOffsetOfMapX:number; //-1*(Mx-1)*128/2 -1*(My-1)*128/2
    centerOffsetOfMapY:number;
    tilesetsData:TilePoint[][];
}
/**
 * EnvironmentObject parses data from "war3map.w3e" file and can dump back.
 */
export class EnvironmentObject implements ReadDumpObject{
    private _environment?:Environment;
    private _fileVersion=11;
    public read(buffer:Buffer):void{
        const reader = new BinaryReadBuffer(buffer);
        const fileID = reader.readChars(4);
        assert.strictEqual(fileID, "W3E!", "File should be `w3e` format.");
        const fileVersion = reader.readInt();
        assert.strictEqual(fileVersion, 11, `Unsupport file version:${fileVersion}`);
        const mainTileset =this.charToTileset(reader.readChars(1));
        //const b=reader.readByte();
        const useCustomTilesets=reader.readInt()===1;
        const numberOfGroundTilesets=reader.readInt();
        const groundTilesets:string[]=[];
        for(let i=0;i<numberOfGroundTilesets;++i){
            groundTilesets.push(reader.readChars(4));
        }
        const numberOfCliffTilesets=reader.readInt();
        const cliffTilesets:string[]=[];
        for(let i=0;i<numberOfCliffTilesets;++i){
            cliffTilesets.push(reader.readChars(4));
        }
        const maxX=reader.readInt();
        const maxY=reader.readInt();
        const centerOffsetOfMapX=reader.readFloat();
        const centerOffsetOfMapY=reader.readFloat();
        const tilesetsData:TilePoint[][]=[];
        for(let i=0;i<maxX;++i)
        {
            const tilesetsDataX:TilePoint[]=[];
            for(let j=0;j<maxY;++j){
                const groundHeight=reader.readShort();
                const waterLevelAndMapEdgeLevelFlag=reader.readShort();
                const waterAndRampFlagAndGroundTextureType=reader.readByte();
                const textureDetailsType=reader.readByte();
                const cliffTextureTypeAndLayerHeight=reader.readByte();
                tilesetsDataX.push({
                    groundHeight,
                    waterLevelAndMapEdgeLevelFlag,
                    waterAndRampFlagAndGroundTextureType,
                    textureDetailsType,
                    cliffTextureTypeAndLayerHeight
                });
            }
            tilesetsData.push(tilesetsDataX);
        }
        this._environment={
            mainTileset,
            useCustomTilesets,
            groundTilesets,
            cliffTilesets,
            maxX,
            maxY,
            centerOffsetOfMapX,
            centerOffsetOfMapY,
            tilesetsData,
        };

    }
    public dump():Buffer{
        if(this._environment){
            const writer=new BinaryWriteBuffer();
            writer.writeString("W3E!",false);
            writer.writeInt(this._fileVersion);
            const env=this._environment;
            writer.writeChar(this.tilesetToChar(env.mainTileset));
            writer.writeInt(env.useCustomTilesets?1:0);
            writer.writeInt(env.groundTilesets.length);
            env.groundTilesets.forEach((tileset)=>{
                writer.writeString(tileset);
            });
            writer.writeInt(env.cliffTilesets.length);
            env.cliffTilesets.forEach((tileset)=>{
                writer.writeString(tileset);
            });
            writer.writeInt(env.maxX);
            writer.writeInt(env.maxY);
            writer.writeFloat(env.centerOffsetOfMapX);
            writer.writeFloat(env.centerOffsetOfMapY);
            env.tilesetsData.forEach((tilesetsDataX)=>{
                tilesetsDataX.forEach((tilesetData)=>{
                    writer.writeShort(tilesetData.groundHeight);
                    writer.writeShort(tilesetData.waterLevelAndMapEdgeLevelFlag);
                    writer.writeByte(tilesetData.waterAndRampFlagAndGroundTextureType);
                    writer.writeByte(tilesetData.textureDetailsType);
                    writer.writeByte(tilesetData.cliffTextureTypeAndLayerHeight);
                });
            });
            return writer.getBuffer();
        }
        throw new Error("Empty environment object, should call `read` first.");
    }
    private charToTileset(char: string):Tileset {
        switch (char) {
            case "A":
                return Tileset["Ashenvale"];
            case "B":
                return Tileset.Barrens;
            case "C":
                return Tileset.Felwood;
            case "D":
                return Tileset.Dungeon;
            case "F":
                return Tileset["Lordaeron Fall"];
            case "G":
                return Tileset.Underground;
            case "L":
                return Tileset["Lordaeron Summer"];
            case "N":
                return Tileset.Northrend;
            case "Q":
                return Tileset["Village Fall"];
            case "V":
                return Tileset.Village;
            case "W":
                return Tileset["Lordaeron Winter"];
            case "X":
                return Tileset.Dalaran;
            case "Y":
                return Tileset.Cityscape;
            case "Z": 
                return Tileset["Sunken Ruins"];
            case "I": 
                return Tileset.Icecrown;
            case "J": 
                return Tileset["Dalaran Ruins"];
            case "O": 
                return Tileset.Outland;
            case "K": 
                return Tileset["Black Citadel"];
            default:
                throw new Error(`Unknown tileset:${char}`);
        }

    }
    private tilesetToChar(tileset:Tileset):string{
        return tileset;
    }
} 
