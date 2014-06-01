///<reference path="./../../../types/all.d.ts" />

/* tslint:disable:quotemark */

import compat = require("./../compat");

var $ = compat.$;
import _ = require("lodash");

function setInDict (dict : { [key: string] : any },
                    key : string, val : any, remove? : boolean)
: { [key: string] : any } {
    if (_.isString(val)) {
        if (remove) {
            /* tslint:disable:no-unused-expression */
            delete dict[key];
            /* tslint:enable:no-unused-expression */
        } else {
            dict[key] = val;
        }
    } else {
        _.forOwn(val, function (v : any, k : string) : void {
            var dk = dict[key];
            if (!_.isObject(dk)) {
                dk = {};
                dict[key] = {};
            }
            dict[key] = setInDict(dk, k, v, remove);
            if (_.isEmpty(dict[key])) {
                /* tslint:disable:no-unused-expression */
                delete dict[key];
                /* tslint:enable:no-unused-expression */
            }
        });
    }
    return dict;
}

export function removeMetadata (node : Element, key : string, value : any = "")
: void {
    var metadata = getMetadata(node);
    metadata = setInDict(metadata, key, value, true);
    setNodeMetaAttr(node, metadata);
}

export function setMetadata (node : Element, key : string, value : any)
: void {
    var metadata = getMetadata(node);
    metadata = setInDict(metadata, key, value);
    setNodeMetaAttr(node, metadata);
}

export function getMetadata (node : Element)
: { [key: string] : any } {
    var attr = "data-metadata";
    return JSON.parse(node.getAttribute(attr)) || {};
}

function setNodeMetaAttr (node : Element, metadata : any)
: void {
    var attr = "data-metadata";
    if (!metadata || _.isEmpty(metadata)) {
        node.removeAttribute(attr);
    } else {
        node.setAttribute(attr, JSON.stringify(metadata));
    }
}

export function setMetadataXml (node : Element, key : string, value : any) : void {
    var mdNode = $(node).children("meta").first().get(0);
    if (!mdNode) {
        mdNode = node.ownerDocument.createElement("meta");
        $(node).prepend(mdNode);
    }
    setMetadataXmlInner(mdNode, key, value);
}

function setMetadataXmlInner (node : Element, key : string, value : any) : void {
    var c = $(node).children(key);
    if (c.length > 1) {
        throw new Error("setMetadataXmlInner: dupe key: " + key);
    } else if (c.length === 0) {
        var el = node.ownerDocument.createElement(key);
        node.appendChild(el);
        c = $(el);
    }
    if (_.isString(value)) {
        c.text(value);
    } else {
        _.forOwn(value, function (v : any, k : string) : void {
            setMetadataXmlInner(c.get(0), k, v);
        });
    }
}

export function removeMetadataXml (node : Element, key : string, value : any)
: void {
    var mdNode = $(node).children("meta").first().get(0);
    if (!mdNode) {
        mdNode = node.ownerDocument.createElement("meta");
        $(node).prepend(mdNode);
    }
    removeMetadataXmlInner(mdNode, key, value);
}

function removeMetadataXmlInner (node : Element, key : string, value : any) : void {
    var c = $(node).children(key);
    if (c.length > 1) {
        throw new Error("removeMetadataXmlInner: dupe key: " + key);
    } else if (c.length === 0) {
        return;
    }
    if (_.isString(value)) {
        c.remove();
    } else {
        _.forOwn(value, function (v : any, k : string) : void {
            removeMetadataXmlInner(c.get(0), k, v);
        });
        if ($(node).children().length === 0) {
            $(node).remove();
        }
    }
}

/**
 * Convert a JS disctionary to an HTML form.
 *
 * For the metadata editing code.
 * @private
 */
function dictionaryToForm (dict : Object, level? : number) : string {
    if (!level) {
        level = 0;
    }
    var res = "";
    if (dict) {
        res = '<table class="metadataTable"><thead><tr><td>Key</td>' +
            '<td>Value</td></tr></thead>';
        for (var k in dict) {
            if (dict.hasOwnProperty(k)) {
                if (typeof dict[k] === "string") {
                    res += '<tr class="strval" data-level="' + level +
                        '"><td class="key">' + '<span style="width:"' +
                        4 * level + 'px;"></span>' + k +
                        '</td><td class="val"><input class="metadataField" ' +
                        'type="text" name="' + k + '" value="' + dict[k] +
                        '" /></td></tr>';
                } else if (typeof dict[k] === "object") {
                    res += '<tr class="tabhead"><td colspan=2>' + k +
                        '</td></tr>';
                    res += dictionaryToForm(dict[k], level + 1);
                }
            }
        }
        res += '</table>';
    }
    return res;
}

