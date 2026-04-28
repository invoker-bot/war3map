/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface GameConfigurationFlags {
    raw: number;
    fogOfWarDisabled: boolean;
    victoryDefeatDisabled: boolean;
}

export interface GameConfigurationPlayerFlags {
    raw: number;
    user: boolean;
    observer: boolean;
    loadCustomAi: boolean;
    aiPathAbsolute: boolean;
}

export interface GameConfigurationPlayer {
    slotId: number;
    team: number;
    race: number;
    color: number;
    handicap: number;
    flags: GameConfigurationPlayerFlags;
    aiDifficulty: number;
    aiScriptPath: string;
}

/**
 * GameConfigurationObject parses ".wgc" files used by World Editor AI tests.
 */
export class GameConfigurationObject implements ReadDumpObject {
    protected _fileVersion = 1;
    protected _flags: GameConfigurationFlags = GameConfigurationObject.flagsToObject(0);
    protected _baseGameSpeed = 1;
    protected _mapPath = "";
    protected _players: GameConfigurationPlayer[] = [];

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        this._fileVersion = reader.readInt();
        assert.strictEqual(this._fileVersion, 1, `Unsupported game configuration version:${this._fileVersion}`);
        this._flags = GameConfigurationObject.flagsToObject(reader.readInt());
        this._baseGameSpeed = reader.readInt();
        this._mapPath = reader.readString();
        const numberOfPlayers = reader.readInt();
        assert.ok(numberOfPlayers >= 0, "Invalid game configuration player count.");
        this._players = [];
        for (let i = 0; i < numberOfPlayers; ++i) {
            this._players.push({
                slotId: reader.readInt(),
                team: reader.readInt(),
                race: reader.readInt(),
                color: reader.readInt(),
                handicap: reader.readInt(),
                flags: GameConfigurationObject.playerFlagsToObject(reader.readInt()),
                aiDifficulty: reader.readInt(),
                aiScriptPath: reader.readString()
            });
        }
        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(this._fileVersion);
        writer.writeInt(GameConfigurationObject.objectToFlags(this._flags));
        writer.writeInt(this._baseGameSpeed);
        writer.writeString(this._mapPath, true);
        writer.writeInt(this._players.length);
        this._players.forEach((player) => {
            writer.writeInt(player.slotId);
            writer.writeInt(player.team);
            writer.writeInt(player.race);
            writer.writeInt(player.color);
            writer.writeInt(player.handicap);
            writer.writeInt(GameConfigurationObject.objectToPlayerFlags(player.flags));
            writer.writeInt(player.aiDifficulty);
            writer.writeString(player.aiScriptPath, true);
        });
        return writer.getBuffer();
    }

    public static flagsToObject(flags: number): GameConfigurationFlags {
        return {
            raw: flags,
            fogOfWarDisabled: !!(flags & 0x1),
            victoryDefeatDisabled: !!(flags & 0x2)
        };
    }

    public static objectToFlags(flags: GameConfigurationFlags): number {
        let raw = flags.raw || 0;
        raw = flags.fogOfWarDisabled ? raw | 0x1 : raw & ~0x1;
        raw = flags.victoryDefeatDisabled ? raw | 0x2 : raw & ~0x2;
        return raw;
    }

    public static playerFlagsToObject(flags: number): GameConfigurationPlayerFlags {
        return {
            raw: flags,
            user: !!(flags & 0x1),
            observer: !!(flags & 0x2),
            loadCustomAi: !!(flags & 0x4),
            aiPathAbsolute: !!(flags & 0x8)
        };
    }

    public static objectToPlayerFlags(flags: GameConfigurationPlayerFlags): number {
        let raw = flags.raw || 0;
        raw = flags.user ? raw | 0x1 : raw & ~0x1;
        raw = flags.observer ? raw | 0x2 : raw & ~0x2;
        raw = flags.loadCustomAi ? raw | 0x4 : raw & ~0x4;
        raw = flags.aiPathAbsolute ? raw | 0x8 : raw & ~0x8;
        return raw;
    }

    public get fileVersion(): number {
        return this._fileVersion;
    }
    public get flags(): GameConfigurationFlags {
        return this._flags;
    }
    public set flags(flags: GameConfigurationFlags) {
        this._flags = flags;
    }
    public get baseGameSpeed(): number {
        return this._baseGameSpeed;
    }
    public set baseGameSpeed(baseGameSpeed: number) {
        this._baseGameSpeed = baseGameSpeed;
    }
    public get mapPath(): string {
        return this._mapPath;
    }
    public set mapPath(mapPath: string) {
        this._mapPath = mapPath;
    }
    public get players(): GameConfigurationPlayer[] {
        return this._players;
    }
    public set players(players: GameConfigurationPlayer[]) {
        this._players = players;
    }
}
