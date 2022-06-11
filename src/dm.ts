import {dmConfirmAllFiles, dmLogin, dmQueueLink, dmQueueTorrent, QueueStatus} from "./dm-client";
import {Options, getFileNameFromCD, getFileNameOrUrl, isSuccessfulStatus, isTorrentFile} from "./utils";

export const enum FileType {
    Torrent = "torrent",
    Ed2k = "ed2k",
    Magnet = "magnet",
    Ftp = "ftp",
    Plain = "plain",
    Unknown = "unknown"
}

export function getFileTypeName(type: FileType): string {
    switch (type) {
        case FileType.Ed2k: return "ED2K file";
        case FileType.Magnet: return "Magnet URL";
        case FileType.Ftp: return "FTP file";
        case FileType.Torrent: return "Torrent file";
        case FileType.Plain: return "File";
        default: return "Unknown file";
    }
}

export interface QueueFile {
    url: string;
    opts: Options;
    type: FileType;
    name: string;
}

export interface QueueResult extends QueueFile {
    status: QueueStatus;
}

export interface QueueTorrent extends QueueFile {
    blob: Blob;
}

const notATorrentUrlPrefixes: { [k: string]: FileType } = {
    "ftp:": FileType.Ftp,
    "ed2k:": FileType.Ed2k,
    "magnet:": FileType.Magnet
};

async function queueTorrent(p: QueueTorrent): Promise<QueueResult> {
    console.log(`Queueing .torrent from ${p.url}...`);
    const uploadBtStatus = await dmQueueTorrent(p);
    if (uploadBtStatus === QueueStatus.ConfirmFiles) {
        const confirmResp = await dmConfirmAllFiles(p);
        return { ...p, status: confirmResp ? QueueStatus.Ok : QueueStatus.Error };
    }
    return { ...p, status: uploadBtStatus };
}

async function queueFile(p: QueueFile): Promise<QueueResult> {
    console.log(`Queueing file from ${p.url}...`);
    const status = await dmQueueLink(p.url, p.opts);
    return { ...p, status };
}

async function queueDownload(url: string, opts: Options): Promise<QueueResult> {
    const loginResp = await dmLogin(opts);
    if (!loginResp) {
        return {url, opts, status: QueueStatus.LoginFail, type: FileType.Unknown, name: url};
    }

    const notATorrentMatch = Object.keys(notATorrentUrlPrefixes).filter(p => url.indexOf(p) === 0);
    if (notATorrentMatch.length > 0) {
        const prefixKey = notATorrentMatch[0];
        return queueFile({url, opts, type: notATorrentUrlPrefixes[prefixKey], name: getFileNameOrUrl(url)});
    }

    console.log(`Checking URL file type. Sending GET request to ${url}`);

    const resp = await fetch(url);
    if (!isSuccessfulStatus(resp.status)) {
        return {url, opts, status: QueueStatus.Error, type: FileType.Unknown, name: url};
    }

    const contentType = resp.headers.get("Content-Type");
    const contentDisposition = resp.headers.get("Content-Disposition");

    const name = getFileNameFromCD(contentDisposition) || getFileNameOrUrl(url);
    if (!isTorrentFile(contentType, name)) {
        return queueFile({url, name, opts, type: FileType.Plain});
    }

    const blob = await resp.blob();
    return queueTorrent({url, name, opts, type: FileType.Torrent, blob});
}

export default queueDownload;
