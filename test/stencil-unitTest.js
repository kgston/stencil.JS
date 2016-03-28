QUnit.config.testTimeout = 5000;
var options = {};
var stencils = {};
var render = {};
render.rendered = false;
var autoStencils;

options.iterationCount = 5;

var isGUID = function(guid) {
    return /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(guid);
}
var isDestination = function(guid) {
    return /[\\.#]stencil-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(guid);
}
var hasChildOutputContainer = function(template) {
    return /[.\\n\\r]*<stencil-output.*><\/stencil-output>[.\\n\\r]*/.test(template);
}
var getGUID = function(template, index) {
    return template.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)[index];
}

//Library tests
QUnit.module("Library", {
    beforeEach: function() { },
    afterEach: function() { }
});

QUnit.test("Check all namespaces and functions", function(assert) {
    assert.ok(typeof stencil === "object", "Stencil namespace declared");
    assert.ok(typeof stencil.opts === "object", "Stencil Options namespace declared");
    assert.ok(typeof stencil.flags === "object", "Stencil Flags namespace declared");
    assert.ok(typeof stencil.attributes === "object", "Stencil Attributes namespace declared");

    assert.ok(typeof stencil.stencilHolder === "object", "Stencil stencilHolder namespace declared");
    assert.ok(typeof stencil.fetch === "function", "Stencil fetch function loaded");
    assert.ok(typeof stencil.define === "function", "Stencil define function loaded");
    assert.ok(typeof stencil.build === "function", "Stencil build function loaded");

    assert.ok(typeof stencil.util === "object", "Stencil util namespace declared");
    assert.ok(typeof stencil.util.guid === "function", "Stencil util GUID function loaded");
    assert.ok(typeof stencil.util.selectOption === "function", "Stencil util selectOption function loaded");
    assert.ok(typeof stencil.util.outerHTML === "function", "Stencil util outerHTML function loaded");
    assert.ok(typeof stencil.util.createWrapper === "function", "Stencil util createWrapper function loaded");
    assert.ok(typeof stencil.util.findStencils === "function", "Stencil util findStencils function loaded");
    assert.ok(typeof stencil.util.cleanUpStencils === "function", "Stencil util cleanUpStencils function loaded");
    assert.ok(typeof stencil.util.escapeCSS === "function", "Stencil util escapeCSS function loaded");
    assert.ok(typeof stencil.util.escapeHTML === "function", "Stencil util escapeHTML function loaded");
    assert.ok(typeof stencil.util.getKeyParts === "function", "Stencil util getKeyParts function loaded");
    assert.ok(typeof stencil.util.getKeyValue === "function", "Stencil util getKeyValue function loaded");
    assert.ok(typeof stencil.util.isIE === "function", "Stencil util isIE function loaded");
    assert.ok(typeof stencil.util.isObject === "function", "Stencil util isObject function loaded");
    assert.ok(typeof stencil.util.log === "function", "Stencil util log function loaded");
});

//Options tests
QUnit.module("Options", {
    setup: function() { },
    teardown: function() { }
});

QUnit.test("Check and list options", function(assert) {
    assert.ok(true, "Has the following options:");
    Object.keys(stencil.opts).forEach(function(key) {
        assert.ok(true, key + ": " + stencil.opts[key]);
    });
    assert.ok(stencil.opts.debug === false, "debug output should be off");
    assert.ok(stencil.opts.defaultOutputElement === "stencil-output", "defaultOutputElement should be stencil-output");
    assert.ok(stencil.opts.fetchTimeout === 30000, "fetchTimeout should be 30000ms");
    assert.ok(stencil.opts.ieNs === "", "ieNs should be blank");
});

QUnit.test("Check and list flags", function(assert) {
    assert.ok(true, "Has the following flags:");
    Object.keys(stencil.flags).forEach(function(key) {
        assert.ok(true, key + ": " + stencil.flags[key]);
    });
    assert.ok(stencil.flags.escapeHtml === true, "escapeHtml flag should be on");
});

