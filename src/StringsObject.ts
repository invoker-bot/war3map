/**
 *  @packageDocumentation
 */
import { BinaryWriteBuffer, ReadDumpObject } from "./BinaryBuffer";

export interface StringDefinition {
    id: string;
    comment?: string;
    value: string;
}

const matchStringDefinitionBlock = /STRING ([0-9]+)\r?\n?(\/\/.*\r?\n?)?{\r?\n((?:.|\r?\n)*?)\r?\n}/g;

/**
 * StringsObject parses data from "war3map.wts" file and can dump back.
 */
export class StringsObject implements ReadDumpObject {
    protected _strings: StringDefinition[] = [];
    protected _source: Buffer | undefined;
    protected _sourceStrings: StringDefinition[] = [];

    public read(buffer: Buffer): void {
        this._source = Buffer.from(buffer);
        this._strings = [];
        const text = buffer.toString("utf8");
        matchStringDefinitionBlock.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = matchStringDefinitionBlock.exec(text)) !== null) {
            const [, id, comment, value] = match;
            const stringDefinition: StringDefinition = { id, value };
            if (comment) {
                stringDefinition.comment = comment.replace(/\r?\n$/, "");
            }
            this._strings.push(stringDefinition);
        }
        this._sourceStrings = StringsObject.cloneStrings(this._strings);
    }

    public dump(): Buffer {
        if (this._source && StringsObject.areStringsEqual(this._strings, this._sourceStrings)) {
            return Buffer.from(this._source);
        }

        const writer = new BinaryWriteBuffer();
        this._strings.forEach((stringDefinition) => {
            writer.writeString(`STRING ${stringDefinition.id}`);
            writer.writeNewLine();
            if (stringDefinition.comment) {
                writer.writeString(stringDefinition.comment.replace(/\r?\n$/, ""));
                writer.writeNewLine();
            }
            writer.writeChar("{");
            writer.writeNewLine();
            writer.writeString(stringDefinition.value);
            writer.writeNewLine();
            writer.writeChar("}");
            writer.writeNewLine();
            writer.writeNewLine();
        });
        return writer.getBuffer();
    }

    public get strings(): StringDefinition[] {
        return this._strings;
    }
    public set strings(_strings: StringDefinition[]) {
        this._strings = _strings;
        this._source = undefined;
        this._sourceStrings = [];
    }

    public getString(id: string): StringDefinition | undefined {
        return this._strings.find((stringDefinition) => stringDefinition.id === id);
    }

    protected static cloneStrings(strings: StringDefinition[]): StringDefinition[] {
        return strings.map((stringDefinition) => ({ ...stringDefinition }));
    }

    protected static areStringsEqual(left: StringDefinition[], right: StringDefinition[]): boolean {
        if (left.length !== right.length) {
            return false;
        }
        return left.every((stringDefinition, index) => {
            const other = right[index];
            return stringDefinition.id === other.id &&
                stringDefinition.comment === other.comment &&
                stringDefinition.value === other.value;
        });
    }
}
