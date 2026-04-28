/**
 *  @packageDocumentation
 */
import { createRequire } from "module";
import * as path from "path";
import { ReadDumpObject } from "./BinaryBuffer";
import { AiScriptObject } from "./AiScriptObject";
import { AudioFileObject } from "./AudioFileObject";
import { BlpImageObject } from "./BlpImageObject";
import { CamerasObject } from "./CamerasObject";
import { CustomTextTriggerObject } from "./CustomTextTriggerObject";
import { DdsImageObject } from "./DdsImageObject";
import { DoodadsObject } from "./DoodadsObject";
import { EnvironmentObject } from "./EnvironmentObject";
import { GameConfigurationObject } from "./GameConfigurationObject";
import { InfoObject } from "./InfoObject";
import { ImportsObject } from "./ImportsObject";
import { MenuMinimapObject } from "./MenuMinimapObject";
import { MdxModelObject } from "./MdxModelObject";
import { ObjectsObject } from "./ObjectsObject";
import { PathmapObject } from "./PathmapObject";
import { RawFileObject } from "./RawFileObject";
import { RegionObject } from "./RegionObject";
import { ShadowObject } from "./ShadowObject";
import { SoundsObject } from "./SoundsObject";
import { StringsObject } from "./StringsObject";
import { TextFileObject } from "./TextFileObject";
import { TgaImageObject } from "./TgaImageObject";
import { TriggerNamesObject } from "./TriggerNamesObject";
import { UnitsObject } from "./UnitsObject";

const dynamicRequire = createRequire(__filename);

export interface StormArchiveEntry {
    name: string;
    size?: number;
}

export interface StormArchiveModule {
    listFiles(archivePath: string, mask?: string, options?: { maxEntries?: number }): StormArchiveEntry[];
    readFile(archivePath: string, fileName: string, options?: { maxBytes?: number }): Buffer;
    createArchive(archivePath: string, options?: {
        rootDir?: string;
        overwrite?: boolean;
        maxFileCount?: number;
        version?: 1 | 2 | 3 | 4;
    }): boolean;
    writeFile(archivePath: string, archivedName: string, data: Buffer, options?: {
        rootDir?: string;
        maxBytes?: number;
        compression?: string | number | boolean;
        replaceExisting?: boolean;
    }): boolean;
    compactArchive(archivePath: string, options?: { rootDir?: string }): boolean;
}

export interface MapArchiveReadOptions {
    mask?: string;
    maxEntries?: number;
    maxBytes?: number;
    fallbackToRaw?: boolean;
}

export interface MapArchiveWriteOptions {
    rootDir?: string;
    overwrite?: boolean;
    maxFileCount?: number;
    maxBytes?: number;
    compression?: string | number | boolean;
    version?: 1 | 2 | 3 | 4;
    compact?: boolean;
}

export interface MapArchiveFile {
    name: string;
    object: ReadDumpObject;
    raw: boolean;
    parseError?: string;
}

function tryRequire(modulePath: string): StormArchiveModule | undefined {
    try {
        const loadedModule = dynamicRequire(modulePath) as StormArchiveModule;
        if (loadedModule && typeof loadedModule.listFiles === "function" && typeof loadedModule.readFile === "function") {
            return loadedModule;
        }
    } catch (_error) {
        return undefined;
    }
    return undefined;
}

export function loadStormArchiveModule(): StormArchiveModule {
    const candidates = [
        process.env.NODE_STORMLIB_PATH,
        "node-stormlib",
        path.resolve(process.cwd(), "..", "node-storm"),
        path.resolve(process.cwd(), "..", "node-stormlib")
    ].filter((candidate): candidate is string => !!candidate);

    for (const candidate of candidates) {
        const module = tryRequire(candidate);
        if (module) {
            return module;
        }
    }

    throw new Error("Cannot load node-stormlib. Install it or set NODE_STORMLIB_PATH to the local node-storm directory.");
}

function normalizeArchiveName(name: string): string {
    return name.replace(/\\/g, "/").toLowerCase();
}

function isGeneratedArchiveEntry(name: string): boolean {
    return /^\(.+\)$/.test(name);
}

function createRawFile(buffer?: Buffer): RawFileObject {
    const object = new RawFileObject();
    if (buffer) {
        object.read(buffer);
    }
    return object;
}