/**
 * Convert an HTML form into a JS dictionary
 *
 * For the metadata editing code
 * @private
 */
function formToDictionary (form : JQuery) : Object {
    var d = {},
        dstack = [],
        curlevel = 0,
        namestack = [];
    form.find("tr").each(function () : void {
        if ($(this).hasClass("strval")) {
            var key = $(this).children(".key").text();
            var val = $(this).find(".val>.metadataField").val();
            d[key] = val;
            if ($(this).prop("data-level") < curlevel) {
                var newDict = dstack.pop();
                var nextName = namestack.pop();
                newDict[nextName] = d;
                d = newDict;
            }
        } else if ($(this).hasClass("tabhead")) {
            namestack.push($(this).text());
            curlevel = $(this).prop("data-level");
            dstack.push(d);
            d = {};
        }
    });
    if (dstack.length > 0) {
        var len = dstack.length;
        for (var i = 0; i < len; i++) {
            var newDict = dstack.pop();
            var nextName = namestack.pop();
            newDict[nextName] = d;
            d = newDict;
        }
    }
    return d;
}

export function saveMetadata () : void {
    if ($("#metadata").html() !== "") {
        $(selection.get()).prop("data-metadata",
                                JSON.stringify(formToDictionary(
                                    $("#metadata"))));
    }
}

function metadataKeyClick(e : Event) : boolean {
    var keyNode = e.target;
    var html = 'Name: <input type="text" ' +
            'id="metadataNewName" value="' + $(keyNode).text() +
            '" /><div id="dialogButtons"><input type="button" value="Save" ' +
        'id="metadataKeySave" /><input type="button" value="Delete" ' +
        'id="metadataKeyDelete" /></div>';
    dialog.showDialogBox("Edit Metadata", html);
    // TODO: make focus go to end, or select whole thing?
    $("#metadataNewName").focus();
    function saveMetadataInner () : void {
        $(keyNode).text($("#metadataNewName").val());
        dialog.hideDialogBox();
        saveMetadata();
    }
    function deleteMetadata() : void {
        $(keyNode).parent().remove();
        dialog.hideDialogBox();
        saveMetadata();
    }
    $("#metadataKeySave").click(saveMetadataInner);
    dialog.setInputFieldEnter($("#metadataNewName"), saveMetadataInner);
    $("#metadataKeyDelete").click(deleteMetadata);
    return false;
}

function addMetadataDialog() : void {
    // TODO: allow specifying value too in initial dialog?
    var html = 'New Name: <input type="text" id="metadataNewName" value="NEW" />' +
            '<div id="dialogButtons"><input type="button" id="addMetadata" ' +
            'value="Add" /></div>';
    dialog.showDialogBox("Add Metatata", html);
    function addMetadata () : void {
        var oldMetadata = formToDictionary($("#metadata"));
        oldMetadata[$("#metadataNewName").val()] = "NEW";
        $(selection.get()).prop("data-metadata", JSON.stringify(oldMetadata));
        updateMetadataEditor();
        dialog.hideDialogBox();
    }
    $("#addMetadata").click(addMetadata);
    dialog.setInputFieldEnter($("#metadataNewName"), addMetadata);
}

export function updateMetadataEditor() : void {
    if (selection.cardinality() !== 1) {
        $("#metadata").html("");
        return;
    }
    var addButtonHtml = '<input type="button" id="addMetadataButton" ' +
            'value="Add" />';
    $("#metadata").html(dictionaryToForm(getMetadata(selection.get())) +
                        addButtonHtml);
    $("#metadata").find(".metadataField").change(saveMetadata).
        focusout(saveMetadata).keydown(function (e : KeyboardEvent) : boolean {
            if (e.keyCode === 13) {
                $(e.target).blur();
            }
            e.stopPropagation();
            return true;
        });
    $("#metadata").find(".key").click(metadataKeyClick);
    $("#addMetadataButton").click(addMetadataDialog);
}

/* tslint:disable:variable-name */
export var __test__ : any = {};
/* tslint:enable:variable-name */

if (process.env.ENV === "test") {
    __test__ = {
        setInDict: setInDict
    };
}
