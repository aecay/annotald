/*global require: false, exports: true */

/*jshint browser: true */

var React = require("react"),
    parser = require("../parse"),
    template = require("./tree-editor-template").template,
    $ = require("jquery"),
    configStore = require("../config-store"),
    treedrawing = require("../treedrawing/startup.ts");

exports.TreeEditor = React.createClass({
    exit: function () {
        $(document).trigger("ChangeView", { view: "Welcome",
                                            name: this.props.config });
    },
    render: function () {
        return template;
    },
    componentDidMount: function () {
        configStore.getConfig(this.props.config).then(function (result) {
            var script = $("<script></script>");
            script.text(result);
            script.appendTo("head");
            treedrawing.startupTreedrawing(this.exit);
        }, function (err) {
            console.log(err);
        });
        var html = parser.parseXmlToHtml(this.props.content);
        $("#editpane").html(html);
    }
});
