export interface Options {
    url: string;
    user: string;
    pwd: string;
}

export const defaultOptions: Options = {
    url: "http://router.asus.com:8081",
    user: "admin",
    pwd: "admin"
};

export function normalizeUrl(url: string): string {
    let i = url.length;
    while (i > 0) {
        if (url[i - 1] !== "/") {
            break;
        }
        --i;
    }
    return url.substring(0, i);
}

export function loadOpts(): Promise<Options> {
    return new Promise((resolve) => chrome.storage.local.get(defaultOptions, items => {
        const i = items as Options;
        if (chrome.runtime.lastError) {
            console.error("Unable to load options. Using default options instead. " +
                (chrome.runtime.lastError.message ? `Error: ${chrome.runtime.lastError.message}` : "Unknown error"));
            resolve(defaultOptions);
        } else {
            resolve({ url: normalizeUrl(i.url), user: i.user, pwd: i.pwd });
        }
    }));
}

export function storeOpts(opts: Options): Promise<Options> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(opts, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(opts);
            }
        });
    });
}
