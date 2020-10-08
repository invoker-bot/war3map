
export interface Translator{
    objectToBuffer:(object:any)=>Buffer;
    bufferToObject:(buffer:Buffer)=>any;
}

