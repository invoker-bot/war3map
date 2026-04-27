/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export enum SoundEffectType {
    Default = "DefaultEAXON",
    Combat = "CombatSoundsEAX",
    Drums = "KotoDrumsEAX",
    Spells = "SpellsEAX",
    Missiles = "MissilesEAX",
    HeroSpeech = "HeroAcksEAX",
    Doodads = "DoodadsEAX"
}

export enum SoundChannel {
    General = 0,
    UnitSelection,
    UnitAcknowledgement,
    UnitMovement,
    UnitReady,
    Combat,
    Error,
    Music,
    UserInterface,
    LoopingMovement,
    LoopingAmbient,
    Animations,
    Constructions,
    Birth,
    Fire,
    LegacyMidi,
    CinematicGeneral,
    CinematicAmbient,
    CinematicMusic,
    CinematicDialog,
    CinematicSFX1,
    CinematicSFX2,
    CinematicSFX3
}

export interface SoundFlags {
    looping: boolean;
    sound3D: boolean;
    stopOutOfRange: boolean;
    music: boolean;
    imported: boolean;
}

export interface SoundDistance {
    min: number;
    max: number;
    cutoff: number;
}

export interface SoundDefinition {
    variableName: string;
    path: string;
    effect: string;
    flags: number;
    fadeInRate: number;
    fadeOutRate: number;
    volume: number;
    pitchRaw: number;
    pitchVarianceRaw: number;
    priority: number;
    channel: number;
    distance: SoundDistance;
    unknowns: number[];
    repeatedVariableName?: string;
    internalName?: string;
    repeatedPath?: string;
    trailingData?: Buffer;
}

/**
 * SoundsObject parses data from "war3map.w3s" file and can dump back.
 */
export class SoundsObject implements ReadDumpObject {
    protected _fileVersion = 1;
    protected _sounds: SoundDefinition[] = [];

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        this._fileVersion = reader.readInt();
        assert.ok(this._fileVersion === 1 || this._fileVersion === 3, `Unsupport file version:${this._fileVersion}`);

        this._sounds = [];
        const numberOfSounds = reader.readInt();
        for (let i = 0; i < numberOfSounds; ++i) {
            const variableName = reader.readString();
            const path = reader.readString();
            const effect = reader.readString();
            const flags = reader.readInt();
            const fadeInRate = reader.readInt();
            const fadeOutRate = reader.readInt();
            const volume = reader.readInt();
            const pitchRaw = reader.readInt();
            const pitchVarianceRaw = reader.readInt();
            const priority = reader.readInt();
            const channel = reader.readInt();
            const distance = {
                min: reader.readInt(),
                max: reader.readInt(),
                cutoff: reader.readInt()
            };
            const unknowns = [
                reader.readInt(),
                reader.readInt(),
                reader.readInt(),
                reader.readInt(),
                reader.readInt(),
                reader.readInt()
            ];

            const sound: SoundDefinition = {
                variableName,
                path,
                effect,
                flags,
                fadeInRate,
                fadeOutRate,
                volume,
                pitchRaw,
                pitchVarianceRaw,
                priority,
                channel,
                distance,
                unknowns
            };

            if (this._fileVersion === 3) {
                sound.repeatedVariableName = reader.readString();
                sound.internalName = reader.readString();
                sound.repeatedPath = reader.readString();
                sound.trailingData = reader.readBytes(22);
            }

            this._sounds.push(sound);
        }

        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(this._fileVersion);
        writer.writeInt(this._sounds.length);
        this._sounds.forEach((sound) => {
            writer.writeString(sound.variableName, true);
            writer.writeString(sound.path, true);
            writer.writeString(sound.effect, true);
            writer.writeInt(sound.flags);
            writer.writeInt(sound.fadeInRate);
            writer.writeInt(sound.fadeOutRate);
            writer.writeInt(sound.volume);
            writer.writeInt(sound.pitchRaw);
            writer.writeInt(sound.pitchVarianceRaw);
            writer.writeInt(sound.priority);
            writer.writeInt(sound.channel);
            writer.writeInt(sound.distance.min);
            writer.writeInt(sound.distance.max);
            writer.writeInt(sound.distance.cutoff);
            sound.unknowns.forEach((unknown) => writer.writeInt(unknown));

            if (this._fileVersion === 3) {
                writer.writeString(sound.repeatedVariableName || sound.variableName, true);
                writer.writeString(sound.internalName || "", true);
                writer.writeString(sound.repeatedPath || sound.path, true);
                writer.writeBuffer(sound.trailingData || Buffer.from([255, 255, 255, 255, 0, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]));
            }
        });
        return writer.getBuffer();
    }

    public get sounds(): SoundDefinition[] {
        return this._sounds;
    }
    public set sounds(_sounds: SoundDefinition[]) {
        this._sounds = _sounds;
    }

    public static flagsToObject(flags: number): SoundFlags {
        return {
            looping: !!(flags & 0x1),
            sound3D: !!(flags & 0x2),
            stopOutOfRange: !!(flags & 0x4),
            music: !!(flags & 0x8),
            imported: !!(flags & 0x10)
        };
    }

    public static objectToFlags(flags: SoundFlags): number {
        let value = 0;
        if (flags.looping) value |= 0x1;
        if (flags.sound3D) value |= 0x2;
        if (flags.stopOutOfRange) value |= 0x4;
        if (flags.music) value |= 0x8;
        if (flags.imported) value |= 0x10;
        return value;
    }
}
