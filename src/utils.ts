import contentDisposition, {ContentDisposition} from "content-disposition";

export type GenericMap<T> = { [k:string]: T };
export type StringMap = GenericMap<string>;
export type StrNumMap = GenericMap<string | number>;
export type QueryMap = GenericMap<Array<string | undefined>>;

const MAGNET_URL_PREFIX = "magnet:";

export function toUrlEncodedPair(key: string, value: string | number): string {
    return encodeURIComponent(key) + "=" + encodeURIComponent(String(value));
}

export function toUrlEncodedFormData(obj: StrNumMap): string {
    return Object.keys(obj).map(k => toUrlEncodedPair(k, obj[k])).join("&");
}

export function isSuccessfulStatus(status: number): boolean {
    return status >= 200 && status < 300;
}

export function unexpectedErrorHandler(err: unknown): void {
    console.log(`Unexpected error occurred: ${String(err)}`);
}

export function getFileNameFromContentDispositionHeader(header: string | null): string | undefined {
    if (!header) {
        return undefined;
    }

    const cd: ContentDisposition = contentDisposition.parse(header);
    const p = cd.parameters as StringMap;
    return p && p.filename || undefined;
}

export function getFileNameFromContentDisposition(req: XMLHttpRequest): string | undefined {
    return getFileNameFromContentDispositionHeader(req.getResponseHeader("Content-Disposition"));
}

export function decodeQueryComponent(comp: string): string {
    return decodeURIComponent(comp.replace(/\+/g, ' '));
}

export function parseQueryString(str: string): QueryMap {
    const result: QueryMap = {};

    str = str.substring(str.indexOf("?") + 1);
    for (const pair of str.split("&")) {

        const eqIndex = pair.indexOf("=");
        const name = decodeQueryComponent(eqIndex >= 0 ? pair.substring(0, eqIndex) : pair);
        const value = eqIndex >= 0 ? decodeQueryComponent(pair.substring(eqIndex + 1)) : undefined;

        let array = result[name];
        if (!array) {
            result[name] = array = [];
        }

        array.push(value);
    }
    return result;
}

export function getMagnetFileNameOrUrl(url: string): string {
    const qs = parseQueryString(url.substring(MAGNET_URL_PREFIX.length + 1));
    const dn = qs['dn'];
    return dn && dn.filter(Boolean)[0] || url;
}

export function getFileNameOrUrl(url: string): string {
    if (url.length === 0) {
        return url;
    }

    if (url.startsWith(MAGNET_URL_PREFIX)) {
        return getMagnetFileNameOrUrl(url);
    }

    let p = new URL(url).pathname;

    const lastSlash = p.lastIndexOf("/");
    if (lastSlash >= 0) {
        p = p.substring(lastSlash + 1);
    }
    return decodeURIComponent(p);
}

export function isTorrentFile(req: XMLHttpRequest, fileName: string): boolean {
    const probablyTorrentContentTypes = [
        "application/x-bittorrent",
        "application/octet-stream",
        "application/octet_stream",
        "application/force-download"
    ];

    const contentType = req.getResponseHeader("Content-Type");
    if (!contentType) {
        return false;
    }
    if (!probablyTorrentContentTypes.some(c => contentType.indexOf(c) >= 0)) {
        return false;
    }
    return fileName ? fileName.endsWith(".torrent") : false;
}
