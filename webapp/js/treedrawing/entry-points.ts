///<reference path="./../../../types/all.d.ts" />

import s = require("./struc-edit");
import undo = require("./undo");
import n = require("./node-edit");
import selection = require("./selection");
import search = require("./search");
import view = require("./view.ts");

export var leafAfter = s.leafAfter;
export var leafBefore = s.leafBefore;
export var setLabel = s.setLabel;
export var makeNode = s.makeNode;
export var coIndex = s.coIndex;
export var toggleCollapsed = false; // TODO
export var splitWord = n.splitWord; // TODO
export var toggleExtension = s.toggleExtension;
export var pruneNode = s.pruneNode;
export var undo = undo.undo;
export var redo = undo.redo;
export var editNode = n.editNode;
export var clearSelection = selection.clearSelection;
export var toggleLemmata = false; // TODO
export var displayRename = false; // TODO
export var search = search.search;
export var toggleLemmata = view.toggleLemmata;
export var toggleCollapsed = view.toggleCollapsed;
