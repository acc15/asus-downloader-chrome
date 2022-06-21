import contentDisposition from "content-disposition";

const probablyTorrentContentTypes = [
    "application/x-bittorrent",
    "application/octet-stream",
    "application/octet_stream",
    "application/force-download"
];

export function isSuccessfulStatus(status: number) {
    return status >= 200 && status < 300;
}

export function getFileNameFromCD(header: string | null): string | null {
    if (!header) {
        return null;
    }
    const file = contentDisposition.parse(header).parameters.filename;
    if (!file) {
        return null;
    }
    return decodeURIComponent(file);
}

export function parseQueryString(url: string) {
    const idx = url.indexOf("?");
    return idx < 0 ? new URLSearchParams() : new URLSearchParams(url.substring(idx + 1));
}

export function isTorrentFile(contentType: string | null, fileName: string): boolean {
    return Boolean(
        contentType &&
        probablyTorrentContentTypes.some(c => contentType.indexOf(c) >= 0) &&
        fileName.endsWith(".torrent")
    );
}

export function getContentLength(resp: Response): number | null {
    const text = resp.headers.get("Content-Length");
    if (!text) {
        return null;
    }
    return parseInt(text);
}

export function normalizeUrl(url: string) {
    let i = url.length;
    while (i > 0) {
        if (url[i - 1] !== "/") {
            break;
        }
        --i;
    }
    return url.substring(0, i);
}

