export interface Options {
    url: string;
    user: string;
    pwd: string;
    notificationTimeout: number;
}

const defaultOptions: Options = {
    url: "http://router.asus.com:8081",
    user: "admin",
    pwd: "admin",
    notificationTimeout: 5000
};

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

export async function loadOpts(): Promise<Options> {
    try {
        const opts = await chrome.storage.local.get(defaultOptions) as Options;
        return ({...opts, url: normalizeUrl(opts.url)} as Options);
    } catch (e) {
        console.error("Unable to load options. Using defaults", e);
        return defaultOptions;
    }
}

export function storeOpts(opts: Options) {
    return chrome.storage.local.set(opts);
}