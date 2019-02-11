import {ContentDisposition} from "content-disposition";
import contentDisposition = require("content-disposition");

interface XhrRequest {
    method: string;
    url: string;
    headers?: { [k: string]: string | string[] };
    body?: string | FormData | Blob;
    responseType?: XMLHttpRequestResponseType;
}

function xhr(req: XhrRequest): Promise<XMLHttpRequest> {
    return new Promise((resolve, reject) => {
        console.log(`XHR request (method: ${req.method}, url: ${req.url}, headers: ${JSON.stringify(req.headers)}, responseType: ${req.responseType})`, req);

        const xhr = new XMLHttpRequest();

        xhr.open(req.method, req.url, true);
        xhr.onload = () => {
            console.log(`XHR response (method: ${req.method}, url: ${req.url}, status: ${xhr.status}, headers: ${xhr.getAllResponseHeaders()})`);
            resolve(xhr);
        };
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
        xhr.timeout = 30000;
        xhr.onerror = () => reject(new Error("XHR request error"));
        xhr.onabort = () => reject(new Error("XHR aborted"));
        xhr.ontimeout = () => reject(new Error("XHR timeout"));
        xhr.send(req.body);
    });
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

export function getFileNameFromCD(cdHeader: string | null, defaultFileName: string): string {
    if (!cdHeader) {
        return defaultFileName;
    }

    const cd: ContentDisposition = contentDisposition.parse(cdHeader);
    return cd.parameters && cd.parameters.filename || defaultFileName;
}

export default xhr;