QUnit.test("Check and list attributes", function(assert) {
    assert.ok(true, "Has the following attributes:");
    Object.keys(stencil.attributes).forEach(function(key) {
        assert.ok(true, key + ": " + stencil.attributes[key]);
    });
});

//Compilation tests
QUnit.module("Compilation", {
    setup: function() {
        if (stencils.toBeCloned == null) {
            stencils.toBeCloned = stencil.define("toBeCloned");
        }
    },
    teardown: function() { }
});

QUnit.test("Auto Build Test", function(assert) {
    //Run auto build
    var autoStencils = stencil.build("autosandbox");
    //Check if objects are created
    assert.ok(typeof autoStencils.autoSimple === "object", "AutoSimple Stencil creation");
    assert.ok(typeof autoStencils.autoSimple.guid === "string"
        && isGUID(autoStencils.autoSimple.guid), "AutoSimple Stencil Object GUID");
    assert.ok(typeof autoStencils.autoSimple.tagID === "string", "AutoSimple Stencil Object tagID");
    assert.ok(typeof autoStencils.autoSimple.template === "string", "AutoSimple Stencil Object template");
    assert.ok(typeof autoStencils.autoSimple.childStencils === "object"
        && Object.keys(autoStencils.autoSimple.childStencils).length === 0, "AutoSimple Stencil Object childStencils creation");
    assert.ok(typeof autoStencils.autoSimple.isStandard === "boolean"
        && autoStencils.autoSimple.isStandard, "AutoSimple Stencil Object isStandard");
    assert.ok(typeof autoStencils.autoSimple.destination === "string"
        && isDestination(autoStencils.autoSimple.destination), "AutoSimple Stencil Object destination");
    assert.ok(typeof autoStencils.autoSimple.clear === "function", "AutoSimple Stencil Object clear");
    assert.ok(typeof autoStencils.autoSimple.render === "function", "AutoSimple Stencil Object render");


    assert.ok(typeof autoStencils.autoNested === "object", "AutoNested Stencil creation");
    assert.ok(typeof autoStencils.autoNested.childStencils === "object"
        && Object.keys(autoStencils.autoNested.childStencils).length === 1, "AutoNested Stencil Object childStencils creation");

    //Check if output is generated in the right places
    assert.ok($("#autoSimpleTest>ul>stencil-output").length === 1, "AutoSimple output container");
    assert.ok($(autoStencils.autoSimple.destination).attr("class") === $("#autoSimpleTest>ul>stencil-output").attr("class"),
        "AutoSimple output destination linkage");

    assert.ok($("#autoNestedTest>stencil-output").length === 1, "AutoNested output container");
    assert.ok($(autoStencils.autoNested.destination).attr("class") === $("#autoNestedTest>stencil-output").attr("class"),
        "AutoNested output destination linkage");
});

QUnit.test("Manual Build Test - Specified Tag only", function(assert) {
    stencils.specificTag = stencil.define("specificTag");
    assert.ok(typeof stencils.specificTag === "object", "Stencil generation");
    assert.ok(Object.keys(stencils.specificTag.childStencils).length === 0, "Correct number of childStencils");
    assert.ok($("#specificTagTest>stencil-output").length === 1, "Output container generated");
    assert.ok($("#specificTagTest>stencil-output").attr("class") === $(stencils.specificTag.destination).attr("class"),
        "Output destination linkage");

});

