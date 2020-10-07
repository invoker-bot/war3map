import {BinaryReadBuffer,BinaryWriteBuffer} from "./BinaryBuffer";

export interface Translator{

}
enum ObjectType{
    Units,
    Items,
    Destructables,
    Doodads,
    Abilities,
    Buffs,
    Upgrades
}
