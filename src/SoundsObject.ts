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

export interface SoundFadeRate {
    in: number;
    out: number;
}

export interface SoundRuntimeExtents {
    minDistance: number;
    maxDistance: number;
    volume: number;
    pitch: number;
    pitchVariance: number;
    cutoffDistance: number;
}

export interface SoundEditorMetadata {
    marker1: number;
    marker2: number;
    marker3: number;
    reserved1: number;
    reserved2: number;
    reserved3: number;
}

export interface SoundDefinition {
    variableName: string;
    path: string;
    effect: string;
    flags: number;
    fadeRate?: SoundFadeRate;
    fadeInRate: number;
    fadeOutRate: number;
    volume: number;
    pitch?: number;
    pitchRaw?: number;
    pitchVariance?: number;
    pitchVarianceRaw?: number;
    priority: number;
    channel: number;
    distance: SoundDistance;
    runtimeExtents?: SoundRuntimeExtents;
    editorMetadata?: SoundEditorMetadata;
    repeatedVariableName?: string;
    internalName?: string;
    repeatedPath?: string;
    tailMarker1?: number;
    tailByte1?: number;
    tailMarker2?: number;
    tailReserved1?: number;
    tailReserved2?: number;
    tailByte2?: number;
    tailMarker3?: number;
    /** @deprecated Use the structured tail marker and reserved fields instead. */
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
            const pitchOffset = reader.offset;
            const pitch = reader.readFloat();
            const pitchRaw = buffer.readInt32LE(pitchOffset);
            const pitchVarianceOffset = reader.offset;
            const pitchVariance = reader.readFloat();
            const pitchVarianceRaw = buffer.readInt32LE(pitchVarianceOffset);
            const priority = reader.readInt();
            const channel = reader.readInt();
            const distance = {
                min: reader.readFloat(),
                max: reader.readFloat(),
                cutoff: reader.readFloat()
            };
            const editorMetadata = {
                marker1: reader.readInt(),
                marker2: reader.readInt(),
                marker3: reader.readInt(),
                reserved1: reader.readInt(),
                reserved2: reader.readInt(),
                reserved3: reader.readInt()
            };
            const runtimeExtents = {
                minDistance: editorMetadata.marker1,
                maxDistance: editorMetadata.marker2,
                volume: editorMetadata.marker3,
                pitch: editorMetadata.reserved1,
                pitchVariance: editorMetadata.reserved2,
                cutoffDistance: editorMetadata.reserved3
            };
            const sound: SoundDefinition = {
                variableName,
                path,
                effect,
                flags,
                fadeRate: {
                    in: fadeInRate,
                    out: fadeOutRate
                },
                fadeInRate,
                fadeOutRate,
                volume,
                pitch,
                pitchRaw,
                pitchVariance,
                pitchVarianceRaw,
                priority,
                channel,
                distance,
                runtimeExtents,
                editorMetadata
            };

            if (this._fileVersion === 3) {
                sound.repeatedVariableName = reader.readString();
                sound.internalName = reader.readString();
                sound.repeatedPath = reader.readString();
                sound.tailMarker1 = reader.readInt();
                sound.tailByte1 = reader.readByte();
                sound.tailMarker2 = reader.readInt();
                sound.tailReserved1 = reader.readInt();
                sound.tailReserved2 = reader.readInt();
                sound.tailByte2 = reader.readByte();
                sound.tailMarker3 = reader.readInt();
                sound.trailingData = SoundsObject.writeVersion3Tail(sound);
            }

            this._sounds.push(sound);
        }

        assert.ok(reader.isEOF(), "Not reach end of the file because of trailing data.");
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
            writer.writeInt(sound.fadeRate ? sound.fadeRate.in : sound.fadeInRate);
            writer.writeInt(sound.fadeRate ? sound.fadeRate.out : sound.fadeOutRate);
            writer.writeInt(sound.volume);
            writer.writeFloat(SoundsObject.getFloatValue(sound.pitch, sound.pitchRaw, 1));
            writer.writeFloat(SoundsObject.getFloatValue(sound.pitchVariance, sound.pitchVarianceRaw, 0));
            writer.writeInt(sound.priority);
            writer.writeInt(sound.channel);
            writer.writeFloat(sound.distance.min);
            writer.writeFloat(sound.distance.max);
            writer.writeFloat(sound.distance.cutoff);
            const editorMetadata = sound.editorMetadata || SoundsObject.defaultEditorMetadata();
            writer.writeInt(editorMetadata.marker1);
            writer.writeInt(editorMetadata.marker2);
            writer.writeInt(editorMetadata.marker3);
            writer.writeInt(editorMetadata.reserved1);
            writer.writeInt(editorMetadata.reserved2);
            writer.writeInt(editorMetadata.reserved3);

            if (this._fileVersion === 3) {
                writer.writeString(sound.repeatedVariableName || sound.variableName, true);
                writer.writeString(sound.internalName || "", true);
                writer.writeString(sound.repeatedPath || sound.path, true);
                writer.writeBuffer(SoundsObject.writeVersion3Tail(sound));
            }
        });
        return writer.getBuffer();
    }

    protected static floatFromRaw(raw: number): number {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32LE(raw, 0);
        return buffer.readFloatLE(0);
    }

    protected static getFloatValue(value: number | undefined, raw: number | undefined, fallback: number): number {
        return value === undefined ? (raw === undefined ? fallback : SoundsObject.floatFromRaw(raw)) : value;
    }

    protected static defaultEditorMetadata(): SoundEditorMetadata {
        return {
            marker1: 0,
            marker2: 0,
            marker3: 127,
            reserved1: 0,
            reserved2: 0,
            reserved3: 0
        };
    }

    protected static writeVersion3Tail(sound: SoundDefinition): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(sound.tailMarker1 === undefined ? -1 : sound.tailMarker1);
        writer.writeByte(sound.tailByte1 === undefined ? 0 : sound.tailByte1);
        writer.writeInt(sound.tailMarker2 === undefined ? -1 : sound.tailMarker2);
        writer.writeInt(sound.tailReserved1 === undefined ? 0 : sound.tailReserved1);
        writer.writeInt(sound.tailReserved2 === undefined ? 0 : sound.tailReserved2);
        writer.writeByte(sound.tailByte2 === undefined ? 0 : sound.tailByte2);
        writer.writeInt(sound.tailMarker3 === undefined ? 1 : sound.tailMarker3);
        return writer.getBuffer();
    }

    public get sounds(): SoundDefinition[] {
        return this._sounds;
    }
    public set sounds(_sounds: SoundDefinition[]) {
        this._sounds = _sounds;
    }

    public get fileVersion(): number {
        return this._fileVersion;
    }
    public set fileVersion(fileVersion: number) {
        this._fileVersion = fileVersion;
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
