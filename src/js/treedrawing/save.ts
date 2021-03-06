///<reference path="./../../../types/all.d.ts" />

import parser = require("../parse");
import log = require("../ui/log");
import globals = require("./global");
import $ = require("jquery");
import Q = require("q");

var saveInProgress : boolean = false;
export var saveFn : (s: string) => Q.Promise<boolean>;

export function save(e : Event, extraArgs? : any) : void {
    if (!extraArgs) {
        extraArgs = {};
    }
    if (document.getElementById("leafphrasebox") ||
        document.getElementById("labelbox")) {
        // It should be impossible to trigger a save in these conditions, but
        // it causes data corruption if the save happens,, so this functions
        // as a last-ditch safety.
        log.error("Cannot save while editing a node label.");
        return;
    }
    if (!saveInProgress) {
        log.notice("Saving...");
        saveInProgress = true;
        var lss = $("#editpane").html();
        saveFn(parser.parseHtmlToXml(document.getElementById("sn0"))).then(
            function () : void {
                log.notice("Save success");
                saveInProgress = false;
                globals.lastSavedState = lss;
            }, function (err : any) : void {
                log.error("Save error: " + err);
                saveInProgress = false;
            });
    }
};
