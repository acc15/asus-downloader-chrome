import contentDisposition, {ContentDisposition} from "content-disposition";

export function toUrlEncodedPair(key: string, value: any) {
    return encodeURIComponent(key) + "=" + (value !== null && value !== undefined ? encodeURIComponent(String(value)) : "");
}

export function toUrlEncodedFormData(obj: { [k: string]: any }): string {
    return Object.keys(obj).map(k => toUrlEncodedPair(k, obj[k])).join("&");
}

export function isSuccessfulStatus(status: number): boolean {
    return status >= 200 && status < 300;
}

export function getFileNameFromContentDispositionHeader(header: string | null): string | undefined {
    if (!header) {
        return undefined;
    }

    const cd: ContentDisposition = contentDisposition.parse(header);
    return cd.parameters && cd.parameters.filename ? cd.parameters.filename : undefined;
}

export function getFileNameFromContentDisposition(req: XMLHttpRequest): string | undefined {
    return getFileNameFromContentDispositionHeader(req.getResponseHeader("Content-Disposition"));
}

export function getFileNameFromUrl(url: string): string | undefined {
    if (url.length === 0) {
        return undefined;
    }

    let p = new URL(url).pathname;

    const lastSlash = p.lastIndexOf("/");
    if (lastSlash >= 0) {
        p = p.substring(lastSlash + 1);
    }
    return decodeURIComponent(p);
}

export function isTorrentFile(req: XMLHttpRequest, fileName: string | undefined): boolean {
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
