import CharIterator from "./char-iterator";
import {decodePercent, toCharCodes} from "../util";

const defaultEncoding = "utf-8";

const enum ChunkType {
    PLAIN,
    PERCENT,
    UTF8
}

const wsChars = " \t\r\n";

function isWhitespace(ch: string): boolean {
    return wsChars.indexOf(ch) >= 0;
}

export default class TokenParser {

    ud: TextDecoder;
    pd: TextDecoder;

    constructor(ud: TextDecoder, pd: TextDecoder) {
        this.ud = ud;
        this.pd = pd;
    }

    withPercentEncoding(e: string | undefined): TokenParser {
        if (!e || e.toLowerCase() === this.pd.encoding.toLowerCase()) {
            return this;
        }
        try {
            return new TokenParser(this.ud, new TextDecoder(e));
        } catch (e) {
            console.log("Unable to create TextDecoder", e);
            return this;
        }
    }

    decodeChunk(type: ChunkType, chunk: string): string {
        if (type === ChunkType.PLAIN) {
            return chunk;
        }

        const chunkBytes = type === ChunkType.PERCENT
            ? decodePercent(chunk)
            : toCharCodes(chunk);

        const decoder = type === ChunkType.PERCENT ? this.pd : this.ud;
        return decoder.decode(new Uint8Array(chunkBytes));
    }

    decode(token: string): string {
        let result = "";

        let chunkType = ChunkType.PLAIN;
        let chunkStart = 0;
        for (let i = 0; i < token.length; i++) {

            const ch = token.charAt(i);
            const charCode = token.charCodeAt(i);

            const curChunkType = ch === '%' ? ChunkType.PERCENT
                : charCode >= 0x80 && charCode <= 0xFF ? ChunkType.UTF8
                : ChunkType.PLAIN;

            if (chunkType != curChunkType) {
                if (chunkStart !== i) {
                    result += this.decodeChunk(chunkType, token.substring(chunkStart, i));
                    chunkStart = i;
                }
                chunkType = curChunkType;
            }

            if (curChunkType === ChunkType.PERCENT) {
                i += 2;
            }
        }
        if (chunkStart != token.length) {
            result += this.decodeChunk(chunkType, token.substring(chunkStart, token.length));
        }
        return result;
    }

    parse(it: CharIterator, stop: string): string {
        while (it.hasNext() && isWhitespace(it.char())) {
            it.skip();
        }

        let token = "";
        let inQuote = false;
        let lastNonWs = 0;

        while (it.hasNext()) {
            const ch = it.next();
            if (ch === '\\') {
                token += it.next();
            } else if (!inQuote && ch === stop) {
                break;
            } else if (ch === '"') {
                inQuote = !inQuote;
            } else {
                token += ch;
            }
            if (inQuote || !isWhitespace(ch)) {
                lastNonWs = token.length;
            }
        }

        return this.decode(token.substring(0, lastNonWs));
    }

    static createDefault(): TokenParser {
        const d = new TextDecoder(defaultEncoding);
        return new TokenParser(d, d);
    }

}