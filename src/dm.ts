import {Options} from "./options";
import UrlDescriptor from "./url-descriptor";
import {Status} from "./status";
import {HttpHeader, isSuccessfulStatus} from "./util";

const statusMap: { [k: string]: Status } = {
    "BT_ACK_SUCESS=": Status.ConfirmFiles,
    "ACK_SUCESS": Status.Ok,
    "TOTAL_FULL": Status.TaskLimit,
    "BT_EXISTS": Status.Exists,
    "BT_EXIST": Status.Exists,
    "DISK_FULL": Status.DiskFull
};

export interface ConfirmFiles {
    name: string,
    files: Array<ConfirmFile>
}

const EMPTY_CONFIRM: ConfirmFiles = { name: "", files: [] };

export interface ConfirmFile {
    name: string,
    size: string,
    index: number
}

export interface DmResult {
    status: Status,
    confirm?: ConfirmFiles
}

function isLoginFailed(status: number) {
    return status === 401 || status === 598;
}

export function responseTextToStatus(responseText: string): Status {
    for (const text in statusMap) {
        if (responseText.indexOf(text) >= 0) {
            return statusMap[text];
        }
    }
    return Status.Error;
}

export function parseConfirmFile(text: string, index: number): ConfirmFile {
    const parts = text.split("#");
    return {
        index: parts[0] && parseInt(parts[0]) || index,
        size: parts[2] || "",
        name: parts[3] || ""
    };
}

export function parseConfirmFiles(text: string): ConfirmFiles {
    const ackPrefix = Object.keys(statusMap).filter(k => statusMap[k] === Status.ConfirmFiles)[0];
    if (!ackPrefix) {
        return EMPTY_CONFIRM;
    }

    const listStart = text.indexOf(ackPrefix);
    const listEnd = text.indexOf("\");</script>");
    if (listStart < 0 || listEnd < 0) {
        return EMPTY_CONFIRM;
    }

    const list = text.substring(listStart + ackPrefix.length, listEnd);
    const entries = list.split(", #");
    if (entries.length < 2) {
        return EMPTY_CONFIRM;
    }

    return { name: entries[1], files: entries.slice(2).map(parseConfirmFile) };
}

async function responseToResult(resp: Response): Promise<DmResult> {
    if (!isSuccessfulStatus(resp.status)) {
        return { status: isLoginFailed(resp.status) ? Status.LoginFail : Status.Error };
    }
    const text = await resp.text();
    const status = responseTextToStatus(text);
    return {
        status,
        confirm: status === Status.ConfirmFiles ? parseConfirmFiles(text) : undefined
    };
}

export type DownloadMasterListener = (status: Status) => Promise<void>;

export default class DownloadMaster {

    opts: Options;
    listener?: DownloadMasterListener;

    constructor(opts:Options, listener?: DownloadMasterListener) {
        this.opts = opts;
        this.listener = listener;
    }

    public async login(): Promise<boolean> {
        const fd = new URLSearchParams({
            "flag": "",
            "login_username": btoa(this.opts.user),
            "login_passwd": btoa(this.opts.pwd),
            "directurl": "/downloadmaster/task.asp"
        });

        console.log("Login form-data", fd);
        const resp = await fetch(this.opts.url + "/check.asp", {
            method: "POST",
            headers: {
                [HttpHeader.ContentType]: "application/x-www-form-urlencoded"
            },
            body: fd
        });
        return isSuccessfulStatus(resp.status);
    }

    private async call(httpCall: () => Promise<Response>): Promise<DmResult> {
        let resp = await httpCall();
        if (isLoginFailed(resp.status)) {
            const loginResult = await this.login();
            if (loginResult) {
                resp = await httpCall();
            }
        }

        const result = await responseToResult(resp);
        if (this.listener) {
            await this.listener(result.status);
        }
        return result;
    }

    async queueUrl(url: UrlDescriptor) {
        console.log(`Queueing file from ${url.link}...`);

        const params = new URLSearchParams({
            action_mode: "DM_ADD",
            download_type: "5",
            again: "no",
            usb_dm_url: url.link,
            t: "0.7478890386712465"
        }).toString();

        return (await this.call(() => fetch(this.opts.url + "/downloadmaster/dm_apply.cgi?" + params))).status;
    }

    async queueTorrent(url: UrlDescriptor, torrent: Blob): Promise<DmResult> {
        console.log(`Queueing .torrent from ${url.link}...`);

        const fd = new FormData();
        fd.append("file", torrent, "a.torrent");

        return this.call(() => fetch(this.opts.url + "/downloadmaster/dm_uploadbt.cgi", { method: "POST", body: fd}));
    }

    async confirmAll(filename: string): Promise<Status> {
        console.log(`Confirming all .torrent files from ${filename}...`);

        const params = new URLSearchParams({
            filename: filename,
            download_type: "All",
            D_type: "3",
            t: "0.36825365996235604"
        }).toString();

        return (await this.call(() => fetch(this.opts.url + "/downloadmaster/dm_uploadbt.cgi?" + params))).status;
    }

    async queueTorrentAndConfirm(url: UrlDescriptor, torrent: Blob): Promise<Status> {
        const result = await this.queueTorrent(url, torrent);
        return result.status === Status.ConfirmFiles ? this.confirmAll(result.confirm?.name as string) : result.status;
    }

}
