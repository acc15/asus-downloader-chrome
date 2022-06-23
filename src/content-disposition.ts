
/*
    Following RFC describes Content-Disposition grammar: https://datatracker.ietf.org/doc/html/rfc6266
    Next comments are direct copy-paste of grammar components
 */

/*

    CHAR           = <any US-ASCII character (octets 0 - 127)>
    CR             = <US-ASCII CR, carriage return (13)>
    LF             = <US-ASCII LF, linefeed (10)>
    UPALPHA        = <any US-ASCII uppercase letter "A".."Z">
    LOALPHA        = <any US-ASCII lowercase letter "a".."z">
    ALPHA          = UPALPHA | LOALPHA
    DIGIT          = <any US-ASCII digit "0".."9">
    CRLF           = CR LF
    SP             = <US-ASCII SP, space (32)>
    HT             = <US-ASCII HT, horizontal-tab (9)>
    LWS            = [CRLF] 1*( SP | HT )
    CTL            = <any US-ASCII control character (octets 0 - 31) and DEL (127)>
    TEXT           = <any OCTET except CTLs, but including LWS>
    separators     = "(" | ")" | "<" | ">" | "@"
                   | "," | ";" | ":" | "\" | <">
                   | "/" | "[" | "]" | "?" | "="
                   | "{" | "}" | SP | HT
    token          = 1*<any CHAR except CTLs or separators>
    quoted-string  = ( <"> *(qdtext | quoted-pair ) <"> )
    qdtext         = <any TEXT except <">>
    quoted-pair    = "\" CHAR
    ext-value      = charset  "'" [ language ] "'" value-chars
                   ; like RFC 2231's <extended-initial-value>
                   ; (see [RFC2231], Section 7)
    charset        = "UTF-8" / "ISO-8859-1" / mime-charset
    mime-charset   = 1*mime-charsetc
    mime-charsetc  = ALPHA / DIGIT
                   / "!" / "#" / "$" / "%" / "&"
                   / "+" / "-" / "^" / "_" / "`"
                   / "{" / "}" / "~"
                   ; as <mime-charset> in Section 2.3 of [RFC2978]
                   ; except that the single quote is not included
                   ; SHOULD be registered in the IANA charset registry

    value-chars    = *( pct-encoded / attr-char )
    pct-encoded    = "%" HEXDIG HEXDIG
                   ; see [RFC3986], Section 2.1
    attr-char      = ALPHA / DIGIT
                   / "!" / "#" / "$" / "&" / "+" / "-" / "."
                   / "^" / "_" / "`" / "|" / "~"
                   ; token except ( "*" / "'" / "%" )

     content-disposition = "Content-Disposition" ":"
                            disposition-type *( ";" disposition-parm )

     disposition-type    = "inline" | "attachment" | disp-ext-type
                         ; case-insensitive
     disp-ext-type       = token
     disposition-parm    = filename-parm | disp-ext-parm
     filename-parm       = "filename" "=" value
                         | "filename*" "=" ext-value
     disp-ext-parm       = token "=" value
                         | ext-token "=" ext-value
     ext-token           = <the characters in token, followed by "*">

 */

export class CharIterator {
    value: string;
    position: number;
    end: number;

    constructor(value: string, start = 0, end = value.length) {
        this.value = value;
        this.position = start;
        this.end = end;
    }

    hasNext(count = 1): boolean {
        return this.position + (count - 1) < this.end;
    }

    skip(count = 1) {
        this.position += count;
    }

    next(count = 1): string {
        if (count == 1) {
            return this.value[this.position++];
        }
        const start = this.position;
        this.position += count;
        return this.value.substring(start, this.position);
    }

    sub(start: number, end: number) {
        return new CharIterator(this.value, start, end);
    }

}

const defaultEncoding = "utf-8";

export function decodePercent(iter: CharIterator, quoted: boolean, encoding: string = defaultEncoding): string {
    let t: TextDecoder | null = null;
    try {
        t = new TextDecoder(encoding);
    } catch (e) {
        console.debug(e);
    }

    let result = "";
    let chunk = [];
    while (iter.hasNext()) {
        const ch = iter.next();
        if (t && ch !== '%' && chunk.length > 0) {
            result += t.decode(new Uint8Array(chunk));
            chunk = [];
        }
        if (quoted && ch === '\\') {
            result += iter.next();
            continue;
        }
        if (t && ch === '%') {
            chunk.push(parseInt(iter.next(2), 16));
            continue;
        }
        result += ch;
    }
    if (chunk.length > 0 && t) {
        result += t.decode(new Uint8Array(chunk));
    }
    return result;
}

export function decodeToken(iter: CharIterator, encoding: string = defaultEncoding): string {
    let result = "";
    let inQuote = false;
    let chunkStart = iter.position;
    while (iter.hasNext()) {
        const ch = iter.next();
        if (inQuote && ch === '\\') {
            iter.skip();
            continue;
        }
        if (ch === '"') {
            result += decodePercent(iter.sub(chunkStart, iter.position - 1), inQuote, encoding);
            chunkStart = iter.position;
            inQuote = !inQuote;
        }
    }
    if (iter.position > chunkStart) {
        result += decodePercent(iter.sub(chunkStart, iter.position), inQuote, encoding);
    }
    return result;
}

export function eatToken(iter: CharIterator, stop: string, encoding: string = defaultEncoding): string {
    let inQuote = false;

    const start = iter.position;
    while (iter.hasNext()) {
        const ch = iter.next();
        if (inQuote) {
            if (ch === '\\') {
                iter.skip();
            } else if (ch === '"') {
                inQuote = false;
            }
        } else if (ch === stop) {
            break;
        } else if (ch === '"') {
            inQuote = true;
        }
    }

    return decodeToken(new CharIterator(iter.value.substring(start, iter.position - (iter.hasNext() ? 1 : 0)).trim()), encoding);
}

export interface ContentDispositionValue {
    value?: string,
    extValue?: string,
    language?: string,
    encoding?: string
}

export type ContentDispositionParams = { [k: string]: ContentDispositionValue };

export interface ContentDisposition {
    type: string,
    params: ContentDispositionParams
}

export function parseContentDisposition(s: string): ContentDisposition {
    const iter = new CharIterator(s);
    const type = eatToken(iter, ";").toLowerCase();

    const params: ContentDispositionParams = {};
    while (iter.hasNext()) {

        let name = eatToken(iter, "=");
        if (name.length === 0 && !iter.hasNext()) {
            break;
        }

        const extParam = name.endsWith("*");
        if (extParam) {
            name = name.substring(0, name.length - 1);
        }
        name = name.toLowerCase();

        let e = params[name];
        if (!e) {
            params[name] = e = {};
        }

        if (extParam) {
            e.encoding = eatToken(iter, "'");
            e.language = eatToken(iter, "'");
            e.extValue = eatToken(iter, ";", e.encoding || defaultEncoding);
        } else {
            e.value = eatToken(iter, ";");
        }

    }
    return { type, params };
}

export function getFileNameFromContentDisposition(header: string | null): string | null {
    if (!header) {
        return null;
    }
    const cd = parseContentDisposition(header);
    const filename = cd.params.filename;
    return (filename && (filename.extValue || filename.value)) || null;
}