QUnit.test("Manual Build Test - Specified Tag with Destination And Nesting", function(assert) {
    stencils.specificWithDest = stencil.define("specificWithDest", "#specificWithDestOutput");
    assert.ok(typeof stencils.specificWithDest === "object", "Stencil generation");
    assert.ok(Object.keys(stencils.specificWithDest.childStencils).length === 1, "Correct number of childStencils");
    assert.ok(stencils.specificWithDest.childStencils.specificWithDestChildContainer.tagID === "specificWithDestChildContainer", "Correct identity of childStencils");
    assert.ok(Object.keys(stencils.specificWithDest.childStencils.specificWithDestChildContainer.childStencils).length === 1, "Recursive building of childStencils");
    assert.ok(stencils.specificWithDest.childStencils.specificWithDestChildContainer.childStencils.specificWithDestChild.tagID === "specificWithDestChild",
        "Correct identity of deep childStencils");

    assert.ok(stencils.specificWithDest.destination === "#specificWithDestOutput", "Output container linkage");
    assert.ok(hasChildOutputContainer(stencils.specificWithDest.template), "Parent template contains child output container");
    assert.ok(getGUID(stencils.specificWithDest.template, 0) === getGUID(stencils.specificWithDest.childStencils.specificWithDestChildContainer.destination, 0),
        "Child output container class matches with childStencil destination");
    assert.ok(hasChildOutputContainer(stencils.specificWithDest.childStencils.specificWithDestChildContainer.template), "Child template contains inner child output container");
    assert.ok(getGUID(stencils.specificWithDest.childStencils.specificWithDestChildContainer.template, 0) === getGUID(stencils.specificWithDest.childStencils.specificWithDestChildContainer.childStencils.specificWithDestChild.destination, 0),
        "Inner child output container class matches with childStencil destination");
});

QUnit.test("Manual Build Test - Specified Tag with Destination and Specfic Childs", function(assert) {
    stencils.specificInner = stencil.define("specificInner", "#specificInnerOutput");
    assert.ok(typeof stencils.specificInner === "object", "Stencil generation");
    assert.ok(Object.keys(stencils.specificInner.childStencils).length === 2, "Correct number of childStencils");
    assert.ok(stencils.specificInner.destination === "#specificInnerOutput", "Output container linkage");

    assert.ok(isGUID(stencils.specificInner.childStencils.specificInnerChild1.destination), "childStencil1 destination");
    assert.ok(isGUID(stencils.specificInner.childStencils.specificInnerChild2.destination), "childStencil2 destination");
});

QUnit.test("Manual Build Test - Specified Tag without Destination but with Specific Childs and Defined Output Container", function(assert) {
    stencils.definedOutput = stencil.define("definedOutput", null, "div");
    assert.ok(typeof stencils.definedOutput === "object", "Stencil generation");
    assert.ok(Object.keys(stencils.definedOutput.childStencils).length === 1, "Correct number of childStencils");
    assert.ok($("#definedOutputTest>div").length === 1, "Output container generated");
    assert.ok($("#definedOutputTest>div").prev().html() === "Test content Head"
        && $("#definedOutputTest>div").next().html() === "Test content Tail", "Output container in correct location");
    assert.ok($("#definedOutputTest>div").attr("class") === $(stencils.definedOutput.destination).attr("class"),
        "Output destination linkage");

});

QUnit.test("Clone Test - Existing Tag with New Destination", function(assert) {
    stencils.cloned = stencil.define("toBeCloned", "#clonedOutput");
    assert.ok(typeof stencils.cloned === "object", "Stencil generation");
    assert.ok(stencils.cloned.guid !== stencils.toBeCloned.guid, "guid is fresh");
    assert.ok(stencils.cloned.destination !== stencils.toBeCloned.destination, "destination is fresh");
    assert.ok(stencils.cloned.tagID === stencils.toBeCloned.tagID, "tagID cloned");
    assert.ok(stencils.cloned.template === stencils.toBeCloned.template, "template cloned");
    assert.notDeepEqual(stencils.cloned.childStencils, stencils.toBeCloned.childStencils, "childStencils are not identical due to GUID")
});

