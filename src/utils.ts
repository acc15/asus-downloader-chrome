import contentDisposition, {ContentDisposition} from "content-disposition";

export function toUrlEncodedFormData(obj: { [k: string]: string | number }): string {
    return Object.keys(obj).map(k => encodeURIComponent(k) + "=" + encodeURIComponent(String(obj[k]))).join("&");
}

export function isSuccessfulStatus(status: number): boolean {
    return status >= 200 && status < 300;
}

export function getFileNameFromCD(cdHeader: string | null): string | null {
    if (!cdHeader) {
        return null;
    }

    const cd: ContentDisposition = contentDisposition.parse(cdHeader);
    return cd.parameters && cd.parameters.filename ? cd.parameters.filename : null;
}

export function getFileNameFromUrl(url: string): string | null {
    if (url.length === 0) {
        return null;
    }

    let p = new URL(url).pathname;

    const lastSlash = p.lastIndexOf("/");
    if (lastSlash >= 0) {
        p = p.substring(lastSlash + 1);
    }
    return decodeURIComponent(p);
}

export function firstNonNull(...values: any[]): any {
    for (let v of values) {
        if (v !== null && v !== undefined) {
            return v;
        }
    }
    return undefined;
}

export function isTorrentFile(req: XMLHttpRequest): boolean {
    const contentType = req.getResponseHeader("Content-Type");
    if (!contentType) {
        return false;
    }

    if (contentType.indexOf("application/x-bittorrent") >= 0) {
        return true;
    }
    if (contentType.indexOf('application/force-download') < 0) {
        return false;
    }

    const fileName = getFileNameFromCD(req.getResponseHeader("Content-Disposition"));
    return fileName !== null && fileName.endsWith(".torrent");
}