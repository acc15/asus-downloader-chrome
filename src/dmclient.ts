import {Options} from "./option-tools";
import xhr, {isSuccessfulStatus, toUrlEncodedFormData} from "./xhr";


/* Auth POST

Request URL: http://router.asus.com:8081/check.asp
Request Method: POST
Status Code: 200 OK
Remote Address: 192.168.1.1:8081
Referrer Policy: no-referrer-when-downgrade
Cache-Control: no-store
Cache-Control: no-cache
Content-Length: 870
Content-Type: text/html
Date: Sun, 10 Feb 2019 20:49:25 GMT
Server: lighttpd/1.4.39
Set-Cookie: AuthByPasswd=asus_app_token:57e6ef9b436b1fe64775a6315b79a65f; path=/downloadmaster/; httponly;
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*;q=0.8
Accept-Encoding: gzip, deflate
Accept-Language: ru,en;q=0.9,en-US;q=0.8
Cache-Control: max-age=0
Connection: keep-alive
Content-Length: 98
Content-Type: application/x-www-form-urlencoded
Cookie: hwaddr=38:D5:47:BC:F5:D8; _ga=GA1.2.971528812.1549396018; apps_last=; _gcl_au=1.1.210339060.1549573241; _ym_uid=1549573242247472667; _ym_d=1549573242; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438432799.ZIP=e5rP2N02bDRfXJUO,1549575197780,11@2@0@149@-1@20@FW_RT_AC88U_300438432799.ZIP; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438432738.ZIP=e5rP2N02bDRfXJUO,1549575206445,11@2@0@149@-1@20@FW_RT_AC88U_300438432738.ZIP; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438421045.ZIP=e5rP2N02bDRfXJUO,1549575214095,11@2@0@149@-1@20@FW_RT_AC88U_300438421045.ZIP; bw_rtab=WIRED; clickedItem_tab=0; _gid=GA1.2.1261306426.1549805623; _ym_isad=1; search_initproduct=ru,,
    Host: router.asus.com:8081
Origin: http://router.asus.com:8081
    Referer: http://router.asus.com:8081/Main_Login.asp
        Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36
flag=&login_username=YWRtaW4%3D&login_passwd=MGF3R2hHVlc%3D&directurl=%2Fdownloadmaster%2Ftask.asp

*/

export async function dmLogin(opts: Options): Promise<boolean> {
    const fd = {
        flag: "",
        login_username: btoa(opts.user),
        login_passwd: btoa(opts.pwd),
        directurl: "/downloadmaster/task.asp"
    };
    console.log("Login form-data", fd);
    const resp = await xhr({ method: "POST", url: opts.url + "/check.asp", headers: {
        "Content-type": 'application/x-www-form-urlencoded'
    }, body: toUrlEncodedFormData(fd)});
    return isSuccessfulStatus(resp.status);
}



/* Add torrent

Request URL: http://router.asus.com:8081/downloadmaster/dm_uploadbt.cgi
Request Method: POST
Status Code: 200 OK
Remote Address: 192.168.1.1:8081
Referrer Policy: no-referrer-when-downgrade
HTTP/1.1 200 OK
ContentType: text/html
Cache-Control: private,max-age=0;
Transfer-Encoding: chunked
Date: Sun, 10 Feb 2019 20:54:09 GMT
Server: lighttpd/1.4.39
POST /downloadmaster/dm_uploadbt.cgi HTTP/1.1
Host: router.asus.com:8081
Connection: keep-alive
Content-Length: 14871
Cache-Control: max-age=0
Origin: http://router.asus.com:8081
Upgrade-Insecure-Requests: 1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryBCvWuOljhcMLOU0D
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*q=0.8
Referer: http://router.asus.com:8081/downloadmaster/task.asp
Accept-Encoding: gzip, deflate
Accept-Language: ru,en;q=0.9,en-US;q=0.8
Cookie: AuthByPasswd=asus_app_token:57e6ef9b436b1fe64775a6315b79a65f; hwaddr=38:D5:47:BC:F5:D8; _ga=GA1.2.971528812.1549396018; apps_last=; _gcl_au=1.1.210339060.1549573241; _ym_uid=1549573242247472667; _ym_d=1549573242; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438432799.ZIP=e5rP2N02bDRfXJUO,1549575197780,11@2@0@149@-1@20@FW_RT_AC88U_300438432799.ZIP; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438432738.ZIP=e5rP2N02bDRfXJUO,1549575206445,11@2@0@149@-1@20@FW_RT_AC88U_300438432738.ZIP; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438421045.ZIP=e5rP2N02bDRfXJUO,1549575214095,11@2@0@149@-1@20@FW_RT_AC88U_300438421045.ZIP; bw_rtab=WIRED; clickedItem_tab=0; _gid=GA1.2.1261306426.1549805623; _ym_isad=1; search_initproduct=ru,,

Multiple files response

<script>parent.hideLoading();parent.response_dm_add("
BT_ACK_SUCESS=
Вдовы_2018_BDRip, #Вдовы Widows (Стив МакКуин Steve McQueen) [2018, Великобритания, США, триллер, драма, криминал, BDRip] Dub (iTunes) + Sub (Rus [rutracker-5683010].torrent,
#0#none#2234MB#Вдовы_2018_BDRip.avi,
#1#none#0MB#Вдовы_2018_BDRip_eng SDH.srt,
#2#none#0MB#Вдовы_2018_BDRip_rus full.srt,
#3#none#0MB#Вдовы_2018_BDRip_eng full.srt,
#4#none#0KB#Вдовы_2018_BDRip_rus forsed.srt");</script>

Ok Accepted

<script>parent.hideLoading();parent.response_dm_add("ACK_SUCESS");</script>

Bt Exists

<script>parent.hideLoading();parent.response_dm_add("BT_EXIST");</script>

*/

