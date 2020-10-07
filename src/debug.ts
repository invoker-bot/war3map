import {CamerasTranslator} from "./CamerasTranslator";
import {readFileSync,writeFileSync} from "fs";
const translator=new CamerasTranslator();
        const buff=readFileSync("./test/w3x/war3map.w3c");
        writeFileSync("./test/json/w3c.json",JSON.stringify(translator.bufferToObject(buff) ));