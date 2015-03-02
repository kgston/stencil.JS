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
    return /[\\.#][0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(guid);
}
var hasChildOutputContainer = function(template) {
    return /[.\\n\\r]*<stencil-output.*><\/stencil-output>[.\\n\\r]*/.test(template);
}
var getGUID = function(template, index) {
    return template.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)[index];
}

//Compilation tests
QUnit.module("Compilation", {
    setup: function() {
        if(stencils.toBeCloned == null) {
            stencils.toBeCloned = stencil.define("toBeCloned");
        }
    },
    teardown: function() {

    }
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
        "AutoNested output destination linkage" );
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
    stencils.specificInner = stencil.define("specificInner", "#specificInnerOutput", ["specificInnerChild1", "specificInnerChild2"]);
    assert.ok(typeof stencils.specificInner === "object", "Stencil generation");
    assert.ok(Object.keys(stencils.specificInner.childStencils).length === 2, "Correct number of childStencils");
    assert.ok(stencils.specificInner.destination === "#specificInnerOutput", "Output container linkage");
    
    assert.ok(stencils.specificInner.childStencils.specificInnerChild1.destination === ".specificInnerChild1", "childStencil1 destination");
    assert.ok(stencils.specificInner.childStencils.specificInnerChild2.destination === ".specificInnerChild2", "childStencil2 destination");
});

QUnit.test("Manual Build Test - Specified Tag without Destination but with Specific Childs and Defined Output Container", function(assert) {
    stencils.definedOutput = stencil.define("definedOutput", null, ["selectOptions"], "div");
    assert.ok(typeof stencils.definedOutput === "object", "Stencil generation");
    assert.ok(Object.keys(stencils.definedOutput.childStencils).length === 1, "Correct number of childStencils");
    assert.ok($("#definedOutputTest>div").length === 1, "Output container generated");
    assert.ok($("#definedOutputTest>div").prev().html() === "Test content Head" 
        && $("#definedOutputTest>div").next().html() === "Test content Tail" , "Output container in correct location");
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

//Rendering Tests
QUnit.module("Rendering", {
    setup: function() {
        if(!render.rendered) {
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
            render.specificChildRender = stencil.define("specificChildRender", "#specificChildRenderOutput", ["specificChildRenderChild1", "specificChildRenderChild2"]);
            render.definedOutputRender = stencil.define("definedOutputRender", null, ["renderSelectOptions"], "div");
            render.attributeChildStencilRender = stencil.define("attributeChildStencilRender", "#attributeChildStencilTest");
            render.rendered = true;
        }
    },
    teardown: function() {
        
    }
});

QUnit.test("Iteration Test", function(assert) {
    var dataset = [];
    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({contents: ("test " + i)});
    }
    assert.ok(render.simpleRender.render(dataset), "Render output");
    assert.ok($("#simpleRenderTest>stencil-output").children().length === options.iterationCount, "Output validation for number of iterations");
    $("#simpleRenderTest>stencil-output>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index);
    });
});

QUnit.test("Deep Object Value Test", function(assert) {
    var dataset = [];
    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({first:{second:{contents: ("deep " + i)}}});
    }
    assert.ok(render.deepRender.render(dataset), "Render output");
    assert.ok($("#deepRenderTest>stencil-output").children().length === options.iterationCount, "Output validation for number of iterations");
    $("#deepRenderTest>stencil-output>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].first.second.contents, "Output validation for iteration " + index);
    });
});

