/* eslint-disable jest/expect-expect */
import * as assert from "assert";
import {BinaryWriteBuffer,BinaryReadBuffer} from '../src/BinaryBuffer';



describe('BinaryWriteBuffer',()=>{
    let binaryWriteBuffer:BinaryWriteBuffer;
    beforeEach(()=>{
        binaryWriteBuffer=new BinaryWriteBuffer();
    });
    it('should writeString', () => {
        const testWords = [
            'Hallo, wêreld!', // Afrikaans
            'Pershëndetje Botë', // Albanian
            'أهلاً بالعالم', // Arabic
            'Բարե՛ւ, աշխարհ։', // Armenian
            'Salam Dünya', // Azeri
            'Ahoj Světe!', // Czech
            'Kaixo mundua!', // Basque/Euskara
            'Прывітанне свет', // Belarusian
            'Shani Mwechalo!', // Bemba
            'Shagatam Prithivi!', // Bengali
            'Zdravo Svijete!', // Bosnian
            'Здравей, свят!', // Bulgarian
            'ជំរាបសួរ ពិភពលោក', // Cambodian
            'Hola món!', // Catalan
            '你好世界', // Chinese
            'ᎣᏏᏲ ᎡᎶᎯ', // Cherokee
            'Klahowya Hayas Klaska', // Chinook Wawa
            'Bok Svijete!', // Croatian
            'Hej, Verden!', // Danish
            'Hallo, wereld!', // Dutch
            'Hello World!', // English
            'Saluton mondo!', // Esperanto
            'Tere maailm!', // Estonian
            'Hei maailma!', // Finnish
            'Salut le Monde!', // French
            'Hallo, wrâld!', // Frisian
            'Ola mundo!', // Galician
            'Hallo Welt!', // German
            'Γεια σου κόσμε!', // Greek
            'Aloha Honua', // Hawaiian
            'שלום עולם', // Hebrew
            'नमस्ते दुनिया', // Hindi
            'Nyob zoo ntiaj teb.', // Hmong
            'Helló világ!', // Hungarian
            'Halló heimur!', // Icelandic
            'Ndewo Ụwa', // Igbo
            'Halo Dunia!', // Indonesian
            'Dia dhaoibh, a dhomhain!', // Irish
            'Ciao Mondo!', // Italian
            'こんにちは、 世界！', // Japanese
            'ಹಲೋ ವರ್ಲ್ಡ್', // Kannada
            'Habari dunia!', // Kiswahili
            'Niatia thi!', // Kikuyu
            'nuqneH', // Klingon
            '반갑다 세상아', // Korean
            'ສະບາຍດີ,ໂລກ', // Lao
            'AVE MVNDE', // Latin
            'Sveika, Pasaule!', // Latvian
            'Sveikas, Pasauli', // Lithuanian
            'coi li terdi', // Lojban
            'Moien Welt!', // Luxembourgish
            'Manao ahoana ry tany!', // Malagasy
            'Namaskaram, lokame', // Malayalam
            'Merhba lid-dinja', // Maltese
            'Hallo verden!', // Norwegian
            '!سلام دنیا', // Persian
            'Witaj świecie!', // Polish
            'Olá, mundo!', // Portuguese
            'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨਿਆ', // Punjabi
            'Salut lume!', // Romanian
            'Здравствуй, мир!', // Russian
            'Halò, a Shaoghail!', // Scots Gaelic
            'Zdravo Svete!', // Serbian
            'Ahoj, svet!', // Slovak
            'Pozdravljen svet!', // Slovenian
            '¡Hola mundo!', // Spanish
            'Hallå världen!', // Swedish
            'Kamusta mundo!', // Tagalog
            'ஹலோ உலகம்', // Tamil
            'హలో వరల్డ్', // Telugu
            'สวัสดีโลก!', // Thai
            'Merhaba Dünya!', // Turkish
            'Привiт, свiте!', // Ukrainian
            'ہیلو دنیا والو', // Urdu
            'Xin chào thế giới', // Vietnamese
            'S\'mae byd!', // Welsh
            'העלא וועלט', // Yiddish
            'Sawubona Mhlaba' // Zulu
        ];
        let totalLength = 0;
        // tslint:disable-next-line: forin
        for (const word of testWords) {
            const bufLength = Buffer.from(word).length;
            binaryWriteBuffer.writeString(word, false);
            totalLength += bufLength;
            const bufferLength = binaryWriteBuffer.getBuffer().length;
            assert.strictEqual(bufferLength, totalLength);
        }
    });
    it('should writeString(terminated)', () => {
        binaryWriteBuffer.writeString('abcABC', true); //65 97
        assert.strictEqual(binaryWriteBuffer.getBuffer().length,7);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0],97);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[1],98);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[2],99);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[3],65);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[4],66);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[5],67);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[6],0);
    });

    it('should writeNewLine', () => {
        binaryWriteBuffer.writeNewLine();
        assert.strictEqual(binaryWriteBuffer.getBuffer().length, 2);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0], 0x0d);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[1], 0x0a);
    });

    it('should writeChar', () => {
        binaryWriteBuffer.writeChar('A');
        assert.strictEqual(binaryWriteBuffer.getBuffer().length, 1);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0], 65); // charcode for the ASCII letter "A"
    });

    it('should writeInt(little-endian)', () => {
        binaryWriteBuffer.writeInt(0x12345678);
        assert.strictEqual(binaryWriteBuffer.getBuffer().length, 4); // integer is 4 bytes in length
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0], 0x78);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[1], 0x56);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[2], 0x34);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[3], 0x12);
    });

    it('should writeShort(little-endian)', () => {
        binaryWriteBuffer.writeShort(0x7876);
        assert.strictEqual(binaryWriteBuffer.getBuffer().length, 2); // 2 bytes in length
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0], 0x76);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[1], 0x78);
    });

    it('should writeFloat', () => {
        binaryWriteBuffer.writeFloat(1.234);
        assert.strictEqual(binaryWriteBuffer.getBuffer().length, 4); // 4 bytes in length
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0], 0xb6);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[1], 0xf3);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[2], 0x9d);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[3], 0x3f);
    });

    it('should writeByte', () => {
        binaryWriteBuffer.writeByte(15);
        assert.strictEqual(binaryWriteBuffer.getBuffer().length, 1);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0], 15);
    });
    it("should writeNullString",()=>{
        binaryWriteBuffer.writeString("\0\n \t\0",true);
        assert.strictEqual(binaryWriteBuffer.getBuffer().length,6);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0],0);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[4],0);

        assert.strictEqual(binaryWriteBuffer.getBuffer()[5],0);
    });
    it('should writeNullTerminator', () => {
        binaryWriteBuffer.writeNullTerminator();
        assert.strictEqual(binaryWriteBuffer.getBuffer().length, 1);
        assert.strictEqual(binaryWriteBuffer.getBuffer()[0], 0);
    });


});



