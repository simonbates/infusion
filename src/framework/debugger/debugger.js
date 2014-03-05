// Usage:
// fluid.activityTracing = true;
// fluid.debugger.init("body");

fluid.debugger = { };

fluid.debugger.init = function (selector) {
    var control = $("<div><a href=\"#\">Dump activityTrace</a></div>").appendTo(selector);
    control.click(function () {
        fluid.debugger.dumpActivityTrace();
        return false;
    });
}

fluid.debugger.dumpActivityTrace = function () {
    var nest_level = 0;
    var min_nest_level = 0;
    var max_nest_level = 0;
    var traceDump = $("<pre>").appendTo("body");
    for (var i = 0; i < fluid.activityTrace.length; ++i) {
        var activity = fluid.activityTrace[i];
        if (activity.pop) {
            nest_level -= activity.pop;
            min_nest_level = Math.min(min_nest_level, nest_level);
        } else {
            traceDump.append("[" + nest_level + "] ");
            traceDump.append(fluid.debugger.getIndent(nest_level));
            traceDump.append("[" + activity.type + "] ");
            var activitySummary = fluid.debugger.buildSummary(activity);
            var summaryContainer = $("<span>").appendTo(traceDump);
            summaryContainer.text(activitySummary);
            traceDump.append("\n");
            nest_level += 1;
            max_nest_level = Math.max(max_nest_level, nest_level);
        }
    }
    traceDump.append("\n");
    traceDump.append("nest_level at end = " + nest_level + "\n");
    traceDump.append("min_nest_level = " + min_nest_level + "\n");
    traceDump.append("max_nest_level = " + max_nest_level + "\n");
}

fluid.debugger.getIndent = function (n) {
    var indent = "";
    for (var i = 0; i < n; ++i) {
        indent += " ";
    }
    return indent;
}

fluid.debugger.buildSummary = function (activity) {
    var message = activity.message;
    var keys = fluid.keys(activity.args);
    keys = keys.sort(fluid.compareStringLength());
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var re = fluid.stringToRegExp("%" + key, "g");
        var value = activity.args[key];
        if ($.isFunction(value)) {
            value = "<FUNCTION>";
        }
        message = message.replace(re, value);
    }
    return message;
}