QUnit.test("Fetch Test", function(assert) {
    var getStencils = stencil.fetch("fetchStencilTest.stencil");
    var done = assert.async(3);
    
    assert.expect(9);
    getStencils.progress(function(template) {
        if(template.tagID === "fetchedStencilFirstRender") {
            assert.ok(template.destination === "#fetchStencilTestFirst", "Correct destination");
            assert.ok(Object.keys(template.childStencils).length === 1, "Correct number of childStencils");
            assert.ok(typeof template.childStencils.fetchedStencilFirstChild == "object", "Child stencil ID correct");
            assert.ok(template.childStencils.fetchedStencilFirstChild.destination == "#fetchedChildOutput", "Correct child stencil destination");
        } else if(template.tagID === "fetchedStencilSecondRender") {
            assert.ok(template.destination === "#fetchStencilTestSecond", "Correct destination");
            assert.ok(Object.keys(template.childStencils).length === 1, "Correct number of childStencils");
            assert.ok(typeof template.childStencils.fetchedStencilSecondChild == "object", "Child stencil ID correct");
            assert.ok(isDestination(template.childStencils.fetchedStencilSecondChild.destination), "Correct child stencil destination");
        }
        done();
    }).done(function(templateList) {
        assert.ok(templateList.length === 2, "Correct number of stencils defined");
        done();
    }).fail(function() {
        assert.ok(false, "Unable to fetch stencils");
        done();
    });
});

QUnit.test("Fetch Test - Destination Override", function(assert) {
    var getStencils = stencil.fetch("fetchStencilTest.stencil", "#fetchOverrideOutput");
    var done = assert.async(3);
    
    assert.expect(9);
    getStencils.progress(function(template) {
        if(template.tagID === "fetchedStencilFirstRender") {
            assert.ok(template.destination === "#fetchOverrideOutput", "Correct destination");
            assert.ok(Object.keys(template.childStencils).length === 1, "Correct number of childStencils");
            assert.ok(typeof template.childStencils.fetchedStencilFirstChild == "object", "Child stencil ID correct");
            assert.ok(template.childStencils.fetchedStencilFirstChild.destination == "#fetchedChildOutput", "Correct child stencil destination");
        } else if(template.tagID === "fetchedStencilSecondRender") {
            assert.ok(template.destination === "#fetchOverrideOutput", "Correct destination");
            assert.ok(Object.keys(template.childStencils).length === 1, "Correct number of childStencils");
            assert.ok(typeof template.childStencils.fetchedStencilSecondChild == "object", "Child stencil ID correct");
            assert.ok(isDestination(template.childStencils.fetchedStencilSecondChild.destination), "Correct child stencil destination");
        }
        done();
    }).done(function(templateList) {
        assert.ok(templateList.length === 2, "Correct number of stencils defined");
        done();
    }).fail(function() {
        assert.ok(false, "Unable to fetch stencils");
        done();
    });
    
});

QUnit.test("Fetch Test - Invalid file", function(assert) {
    var getStencils = stencil.fetch("unknownFile.stencil");
    var done = assert.async();
    
    getStencils.progress(function() {
        assert.ok(false, "Progress triggered when stencil is not supposed to be avaliable");
        done();
    }).done(function() {
        assert.ok(false, "Done triggered when stencil is not supposed to be avaliable");
        done();
    }).fail(function() {
        assert.ok(true, "Fetch failure enters fail block");
        done();
    });
});

//Rendering Tests
QUnit.module("Rendering", {
    beforeEach: function(assert) {
        if (!render.rendered) {
            var done = assert.async();
            
            render.simpleRender = stencil.define("simpleRender");
            render.appendRender = stencil.define("simpleRender", "#appendRenderOutput");
            render.prependRender = stencil.define("simpleRender", "#prependRenderOutput");
            render.fragmentRender = stencil.define("simpleRender", "#fragmentRenderOutputInitial");
            render.noneRender = stencil.define("simpleRender", "#noneRenderOutput");
            render.clearRender = stencil.define("simpleRender", "#clearRenderOutput");
            render.deepRender = stencil.define("deepRender");
            render.nestedRender = stencil.define("nestedRender");
            render.noDataRender = stencil.define("noDataRender");
            render.blankRender = stencil.define("blankRender");
            render.complexRender = stencil.define("complexRender", "#complexRenderOutput");
            render.cloneRender = stencil.define("complexRender", "#clonedRenderOutput");
            render.specificChildRender = stencil.define("specificChildRender");
            render.definedOutputRender = stencil.define("definedOutputRender", null, "div");
            render.attributeChildStencilRender = stencil.define("attributeChildStencilRender");
            render.deepNestedChildStencilRender = stencil.define("deepNestedChildStencilRender");
            render.htmlEscapeStencilRender = stencil.define("htmlEscapeStencilRender");
            render.imgsrcStencilRender = stencil.define("imgsrcStencilRender");
            stencil.fetch("fetchStencilTest.stencil")
                .progress(function(template) {
                    render[template.tagID] = template;
                })
                .done(function() {
                    assert.ok(true, "Fetched fetchStencilTest.stencil");
                    done();
                })
                .fail(function() {
                    assert.ok(false, "Unable to fetch fetchStencilTest.stencil");
                    done();
                });
            
            render.rendered = true;
        }
    },
    afterEach: function() {}
});

