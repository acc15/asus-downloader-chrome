export enum HttpHeader {
    ContentType = "Content-Type",
    ContentDisposition = "Content-Disposition",
    ContentLength = "Content-Length"
}

const probablyTorrentContentTypes = [
    "application/x-bittorrent",
    "application/octet-stream",
    "application/octet_stream",
    "application/force-download"
];

export function isSuccessfulStatus(status: number) {
    return status >= 200 && status < 300;
}

export function parseQueryString(url: string): URLSearchParams {
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

export function getHeader(resp: Response, header: HttpHeader): string | null {
    return resp.headers.get(header);
}

export function getIntHeader(resp: Response, header: HttpHeader): number | null {
    const v = getHeader(resp, header);
    return v ? parseInt(v) : null;
}

export async function downloadWithProgress(resp: Response, reporter: (cur: number, total: number) => Promise<void>): Promise<Blob> {
    const total = getIntHeader(resp, HttpHeader.ContentLength);
    if (!total || !resp.body) {
        await reporter(0, Number.NaN);
        return resp.blob();
    }

    const reader = resp.body.getReader();
    const chunks: Array<Uint8Array> = [];

    let current = 0;
    for (;;) {
        await reporter(current, total);
        const {done, value} = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        current += value.length;
    }
    return new Blob(chunks);
}

export function decodePercent(str: string): Array<number> {
    return str.split("%").filter(s => s.length > 0).map(s => parseInt(s, 16));
}

export function toCharCodes(str: string): Array<number> {
    const result = [];
    for (let i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return result;
}