QUnit.test("Nested Object Key Test", function(assert) {
    var dataset = [];
    for(var i = 0; i < options.iterationCount; i++) {
        var obj = {nestedKey: "hello" + i};
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
    for(var i = 0; i < options.iterationCount; i++) {
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
    for(var i = 0; i < options.iterationCount; i++) {
        child.push({contents: ("child " + i)});
    }

    for(var i = 0; i < options.iterationCount; i++) {
        container.push({complexRenderChild: child});
    }

    for(var i = 0; i < options.iterationCount; i++) {
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
        if(index % options.iterationCount === 0 && index !== 0) {
            containeridx++;
            if(containeridx === options.iterationCount) {
                containeridx = 0;
            }
        }
        if(index % (options.iterationCount * options.iterationCount) === 0 && index !== 0) {
            outeridx++;
            if(outeridx === options.iterationCount * options.iterationCount) {
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
    for(var i = 0; i < options.iterationCount; i++) {
        child.push({contents: ("child clone " + i)});
    }

    for(var i = 0; i < options.iterationCount; i++) {
        container.push({complexRenderChild: child});
    }

    for(var i = 0; i < options.iterationCount; i++) {
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
        if(index % options.iterationCount === 0 && index !== 0) {
            containeridx++;
            if(containeridx === options.iterationCount) {
                containeridx = 0;
            }
        }
        if(index % (options.iterationCount * options.iterationCount) === 0 && index !== 0) {
            outeridx++;
            if(outeridx === options.iterationCount * options.iterationCount) {
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
    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({contents: ("append " + i)});
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
    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({contents: ("prepend " + i)});
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
    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({contents: ("none " + i)});
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
    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({contents: ("fragment " + i)});
    }

    var datasetFinal = [];
    for(var i = 0; i < options.iterationCount; i++) {
        datasetFinal.push({contents: ("fragmentFinal " + i)});
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
    for(var i = 0; i < options.iterationCount; i++) {
        child1.push({contents: ("child 1 " + i)});
    }

    for(var i = 0; i < options.iterationCount; i++) {
        child2.push({contents: ("child 2 " + i)});
    }

    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({
            contents: ("specific child " + i),
            specificChildRenderChild1: child1,
            specificChildRenderChild2: child2
        });
    }
    assert.ok(render.specificChildRender.render(dataset), "Render output");

    $("#specificChildRenderOutput>span").each(function(index) {
        assert.ok(this.innerHTML === dataset[index].contents, "Output validation for iteration " + index + " (outer span tag)");
    });

    var mainIdx = 0;
    var childName = "specificChildRenderChild1";
    $("#specificChildRenderOutput>div>span").each(function(index) {
        if(index % (options.iterationCount * 2) === 0 && index !== 0) {
            mainIdx++;
            if(mainIdx === options.iterationCount) {
                mainIdx = 0;
            }
        }
        
        if(index % options.iterationCount === 0 && index !== 0) {
            if(childName === "specificChildRenderChild1") {
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
    for(var i = 0; i < options.iterationCount; i++) {
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
    assert.ok($("#definedOutputRenderTest>div").prev().html().trim() === "Test content Head", "Check item above")
    assert.ok($("#definedOutputRenderTest>div").next().html().trim() === "Test content Tail", "Check item below")
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
    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({contents: ("clear " + i)});
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
    var dataset = [];
    for(var i = 0; i < options.iterationCount; i++) {
        dataset.push({
            content: "outerStencil",
            innerStencil: {
                ddl: [{
                    item: "foo"
                }, {
                    item: "foo"
                }, {
                    item: "foo"
                }],
                ddl1: [{
                    item: "bar"
                }, {
                    item: "bar"
                }, {
                    item: "bar"
                }]
            }
        });
    }
    assert.ok(render.attributeChildStencilRender.render(dataset), "Render output");

    $("#attributeChildStencilTest").children().each(function(index) {
        if(index % 3 === 0) {
            assert.ok(this.innerHTML == ("outerStencil - " + (index / 3)), "Outer stencil output - " + (index / 3));
        } else {
            var key = null;
            if(index % 3 === 1) {
                key = "foo";
            } else {
                key = "bar";
            }
            $(this).children().each(function(innerIndex) {
                assert.ok(this.innerHTML == key + " - " + innerIndex, "inner ddl stencil output - " + index + "-" + innerIndex);
            });
        }
    });
});