QUnit.test("Iteration Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({ contents: ("test " + i) });
    }
    assert.ok(render.simpleRender.render(dataset), "Render output");
    assert.ok($("#simpleRenderTest>stencil-output").children().length === options.iterationCount, "Output validation for number of iterations");
    $("#simpleRenderTest>stencil-output>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index);
    });
});

QUnit.test("Deep Object Value Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({ first: { second: { contents: ("deep " + i) } } });
    }
    assert.ok(render.deepRender.render(dataset), "Render output");
    assert.ok($("#deepRenderTest>stencil-output").children().length === options.iterationCount, "Output validation for number of iterations");
    $("#deepRenderTest>stencil-output>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].first.second.contents, "Output validation for iteration " + index);
    });
});

QUnit.test("Nested Object Key Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        var obj = { nestedKey: "hello" + i };
        obj["appended" + i] = "Key"
        dataset.push(obj);
    }
    assert.ok(render.nestedRender.render(dataset), "Render output");
    assert.ok($("#nestedRenderTest>stencil-output").children().length === options.iterationCount, "Output validation for number of iterations");
    $("#nestedRenderTest>stencil-output>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].nestedKey, "Output validation for iteration " + index);
    });
});

QUnit.test("No Dataset Test", function(assert) {
    var dataset = [];
    assert.ok(!render.noDataRender.render(dataset), "No render output");
    assert.ok($("#noDataRenderTest>stencil-output").children().length === 0, "Output validation for number of iteration");
});

QUnit.test("Blank Dataset Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({});
    }
    assert.ok(render.blankRender.render(dataset), "Render output");
    assert.ok($("#blankRenderTest>stencil-output").children().length === options.iterationCount, "Output validation for number of iterations");
    $("#blankRenderTest>stencil-output>span").each(function(index) {
        assert.ok(this.innerHTML === "", "Output validation for iteration " + index);
    });
});

QUnit.test("Child Stencils Iteration Test", function(assert) {
    var dataset = [];
    var container = [];
    var child = [];
    for (var i = 0; i < options.iterationCount; i++) {
        child.push({ contents: ("child " + i) });
    }

    for (var i = 0; i < options.iterationCount; i++) {
        container.push({ complexRenderChild: child });
    }

    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({
            contents: ("test " + i),
            complexRenderChildContainer: container
        });
    }
    assert.ok(render.complexRender.render(dataset), "Render output");

    //Test to ensure that output is replaced
    assert.ok($("#complexRenderOutput>div:contains('Test content')").length === 0, "Ensure that output is cleared before output by default");

    $("#complexRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index + " (outer span tag)");
    });

    var outeridx = 0;
    var containeridx = 0;
    $("#complexRenderOutput>div>ul>li").each(function(index) {
        if (index % options.iterationCount === 0 && index !== 0) {
            containeridx++;
            if (containeridx === options.iterationCount) {
                containeridx = 0;
            }
        }
        if (index % (options.iterationCount * options.iterationCount) === 0 && index !== 0) {
            outeridx++;
            if (outeridx === options.iterationCount * options.iterationCount) {
                outeridx = 0;
            }
        }

        assert.ok(this.innerHTML === dataset[outeridx]
            .complexRenderChildContainer[containeridx]
            .complexRenderChild[index % options.iterationCount].contents +
            " - lpIdx: " + index % options.iterationCount + " - ctIdx: " + ((index % options.iterationCount) + 1),
            "Output validation for iteration " + outeridx + ", " + containeridx + ", " + index % options.iterationCount + " (inner li tag)");
    });
});

