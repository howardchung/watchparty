"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const index_1 = require("./index");
const getBytes = (filename) => {
    const file = require.resolve(`./testfiles/${filename}`);
    const buffer = fs.readFileSync(file);
    return Array.prototype.slice.call(buffer, 0);
};
describe("Tests the public API", () => {
    it("detects woff", () => {
        const bytes = getBytes("font.woff");
        const [result] = index_1.filetypeinfo(bytes);
        expect(result).toBeDefined();
        expect(result).toStrictEqual({
            typename: "woff",
            mime: "font/woff",
            extension: "woff",
        });
    });
    it("detects woff2", () => {
        const bytes = getBytes("inter.woff2");
        const [result] = index_1.filetypeinfo(bytes);
        expect(result).toBeDefined();
        expect(result).toStrictEqual({
            typename: "woff2",
            mime: "font/woff2",
            extension: "woff2",
        });
    });
    it("detects tar with offset", () => {
        const bytes = getBytes("a.tar");
        const [result] = index_1.filetypeinfo(bytes);
        expect(result).toBeDefined();
        expect(result.typename).toBe("tar");
    });
    it("detects apng", () => {
        const bytes = getBytes("a.apng");
        const result = index_1.filetypeinfo(bytes);
        expect(result).toHaveLength(2);
        const [png, apng] = result;
        expect(png.typename).toBe("png");
        expect(png.mime).toBe("image/png");
        expect(apng.typename).toBe("apng");
        expect(apng.mime).toBe("image/apng");
    });
    it("detects mp4", () => {
        const bytes = getBytes("a.mp4");
        const [result] = index_1.filetypeinfo(bytes);
        expect(result).toBeDefined();
        expect(result.typename).toBe("mp4");
        expect(result.mime).toBe("video/mp4");
    });
    describe("detects ogg containers", () => {
        it("detects ogv", () => {
            const bytes = getBytes("a.ogv");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("ogv");
            expect(result.mime).toBe("video/ogg");
        });
        it("detects ogm", () => {
            const bytes = getBytes("a.ogm");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("ogm");
            expect(result.mime).toBe("video/ogg");
        });
        it("detects oga", () => {
            const bytes = getBytes("a.oga");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("oga");
            expect(result.mime).toBe("audio/ogg");
        });
        it("detects spx", () => {
            const bytes = getBytes("a.spx");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("spx");
            expect(result.mime).toBe("audio/ogg");
        });
        it("detects ogg", () => {
            const bytes = getBytes("a.ogg");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("ogg");
            expect(result.mime).toBe("audio/ogg");
        });
        it("detects ogx", () => {
            const bytes = getBytes("a.ogx");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("ogx");
            expect(result.mime).toBe("application/ogg");
        });
    });
    describe("detects mov", () => {
        it("detects mov (moov)", () => {
            const bytes = getBytes("a.moov.mov");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("mov");
            expect(result.extension).toBe("mov");
            expect(result.mime).toBe("video/quicktime");
        });
        it("detects mov (mdat)", () => {
            const bytes = getBytes("a.mdat.mov");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("mov");
            expect(result.extension).toBe("mov");
            expect(result.mime).toBe("video/quicktime");
        });
        it("detects mov (ftypqt)", () => {
            const bytes = getBytes("a.ftypqt.mov");
            const [result] = index_1.filetypeinfo(bytes);
            expect(result).toBeDefined();
            expect(result.typename).toBe("mov");
            expect(result.extension).toBe("mov");
            expect(result.mime).toBe("video/quicktime");
        });
    });
    it("filetypeinfo", () => {
        const bytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        const result = index_1.filetypeinfo(bytes);
        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty("typename");
    });
    it("filetypename", () => {
        const bytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        const result = index_1.filetypename(bytes);
        expect(result).toHaveLength(2);
        expect(result).toEqual(["png", "apng"]);
    });
    it("detects an ELF binary and not RAR", () => {
        const bytes = [0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00];
        const result = index_1.filetypename(bytes);
        expect(result).toEqual(["ELF"]);
    });
    it("filetypename failure", () => {
        const bytes = [0x89, 0x00, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        const result = index_1.filetypename(bytes);
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
    });
    it("does not match a signature longer than the input", () => {
        index_1.register("wildtail", ["0x77", "0x69", "0x6c", "0x64", "?", "?"]);
        const result = index_1.filetypename([0x77, 0x69, 0x6c, 0x64]);
        expect(result).not.toContain("wildtail");
    });
    it("filetypemime", () => {
        const bytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        const result = index_1.filetypemime(bytes);
        expect(result).toHaveLength(2);
        expect(result).toEqual(["image/png", "image/apng"]);
    });
    it("filetypemime not found", () => {
        const bytes = [0x89, 0x50, 0x00, 0x47, 0x00, 0x0a, 0x1a, 0x0a];
        const result = index_1.filetypemime(bytes);
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
    });
    it("filetypeextension", () => {
        const bytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        const result = index_1.filetypeextension(bytes);
        expect(result).toHaveLength(2);
        expect(result).toEqual(["png", "apng"]);
    });
    it("filetypeextension not found", () => {
        const bytes = [0x89, 0x50, 0x4e, 0x47, 0x00, 0x0a, 0x1a, 0x0a];
        const result = index_1.filetypeextension(bytes);
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
    });
    it("detects utf8", () => {
        const file = getBytes("a.utf8");
        const result = index_1.filetypemime(file);
        expect(result).toContain("text/plain; charset=UTF-8");
    });
    it("detects utf16le", () => {
        const file = getBytes("a.utf16le");
        const result = index_1.filetypemime(file);
        expect(result).toContain("text/plain; charset=UTF-16LE");
    });
    it("detects utf16be", () => {
        const file = getBytes("a.utf16be");
        const result = index_1.filetypemime(file);
        expect(result).toContain("text/plain; charset=UTF-16BE");
    });
    it("detects json object", () => {
        const fileObj = getBytes("a.json");
        const fileArray = getBytes("a_array.json");
        const result = index_1.filetypemime(fileObj);
        const result2 = index_1.filetypemime(fileArray);
        expect(result).toContain("application/json");
        expect(result2).toContain("application/json");
    });
    it("detects srt", () => {
        const file = getBytes("a.srt");
        const result = index_1.filetypemime(file);
        expect(result).toContain("application/x-subrip");
    });
    it("detects vtt", () => {
        const file = getBytes("a.vtt");
        const result = index_1.filetypemime(file);
        expect(result).toContain("text/vtt");
    });
    it("detects jpeg (photoshop)", () => {
        // File created with Adobe Photoshop 2024 via "Save As" menu
        const file = getBytes("photoshop.jpg");
        const result = index_1.filetypemime(file);
        expect(result).toContain("image/jpeg");
    });
    it("detects jpeg (photoshop export)", () => {
        // File created with Adobe Photoshop 2024 via "Export As" menu
        const file = getBytes("photoshop-export.jpg");
        const result = index_1.filetypemime(file);
        expect(result).toContain("image/jpeg");
    });
    it("detects jpeg (png2jpg)", () => {
        // File created using https://png2jpg.com
        const file = getBytes("png2jpg.jpg");
        const result = index_1.filetypemime(file);
        expect(result).toContain("image/jpeg");
    });
    describe("add new custom types", () => {
        beforeAll(() => {
            index_1.register('customNoInfo', ["0xde", "0xad", "0xbe", "0xef"]);
            index_1.register('customMime', ["0x12", "0x34", "0x56", "0x78"], {
                mime: 'application/vnd-custom',
                extension: '.cust'
            });
            index_1.register('customOffset', ["0xab", "0xcb"], {
                mime: 'application/vnd-custom-offset',
                extension: '.custoff'
            }, 2);
        });
        it("detects customNoInfo file", () => {
            const bytes = [0xde, 0xad, 0xbe, 0xef, 0x00];
            const result = index_1.filetypeinfo(bytes);
            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    "typename": "customNoInfo",
                })
            ]));
        });
        it("detects customMime file", () => {
            const bytes = [0x12, 0x34, 0x56, 0x78];
            const result = index_1.filetypeinfo(bytes);
            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    "typename": "customMime",
                    "mime": "application/vnd-custom",
                    "extension": ".cust"
                })
            ]));
        });
        it("detects customOffset file", () => {
            const bytes = [0x12, 0x34, 0xab, 0xcb];
            const result = index_1.filetypeinfo(bytes);
            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    "typename": "customOffset",
                    "mime": "application/vnd-custom-offset",
                    "extension": ".custoff"
                })
            ]));
        });
    });
    it("detects sqlite (SQLite 3 database file)", () => {
        const file = getBytes("a.sqlite");
        const result = index_1.filetypemime(file);
        expect(result).toContain("application/vnd.sqlite3");
    });
    it("detects pdf (Libreoffice export)", () => {
        // File created using libreoffice writter export to pdf
        const file = getBytes("a.pdf");
        const result = index_1.filetypemime(file);
        expect(result).toContain("application/pdf");
    });
    it("detects a PDF prefixed with a UTF-8 byte order mark", () => {
        const file = [0xef, 0xbb, 0xbf, ...getBytes("a.pdf")];
        const result = index_1.filetypeinfo(file);
        expect(result).toEqual([
            {
                typename: "pdf",
                mime: "application/pdf",
                extension: "pdf",
            },
        ]);
    });
    it("detects a BOM prefixed PDF passed as a Uint8Array", () => {
        const file = Uint8Array.from([0xef, 0xbb, 0xbf, ...getBytes("a.pdf")]);
        const result = index_1.filetypemime(file);
        expect(result).toContain("application/pdf");
    });
    it("does not detect a bare UTF-8 byte order mark as a pdf", () => {
        expect(index_1.filetypename([0xef, 0xbb, 0xbf])).not.toContain("pdf");
    });
    it("does not detect a BOM prefixed non-pdf as a pdf", () => {
        // UTF-8 BOM followed by "hello" - text, not a pdf. The BOM alone must not be
        // enough to claim the type.
        const file = [0xef, 0xbb, 0xbf, 0x68, 0x65, 0x6c, 0x6c, 0x6f];
        expect(index_1.filetypename(file)).not.toContain("pdf");
    });
    it("does not detect a truncated BOM prefixed pdf signature", () => {
        // BOM plus "%PD" - the signature is cut short, so nothing matches yet.
        const file = [0xef, 0xbb, 0xbf, 0x25, 0x50, 0x44];
        expect(index_1.filetypename(file)).not.toContain("pdf");
    });
    it("does not detect a pdf whose BOM is preceded by other bytes", () => {
        // The BOM only counts at the very start of the file.
        const file = [0x00, 0xef, 0xbb, 0xbf, ...getBytes("a.pdf")];
        expect(index_1.filetypename(file)).not.toContain("pdf");
    });
    it("detects both types of a file matching at an offset and at offset 0", () => {
        // A PDF carrying a tar header at offset 257 is still a PDF. Reporting only the
        // offset match would hide the pdf from anyone validating against an allowlist.
        const file = getBytes("a.pdf");
        while (file.length < 512)
            file.push(0x00);
        [0x75, 0x73, 0x74, 0x61, 0x72, 0x00, 0x30, 0x30].forEach((byte, i) => (file[257 + i] = byte));
        const result = index_1.filetypename(file);
        expect(result).toContain("tar");
        expect(result).toContain("pdf");
    });
    it("detects types matching at more than one offset", () => {
        const file = new Array(4200).fill(0x00);
        [0x66, 0x74, 0x79, 0x70].forEach((byte, i) => (file[4 + i] = byte)); // mp4
        [0x44, 0x49, 0x43, 0x4d].forEach((byte, i) => (file[128 + i] = byte)); // dcm
        const result = index_1.filetypename(file);
        expect(result).toContain("mp4");
        expect(result).toContain("dcm");
    });
    it("does not hand out the internal match objects", () => {
        const bytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        const first = index_1.filetypeinfo(bytes);
        first[0].mime = "mutated/by-caller";
        expect(index_1.filetypeinfo(bytes)[0].mime).toBe("image/png");
    });
    it("reports a signature registered twice only once", () => {
        index_1.register("twice", ["0xe1", "0xe2"], { mime: "x/twice" });
        index_1.register("twice", ["0xe1", "0xe2"], { mime: "x/twice" });
        expect(index_1.filetypename([0xe1, 0xe2])).toEqual(["twice"]);
    });
    it("detects poscript (pdf2ps)", () => {
        // File created using pdf2ps from https://www.ghostscript.com
        const file = getBytes("a.ps");
        const result = index_1.filetypemime(file);
        expect(result).toContain("application/postscript");
    });
    it("detects svg", () => {
        // File created using https://png2jpg.com
        const file = getBytes("a.svg");
        const result = index_1.filetypemime(file);
        expect(result).toContain("image/svg+xml");
    });
    it("detects avif", () => {
        // File created using avifenc on a.apng
        const file = getBytes("a.avif");
        const result = index_1.filetypemime(file);
        expect(result).toContain("image/avif");
    });
    it("detects aac", () => {
        // File created using FFmpeg on a.ogg
        const file = getBytes("a.aac");
        const result = index_1.filetypemime(file);
        expect(result).toContain("audio/aac");
    });
    it("detects flac", () => {
        // File created using FFmpeg on a.ogg
        const file = getBytes("a.flac");
        const result = index_1.filetypemime(file);
        expect(result).toContain("audio/flac");
    });
});
