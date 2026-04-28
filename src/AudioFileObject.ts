/**
 * @packageDocumentation
 */

import * as assert from "assert";
import { ReadDumpObject } from "./BinaryBuffer";

export type AudioFileKind = "WAVE" | "MP3";

export interface WaveChunk {
    id: string;
    offset: number;
    size: number;
    data: Buffer;
}

export interface WaveFormat {
    audioFormat: number;
    channels: number;
    sampleRate: number;
    byteRate: number;
    blockAlign: number;
    bitsPerSample: number;
    extraData: Buffer;
}

export interface Mp3Id3v2Tag {
    majorVersion: number;
    revision: number;
    flags: number;
    size: number;
}

export interface Mp3FrameInfo {
    offset: number;
    version: string;
    layer: string;
    bitrateKbps?: number;
    sampleRate?: number;
    channelMode: string;
    padded: boolean;
}

/**
 * AudioFileObject validates imported WAV/MP3 assets and exposes stable header
 * metadata while preserving the original bytes.
 */
export class AudioFileObject implements ReadDumpObject {
    protected _kind: AudioFileKind = "MP3";
    protected _buffer: Buffer = Buffer.alloc(0);
    protected _waveChunks: WaveChunk[] = [];
    protected _waveFormat: WaveFormat | undefined;
    protected _id3v2: Mp3Id3v2Tag | undefined;
    protected _mp3Frame: Mp3FrameInfo | undefined;

    constructor(protected readonly expectedKind?: AudioFileKind) {
        if (expectedKind) {
            this._kind = expectedKind;
        }
    }

    public read(buffer: Buffer): void {
        this._buffer = Buffer.from(buffer);
        this._waveChunks = [];
        this._waveFormat = undefined;
        this._id3v2 = undefined;
        this._mp3Frame = undefined;

        if (buffer.length === 0 && this.expectedKind) {
            this._kind = this.expectedKind;
            return;
        }
        assert.ok(buffer.length > 0, "Audio file is empty.");

        if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WAVE") {
            this.readWave(buffer);
            return;
        }