QUnit.test("Cloned Template Test", function(assert) {
    var dataset = [];
    var container = [];
    var child = [];
    for (var i = 0; i < options.iterationCount; i++) {
        child.push({ contents: ("child clone " + i) });
    }

    for (var i = 0; i < options.iterationCount; i++) {
        container.push({ complexRenderChild: child });
    }

    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({
            contents: ("test clone " + i),
            complexRenderChildContainer: container
        });
    }
    assert.ok(render.cloneRender.render(dataset), "Render output");

    //Test to ensure that output is replaced
    assert.ok($("#clonedRenderOutput>div:contains('Test content')").length === 0, "Ensure that output is cleared before output by default");

    $("#clonedRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index + " (outer span tag)");
    });

    var outeridx = 0;
    var containeridx = 0;
    $("#clonedRenderOutput>div>ul>li").each(function(index) {
        if (index % options.iterationCount === 0 && index !== 0) {
            containeridx++;
            if (containeridx === options.iterationCount) {
                containeridx = 0;
            }
        }
        if (index % (options.iterationCount * options.iterationCount) === 0 && index !== 0) {
            outeridx++;
            if (outeridx === options.iterationCount * options.iterationCount) {
                outeridx = 0;
            }
        }

        assert.ok(this.innerHTML === dataset[outeridx]
            .complexRenderChildContainer[containeridx]
            .complexRenderChild[index % options.iterationCount].contents +
            " - lpIdx: " + index % options.iterationCount + " - ctIdx: " + ((index % options.iterationCount) + 1),
            "Output validation for iteration " + outeridx + ", " + containeridx + ", " + index % options.iterationCount + " (inner li tag)");
    });
});

QUnit.test("Output Append Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({ contents: ("append " + i) });
    }
    assert.ok(render.appendRender.render(dataset, "append"), "Render output");
    assert.ok($("#appendRenderOutput").children().first().html().trim() === "Test content", "Ensure that output is appended");
    assert.ok($("#appendRenderOutput>span").length === options.iterationCount, "Output validation for number of iterations");
    $("#appendRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index);
    });
});

QUnit.test("Output Prepend Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({ contents: ("prepend " + i) });
    }
    assert.ok(render.prependRender.render(dataset, "prepend"), "Render output");
    assert.ok($("#prependRenderOutput:last").children().last().html().trim() === "Test content", "Ensure that output is prepended");
    assert.ok($("#prependRenderOutput>span").length === options.iterationCount, "Output validation for number of iterations");
    $("#prependRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index);
    });
});

QUnit.test("Output None Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({ contents: ("none " + i) });
    }

    assert.ok(render.noneRender.render(dataset), "Render default output");
    assert.ok($("#noneRenderOutput>span").length === options.iterationCount, "Output validation for number of iterations");
    $("#noneRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index);
    });
    var output = render.noneRender.render(dataset, "none");
    assert.ok(output.context.nodeType != null, "Render none output");
    assert.ok($("#noneRenderOutput").children().length === 0, "Clear output");
    $("#noneRenderOutput").append(output);
    assert.ok($("#noneRenderOutput>span").length === options.iterationCount, "Output validation for number of iterations");
    $("#noneRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index);
    });
});

QUnit.test("Output Fragment Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({ contents: ("fragment " + i) });
    }

    var datasetFinal = [];
    for (var i = 0; i < options.iterationCount; i++) {
        datasetFinal.push({ contents: ("fragmentFinal " + i) });
    }
    assert.ok(render.fragmentRender.render(dataset), "Render default output");
    assert.ok($("#fragmentRenderOutputInitial div").length === 0, "Ensure that contents are cleared as default");
    assert.ok($("#fragmentRenderOutputInitial>span").length === options.iterationCount, "Output validation for initial number of iterations");
    $("#fragmentRenderOutputInitial>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for initial iteration " + index);
    });

    var output = render.fragmentRender.render(datasetFinal, "fragment")
    $("#fragmentRenderOutputFinal").append(output);
    assert.ok(output.context.nodeType != null, "Render fragment output");
    assert.ok($("#fragmentRenderOutputFinal>span").length === options.iterationCount, "Output validation for final number of iterations");
    $("#fragmentRenderOutputFinal>span").each(function(index) {
        assert.ok(this.innerHTML === datasetFinal[index].contents, "Output validation for final iteration " + index);
    });
});

