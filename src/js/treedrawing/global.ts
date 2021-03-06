
// TODO: is there a way to import only the decls?
import labelConvert = require("./label-convert");

export var lastEventWasMouse : boolean = false;
export var lastSavedState : string = "";
export var labelMapping : labelConvert.LabelMap = {
    defaults: {},
    defaultSubcategories: [],
    byLabel: {}
};

export var format : Element;

export function reset () : void {
    lastEventWasMouse = false;
    lastSavedState = "";
    labelMapping = {
        defaults: {},
        defaultSubcategories: [],
        byLabel: {}
    };

    format = undefined;
}