export function createMapFileObject(name: string, context?: { pathmap?: PathmapObject }): ReadDumpObject {
    const normalizedName = normalizeArchiveName(name);
    const basename = path.posix.basename(normalizedName);

    switch (normalizedName) {
        case "war3map.wgc":
        case "map.wgc":
        case "testconfig.wgc":
            return new GameConfigurationObject();
        case "war3map.w3e":
            return new EnvironmentObject();
        case "war3mapunits.doo":
            return new UnitsObject();
        case "war3map.doo":
            return new DoodadsObject();
        case "war3map.w3r":
            return new RegionObject();
        case "war3map.w3c":
            return new CamerasObject();
        case "war3map.w3s":
            return new SoundsObject();
        case "war3map.wai":
            return new AiScriptObject();
        case "war3map.imp":
            return new ImportsObject();
        case "war3map.wts":
            return new StringsObject();
        case "war3map.w3i":
            return new InfoObject();
        case "war3map.wct":
            return new CustomTextTriggerObject();
        case "war3map.wtg":
            return new TriggerNamesObject();
        case "war3map.mmp":
            return new MenuMinimapObject();
        case "war3map.wpm":
            return new PathmapObject();
        case "war3map.shd":
            if (context && context.pathmap) {
                return new ShadowObject(context.pathmap.pathWidth / 4, context.pathmap.pathHeight / 4);
            }
            return new RawFileObject();
        case "war3map.w3u":
        case "war3map.w3t":
        case "war3map.w3b":
        case "war3map.w3h":
            return new ObjectsObject(false);
        case "war3map.w3d":
        case "war3map.w3a":
        case "war3map.w3q":
            return new ObjectsObject(true);
        case "war3map.j":
        case "war3map.lua":
            return new TextFileObject();
        default:
            if (basename.endsWith(".wgc")) {
                return new GameConfigurationObject();
            }
            if (basename.endsWith(".wai")) {
                return new AiScriptObject();
            }
            if (basename.endsWith(".mdx")) {
                return new MdxModelObject();
            }
            if (basename.endsWith(".blp") || basename.endsWith(".b00")) {
                return new BlpImageObject();
            }
            if (basename.endsWith(".dds")) {
                return new DdsImageObject();
            }
            if (basename.endsWith(".tga")) {
                return new TgaImageObject();
            }
            if (basename.endsWith(".wav")) {
                return new AudioFileObject("WAVE");
            }
            if (basename.endsWith(".mp3")) {
                return new AudioFileObject("MP3");
            }
            if (/\.(ai|fdf|ini|mdl|slk|toc|txt)$/i.test(basename)) {
                return new TextFileObject();
            }
            return new RawFileObject();
    }
}

/**
 * MapArchiveObject reads and writes Warcraft III .w3m/.w3x/.mpq archives through node-stormlib.
 */
export class MapArchiveObject {
    protected _files: MapArchiveFile[] = [];
    protected _storm: StormArchiveModule;

    constructor(storm: StormArchiveModule = loadStormArchiveModule()) {
        this._storm = storm;
    }

    public readArchive(archivePath: string, options: MapArchiveReadOptions = {}): void {
        const fallbackToRaw = options.fallbackToRaw !== false;
        const entries = this._storm
            .listFiles(archivePath, options.mask || "*", { maxEntries: options.maxEntries })
            .filter((entry) => !isGeneratedArchiveEntry(entry.name));
        const buffers = new Map<string, Buffer>();

        entries.forEach((entry) => {
            buffers.set(entry.name, this._storm.readFile(archivePath, entry.name, { maxBytes: options.maxBytes }));
        });

        const pathmap = this.readPathmapFirst(buffers);
        this._files = [];

        entries.forEach((entry) => {
            if (pathmap && normalizeArchiveName(entry.name) === "war3map.wpm") {
                this._files.push({ name: entry.name, object: pathmap, raw: false });
                return;
            }

            const buffer = buffers.get(entry.name);
            if (!buffer) {
                return;
            }

            const object = createMapFileObject(entry.name, { pathmap });
            try {
                object.read(buffer);
                this._files.push({ name: entry.name, object, raw: object instanceof RawFileObject });
            } catch (error) {
                if (!fallbackToRaw) {
                    throw error;
                }
                this._files.push({
                    name: entry.name,
                    object: createRawFile(buffer),
                    raw: true,
                    parseError: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }

    public writeArchive(archivePath: string, options: MapArchiveWriteOptions = {}): void {
        const rootDir = options.rootDir || path.dirname(archivePath);
        this._storm.createArchive(archivePath, {
            rootDir,
            overwrite: options.overwrite,
            maxFileCount: options.maxFileCount || Math.max(64, this._files.length * 2),
            version: options.version
        });

        this._files.forEach((file) => {
            if (isGeneratedArchiveEntry(file.name)) {
                return;
            }
            this._storm.writeFile(archivePath, file.name, file.object.dump(), {
                rootDir,
                maxBytes: options.maxBytes,
                compression: options.compression === undefined ? "zlib" : options.compression,
                replaceExisting: true
            });
        });

        if (options.compact !== false) {
            this._storm.compactArchive(archivePath, { rootDir });
        }
    }

    public get files(): MapArchiveFile[] {
        return this._files;
    }
    public set files(files: MapArchiveFile[]) {
        this._files = files;
    }

    public getFile(name: string): MapArchiveFile | undefined {
        const normalizedName = normalizeArchiveName(name);
        return this._files.find((file) => normalizeArchiveName(file.name) === normalizedName);
    }

    public setFile(name: string, object: ReadDumpObject, raw = object instanceof RawFileObject): void {
        const normalizedName = normalizeArchiveName(name);
        const existing = this._files.find((file) => normalizeArchiveName(file.name) === normalizedName);
        if (existing) {
            existing.object = object;
            existing.raw = raw;
            delete existing.parseError;
            return;
        }
        this._files.push({ name, object, raw });
    }

    protected readPathmapFirst(buffers: Map<string, Buffer>): PathmapObject | undefined {
        for (const [name, buffer] of buffers) {
            if (normalizeArchiveName(name) === "war3map.wpm") {
                const pathmap = new PathmapObject();
                pathmap.read(buffer);
                return pathmap;
            }
        }
        return undefined;
    }
}