QUnit.test("Specific Child Output Test", function(assert) {
    var dataset = [];
    var child1 = [];
    var child2 = [];
    for (var i = 0; i < options.iterationCount; i++) {
        child1.push({ contents: ("child 1 " + i) });
    }

    for (var i = 0; i < options.iterationCount; i++) {
        child2.push({ contents: ("child 2 " + i) });
    }

    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({
            contents: ("specific child " + i),
            specificChildRenderChild1: child1,
            specificChildRenderChild2: child2
        });
    }
    assert.ok(render.specificChildRender.render(dataset), "Render output");

    assert.ok($("#specificChildRenderOutput").children().length === 3 * options.iterationCount, "Correct number of output items");
    $("#specificChildRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index + " (outer span tag)");
    });

    var mainIdx = 0;
    var childName = "specificChildRenderChild1";
    $("#specificChildRenderOutput>div>span").each(function(index) {
        if (index % (options.iterationCount * 2) === 0 && index !== 0) {
            mainIdx++;
            if (mainIdx === options.iterationCount) {
                mainIdx = 0;
            }
        }

        if (index % options.iterationCount === 0 && index !== 0) {
            if (childName === "specificChildRenderChild1") {
                childName = "specificChildRenderChild2";
            } else {
                childName = "specificChildRenderChild1";
            }
        }

        assert.ok(this.innerHTML === dataset[mainIdx][childName][index % options.iterationCount].contents,
            "Output validation for iteration " + mainIdx + ", " + index % options.iterationCount + " (inner div tag)");
    });
});

QUnit.test("Nested Output & Selector Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({
            contents: ("clear " + i),
            renderSelectOptions: [{
                value: "apple"
            },
                {
                    value: "banana"
                },
                {
                    value: "cherry"
                },
                {
                    value: "dragonfruit"
                }],
            select: {
                selectThis: "cherry"
            }
        });
    }
    assert.ok(render.definedOutputRender.render(dataset), "Render output");
    assert.ok($("#definedOutputRenderTest>div").prev().html().trim() === "Test content Head", "Check item above");
    assert.ok($("#definedOutputRenderTest>div").next().html().trim() === "Test content Tail", "Check item below");
    assert.ok($("#definedOutputRenderTest>div>span").length === options.iterationCount, "Output validation for number of iterations");
    $("#definedOutputRenderTest>div>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index);
    });
    $("#definedOutputRenderTest>div>select").each(function(index) {
        assert.ok($(this).val() === dataset[index].select.selectThis, "Output validation for selector " + index);
    });
});

QUnit.test("Clear Test", function(assert) {
    var dataset = [];
    for (var i = 0; i < options.iterationCount; i++) {
        dataset.push({ contents: ("clear " + i) });
    }
    assert.ok(render.clearRender.render(dataset, "prepend"), "Render output");
    assert.ok($("#clearRenderOutput:last").children().last().html().trim() === "Test content", "Ensure that output is prepended");
    assert.ok($("#clearRenderOutput>span").length === options.iterationCount, "Output validation for number of iterations");
    $("#clearRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index);
    });
    render.clearRender.clear();
    assert.ok($("#clearRenderOutput").children().first().html().trim() === "Test content", "Place content back after clearing");
});

