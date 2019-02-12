

export type XhrCallback = (xhr: XMLHttpRequest) => void;

export const replaceRefererHeader = "X-Replace-Referer";

interface XhrRequest {
    method: string;
    url: string;
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

    }, {types: ["xmlhttprequest"], urls: ["http://*/*", "https://*/*"]}, ["requestHeaders", "extraHeaders", "blocking"]);
}

function startRequestFiltering() {
    ++webRequestFilterRequests;
}

function stopRequestFiltering() {
    --webRequestFilterRequests;
}

export default xhr;