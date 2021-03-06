///<reference path="./../../types/all.d.ts" />

import peg = require("pegjs");
var fs = require("fs");
import lc = require("./treedrawing/label-convert");
import _ = require("lodash");
import md = require("./treedrawing/metadata");
import compat = require("./compat");

var grammar = fs.readFileSync(__dirname + "/psd-grammars/main.txt", "utf8");

var icelandicText = fs.readFileSync(__dirname + "/psd-grammars/icelandic-text.txt",
                                    "utf8");

var icelandicLeaf = fs.readFileSync(__dirname + "/psd-grammars/icelandic-leaf.txt",
                                    "utf8");

var document : Document = compat.getDocument();

// TODO: case as part of the return value

export interface CorpusDef {
    continuation : string;
    brokenContinuation : boolean;
}

/* const */
export var corpusDefs : { [key: string] : CorpusDef } = {
    icepahc: {
        continuation: "$",
        brokenContinuation: false
    },
    mcvf: {
        continuation: "@",
        brokenContinuation: false
    },
    ppche: {
        continuation: "$",
        brokenContinuation: true
    }
};

export function parseCorpus (corpus : string) : any {
    var parser = peg.buildParser(grammar + icelandicText + icelandicLeaf);
    var res = parser.parse(corpus);
    return res;
}

export function jsToXml (root : any, spec : lc.LabelMap, cd : CorpusDef)
: string {
    var doc = document.implementation.createDocument(null, null, null);
    var corpus = doc.createElement("corpus");
    doc.appendChild(corpus);
    _.forEach(root, function (tree : any) : void {
        corpus.appendChild(jsToXmlInnerTop(tree, doc, spec, cd));
    });
    return compat.XmlSerializer.serializeToString(doc).replace(/ xmlns="foo"/, "");
}

function jsToXmlInnerTop (obj : any, doc : Document, spec : lc.LabelMap,
                          cd : CorpusDef)
: Element {
    var s = doc.createElement("sentence");
    if (obj.id) {
        s.setAttribute("id", obj.id);
    }
    s.appendChild(jsToXmlInner(obj.tree, doc, spec, cd));
    return s;
}

// TODO: support broken continuation
function jsToXmlInner (obj : any, doc : Document, spec : lc.LabelMap,
                       cd : CorpusDef)
: Element {
    if (!obj.label) {
        throw new Error("jsToXmlInner: missing label: " + JSON.stringify(obj));
    }
    if (obj.type) {
        var t;
        if (obj.type === "text") {
            t = doc.createElement("text");
            if (obj.text.substr(0, 1) === cd.continuation) {
                obj.text = obj.text.substr(1);
            }
            if (obj.text.substr(obj.text.length - 1) === cd.continuation) {
                obj.text = obj.text.substr(0, obj.text.length - 1);
                obj.hasCont = true;
            }
            t.appendChild(doc.createTextNode(obj.text));
            lc.setLabelForNode(obj.label, t, spec, false, true);
            if (obj.lemma) {
                md.setMetadataXml(t, "lemma", obj.lemma);
            }
            if (obj.index) {
                md.setMetadataXml(t, "index", obj.index.index);
                md.setMetadataXml(t, "idxtype", obj.index.idxtype);
            }
            if (obj.hasCont) {
                md.setMetadataXml(t, "has_continuation", "yes");
            }
        } else if (obj.type === "trace") {
            t = doc.createElementNS("foo", "trace");
            lc.setLabelForNode(obj.label, t, spec, false, true);
            md.setMetadataXml(t, "index", obj.index.index);
            md.setMetadataXml(t, "idxtype", obj.index.idxtype);
            t.setAttribute("tracetype", obj.tracetype);
        } else if (obj.type === "ec") {
            t = doc.createElementNS("foo", "ec");
            lc.setLabelForNode(obj.label, t, spec, false, true);
            if (obj.index) {
                md.setMetadataXml(t, "index", obj.index.index);
                md.setMetadataXml(t, "idxtype", obj.index.idxtype);
            }
            t.setAttribute("ectype", obj.ectype);
        } else if (obj.type === "comment") {
            t = doc.createElementNS("foo", "comment");
            t.setAttribute("category", "CODE");
            t.setAttribute("comtype", obj.comtype || "COM");
            t.appendChild(doc.createTextNode(obj.text));
        } else {
            throw new Error("jsToXmlInner: unknown type: " + obj.type);
        }
        return t;

    } else {
        var nt = doc.createElementNS("foo", "nonterminal");
        lc.setLabelForNode(obj.label, nt, spec, false, true);
        if (obj.index) {
            nt.setAttribute("index", obj.index.index);
            nt.setAttribute("idxtype", obj.index.idxtype);
        }
        _.forEach(obj.desc, (x : any) : any =>
                  nt.appendChild(jsToXmlInner(x, doc, spec, cd)));
        return nt;
    }
}
