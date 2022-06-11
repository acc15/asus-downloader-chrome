import contentDisposition from "content-disposition";

export interface Options {
    url: string;
    user: string;
    pwd: string;
}

const defaultOptions: Options = {
    url: "http://router.asus.com:8081",
    user: "admin",
    pwd: "admin"
};

const magnetUrlPrefix = "magnet:";
const probablyTorrentContentTypes = [
    "application/x-bittorrent",
    "application/octet-stream",
    "application/octet_stream",
    "application/force-download"
];

export const isSuccessfulStatus = (status: number) => status >= 200 && status < 300;
export const unexpectedErrorHandler = (err: unknown) => console.log(`Unexpected error occurred: ${String(err)}`)
export const getFileNameFromCD = (header: string | null) => {
    if (!header) {
        return null;
    }
    const file = contentDisposition.parse(header).parameters.filename;
    if (!file) {
        return null;
    }
    return decodeURIComponent(file);
}
export const parseQueryString = (url: string) => {
    const idx = url.indexOf("?");
    return idx < 0 ? new URLSearchParams() : new URLSearchParams(url.substring(idx + 1));
}
export const getMagnetFileNameOrUrl = (url: string) => parseQueryString(url).get("dn") || url;
export const getFileNameOrUrl = (url: string) => {
    if (url.length === 0) {
        return url;
    }

    if (url.startsWith(magnetUrlPrefix)) {
        return getMagnetFileNameOrUrl(url);
    }

    let p = new URL(url).pathname;

    const lastSlash = p.lastIndexOf("/");
    if (lastSlash >= 0) {
        p = p.substring(lastSlash + 1);
    }
    return decodeURIComponent(p);
}

export const isTorrentFile = (contentType: string | null, fileName: string) => Boolean(
    contentType && probablyTorrentContentTypes.some(c => contentType.indexOf(c) >= 0) && fileName.endsWith(".torrent")
);

export const normalizeUrl = (url: string) => {
    let i = url.length;
    while (i > 0) {
        if (url[i - 1] !== "/") {
            break;
        }
        --i;
    }
    return url.substring(0, i);
}

export const loadOpts = async () => {
    try {
        const opts = await chrome.storage.local.get(defaultOptions) as Options;
        return ({...opts, url: normalizeUrl(opts.url)} as Options);
    } catch (error) {
        console.error("Unable to load options. Using defaults", error);
        return defaultOptions;
    }
}

export const storeOpts = async (opts: Options) => {
    await chrome.storage.local.set(opts);
    return opts;
}
