import {expect} from "chai";
import {normalizeUrl} from "./options";

describe("options", () => {
    describe("normalizeUrl", () => {
        it("must correctly normalize urls", () => {
            const expectations: { [k: string]: string } = {
                "http://abc////": "http://abc",
                "http://abc/": "http://abc",
                "http://abc": "http://abc"
            }

            for (const k in expectations) {
                expect(normalizeUrl(k)).eq(expectations[k]);
            }
        });
    });
});