export const enum UploadStatus {
    Success = "success",
    ConfirmFiles = "confirm_files",
    Exists = "exists",
    Error = "error"
}

export async function dmQueueTorrent(file: Blob, fileName: string, opts: Options): Promise<UploadStatus> {
    const fd = new FormData();
    fd.append("file", file, fileName);
    const resp = await xhr({method: "POST", url: opts.url + "/downloadmaster/dm_uploadbt.cgi", body: fd});
    if (!isSuccessfulStatus(resp.status)) {
        return UploadStatus.Error;
    }
    if (resp.responseText.indexOf("BT_EXISTS") >= 0) {
        return UploadStatus.Exists;
    }
    if (resp.responseText.indexOf("BT_ACK_SUCESS=") >= 0) {
        return UploadStatus.ConfirmFiles;
    }
    return UploadStatus.Success;
}


/*

Multiple files

Request URL: http://router.asus.com:8081/downloadmaster/dm_uploadbt.cgi?filename=%D0%92%D0%B4%D0%BE%D0%B2%D1%8B%20Widows%20(%D0%A1%D1%82%D0%B8%D0%B2%20%D0%9C%D0%B0%D0%BA%D0%9A%D1%83%D0%B8%D0%BD%20Steve%20McQueen)%20%5B2018%2C%20%D0%92%D0%B5%D0%BB%D0%B8%D0%BA%D0%BE%D0%B1%D1%80%D0%B8%D1%82%D0%B0%D0%BD%D0%B8%D1%8F%2C%20%D0%A1%D0%A8%D0%90%2C%20%D1%82%D1%80%D0%B8%D0%BB%D0%BB%D0%B5%D1%80%2C%20%D0%B4%D1%80%D0%B0%D0%BC%D0%B0%2C%20%D0%BA%D1%80%D0%B8%D0%BC%D0%B8%D0%BD%D0%B0%D0%BB%2C%20BDRip%5D%20Dub%20(iTunes)%20%2B%20Sub%20(Rus%20%5Brutracker-5683010%5D.torrent&download_type=All&D_type=3&t=0.36825365996235604
    Request Method: GET
Status Code: 200 OK
Remote Address: 192.168.1.1:8081
Referrer Policy: no-referrer-when-downgrade
Cache-Control: private,max-age=0;
ContentType: text/html
Date: Sun, 10 Feb 2019 23:07:37 GMT
Server: lighttpd/1.4.39
Transfer-Encoding: chunked
Accept:
Accept-Encoding: gzip, deflate
Accept-Language: ru,en;q=0.9,en-US;q=0.8
Connection: keep-alive
Cookie: AuthByPasswd=asus_app_token:d2d9071e22ea892dbbf271bf5e1d8ac5; hwaddr=38:D5:47:BC:F5:D8; _ga=GA1.2.971528812.1549396018; _gcl_au=1.1.210339060.1549573241; _ym_uid=1549573242247472667; _ym_d=1549573242; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438432799.ZIP=e5rP2N02bDRfXJUO,1549575197780,11@2@0@149@-1@20@FW_RT_AC88U_300438432799.ZIP; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438432738.ZIP=e5rP2N02bDRfXJUO,1549575206445,11@2@0@149@-1@20@FW_RT_AC88U_300438432738.ZIP; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438421045.ZIP=e5rP2N02bDRfXJUO,1549575214095,11@2@0@149@-1@20@FW_RT_AC88U_300438421045.ZIP; bw_rtab=WIRED; clickedItem_tab=0; _gid=GA1.2.1261306426.1549805623; _ym_isad=1; search_initproduct=ru,,; asus_token=xNGvjqQhLayWWbLOUZ6gQWLD3fhOt5V; apps_last=
Host: router.asus.com:8081
Referer: http://router.asus.com:8081/downloadmaster/task.asp
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36
X-Requested-With: XMLHttpRequest
filename: Вдовы Widows (Стив МакКуин Steve McQueen) [2018, Великобритания, США, триллер, драма, криминал, BDRip] Dub (iTunes) + Sub (Rus [rutracker-5683010].torrent
download_type: All
D_type: 3
t: 0.36825365996235604

*/
export async function dmConfirmAllFiles(fileName: string, opts: Options): Promise<boolean> {
    const formData = {
        filename: fileName,
        download_type: "All",
        D_type: "3",
        t: "0.36825365996235604"
    };
    const resp = await xhr({method: "GET", url: opts.url + "/downloadmaster/dm_uploadbt.cgi?" + toUrlEncodedFormData(formData)});
    return isSuccessfulStatus(resp.status);
}

