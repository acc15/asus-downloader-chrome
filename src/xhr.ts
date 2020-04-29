export type XhrCallback = (xhr: XMLHttpRequest) => void;

export const replaceRefererHeader = "X-Replace-Referer";

interface XhrRequest {
    method: string;
    url: string;
    headers?: { [k: string]: string | Array<string> };
    body?: string | FormData | Blob;
    responseType?: XMLHttpRequestResponseType;
    onHeadersReceived?: XhrCallback;
}

function xhr(req: XhrRequest): Promise<XMLHttpRequest> {
    console.log("XHR request", req);

    const requiresFiltering = req.headers && req.headers[replaceRefererHeader];
    return new Promise<XMLHttpRequest>((resolve, reject) => {

        const q = new XMLHttpRequest();

        q.open(req.method, req.url, true);
        q.onload = () => resolve(q);
        if (req.headers) {
            for (const k in req.headers) {
                if (!req.headers.hasOwnProperty(k)) {
                    continue;
                }
                const v = req.headers[k];
                if (Array.isArray(v)) {
                    for (const h of v) {
                        q.setRequestHeader(k, h);
                    }
                } else {
                    q.setRequestHeader(k, v);
                }
            }
        }

        if (req.responseType) {
            q.responseType = req.responseType;
        }
        if (req.onHeadersReceived) {
            const onHeadersReceived = req.onHeadersReceived;
            q.onreadystatechange = () => {
                if (q.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
                    onHeadersReceived(q);
                }
            };
        }
        q.timeout = 30000;
        q.onerror = () => reject(new Error("XHR request error"));
        q.onabort = () => resolve(q);
        q.ontimeout = () => reject(new Error("XHR timeout"));

        if (requiresFiltering) {
            startRequestFiltering();
        }
        q.send(req.body);
    })
    .finally(() => {
        if (requiresFiltering) {
            stopRequestFiltering();
        }
    })
    .then(q => {
        console.log(`XHR response (method: ${req.method}, url: ${req.url}, status: ${q.status}, headers: ${q.getAllResponseHeaders()})`);
        return q;
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

        const filteredToReplaceIndex = headers.findIndex(h => h.name === replaceRefererHeader);
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

    }, {types: ["xmlhttprequest"], urls: ["http://*/*", "https://*/*"]}, ["requestHeaders", "extraHeaders", "blocking"]);
}

function startRequestFiltering() {
    ++webRequestFilterRequests;
}

function stopRequestFiltering() {
    --webRequestFilterRequests;
}

export default xhr;
