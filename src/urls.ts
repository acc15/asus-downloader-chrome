import {parseQueryString} from "./utils";

export const enum UrlKind {
    Unknown,
    Torrent,
    Ed2k,
    Magnet,
    Ftp
}

const urlPrefixes: { [k: string]: UrlKind } = {
    "ftp:": UrlKind.Ftp,
    "ed2k:": UrlKind.Ed2k,
    "magnet:": UrlKind.Magnet
};

export function isMagnetUrl(url: string) {
    for (const prefix in urlPrefixes) {
        const kind = urlPrefixes[prefix];
        if (kind === UrlKind.Magnet && url.startsWith(prefix)) {
            return true;
        }
    }
    return false;
}

export function detectUrlKind(url: string): UrlKind {
    for (const prefix in urlPrefixes) {
        if (url.startsWith(prefix)) {
            return urlPrefixes[prefix];
        }
    }
    return UrlKind.Unknown;
}

export function getFileTypeName(type: UrlKind): string {
    switch (type) {
        case UrlKind.Ed2k: return "ED2K file";
        case UrlKind.Magnet: return "Magnet URL";
        case UrlKind.Ftp: return "FTP file";
        case UrlKind.Torrent: return "Torrent file";
        default: return "File";
    }
}

export function getMagnetFileNameByUrl(url: string) {
    return parseQueryString(url).get("dn") || url;
}

export function getFileNameByUrl(url: string) {
    if (url.length === 0) {
        return url;
    }

    if (isMagnetUrl(url)) {
        return getMagnetFileNameByUrl(url);
    }

    let p = new URL(url).pathname;

    const lastSlash = p.lastIndexOf("/");
    if (lastSlash >= 0) {
        p = p.substring(lastSlash + 1);
    }
    return decodeURIComponent(p);
}