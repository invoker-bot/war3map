/**
 *  @packageDocumentation
 */
import * as assert from "assert";
import { BinaryReadBuffer, BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface GameVersion {
    major: number;
    minor: number;
    patch: number;
    build: number;
}

export interface MapFlags {
    raw: number;
    hideMinimapInPreview: boolean;
    modifyAllyPriorities: boolean;
    isMeleeMap: boolean;
    maskedPartiallyVisible: boolean;
    fixedPlayerSetting: boolean;
    useCustomForces: boolean;
    useCustomTechtree: boolean;
    useCustomAbilities: boolean;
    useCustomUpgrades: boolean;
    waterWavesOnCliffShores: boolean;
    waterWavesOnRollingShores: boolean;
    useTerrainFog: boolean;
    useItemClassificationSystem: boolean;
    enableWaterTinting: boolean;
    useAccurateProbabilityForCalculations: boolean;
    useCustomAbilitySkins: boolean;
    disableDenyIcon: boolean;
    forceDefaultCameraZoom: boolean;
    forceMaxCameraZoom: boolean;
    forceMinCameraZoom: boolean;
}

export interface MapInfo {
    name: string;
    author: string;
    description: string;
    recommendedPlayers: string;
    playableAreaWidth: number;
    playableAreaHeight: number;
    flags: MapFlags;
    mainTileset: string;
}

export interface CameraBounds {
    bounds: number[];
    complements: number[];
}

export interface LoadingScreenInfo {
    background: number;
    path: string;
    text: string;
    title: string;
    subtitle: string;
}

export interface FogInfo {
    type: number;
    startHeight: number;
    endHeight: number;
    density: number;
    color: number[];
}

export interface PlayerInfo {
    playerNum: number;
    type: number;
    race: number;
    fixedStartPosition: boolean;
    fixedStartPositionFlag: number;
    name: string;
    startingX: number;
    startingY: number;
    allyLowPriorityFlags: number;
    allyHighPriorityFlags: number;
    enemyLowPriorityFlags?: number;
    enemyHighPriorityFlags?: number;
}

export interface ForceInfo {
    flags: number;
    players: number;
    name: string;
}

export interface UpgradeInfo {
    players: number;
    id: string;
    level: number;
    availability: number;
}

export interface TechtreeInfo {
    players: number;
    id: string;
}

export interface RandomGroupRow {
    chance: number;
    entries: string[];
}

export interface RandomGroupTable {
    number: number;
    name: string;
    positions: number[];
    rows: RandomGroupRow[];
}

export interface RandomItem {
    chance: number;
    id: string;
}

export interface RandomItemTable {
    number: number;
    name: string;
    sets: RandomItem[][];
}

export interface ReforgedInfo {
    scriptLanguage: number;
    supportedModes?: number;
    gameDataVersion?: number;
    forceDefaultCameraZoom?: number;
    forceMaxCameraZoom?: number;
    forceMinCameraZoom?: number;
}

/**
 * InfoObject parses data from "war3map.w3i" and can dump it back.
 */
export class InfoObject implements ReadDumpObject {
    protected _fileVersion = 25;
    protected _saves = 0;
    protected _editorVersion = 0;
    protected _gameVersion?: GameVersion;
    protected _map: MapInfo = {
        name: "",
        author: "",
        description: "",
        recommendedPlayers: "",
        playableAreaWidth: 0,
        playableAreaHeight: 0,
        flags: InfoObject.flagsToObject(0),
        mainTileset: ""
    };
    protected _camera: CameraBounds = { bounds: [], complements: [] };
    protected _loadingScreen: LoadingScreenInfo = { background: 0, path: "", text: "", title: "", subtitle: "" };
    protected _gameDataSet = 0;
    protected _prologue: LoadingScreenInfo = { background: 0, path: "", text: "", title: "", subtitle: "" };
    protected _fog: FogInfo = { type: 0, startHeight: 0, endHeight: 0, density: 0, color: [0, 0, 0, 255] };
    protected _globalWeatherId = "\0\0\0\0";
    protected _customSoundEnvironment = "";
    protected _customLightEnvironment = "";
    protected _waterColor: number[] = [255, 255, 255, 255];
    protected _reforged?: ReforgedInfo;
    protected _players: PlayerInfo[] = [];
    protected _forces: ForceInfo[] = [];
    protected _upgrades: UpgradeInfo[] = [];
    protected _techtree: TechtreeInfo[] = [];
    protected _randomGroupTables: RandomGroupTable[] = [];
    protected _randomItemTables: RandomItemTable[] = [];
    protected _legacyTail?: Buffer;

    public read(buffer: Buffer): void {
        const reader = new BinaryReadBuffer(buffer);
        this._fileVersion = reader.readInt();
        assert.ok(this._fileVersion >= 18 && this._fileVersion <= 33, `Unsupported w3i file version:${this._fileVersion}`);
        this._saves = reader.readInt();
        this._editorVersion = reader.readInt();

        if (this._fileVersion >= 27) {
            this._gameVersion = {
                major: reader.readInt(),
                minor: reader.readInt(),
                patch: reader.readInt(),
                build: reader.readInt()
            };
        } else {
            this._gameVersion = undefined;
        }

        this._map.name = reader.readString();
        this._map.author = reader.readString();
        this._map.description = reader.readString();
        this._map.recommendedPlayers = reader.readString();
        this._camera = {
            bounds: [reader.readFloat(), reader.readFloat(), reader.readFloat(), reader.readFloat(),
                reader.readFloat(), reader.readFloat(), reader.readFloat(), reader.readFloat()],
            complements: [reader.readInt(), reader.readInt(), reader.readInt(), reader.readInt()]
        };
        this._map.playableAreaWidth = reader.readInt();
        this._map.playableAreaHeight = reader.readInt();
        this._map.flags = InfoObject.flagsToObject(reader.readInt());
        this._map.mainTileset = reader.readChars(1);
        this._loadingScreen = { background: reader.readInt(), path: "", text: "", title: "", subtitle: "" };

        this._legacyTail = undefined;
        if (this._fileVersion < 25) {
            this._legacyTail = reader.readBytes(reader.remainingBytes());
            this._players = [];
            this._forces = [];
            this._upgrades = [];
            this._techtree = [];
            this._randomGroupTables = [];
            this._randomItemTables = [];
            assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
            return;
        }

        if (this._fileVersion >= 25) {
            this._loadingScreen.path = reader.readString();
            this._loadingScreen.text = reader.readString();
            this._loadingScreen.title = reader.readString();
            this._loadingScreen.subtitle = reader.readString();
            this._gameDataSet = reader.readInt();
            this._prologue = {
                background: 0,
                path: reader.readString(),
                text: reader.readString(),
                title: reader.readString(),
                subtitle: reader.readString()
            };
            this._fog = {
                type: reader.readInt(),
                startHeight: reader.readFloat(),
                endHeight: reader.readFloat(),
                density: reader.readFloat(),
                color: [reader.readByte(), reader.readByte(), reader.readByte(), reader.readByte()]
            };
            this._globalWeatherId = reader.readChars(4);
            this._customSoundEnvironment = reader.readString();
            this._customLightEnvironment = reader.readChars(1);
            this._waterColor = [reader.readByte(), reader.readByte(), reader.readByte(), reader.readByte()];
        } else {
            this._gameDataSet = 0;
            this._prologue = { background: 0, path: "", text: "", title: "", subtitle: "" };
            this._fog = { type: 0, startHeight: 0, endHeight: 0, density: 0, color: [0, 0, 0, 255] };
            this._globalWeatherId = "\0\0\0\0";
            this._customSoundEnvironment = "";
            this._customLightEnvironment = "";
            this._waterColor = [255, 255, 255, 255];
        }

        if (this._fileVersion >= 28) {
            const reforged: ReforgedInfo = { scriptLanguage: reader.readInt() };
            if (this._fileVersion >= 29) {
                reforged.supportedModes = reader.readInt();
            }
            if (this._fileVersion >= 30) {
                reforged.gameDataVersion = reader.readInt();
            }
            if (this._fileVersion >= 32) {
                reforged.forceDefaultCameraZoom = reader.readInt();
                reforged.forceMaxCameraZoom = reader.readInt();
            }
            if (this._fileVersion >= 33) {
                reforged.forceMinCameraZoom = reader.readInt();
            }
            this._reforged = reforged;
        } else {
            this._reforged = undefined;
        }

        if (reader.remainingBytes() > 0) {
            this.readPlayers(reader);
        } else {
            this._players = [];
        }
        if (reader.remainingBytes() > 0) {
            this.readForces(reader);
        } else {
            this._forces = [];
        }
        if (reader.remainingBytes() > 0) {
            this.readUpgrades(reader);
        } else {
            this._upgrades = [];
        }
        if (reader.remainingBytes() > 0) {
            this.readTechtree(reader);
        } else {
            this._techtree = [];
        }
        if (reader.remainingBytes() > 0) {
            this.readRandomGroupTables(reader);
        } else {
            this._randomGroupTables = [];
        }
        if (reader.remainingBytes() > 0) {
            this.readRandomItemTables(reader);
        } else {
            this._randomItemTables = [];
        }

        assert.ok(reader.isEOF(), "Not reach end of the file because of unknown data.");
    }

    public dump(): Buffer {
        const writer = new BinaryWriteBuffer();
        writer.writeInt(this._fileVersion);
        writer.writeInt(this._saves);
        writer.writeInt(this._editorVersion);
        if (this._fileVersion >= 27) {
            const gameVersion = this._gameVersion || { major: 0, minor: 0, patch: 0, build: 0 };
            writer.writeInt(gameVersion.major);
            writer.writeInt(gameVersion.minor);
            writer.writeInt(gameVersion.patch);
            writer.writeInt(gameVersion.build);
        }
        writer.writeString(this._map.name, true);
        writer.writeString(this._map.author, true);
        writer.writeString(this._map.description, true);
        writer.writeString(this._map.recommendedPlayers, true);
        this._camera.bounds.forEach((bound) => writer.writeFloat(bound));
        this._camera.complements.forEach((complement) => writer.writeInt(complement));
        writer.writeInt(this._map.playableAreaWidth);
        writer.writeInt(this._map.playableAreaHeight);
        writer.writeInt(InfoObject.objectToFlags(this._map.flags));
        writer.writeString(this._map.mainTileset);
        writer.writeInt(this._loadingScreen.background);
        if (this._fileVersion < 25) {
            writer.writeBuffer(this._legacyTail || Buffer.alloc(0));
            return writer.getBuffer();
        }
        if (this._fileVersion >= 25) {
            writer.writeString(this._loadingScreen.path, true);
            writer.writeString(this._loadingScreen.text, true);
            writer.writeString(this._loadingScreen.title, true);
            writer.writeString(this._loadingScreen.subtitle, true);
            writer.writeInt(this._gameDataSet);
            writer.writeString(this._prologue.path, true);
            writer.writeString(this._prologue.text, true);
            writer.writeString(this._prologue.title, true);
            writer.writeString(this._prologue.subtitle, true);
            writer.writeInt(this._fog.type);
            writer.writeFloat(this._fog.startHeight);
            writer.writeFloat(this._fog.endHeight);
            writer.writeFloat(this._fog.density);
            this._fog.color.forEach((color) => writer.writeByte(color));
            writer.writeString(this._globalWeatherId);
            writer.writeString(this._customSoundEnvironment, true);
            writer.writeString(this._customLightEnvironment);
            this._waterColor.forEach((color) => writer.writeByte(color));
        }
        if (this._fileVersion >= 28) {
            const reforged = this._reforged || { scriptLanguage: 0 };
            writer.writeInt(reforged.scriptLanguage);
            if (this._fileVersion >= 29) {
                writer.writeInt(reforged.supportedModes === undefined ? 3 : reforged.supportedModes);
            }
            if (this._fileVersion >= 30) {
                writer.writeInt(reforged.gameDataVersion === undefined ? 1 : reforged.gameDataVersion);
            }
            if (this._fileVersion >= 32) {
                writer.writeInt(reforged.forceDefaultCameraZoom || 0);
                writer.writeInt(reforged.forceMaxCameraZoom || 0);
            }
            if (this._fileVersion >= 33) {
                writer.writeInt(reforged.forceMinCameraZoom || 0);
            }
        }
        this.writePlayers(writer);
        this.writeForces(writer);
        this.writeUpgrades(writer);
        this.writeTechtree(writer);
        this.writeRandomGroupTables(writer);
        this.writeRandomItemTables(writer);
        return writer.getBuffer();
    }

    public static flagsToObject(flags: number): MapFlags {
        return {
            raw: flags,
            hideMinimapInPreview: !!(flags & 0x1),
            modifyAllyPriorities: !!(flags & 0x2),
            isMeleeMap: !!(flags & 0x4),
            maskedPartiallyVisible: !!(flags & 0x10),
            fixedPlayerSetting: !!(flags & 0x20),
            useCustomForces: !!(flags & 0x40),
            useCustomTechtree: !!(flags & 0x80),
            useCustomAbilities: !!(flags & 0x100),
            useCustomUpgrades: !!(flags & 0x200),
            waterWavesOnCliffShores: !!(flags & 0x800),
            waterWavesOnRollingShores: !!(flags & 0x1000),
            useTerrainFog: !!(flags & 0x2000),
            useItemClassificationSystem: !!(flags & 0x8000),
            enableWaterTinting: !!(flags & 0x10000),
            useAccurateProbabilityForCalculations: !!(flags & 0x20000),
            useCustomAbilitySkins: !!(flags & 0x40000),
            disableDenyIcon: !!(flags & 0x80000),
            forceDefaultCameraZoom: !!(flags & 0x100000),
            forceMaxCameraZoom: !!(flags & 0x200000),
            forceMinCameraZoom: !!(flags & 0x400000)
        };
    }

    public static objectToFlags(flags: MapFlags): number {
        return flags.raw;
    }

    protected readPlayers(reader: BinaryReadBuffer): void {
        this._players = [];
        const numberOfPlayers = reader.readInt();
        for (let i = 0; i < numberOfPlayers; ++i) {
            const player: PlayerInfo = {
                playerNum: reader.readInt(),
                type: reader.readInt(),
                race: reader.readInt(),
                fixedStartPosition: false,
                fixedStartPositionFlag: reader.readInt(),
                name: reader.readString(),
                startingX: reader.readFloat(),
                startingY: reader.readFloat(),
                allyLowPriorityFlags: reader.readInt(),
                allyHighPriorityFlags: reader.readInt()
            };
            player.fixedStartPosition = player.fixedStartPositionFlag !== 0;
            if (this._fileVersion >= 31) {
                player.enemyLowPriorityFlags = reader.readInt();
                player.enemyHighPriorityFlags = reader.readInt();
            }
            this._players.push(player);
        }
    }

    protected readForces(reader: BinaryReadBuffer): void {
        this._forces = [];
        const numberOfForces = reader.readInt();
        for (let i = 0; i < numberOfForces; ++i) {
            this._forces.push({
                flags: reader.readInt(),
                players: reader.readInt(),
                name: reader.readString()
            });
        }
    }

    protected readUpgrades(reader: BinaryReadBuffer): void {
        this._upgrades = [];
        const numberOfUpgrades = reader.readInt();
        for (let i = 0; i < numberOfUpgrades; ++i) {
            this._upgrades.push({
                players: reader.readInt(),
                id: reader.readChars(4),
                level: reader.readInt(),
                availability: reader.readInt()
            });
        }
    }

    protected readTechtree(reader: BinaryReadBuffer): void {
        this._techtree = [];
        const numberOfTechtree = reader.readInt();
        for (let i = 0; i < numberOfTechtree; ++i) {
            this._techtree.push({ players: reader.readInt(), id: reader.readChars(4) });
        }
    }

    protected readRandomGroupTables(reader: BinaryReadBuffer): void {
        this._randomGroupTables = [];
        const numberOfTables = reader.readInt();
        for (let i = 0; i < numberOfTables; ++i) {
            const table: RandomGroupTable = {
                number: reader.readInt(),
                name: reader.readString(),
                positions: [],
                rows: []
            };
            const numberOfPositions = reader.readInt();
            for (let positionIndex = 0; positionIndex < numberOfPositions; ++positionIndex) {
                table.positions.push(reader.readInt());
            }
            const numberOfRows = reader.readInt();
            for (let rowIndex = 0; rowIndex < numberOfRows; ++rowIndex) {
                const row: RandomGroupRow = { chance: reader.readInt(), entries: [] };
                for (let positionIndex = 0; positionIndex < numberOfPositions; ++positionIndex) {
                    row.entries.push(reader.readChars(4));
                }
                table.rows.push(row);
            }
            this._randomGroupTables.push(table);
        }
    }

    protected readRandomItemTables(reader: BinaryReadBuffer): void {
        this._randomItemTables = [];
        const numberOfTables = reader.readInt();
        for (let i = 0; i < numberOfTables; ++i) {
            const table: RandomItemTable = { number: reader.readInt(), name: reader.readString(), sets: [] };
            const numberOfSets = reader.readInt();
            for (let setIndex = 0; setIndex < numberOfSets; ++setIndex) {
                const numberOfItems = reader.readInt();
                const itemSet: RandomItem[] = [];
                for (let itemIndex = 0; itemIndex < numberOfItems; ++itemIndex) {
                    itemSet.push({ chance: reader.readInt(), id: reader.readChars(4) });
                }
                table.sets.push(itemSet);
            }
            this._randomItemTables.push(table);
        }
    }

    protected writePlayers(writer: BinaryWriteBuffer): void {
        writer.writeInt(this._players.length);
        this._players.forEach((player) => {
            writer.writeInt(player.playerNum);
            writer.writeInt(player.type);
            writer.writeInt(player.race);
            writer.writeInt(player.fixedStartPositionFlag !== undefined ? player.fixedStartPositionFlag : (player.fixedStartPosition ? 1 : 0));
            writer.writeString(player.name, true);
            writer.writeFloat(player.startingX);
            writer.writeFloat(player.startingY);
            writer.writeInt(player.allyLowPriorityFlags);
            writer.writeInt(player.allyHighPriorityFlags);
            if (this._fileVersion >= 31) {
                writer.writeInt(player.enemyLowPriorityFlags || 0);
                writer.writeInt(player.enemyHighPriorityFlags || 0);
            }
        });
    }

    protected writeForces(writer: BinaryWriteBuffer): void {
        writer.writeInt(this._forces.length);
        this._forces.forEach((force) => {
            writer.writeInt(force.flags);
            writer.writeInt(force.players);
            writer.writeString(force.name, true);
        });
    }

    protected writeUpgrades(writer: BinaryWriteBuffer): void {
        writer.writeInt(this._upgrades.length);
        this._upgrades.forEach((upgrade) => {
            writer.writeInt(upgrade.players);
            writer.writeString(upgrade.id);
            writer.writeInt(upgrade.level);
            writer.writeInt(upgrade.availability);
        });
    }

    protected writeTechtree(writer: BinaryWriteBuffer): void {
        writer.writeInt(this._techtree.length);
        this._techtree.forEach((techtree) => {
            writer.writeInt(techtree.players);
            writer.writeString(techtree.id);
        });
    }

    protected writeRandomGroupTables(writer: BinaryWriteBuffer): void {
        writer.writeInt(this._randomGroupTables.length);
        this._randomGroupTables.forEach((table) => {
            writer.writeInt(table.number);
            writer.writeString(table.name, true);
            writer.writeInt(table.positions.length);
            table.positions.forEach((position) => writer.writeInt(position));
            writer.writeInt(table.rows.length);
            table.rows.forEach((row) => {
                writer.writeInt(row.chance);
                row.entries.forEach((entry) => writer.writeString(entry));
            });
        });
    }

    protected writeRandomItemTables(writer: BinaryWriteBuffer): void {
        writer.writeInt(this._randomItemTables.length);
        this._randomItemTables.forEach((table) => {
            writer.writeInt(table.number);
            writer.writeString(table.name, true);
            writer.writeInt(table.sets.length);
            table.sets.forEach((itemSet) => {
                writer.writeInt(itemSet.length);
                itemSet.forEach((item) => {
                    writer.writeInt(item.chance);
                    writer.writeString(item.id);
                });
            });
        });
    }

    public get fileVersion(): number {
        return this._fileVersion;
    }
    public get saves(): number {
        return this._saves;
    }
    public get editorVersion(): number {
        return this._editorVersion;
    }
    public get map(): MapInfo {
        return this._map;
    }
    public get camera(): CameraBounds {
        return this._camera;
    }
    public get loadingScreen(): LoadingScreenInfo {
        return this._loadingScreen;
    }
    public get players(): PlayerInfo[] {
        return this._players;
    }
    public get forces(): ForceInfo[] {
        return this._forces;
    }
    public get upgrades(): UpgradeInfo[] {
        return this._upgrades;
    }
    public get techtree(): TechtreeInfo[] {
        return this._techtree;
    }
}
