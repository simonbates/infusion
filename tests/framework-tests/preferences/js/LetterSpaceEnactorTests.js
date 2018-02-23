/*
Copyright 2017-2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.letterSpace
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.letterSpaceEnactor", {
        gradeNames: ["fluid.prefs.enactor.letterSpace"],
        model: {
            value: 1
        },
        fontSizeMap: fluid.tests.enactors.utils.fontSizeMap
    });

    fluid.defaults("fluid.tests.letterSpaceTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            letterSpace: {
                type: "fluid.tests.prefs.enactor.letterSpaceEnactor",
                container: ".flc-letterSpace",
                createOnEvent: "{letterSpaceTester}.events.onTestCaseStart"
            },
            letterSpaceTester: {
                type: "fluid.tests.letterSpaceTester"
            }
        }
    });

    fluid.defaults("fluid.tests.letterSpaceTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.enactor.letterSpace",
            tests: [{
                expect: 10,
                name: "Set letter space",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{letterSpaceTests letterSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.letterSpaceTester.assertLetterSpace",
                    args: ["{letterSpace}", {value: 1, unit: 0}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.letterSpaceTester.assertLetterSpace",
                    args: ["{letterSpace}", {value: 2, unit: 1}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.letterSpaceTester.assertLetterSpace",
                    args: ["{letterSpace}", {value: -0.5, unit: -1.5}]
                }, {
                    funcName: "fluid.tests.letterSpaceTester.reset"
                }]
            }]
        }]
    });

    fluid.tests.letterSpaceTester.assertLetterSpace = function (that, expectedModel) {
        var pxVal = expectedModel.unit * 16; // convert from em to px
        var expectedLetterSpace = pxVal ? pxVal + "px" : "0";
        jqUnit.assertDeepEq("The model should be set correctly", expectedModel, that.model);
        jqUnit.assertEquals("The letter-spacing css style should be set to " + expectedLetterSpace, expectedLetterSpace, that.root.css("letter-spacing"));
        jqUnit.assertEquals("The letter-spacing of the content is set to " + expectedLetterSpace, expectedLetterSpace, that.container.css("letter-spacing"));
    };

    fluid.tests.letterSpaceTester.reset = function () {
        $("body").css("letter-spacing", "normal");
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.letterSpaceTests"
        ]);
    });

})(jQuery);
