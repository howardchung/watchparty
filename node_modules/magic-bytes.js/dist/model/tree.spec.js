"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("./tree");
describe("tree", () => {
    it("Creates complex node", () => {
        const tree = tree_1.createComplexNode("mpe", ["0x00", "0x01"]);
        expect(tree.bytes["0x00"].bytes["0x01"]).toHaveProperty("matches");
        expect(tree.bytes["0x00"].bytes["0x01"]["matches"][0].typename).toBe("mpe");
    });
    it("Merges trees", () => {
        const tree = tree_1.createComplexNode("pic", ["0x00"]);
        const dba = tree_1.createNode("dba", ["0x00", "0x01", "0x02", "0x03"]);
        const merged = tree_1.merge(dba, tree);
        expect(merged.bytes["0x00"].matches[0].typename).toBe("pic");
        expect(merged.bytes["0x00"].bytes["0x01"].bytes["0x02"].bytes["0x03"].matches[0]
            .typename).toBe("dba");
    });
    it("Merges overlapping", () => {
        const tree = tree_1.createComplexNode("pic", ["0x00"]);
        const dba = tree_1.createNode("pif", ["0x00"]);
        const merged = tree_1.merge(dba, tree);
        expect(merged.bytes["0x00"].matches).toHaveLength(2);
    });
    it("Merges deep overlapping", () => {
        const gifA = tree_1.createComplexNode("gif", ["0x47", "0x49", "0x46", "0x38", "0x37", "0x61"], { mime: "image/gif", extension: "gif" });
        const gifB = tree_1.createNode("gif", ["0x47", "0x49", "0x46", "0x38", "0x38", "0x61"], { mime: "image/gif", extension: "gif" });
        const gifC = tree_1.createNode("gif", ["0x47", "0x49", "0x46", "0x38", "0x39", "0x61"], { mime: "image/gif", extension: "gif" });
        const mergeA = tree_1.merge(gifB, gifA);
        const mergeB = tree_1.merge(gifC, mergeA);
        expect(mergeB.bytes["0x47"].bytes["0x49"].bytes["0x46"].bytes["0x38"].bytes["0x37"].bytes["0x61"].matches[0]).toEqual({ typename: "gif", extension: "gif", mime: "image/gif" });
        expect(mergeB.bytes["0x47"].bytes["0x49"].bytes["0x46"].bytes["0x38"].bytes["0x39"].bytes["0x61"].matches[0]).toEqual({ typename: "gif", extension: "gif", mime: "image/gif" });
        expect(mergeB.bytes["0x47"].bytes["0x49"].bytes["0x46"].bytes["0x38"].bytes["0x38"].bytes["0x61"].matches[0]).toEqual({ typename: "gif", extension: "gif", mime: "image/gif" });
    });
});
