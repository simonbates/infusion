/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit, sinon */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /**************************************************************************
     * Unit tests for fluid.prefs.enactor.captions.youTubePlayer functions
     **************************************************************************/

    fluid.registerNamespace("fluid.tests.prefs.enactor.captions.youTubePlayer");

    fluid.tests.prefs.enactor.captions.youTubePlayer.parseQueryStringTestCases = [{
        name: "empty",
        query: "",
        expected: {}
    }, {
        name: "only leading \"?\"",
        query: "?",
        expected: {}
    }, {
        name: "leading \"?\"",
        query: "?foo=bar",
        expected: {foo: "bar"}
    }, {
        name: "no leading \"?\"",
        query: "foo=bar",
        expected: {foo: "bar"}
    }, {
        name: "multiple params",
        query: "foo=bar&a=b",
        expected: {foo: "bar", a: "b"}
    }, {
        name: "duplicate params",
        query: "foo=bar&foo=baz",
        expected: {foo: "baz"}
    }, {
        name: "encoded value",
        query: "email=my%40e-mail.com",
        expected: {email: "my@e-mail.com"}
    }];

    jqUnit.test("Test fluid.prefs.enactor.captions.youTubePlayer.parseQueryString", function () {
        fluid.each(fluid.tests.prefs.enactor.captions.youTubePlayer.parseQueryStringTestCases, function (testCase) {
            var params = fluid.prefs.enactor.captions.youTubePlayer.parseQueryString(testCase.query);
            jqUnit.assertDeepEq(testCase.name + " - The params should have been parsed from the query string correctly", testCase.expected, params);
        });
    });

    fluid.tests.prefs.enactor.captions.youTubePlayer.enableJSAPITestCases = [{
        name: "no query parameters",
        src: "https://localhost:8888/embed/SjnXy0Iplvs"
    }, {
        name: "jsapi disabled",
        src: "https://localhost:8888/embed/SjnXy0Iplvs/?enablejsapi=0"
    }, {
        name: "jsapi invalid",
        src: "https://localhost:8888/embed/SjnXy0Iplvs/?enablejsapi=false"
    }, {
        name: "jsapi enabled",
        src: "https://localhost:8888/embed/SjnXy0Iplvs/?enablejsapi=1"
    }, {
        name: "other params",
        src: "https://localhost:8888/embed/SjnXy0Iplvs/?controls=0&loop=1"
    }];

    jqUnit.test("Test fluid.prefs.enactor.captions.youTubePlayer.enableJSAPI", function () {
        var expectedParam = "enablejsapi=1";
        fluid.each(fluid.tests.prefs.enactor.captions.youTubePlayer.enableJSAPITestCases, function (testCase) {
            var elm = $("<iframe src =\"" + testCase.src + "\">");
            fluid.prefs.enactor.captions.youTubePlayer.enableJSAPI(elm);
            jqUnit.assertTrue(testCase.name + " - The params should have been parsed from the query string correctly", elm.attr("src").indexOf(expectedParam) >= 0);
        });
    });

    fluid.tests.prefs.enactor.captions.youTubePlayer.verifyApplyCaptions = function (msgPrefix, player, track, state) {
        if (state) {
            jqUnit.assertTrue(msgPrefix + ": the loadModule method was called", player.loadModule.calledWithExactly("captions"));
            jqUnit.assertTrue(msgPrefix + ": the setOption method was called", player.setOption.calledWithExactly("captions", "track", track));
            jqUnit.assertFalse(msgPrefix + ": the unloadModule method was not called", player.unloadModule.called);
        } else {
            // captions disabled
            jqUnit.assertFalse(msgPrefix + ": the loadModule method was not called", player.loadModule.called);
            jqUnit.assertFalse(msgPrefix + ": the setOption method was not called", player.setOption.called);
            jqUnit.assertTrue(msgPrefix + ": the unloadModule method was called", player.unloadModule.calledWithExactly("captions"));
        }
    };

    jqUnit.test("Test fluid.prefs.enactor.captions.youTubePlayer.applyCaptions", function () {
        var testTrack = {track: "test"};
        var player = new fluid.tests.mock.YT.player("applyCaptionsTest");

        // captions enabled
        fluid.prefs.enactor.captions.youTubePlayer.applyCaptions(player, testTrack, true);
        fluid.tests.prefs.enactor.captions.youTubePlayer.verifyApplyCaptions("Captions Enabled", player, testTrack, true);
        sinon.resetHistory();

        // captions disabled
        fluid.prefs.enactor.captions.youTubePlayer.applyCaptions(player, testTrack, false);
        fluid.tests.prefs.enactor.captions.youTubePlayer.verifyApplyCaptions("Captions Disabled", player, testTrack, false);
        sinon.resetHistory();

        // API hasn't loaded yet - no loadModule available
        player.loadModule = undefined;
        fluid.prefs.enactor.captions.youTubePlayer.applyCaptions(player, testTrack, false);
        jqUnit.assertFalse("API not loaded: the setOption method was not called", player.setOption.called);
        jqUnit.assertFalse("API not loaded: the unloadModule method was not called", player.unloadModule.called);
        sinon.resetHistory();
    });

    fluid.tests.prefs.enactor.captions.youTubePlayer.testPrepTrack = function (msgPrefix, defaultTrackList, returnedTracklist) {
        var mockThat = {tracklist: defaultTrackList, applier: {change: sinon.stub()}};
        var player = new fluid.tests.mock.YT.player("prepTrackTest");
        player.getOption.returns(returnedTracklist);
        var tracklist = defaultTrackList.length ? defaultTrackList : returnedTracklist;

        // Test prepTrack function
        fluid.prefs.enactor.captions.youTubePlayer.prepTrack(mockThat, player);

        jqUnit.assertTrue(msgPrefix + ": the loadModule method was called", player.loadModule.calledWithExactly("captions"));
        jqUnit.assertTrue(msgPrefix + ": the getOption method was called", player.getOption.calledWithExactly("captions", "tracklist"));
        jqUnit.assertDeepEq(msgPrefix + ": the tracklist member has the expected value", tracklist, mockThat.tracklist);

        if (defaultTrackList.length || !mockThat.tracklist.length) {
            jqUnit.assertFalse("Tracklist already populated: a model change for the \"track\" model path was not triggered", mockThat.applier.change.calleded);
        } else {
            jqUnit.assertTrue("Tracklist from module: a model change for the \"track\" model path was triggered", mockThat.applier.change.calledWithExactly("track", tracklist[0], "ADD", "prepTrack"));
        }

        sinon.resetHistory();
    };

    jqUnit.test("Test fluid.prefs.enactor.captions.youTubePlayer.prepTrack", function () {
        var tracklist = [{track: 1}, {track: 2}];

        // Load tracklist from module
        fluid.tests.prefs.enactor.captions.youTubePlayer.testPrepTrack("Tracklist from module", [], tracklist);

        // tracklist already populated
        fluid.tests.prefs.enactor.captions.youTubePlayer.testPrepTrack("Tracklist from module", tracklist, tracklist);

        // No tracklist returned from module
        fluid.tests.prefs.enactor.captions.youTubePlayer.testPrepTrack("Tracklist from module", [], []);
    });

    /*******************************************************************************
     * IoC Unit tests for fluid.prefs.enactor.captions.youTubePlayer
     *******************************************************************************/

    fluid.defaults("fluid.tests.youTubePlayerTests", {
        gradeNames: ["fluid.tests.mockYTEnvironment"],
        listeners: {
            "onCreate.setupMockYTPlayer": {
                listener: "{that}.initYT",
                priority: "first"
            }
        },
        components: {
            youtTubePlayer: {
                type: "fluid.prefs.enactor.captions.youTubePlayer",
                container: ".flc-captions-ytPlayer",
                createOnEvent: "onYTPlayerReady"
            },
            youtTubePlayerTester: {
                type: "fluid.tests.youtTubePlayerTester",
                createOnEvent: "onYTPlayerReady"
            }
        }
    });

    fluid.defaults("fluid.tests.youtTubePlayerTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            tracklist: [{track: 1}, {track: 2}]
        },
        modules: [{
            name: "fluid.prefs.enactor.captions.youTubePlayer",
            tests: [{
                expect: 18,
                name: "Init and Operation",
                sequence: [{
                    funcName: "fluid.tests.youtTubePlayerTester.verifyInit",
                    args: ["{youtTubePlayer}"]
                }, {
                    func: "fluid.tests.youtTubePlayerTester.setTracklistReturn",
                    args: ["{youtTubePlayer}", "{that}.options.testOpts.tracklist"]
                }, {
                    func: "{youtTubePlayer}.player.options.events.onApiChange"
                }, {
                    listener: "fluid.tests.youtTubePlayerTester.verifyTrackPrep",
                    args: [
                        "{youtTubePlayer}",
                        "{that}.options.testOpts.tracklist"
                    ],
                    changeEvent: "{youtTubePlayer}.applier.modelChanged",
                    spec: {path: "track", priority: "last:testing"}
                }, {
                    funcName: "fluid.tests.youtTubePlayerTester.resetSinonHistory"
                }, {
                    func: "{youtTubePlayer}.applier.change",
                    args: ["captions", true]
                }, {
                    listener: "fluid.tests.prefs.enactor.captions.youTubePlayer.verifyApplyCaptions",
                    args: [
                        "Captions Enabled",
                        "{youtTubePlayer}.player",
                        "{youtTubePlayer}.model.track",
                        true
                    ],
                    changeEvent: "{youtTubePlayer}.applier.modelChanged",
                    spec: {path: "captions", priority: "last:testing"}
                }, {
                    funcName: "fluid.tests.youtTubePlayerTester.resetSinonHistory"
                }, {
                    func: "{youtTubePlayer}.applier.change",
                    args: ["captions", false]
                }, {
                    listener: "fluid.tests.prefs.enactor.captions.youTubePlayer.verifyApplyCaptions",
                    args: [
                        "Captions Disabled:",
                        "{youtTubePlayer}.player",
                        "{youtTubePlayer}.model.track",
                        false
                    ],
                    changeEvent: "{youtTubePlayer}.applier.modelChanged",
                    spec: {path: "captions", priority: "last:testing"}
                }, {
                    funcName: "fluid.tests.youtTubePlayerTester.resetSinonHistory"
                }, {
                    func: "{youtTubePlayer}.applier.change",
                    args: ["track", "{that}.options.testOpts.tracklist.1"]
                }, {
                    listener: "fluid.tests.prefs.enactor.captions.youTubePlayer.verifyApplyCaptions",
                    args: [
                        "Track Changed",
                        "{youtTubePlayer}.player",
                        "{that}.options.testOpts.tracklist.1",
                        false
                    ],
                    changeEvent: "{youtTubePlayer}.applier.modelChanged",
                    spec: {path: "track", priority: "last:testing"}
                }]
            }]
        }]
    });

    fluid.tests.youtTubePlayerTester.resetSinonHistory = function () {
        sinon.resetHistory();
    };

    fluid.tests.youtTubePlayerTester.setTracklistReturn = function (that, tracklist) {
        that.player.getOption.returns(tracklist);
    };

    fluid.tests.youtTubePlayerTester.verifyInit = function (that) {
        var apiParam = "enablejsapi=1";
        jqUnit.assertValue("The YT Player has been created", that.player);
        jqUnit.assertTrue("The src for the embedded video should have the \"" + apiParam + "\" parameter", that.container.attr("src").indexOf(apiParam) >= 0);
    };

    fluid.tests.youtTubePlayerTester.verifyTrackPrep = function (that, tracklist) {
        jqUnit.assertTrue("Verify Track Prep: the loadModule method was called", that.player.loadModule.calledWithExactly("captions"));
        jqUnit.assertTrue("Verify Track Prep: the loadModule method was called only once", that.player.loadModule.calledOnce);
        jqUnit.assertTrue("Verify Track Prep: the getOption method was called", that.player.getOption.calledWithExactly("captions", "tracklist"));
        jqUnit.assertDeepEq("Verify Track Prep: the tracklist member is set", tracklist, that.tracklist);
        jqUnit.assertDeepEq("Verify Track Prep: the track model value is set", tracklist[0], that.model.track);
        jqUnit.assertFalse("Verify Track Prep: the setOption method was not called", that.player.setOption.called);
        jqUnit.assertTrue("Verify Track Prep: the unloadModule method was called", that.player.unloadModule.calledWithExactly("captions"));
    };

    /*******************************************************************************
     * IoC Unit tests for fluid.prefs.enactor.captions
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.captions", {
        gradeNames: ["fluid.prefs.enactor.captions"],
        model: {
            enabled: false
        },
        members: {
            record: {
                onVideoElmLocated: []
            }
        },
        listeners: {
            "onVideoElmLocated.record": {
                listener: "fluid.tests.prefs.enactor.captions.recordEvent",
                args: ["{that}", "onVideoElmLocated", "{arguments}.0"],
                priority: "first"
            }
        }
    });

    fluid.tests.prefs.enactor.captions.recordEvent = function (that, path, value) {
        var currentRecord = fluid.get(that.record, path);
        currentRecord.push(value);
        fluid.set(that.record, path, currentRecord);
    };

    fluid.defaults("fluid.tests.captionsTests", {
        gradeNames: ["fluid.tests.mockYTEnvironment"],
        events: {
            onTestCaseStart: null
        },
        listeners: {
            "onCreate.setupMockYTPlayer": {
                listener: "{that}.initYT",
                priority: "first"
            }
        },
        components: {
            captions: {
                type: "fluid.tests.prefs.enactor.captions",
                container: ".flc-captions",
                createOnEvent: "{captionsTests}.events.onTestCaseStart"
            },
            captionsTester: {
                type: "fluid.tests.captionsTester",
                createOnEvent: "onYTPlayerReady",
                options: {
                    events: {
                        onTestCaseStart: "{captionsTests}.events.onTestCaseStart"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.captionsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            componentNames: ["player", "player-1"]
        },
        modules: [{
            name: "fluid.prefs.enactor.captions",
            tests: [{
                expect: 7,
                name: "Init and Events",
                sequence: [{
                    funcName: "jqUnit.assertEquals",
                    args: ["The onVideoElmLocated should have fired for each found element", 2, "{captions}.record.onVideoElmLocated.length"]
                }, {
                    funcName: "fluid.tests.captionsTester.verifyDynamicComponentsCreated",
                    args: ["{captions}", "{that}.options.testOpts.componentNames"]
                }, {
                    funcName: "{captions}.applier.change",
                    args: ["enabled", true]
                }, {
                    listener: "fluid.tests.captionsTester.verifyDynamicComponentsModel",
                    args: [
                        "{captions}",
                        "{that}.options.testOpts.componentNames",
                        true
                    ],
                    changeEvent: "{captions}.applier.modelChanged",
                    spec: {path: "enabled", priority: "last:testing"}
                }, {
                    funcName: "{captions}.applier.change",
                    args: ["enabled", false]
                }, {
                    listener: "fluid.tests.captionsTester.verifyDynamicComponentsModel",
                    args: [
                        "{captions}",
                        "{that}.options.testOpts.componentNames",
                        false
                    ],
                    changeEvent: "{captions}.applier.modelChanged",
                    spec: {path: "enabled", priority: "last:testing"}
                }]
            }]
        }]
    });

    fluid.tests.captionsTester.verifyDynamicComponentsCreated = function (that, componentNames) {
        fluid.each(componentNames, function (name) {
            jqUnit.assertValue("The \"" + name + "\" dynamic component was created.", that[name]);
        });
    };

    fluid.tests.captionsTester.verifyDynamicComponentsModel = function (that, componentNames, state) {
        fluid.each(componentNames, function (name) {
            jqUnit.assertEquals("The \"" + name + "\" dynamic component model is set correctly.", state, that[name].model.captions);
        });
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.youTubePlayerTests",
            "fluid.tests.captionsTests"
        ]);
    });

})(jQuery);