QUnit.test("Attribute Defined Child Stencil Test", function(assert) {
    var dataset = {
        content: "outerStencil",
        innerStencil: []
    };
    for (var i = 0; i < options.iterationCount; i++) {
        var innerData = {};
        innerData["ddl{{lpIdx}}"] = [{
            item: "foo " + i
        }, {
                item: "foo " + i
            }, {
                item: "foo " + i
            }];
        dataset.innerStencil.push(innerData);
    }
    assert.ok(render.attributeChildStencilRender.render(dataset), "Render output");

    $("#attributeChildStencilTest select").each(function(selectIndex) {
        assert.ok(this.id == "ddl" + selectIndex, "Correct dynamic ID ddl" + selectIndex);
        assert.ok($(this).children().length == 3, "Correct number of options - 3? Actual:" + $(this).children().length);
        $(this).children().each(function eachOption(optionIndex) {
            assert.ok(this.innerHTML == "foo " + selectIndex + " - " + optionIndex, "Dynamic option value is correct");
        })
    });
});

QUnit.test("Deep Nested Child Stencil Test", function(assert) {
    var dataset = {
        tableRow: []
    };
    for (var i = 0; i < options.iterationCount; i++) {
        var row = [];
        for (var j = 0; j < options.iterationCount; j++) {
            row.push({
                cellData: i + " - " + j
            });
        }
        dataset.tableRow.push({
            "row{{lpIdx}}": row
        });
    }
    assert.ok(render.deepNestedChildStencilRender.render(dataset), "Render output");

    var rows = $("#tableRow").children();
    assert.ok(rows.length === options.iterationCount, "Correct number of rows in table");
    rows.each(function(rowIndex) {
        var cells = $(this).children();
        assert.ok(this.id === "row" + rowIndex, "Correct dynamic ID");
        assert.ok(cells.length === options.iterationCount, "Correct number of cells in row " + rowIndex);
        cells.each(function(cellIndex) {
            assert.ok(this.innerHTML.trim() === rowIndex + " - " + cellIndex, "Correct cell content " + rowIndex + " - " + cellIndex);
        });
    });
});

QUnit.test("HTML Escaping and Flags Stencil Test", function(assert) {
    var escaped = "&lt;ul&gt;&lt;li&gt;this is a list&lt;/li&gt;&lt;/ul&gt;"
    var content = "<ul><li>this is a list</li></ul>"
    
    var dataset = {
        content: content
    };
    
    assert.ok(render.htmlEscapeStencilRender.render(dataset), "Render output");
    
    assert.ok($("#forcedUnescaped").html() === content, "Forced unescaped output");
    assert.ok($("#forcedEscaped").html() === escaped, "Forced escaped output");
    assert.ok($("#undefined").html() === "", "Undefined output");
    assert.ok($("#forcedUnescaped").html() === (stencil.opts.escapeHtml)? escaped: content, "Default output");
});

QUnit.test("Imgsrc test", function(assert) {
    var dataset = {
        imgsrc: "imgURL/abcdef.test"
    };
    
    assert.ok(render.imgsrcStencilRender.render(dataset), "Render output");
    
    assert.ok($("#imgsrcImg").attr("src") === "imgURL/abcdef.test", "Image source correct");
});

QUnit.test("Fetch test", function(assert) {
    assert.expect(14);
    
    var datasetFirst = {
        fetchedStencilFirstChild: []
    };
    
    var datasetSecond = {
        fetchedStencilSecondChild: []
    };
    
    for (var i = 0; i < options.iterationCount; i++) {
        datasetFirst.fetchedStencilFirstChild.push({
            contents: "First - " + i
        });
        datasetSecond.fetchedStencilSecondChild.push({
            contents: "Second - " + i
        });
    }
    
    assert.ok(render.fetchedStencilFirstRender.render(datasetFirst), "Render output first");
    assert.ok(render.fetchedStencilSecondRender.render(datasetSecond), "Render output second");
    
    var outputFirst = $("#fetchStencilTestFirst #fetchedChildOutput").children();
    assert.ok(outputFirst.length === options.iterationCount, "Correct number of iterations");
    outputFirst.each(function(index) {
        assert.ok(this.innerHTML === "First - " + index, "Correct output for first - " + index);
    });
    
    var outputSecond = $("#fetchStencilTestSecond #fetchedStencilSecondChild").children();
    assert.ok(outputSecond.length === options.iterationCount, "Correct number of iterations");
    outputSecond.each(function(index) {
        assert.ok(this.innerHTML === "Second - " + index, "Correct output for second - " + index);
    });
});