/*

Add by url

Request URL: http://router.asus.com:8081/downloadmaster/dm_apply.cgi?action_mode=DM_ADD&download_type=5&again=no&usb_dm_url=http%3A%2F%2Fcdndl.zaycev.net%2F63487%2F3936546%2Flmfao_-_la_la_la_%2528zaycev.net%2529.mp3%3Fext.page%3Ddefault&t=0.7478890386712465
    Request Method: GET
Status Code: 200 OK
Remote Address: 192.168.1.1:8081
Referrer Policy: no-referrer-when-downgrade
Cache-Control: private,max-age=0;
ContentType: text/html
Date: Sun, 10 Feb 2019 23:27:21 GMT
Server: lighttpd/1.4.39
Transfer-Encoding: chunked
Accept-Encoding: gzip, deflate
Accept-Language: ru,en;q=0.9,en-US;q=0.8
Connection: keep-alive
Cookie: AuthByPasswd=asus_app_token:dafd11b34aec319ed914ac30b5e30b9d; hwaddr=38:D5:47:BC:F5:D8; _ga=GA1.2.971528812.1549396018; _gcl_au=1.1.210339060.1549573241; _ym_uid=1549573242247472667; _ym_d=1549573242; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438432799.ZIP=e5rP2N02bDRfXJUO,1549575197780,11@2@0@149@-1@20@FW_RT_AC88U_300438432799.ZIP; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438432738.ZIP=e5rP2N02bDRfXJUO,1549575206445,11@2@0@149@-1@20@FW_RT_AC88U_300438432738.ZIP; PD_Download_List$11@2@0@149@-1@20@FW_RT_AC88U_300438421045.ZIP=e5rP2N02bDRfXJUO,1549575214095,11@2@0@149@-1@20@FW_RT_AC88U_300438421045.ZIP; bw_rtab=WIRED; clickedItem_tab=0; _gid=GA1.2.1261306426.1549805623; _ym_isad=1; search_initproduct=ru,,; asus_token=xNGvjqQhLayWWbLOUZ6gQWLD3fhOt5V; apps_last=
Host: router.asus.com:8081
Referer: http://router.asus.com:8081/downloadmaster/task.asp
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36
X-Requested-With: XMLHttpRequest
action_mode: DM_ADD
download_type: 5
again: no
usb_dm_url: http://cdndl.zaycev.net/63487/3936546/lmfao_-_la_la_la_%28zaycev.net%29.mp3?ext.page=default
t: 0.7478890386712465
*/

export async function dmQueueLink(url: string, opts: Options): Promise<boolean> {
    const formData = {
        action_mode: "DM_ADD",
        download_type: 5,
        again: "no",
        usb_dm_url: url,
        t: "0.7478890386712465"
    };
    const resp = await xhr({method: "GET", url: opts.url + "/downloadmaster/dm_apply.cgi?" + toUrlEncodedFormData(formData)});
    return isSuccessfulStatus(resp.status);
}