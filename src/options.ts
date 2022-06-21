import {normalizeUrl} from "./utils";

export interface Options {
    url: string;
    user: string;
    pwd: string;
}

const defaultOptions: Options = {
    url: "http://router.asus.com:8081",
    user: "admin",
    pwd: "admin"
};

export async function loadOpts() {
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