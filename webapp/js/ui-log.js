/*global require: false, exports: true */

var notify = require("./growl").growl;

exports.error = function (text) {
    notify.error({ title: "Error",
                   message: text });
};

exports.warning = function (text) {
    notify.warning({ title: "Warning",
                     message: text });
};

exports.notice = function (text) {
    notify.notice({ message: text });
};