
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

import CharRange from "./char-range";
import TokenParser from "./token-parser";

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
    const it = new CharRange(s);

    const p = TokenParser.createDefault();
    const type = p.parse(it, ";").toLowerCase();

    const params: ContentDispositionParams = {};
    while (it.hasNext()) {

        let name = p.parse(it, "=");
        if (name.length === 0 && !it.hasNext()) {
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
            e.encoding = p.parse(it, "'");
            e.language = p.parse(it, "'");
            e.extValue = p.withPercentEncoding(e.encoding).parse(it, ";");
        } else {
            e.value = p.parse(it, ";");
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