import {parseQueryString} from "./util";

export const enum Proto {
    Unknown,
    Torrent,
    Ed2k,
    Magnet,
    Ftp
}

export interface ProtoDescriptor {
    name: string,
    urlPrefix?: string
}

export const protoDescriptors: { [K in Proto]: ProtoDescriptor } = {
    [Proto.Unknown]: { name: "File"},
    [Proto.Torrent]: { name: "Torrent file" },
    [Proto.Ed2k]: { name: "ED2K file", urlPrefix: "ed2k:" },
    [Proto.Magnet]: { name: "Magnet URL", urlPrefix: "magnet:" },
    [Proto.Ftp]: { name: "FTP file", urlPrefix: "ftp:" }
}

export function isMagnetUrl(url: string) {
    const desc = protoDescriptors[Proto.Magnet];
    return desc.urlPrefix && url.startsWith(desc.urlPrefix);
}

export function getProtoByUrl(url: string): Proto {
    for (const p in protoDescriptors) {
        const proto = Number(p) as Proto;
        const desc = protoDescriptors[proto];
        if (desc.urlPrefix && url.startsWith(desc.urlPrefix)) {
            return proto;
        }
    }
    return Proto.Unknown;
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