        this.readMp3(buffer);
    }

    public dump(): Buffer {
        return Buffer.from(this._buffer);
    }

    protected readWave(buffer: Buffer): void {
        this._kind = "WAVE";
        const riffSize = buffer.readUInt32LE(4);
        assert.ok(riffSize + 8 <= buffer.length, "WAVE RIFF size points outside the file.");

        let offset = 12;
        while (offset < buffer.length) {
            assert.ok(offset + 8 <= buffer.length, "WAVE chunk header is truncated.");
            const id = buffer.toString("ascii", offset, offset + 4);
            const size = buffer.readUInt32LE(offset + 4);
            const dataOffset = offset + 8;
            assert.ok(dataOffset + size <= buffer.length, `WAVE ${id} chunk payload is truncated.`);
            const data = Buffer.from(buffer.slice(dataOffset, dataOffset + size));
            this._waveChunks.push({ id, offset, size, data });
            if (id === "fmt " && size >= 16) {
                this._waveFormat = AudioFileObject.readWaveFormat(data);
            }
            offset = dataOffset + size + (size % 2);
        }

        assert.ok(this._waveFormat, "WAVE file is missing a fmt chunk.");
    }

    protected readMp3(buffer: Buffer): void {
        this._kind = "MP3";
        let offset = 0;
        if (buffer.length >= 10 && buffer.toString("ascii", 0, 3) === "ID3") {
            const tagSize = AudioFileObject.readSynchsafeInt(buffer, 6);
            this._id3v2 = {
                majorVersion: buffer[3],
                revision: buffer[4],
                flags: buffer[5],
                size: tagSize
            };
            offset = 10 + tagSize;
        }

        const frame = AudioFileObject.findMp3Frame(buffer, offset);
        assert.ok(frame, "MP3 file is missing an MPEG audio frame.");
        this._mp3Frame = frame;
    }

    protected static readWaveFormat(buffer: Buffer): WaveFormat {
        return {
            audioFormat: buffer.readUInt16LE(0),
            channels: buffer.readUInt16LE(2),
            sampleRate: buffer.readUInt32LE(4),
            byteRate: buffer.readUInt32LE(8),
            blockAlign: buffer.readUInt16LE(12),
            bitsPerSample: buffer.readUInt16LE(14),
            extraData: Buffer.from(buffer.slice(16))
        };
    }

    protected static readSynchsafeInt(buffer: Buffer, offset: number): number {
        return (buffer[offset] << 21) | (buffer[offset + 1] << 14) | (buffer[offset + 2] << 7) | buffer[offset + 3];
    }

    protected static findMp3Frame(buffer: Buffer, startOffset: number): Mp3FrameInfo | undefined {
        for (let offset = startOffset; offset + 4 <= buffer.length; ++offset) {
            if (buffer[offset] !== 0xff || (buffer[offset + 1] & 0xe0) !== 0xe0) {
                continue;
            }
            const frame = AudioFileObject.parseMp3Frame(buffer, offset);
            if (frame) {
                return frame;
            }
        }
        return undefined;
    }

    protected static parseMp3Frame(buffer: Buffer, offset: number): Mp3FrameInfo | undefined {
        const versionBits = (buffer[offset + 1] >> 3) & 0x03;
        const layerBits = (buffer[offset + 1] >> 1) & 0x03;
        const bitrateIndex = (buffer[offset + 2] >> 4) & 0x0f;
        const sampleRateIndex = (buffer[offset + 2] >> 2) & 0x03;
        if (versionBits === 1 || layerBits === 0 || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
            return undefined;
        }

        const version = AudioFileObject.readMpegVersion(versionBits);
        const layer = AudioFileObject.readMpegLayer(layerBits);
        return {
            offset,
            version,
            layer,
            bitrateKbps: AudioFileObject.readMpegBitrate(version, layer, bitrateIndex),
            sampleRate: AudioFileObject.readMpegSampleRate(version, sampleRateIndex),
            channelMode: AudioFileObject.readMpegChannelMode((buffer[offset + 3] >> 6) & 0x03),
            padded: ((buffer[offset + 2] >> 1) & 0x01) === 1
        };
    }

    protected static readMpegVersion(versionBits: number): string {
        if (versionBits === 3) {
            return "MPEG1";
        }
        if (versionBits === 2) {
            return "MPEG2";
        }
        return "MPEG2.5";
    }

    protected static readMpegLayer(layerBits: number): string {
        if (layerBits === 3) {
            return "Layer I";
        }
        if (layerBits === 2) {
            return "Layer II";
        }
        return "Layer III";
    }

    protected static readMpegBitrate(version: string, layer: string, index: number): number | undefined {
        const mpeg1Layer1 = [undefined, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, undefined];
        const mpeg1Layer2 = [undefined, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, undefined];
        const mpeg1Layer3 = [undefined, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, undefined];
        const mpeg2Layer1 = [undefined, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, undefined];
        const mpeg2Layer23 = [undefined, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, undefined];

        if (version === "MPEG1" && layer === "Layer I") {
            return mpeg1Layer1[index];
        }
        if (version === "MPEG1" && layer === "Layer II") {
            return mpeg1Layer2[index];
        }
        if (version === "MPEG1") {
            return mpeg1Layer3[index];
        }
        if (layer === "Layer I") {
            return mpeg2Layer1[index];
        }
        return mpeg2Layer23[index];
    }

    protected static readMpegSampleRate(version: string, index: number): number | undefined {
        const rates: { [version: string]: number[] } = {
            MPEG1: [44100, 48000, 32000],
            MPEG2: [22050, 24000, 16000],
            "MPEG2.5": [11025, 12000, 8000]
        };
        return rates[version][index];
    }

    protected static readMpegChannelMode(channelMode: number): string {
        return ["Stereo", "Joint stereo", "Dual channel", "Mono"][channelMode];
    }

    public get kind(): AudioFileKind {
        return this._kind;
    }

    public get waveChunks(): WaveChunk[] {
        return this._waveChunks.map((chunk) => ({
            ...chunk,
            data: Buffer.from(chunk.data)
        }));
    }

    public get waveFormat(): WaveFormat | undefined {
        if (!this._waveFormat) {
            return undefined;
        }
        return {
            ...this._waveFormat,
            extraData: Buffer.from(this._waveFormat.extraData)
        };
    }

    public get id3v2(): Mp3Id3v2Tag | undefined {
        return this._id3v2;
    }

    public get mp3Frame(): Mp3FrameInfo | undefined {
        return this._mp3Frame;
    }

    public get buffer(): Buffer {
        return Buffer.from(this._buffer);
    }
    public set buffer(buffer: Buffer) {
        this.read(buffer);
    }
}
