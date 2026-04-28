const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  MapArchiveObject,
  MdxModelObject,
  RawFileObject,
  loadStormArchiveModule
} = require("../dist/src/index");

const mapsDir = process.env.WAR3_MAPS_DIR || "D:/Games/Warcraft III/Maps";
const maxEntries = Number(process.env.WAR3_MAP_MAX_ENTRIES || 20000);
const maxBytes = Number(process.env.WAR3_MAP_MAX_BYTES || 64 * 1024 * 1024);
const mapLimit = process.env.WAR3_MAP_LIMIT ? Number(process.env.WAR3_MAP_LIMIT) : undefined;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(filePath, out);
    } else if (/\.(w3x|w3m)$/i.test(entry.name)) {
      out.push(filePath);
    }
  }
  return out;
}

function sha1(buffer) {
  return crypto.createHash("sha1").update(buffer).digest("hex");
}

function isGeneratedArchiveEntry(name) {
  return /^\(.+\)$/.test(name);
}

const storm = loadStormArchiveModule();
const maps = walk(mapsDir).slice(0, mapLimit);
const result = {
  maps: maps.length,
  files: 0,
  mismatches: [],
  dumpFailures: [],
  knownChunkErrors: [],
  parseErrors: [],
  rawFiles: [],
  readFailures: []
};

for (const mapPath of maps) {
  let entries;
  try {
    entries = storm
      .listFiles(mapPath, "*", { maxEntries })
      .filter((entry) => !isGeneratedArchiveEntry(entry.name || ""));
  } catch (error) {
    result.readFailures.push({ map: path.basename(mapPath), stage: "list", error: error.message });
    continue;
  }

  const originals = new Map();
  for (const entry of entries) {
    try {
      originals.set(entry.name, storm.readFile(mapPath, entry.name, { maxBytes }));
    } catch (error) {
      result.readFailures.push({ map: path.basename(mapPath), file: entry.name, stage: "readFile", error: error.message });
    }
  }

  let archive;
  try {
    archive = new MapArchiveObject(storm);
    archive.readArchive(mapPath, { maxEntries, maxBytes });
  } catch (error) {
    result.readFailures.push({ map: path.basename(mapPath), stage: "readArchive", error: error.message });
    continue;
  }

  for (const file of archive.files) {
    if (file.object instanceof RawFileObject) {
      result.rawFiles.push({
        map: path.basename(mapPath),
        file: file.name
      });
    }

    if (file.object instanceof MdxModelObject) {
      file.object.knownChunkErrors.forEach((error) => {
        result.knownChunkErrors.push({
          map: path.basename(mapPath),
          file: file.name,
          tag: error.tag,
          message: error.message
        });
      });
    }

    if (file.parseError) {
      result.parseErrors.push({
        map: path.basename(mapPath),
        file: file.name,
        error: file.parseError
      });
    }

    const original = originals.get(file.name);
    if (!original) {
      continue;
    }
    result.files += 1;

    let dumped;
    try {
      dumped = file.object.dump();
    } catch (error) {
      result.dumpFailures.push({
        map: path.basename(mapPath),
        file: file.name,
        type: file.object.constructor.name,
        error: error.message
      });
      continue;
    }

    if (!original.equals(dumped)) {
      let firstDiff = -1;
      const limit = Math.min(original.length, dumped.length);
      for (let index = 0; index < limit; ++index) {
        if (original[index] !== dumped[index]) {
          firstDiff = index;
          break;
        }
      }
      if (firstDiff < 0 && original.length !== dumped.length) {
        firstDiff = limit;
      }
      result.mismatches.push({
        map: path.basename(mapPath),
        file: file.name,
        type: file.object.constructor.name,
        originalLength: original.length,
        dumpedLength: dumped.length,
        firstDiff,
        originalSha1: sha1(original),
        dumpedSha1: sha1(dumped)
      });
    }
  }
}

console.log(JSON.stringify(result, null, 2));

if (
  result.readFailures.length > 0 ||
  result.dumpFailures.length > 0 ||
  result.knownChunkErrors.length > 0 ||
  result.parseErrors.length > 0 ||
  result.mismatches.length > 0
) {
  process.exitCode = 1;
}
