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

const optionKeys: string[] = Object.keys(defaultOptions);

export function loadOpts(): Promise<Options> {
    return new Promise((resolve, reject) => chrome.storage.local.get(optionKeys, items => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
        } else {
            resolve(items as Options);
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

