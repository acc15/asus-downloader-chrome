import {getProtoByUrl, getFileNameByUrl, Proto, protoDescriptors} from "./url";

class UrlDesc {

    link: string;
    name: string;
    proto: Proto;

    constructor(url: string) {
        this.link = url;
        this.proto = getProtoByUrl(this.link);
        this.name = getFileNameByUrl(this.link);
    }

    get fileType(): string {
        return protoDescriptors[this.proto].name;
    }

    get description() {
        return `${this.fileType} '${this.name}'`;
    }

}

export default UrlDesc;