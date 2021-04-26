import {dmConfirmAllFiles, dmLogin, dmQueueLink, dmQueueTorrent, QueueStatus} from "./DownloadMasterClient";
import {Options} from "./option-tools";
import {getFileNameFromContentDisposition, getFileNameOrUrl, isTorrentFile} from "./utils";
import xhr, {replaceRefererHeader} from "./xhr";

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
    console.log(`Downloading .torrent from ${p.url}...`);

    const uploadBtResp = await dmQueueTorrent(p);

    const result: QueueResult = { ...p, status: uploadBtResp };
    if (uploadBtResp === QueueStatus.ConfirmFiles) {
        const confirmResp = await dmConfirmAllFiles(p);
        result.status = confirmResp ? QueueStatus.Ok : QueueStatus.Error;
    }
    return result;
}

async function queueFile(p: QueueFile): Promise<QueueResult> {
    console.log(`Downloading file from ${p.url}...`);
    const status = await dmQueueLink(p.url, p.opts);
    return { ...p, status };
}

async function queueDownload(url: string, referer: string, opts: Options): Promise<QueueResult> {
    const loginResp = await dmLogin(opts);
    if (!loginResp) {
        return {url, opts, status: QueueStatus.LoginFail, type: FileType.Unknown, name: url};
    }

    const notATorrentMatch = Object.keys(notATorrentUrlPrefixes).filter(p => url.indexOf(p) === 0);
    if (notATorrentMatch.length > 0) {
        const prefixKey = notATorrentMatch[0];
        return await queueFile({url, opts, type: notATorrentUrlPrefixes[prefixKey], name: getFileNameOrUrl(url)});
    }

    let name = "";
    const resp = await xhr({
        method: "GET",
        url,
        headers: {
            [replaceRefererHeader]: referer
        },
        onHeadersReceived: req => {
            name = getFileNameFromContentDisposition(req) || getFileNameOrUrl(url);
            if (!isTorrentFile(req, name)) {
                console.log("Aborting XHR request as it's not a .torrent", url);
                req.abort();
            }
        },
        responseType: "blob"
    });

    if (resp.readyState === XMLHttpRequest.UNSENT) {
        console.log("XHR request was aborted. Queue as simple file", url);
        return await queueFile({url, name, opts, type: FileType.Plain});
    }
    return await queueTorrent({url, name, opts, type: FileType.Torrent, blob: resp.response as Blob});
}

export default queueDownload;
