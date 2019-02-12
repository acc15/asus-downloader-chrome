import {ContentDisposition} from "content-disposition";
import contentDisposition = require("content-disposition");

export type XhrCallback = (xhr: XMLHttpRequest) => void;

export const replaceRefererHeader = "X-Replace-Referer";

interface XhrRequest {
    method: string;
    url: string;
    referer?: string;
    headers?: { [k: string]: string | string[] };
    body?: string | FormData | Blob;
    responseType?: XMLHttpRequestResponseType;
    onHeadersReceived?: XhrCallback;
}

function xhr(req: XhrRequest): Promise<XMLHttpRequest> {
    console.log(`XHR request (method: ${req.method}, url: ${req.url}, headers: ${JSON.stringify(req.headers)}, responseType: ${req.responseType})`, req);

    const requiresFiltering = req.headers && req.headers[replaceRefererHeader];
    return new Promise<XMLHttpRequest>((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.open(req.method, req.url, true);
        xhr.onload = () => resolve(xhr);
        if (req.headers) {
            for (let k in req.headers) {
                if (!req.headers.hasOwnProperty(k)) {
                    continue;
                }
                const v = req.headers[k];
                if (Array.isArray(v)) {
                    for (const h of v) {
                        xhr.setRequestHeader(k, h);
                    }
                } else {
                    xhr.setRequestHeader(k, v);
                }
            }
        }

        if (req.responseType) {
            xhr.responseType = req.responseType;
        }
        if (req.onHeadersReceived) {
            const onHeadersReceived = req.onHeadersReceived;
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
                    onHeadersReceived(xhr);
                }
            }
        }
        xhr.timeout = 30000;
        xhr.onerror = () => reject(new Error("XHR request error"));
        xhr.onabort = () => resolve(xhr);
        xhr.ontimeout = () => reject(new Error("XHR timeout"));

        if (requiresFiltering) {
            startRequestFiltering();
        }
        xhr.send(req.body);
    })
    .finally(() => {
        if (requiresFiltering) {
            stopRequestFiltering();
        }
    })
    .then(x => {
        console.log(`XHR response (method: ${req.method}, url: ${req.url}, status: ${x.status}, headers: ${x.getAllResponseHeaders()})`);
        return x;
    });
}


let webRequestFilterRequests: number = 0;

export function initRequestFiltering() {
    chrome.webRequest.onBeforeSendHeaders.addListener(details => {
        if (webRequestFilterRequests <= 0) {
            return;
        }

        const headers = details.requestHeaders;
        if (!headers) {
            return;
        }

        console.log("onBeforeSendHeaders original headers", headers);

        const filteredToReplaceIndex = headers.findIndex(header => header.name === replaceRefererHeader);
        if (filteredToReplaceIndex < 0) {
            return;
        }

        const header = headers[filteredToReplaceIndex];
        const referer = header.value;

        headers.splice(filteredToReplaceIndex, 1);
        headers.push({
            name: "Referer",
            value: referer
        });

        console.log("onBeforeSendHeader filtered headers", headers);

        return {requestHeaders: headers};

    }, {urls: ["http://*/*", "https://*/*"]}, ["requestHeaders", "extraHeaders", "blocking"]);
}

function startRequestFiltering() {
    ++webRequestFilterRequests;
}

function stopRequestFiltering() {
    --webRequestFilterRequests;
}

export function toUrlEncodedFormData(obj: {[k: string]: string | number}): string {
    return Object.keys(obj).map(k => encodeURIComponent(k) + "=" + encodeURIComponent(String(obj[k]))).join("&");
}

export function toMultipartFormData(obj: {[k: string]: string | Blob}): FormData {
    const fd = new FormData();
    Object.keys(obj).forEach(k => {
        const val: string | Blob = obj[k];
        if (typeof val === "string") {
            fd.append(k, encodeURIComponent(val));
        } else {
            fd.append(k, val);
        }
    });
    return fd;
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

export default xhr;