describe('BinaryReadBuffer',()=>{
    it('should readMatchAll',()=>{
        const buffData = Buffer.from([
            0x57, 0x33, 0x64, 0x6f, // char(4): "W3do"
            0x01, 0x02, 0x03, 0x04, // int: 1
            0x00, 0x00, 0x9b, 0xc5, // float: -4960
            0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x00, // string: "WWWWWWW"
            0x02 // byte: 2
        ]);
        const binaryReadBuffer=new BinaryReadBuffer(buffData);
        assert.strictEqual(binaryReadBuffer.readChars(4),'W3do');
        assert.strictEqual(binaryReadBuffer.readInt(),0x04030201);
        assert.strictEqual(binaryReadBuffer.readFloat(),-4960);
        assert.strictEqual(binaryReadBuffer.readString(),"WWWWWWW");
        assert.strictEqual(binaryReadBuffer.readByte(),2);
    });
    it('should readChars',()=>{
        const buffData = Buffer.from([
            0x68,0x65,0x6C,0x6C,0x6F,//hello
            0x77,0x6F,0x72,0x6C,0x64 //world
        ]);
        const binaryReadBuffer=new BinaryReadBuffer(buffData);
        assert.strictEqual(binaryReadBuffer.readChars(5),'hello');
        assert.strictEqual(binaryReadBuffer.readChars(5),"world");
    });

});

describe('BinaryBuffer',()=>{
    it('should readWriteColor',()=>{
        const color=0xFF00FF;
        const binaryWriteBuffer=new BinaryWriteBuffer();
        binaryWriteBuffer.writeColor(color);
        const binaryReadBuffer=new BinaryReadBuffer(binaryWriteBuffer.getBuffer());
        const colorNew=binaryReadBuffer.readColor();
        assert.strictEqual(colorNew,color);
    });

});