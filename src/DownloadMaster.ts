import {dmConfirmAllFiles, dmLogin, dmQueueLink, dmQueueTorrent, UploadStatus} from "./DownloadMasterClient";
import {Options} from "./option-tools";
import {getFileNameFromContentDisposition, getFileNameFromUrl, isTorrentFile} from "./utils";
import xhr, {replaceRefererHeader} from "./xhr";

export const enum FileType {
    Torrent = "torrent",
    Ed2k = "ed2k",
    Magnet = "magnet",
    Ftp = "ftp",
    Plain = "plain"
}

export interface QueueBase {
    url: string;
    opts: Options;
}

export interface QueueResult extends QueueBase {
    status: UploadStatus;
    type?: FileType;
    fileName?: string;
}

export interface QueueFile extends QueueBase {
    type: FileType;
    fileName?: string;
}

export interface QueueTorrent extends QueueBase {
    fileName?: string;
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

    const result: QueueResult = {
        url: p.url,
        opts: p.opts,
        fileName: p.fileName,
        type: FileType.Torrent,
        status: uploadBtResp
    };

    if (result.status === UploadStatus.ConfirmFiles) {
        const confirmResp = await dmConfirmAllFiles(p);
        result.status = confirmResp ? UploadStatus.Ok : UploadStatus.Error;
    }
    return result;
}

async function queueFile(p: QueueFile): Promise<QueueResult> {
    console.log(`Downloading file from ${p.url}...`);

    const resp = await dmQueueLink(p.url, p.opts);
    const result: QueueResult = {
        url: p.url,
        opts: p.opts,
        fileName: p.fileName,
        type: p.type,
        status: UploadStatus.Ok
    };
    result.status = resp ? UploadStatus.Ok : UploadStatus.Error;
    return result;
}

async function queueDownload(url: string, referer: string, opts: Options): Promise<QueueResult> {
    const loginResp = await dmLogin(opts);
    if (!loginResp) {
        return {url, opts, status: UploadStatus.LoginFail};
    }

    const notATorrentMatch = Object.keys(notATorrentUrlPrefixes).filter(p => url.indexOf(p) === 0);
    if (notATorrentMatch.length > 0) {
        const prefixKey = notATorrentMatch[0];
        return await queueFile({url, opts, type: notATorrentUrlPrefixes[prefixKey]});
    }

    let fileName: string | undefined = undefined;

    const resp = await xhr({
        method: "GET",
        url,
        headers: {
            [replaceRefererHeader]: referer
        },
        onHeadersReceived: req => {
            fileName = [getFileNameFromContentDisposition(req), getFileNameFromUrl(url)].filter(Boolean)[0];
            if (!isTorrentFile(req, fileName)) {
                console.log("Aborting XHR request as it's not a .torrent", url);
                req.abort();
            }
        },
        responseType: "blob"
    });

    if (resp.readyState === XMLHttpRequest.UNSENT) {
        console.log("XHR request was aborted. Queue as simple file", url);
        return await queueFile({url, fileName, opts, type: FileType.Plain});
    }
    return await queueTorrent({url, fileName, opts, blob: resp.response as Blob});
}

export default queueDownload;
