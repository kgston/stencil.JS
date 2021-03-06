# stencil.JS

###### *Javascript templating made easy*

Version: 18.1  
Author: Kingston Chan <kgston@hotmail.com>  
Last modified: 20 Jun 2016

Copyright (c) 2014-2016 Kingston Chan. This software is provided as-is under The MIT Licence (Expat).  
*Full legal text can be found in licence.txt*

### Introduction

Stencil is a client side Javascript templating engine that allows for rapid template prototyping and automatic nested template generation. Supports design time templating, automatic template segregation, nested template generation, JSON object notation and automatic drop down selection. Inspired by popular JS templating libraries such as Mustache.JS and Transparency.JS.

### Rational

Stencil was developed out of the need for the ability to view and amend the template continuously throughout the design-development process without having to move it in and out of `<script>` tags or having to chop up templates into multiple parts. Also, template nesting and conditionals comes across as unnecessarily complex with queer symbol semantics that are not immediately obvious to people not familiar with the hieroglyphics, increasing the learning curve. While it is useful to have logic within a templating language, similar to JSP and tag libs, nesting such semantics usually results in a compromise in functionality or legibility. Any sort of logic, should be as much as possible, transparent and determined from the dataset structure.

### Upgrade Notes
**From version 14**  
Declaring childStencilIDs within the template.render() function has been removed. Please use the data-stencil-childs attribute in the stencil tag instead

**From version 17**  
All custom stencil attributes have been renamed for clarity and organization. These names is also customizable through the stencil.attributes object so they can be reverted to the old naming style if so deemed necessary

`data-stencildestination`   > `data-stencil-destination`  
`data-childStencil`         > `data-stencil-childs`  
`data-stencilSelector`      > `data-stencil-selector`  
`data-stencilimgsrc`        > `data-stencil-imgsrc`  

## Usage

### Preparation  

First off, you should have your HTML code ready and identify all parts which should be iterated. Wrap the iterating area in `<stencil id="stencilID">...TemplateHTML...</stencil>` stencil tags and give it a stencil ID. The stencil ID will uniquely identify your stencil for later use. Also, feel free to nest stencil tags inside stencil tags. The engine will automatically identify them, just remember to give them unique IDs too!

### Compilation  

There are 2 ways to "compile" the templates for use. You can manually define a stencil by calling:

```javascript
    var myStencil = stencil.define("stencilID"); 
```

and get back a stencil object OR

If you want to quickly "compile" all stencils in the page, just call:

```javascript
    var stencilCollection = stencil.build(); 
```

which will return you an object of stencilIDs and stencil object pairs.

If you want to limit auto build to a section of the page, just call:

```javascript
    var stencilCollection = stencil.build("elementIDToStartFrom");
```

*Note that this method only supports stencil tags in default configuration.* 

If for some reason you are unable to insert stencil tags into the HTML code, due to HTML requirements e.g. outside `<tr>...</tr>` tags, you may wrap them in any tag that is valid, like `<tbody id="childStencilID">...</tbody>` and give it an ID. This only works for child stencils, so you will need to insert a parent stencil surrounding the child e.g. around the `<table>...</table>` tags and define the childStencils as an attribute of the immediate parent stencil using the attribute name "data-stencil-childs". Multiple values are delimited by spaces. See the section on child stencils for more information

If you would like to specify an output location for the generated stencil, you can set it using the `data-stencil-destination` attribute in the stencil tag using the jQuery selector notation:

```html
    <stencil id="stencilID" data-stencil-destination="#output .duplicates">
        ...
    </stencil>
```

The stencil will be inserted into the inner HTML of the specified element/s.

Alternatively if you would like to specify the destination in code, use the following style:

```javascript
    var myStencil = stencil.define("stencilID", "#output .duplicates"); 
```

If you do not need the output to be displayed in a specific location, you can set the destination to `"none"`. Take note that in this case you will need to set the render method output parameter to either `"none"` or `"fragment"`

### Asyncronous Stencil Fetching  

At times, when you load a ton of templates on a single HTML page, loading times at the beginning can create quite a drag on your application. From version 15 onwards, asyncronous loading of stencils via URL can be done through the fetch API. The fetch API returns a jQuery promise with the following APIs:

```javascript
    promise.progress(forEachTemplateInFile(stencilObj));
    promise.done(afterAllTemplatesHaveBeenDefined(aryOfStencilObjs));
    promise.fail(ifTheFileFailsToLoad(jqXHR));
```

***Where:***

```javascript
    var myStencils = {};
    //Returns a promise object
    stencil.fetch("stencils/myStencils.stencil", "#optionalOutputDestination")
        .progress(function(template) {
            //Save each template into an object for later use
            myStencils[template.tagID] = template;
        })
        .done(function(templateAry) {
            //templateAry.length == 2
            //All templates have been loaded, trigger some other callback
            callNextStep();
        })
        .fail(function(jqXHR) {
            //Error handling goes here
        });

    function callNextStep() {
        myStencils.foo.render({value: "Fighters"})
        myStencils.bar.render({value: "Dot"}, "append")
    }
```

***In:***
Assume a separate HTML file called myStencils.stencil exists in a folder called stencils   
*stencils/myStencils.stencil*

```html
    <stencil id="foo">
        <span>Foo: {{value}}</span>
    </stencil>
    <stencil id="bar">
        <span>Bar: {{value}}</span>
    </stencil>
```

***Results:***

```html
    <div id="optionalOutputDestination">
        <span>Foo: Fighters</span>
        <span>Bar: Dot</span>
    </div>
```

*Be warned that standard browser AJAX restrictions still applies.* 

If an output destination is not specified (either through the fetch API or via the data-stencil-destination attribute), it will be defined with the `"none"` destination and can only be rendered with the `"none"`, `"fragment"` or `"string"` output methods.

### Cloning

By default, Stencil will remove your stencil template after "compilation". If you would like to create a new copy of the stencil with a separate output, just define the stencil manually in the first example and the engine will compile a deep copy of the existing stencil for you with a provided destination or a auto generated one. Auto generated outputs will always be exactly after the existing template. Do note that once a stencil structure has been defined, it is not possible to dynamically redefine it except for its output destination and output container. However, this feature may be included in a later version. 

## Rendering

Once you have compiled the stencil and built your template, we can finally render the finalized stencil with the data inside it. Use the following command to generate the output:

```javascript
    myStencil.render(json);
```

Where `JSON` is an array of objects. Each object should contain all the key value pairs for one stencil. Multiple objects in an array will generate multiple copies of the stencil with the respective objects in the order of insertion. If a key value is not found, the engine will leave the field blank and log to the console, if debug is on.

Each stencil object is linked to an output location and does not change over the lifetime of the object. If you would want to hide and get a document fragment, not hide and get a document fragment, get a pure string output, append or prepend the generated stencil to the output, you can use the following syntax:

```javascript
    myStencil.render(json, "none");
    myStencil.render(json, "fragment");
    myStencil.render(json, "string");
    myStencil.render(json, "append");
    myStencil.render(json, "prepend");
```

### Data Insertion

In order to insert data into a stencil template

```javascript
    var template = stencil.define("template");
    var json = {
        value: "foo"
    };
    template.render(json);
```

***In:***

```html
    <stencil id="template">
        <span>Value: {{value}}</span>
    </stencil>
```

***Results:***

```html
    <span>Value: foo</span>
```

### Child stencils

In order to nest child stencils, use the following syntax:  
***Where:***

```javascript
    var template = stencil.define("template");
    var json = {
        child: {
            value: "foo"
        }
    };
    template.render(json);
```

***In:***

```html
    <stencil id="template">
        <stencil id="child">
            <span>Child value: {{value}}</span>
        </stencil>
    </stencil>
```

***Results:***

```html
    <span>Child value: foo</span>
```

In certain cases where `<stencil>` tags are not allowed to be nested in certain HTML tags such as `<table>` or `<select>`, you can make use of the `data-stencil-childs` attribute to define child stencils without the `<stencil>` tag and also supports recursion as shown in the rather complex example below:     
*Note: lpIdx(Loop Index) and ctIdx(Counter Index) are special counters that are provided by the templating engine. They always start from 0 or 1 respectively for each stencil.*  
***Where:***

```javascript
    var template = stencil.define("template");
    var json = {
        listsTitle: "My List",
        primaryList: [{
            item: "primary"
        }, {
            item: "primary"
        }],
        secondaryList: [{
            "group{{ctIdx}}": [{
                item: "secondary group 1"
            }, {
                item: "secondary group 1"
            }]
        }, {
            "group{{ctIdx}}": [{
                item: "secondary group 2"
            }, {
                item: "secondary group 2"
            }]
        }],
        childLists: [{
            "childList{{lpIdx}}": [{
                item: "childList0"
            }, {
                item: "childList0"
            }]
        }, {
            "childList{{lpIdx}}": [{
                item: "childList1"
            }, {
                item: "childList1"
            }]
        }]
    }
    template.render(json);
```

***In:***

```html
    <stencil id="template" data-stencil-childs="primaryList secondaryList">
        <div>{{listsTitle}}</div>
        <select id="primaryList">
            <option>{{item}} - {{ctIdx}}</option>
        </select>
        <select id="secondaryList" data-stencil-childs="group{{ctIdx}}">
            <optgroup id="group{{ctIdx}}" label="Group {{ctIdx}}">
                <option>{{item}} - {{ctIdx}}</option>
            </optgroup>
        </select>
        <stencil id="childLists" data-stencil-childs="childList{{lpIdx}}">
            <select id="childList{{lpIdx}}">
                <option>{{item}} - {{ctIdx}}</option>
            </select>
        </stencil>
    </stencil>
```

***Results:***

```html
    <div>My List</div>
    <select id="primaryList">
        <option>primary - 1</option>
        <option>primary - 2</option>
    </select>
    <select id="secondaryList">
        <optgroup id="group1" label="Group 1">
            <option>secondary group 1 - 1</option>
            <option>secondary group 1 - 2</option>
        </optgroup>
        <optgroup id="group2" label="Group 2">
            <option>secondary group 2 - 1</option>
            <option>secondary group 2 - 2</option>
        </optgroup>
    </select>
    <select id="childList0">
        <option>childList0 - 1</option>
        <option>childList0 - 2</option>
    </select>
    <select id="childList1">
        <option>childList1 - 1</option>
        <option>childList1 - 2</option>
    </select>
```

***The following style of defining childStencils has been __REMOVED__ since version 14 due it its limited functionality. Please use the above method to define childStencils***

```javascript
    var myStencil = stencil.define("parentStencilID", null, ["childStencilID1", "childStencilID2", ...]);
```

### Recursive child stencils

From version 18 onwards, functionality has been added to allow for stencils to be built and accessed in a recursive way using the attribute `data-stencil-recurse = "stencilID to link to"`.  
***Where:***

```javascript
    var recursiveList = stencil.define("recursiveList");
    recursiveList.render({
        title: "Infinite list",
        list: {
            listItem: [{
                content: "foo"
            }, {
                content: "bar",
                list: {
                    listItem: [{
                        content: "bar - foo"
                    }, {
                        content: "bar - bar",
                        list: {
                            listItem: [{
                                content: "bar - bar - foo"
                            }, {
                                content: "bar - bar - black sheep"
                            }]
                        }
                    }]
                }
            }]
        }
    });
```

***In:***

```html
    <stencil id="recursiveList">
        <div>
            <span>Title: {{title}}</span>
            <stencil id="list">
                <ul>
                    <stencil id="listItem">
                        <li>{{content}}</li>
                        <stencil data-stencil-recurse="list"></stencil>
                    </stencil>
                </ul>
            </stencil>
        </div>
    </stencil>
```

***Results:***

```html
    <div>
        <span>Title: Infinite list</span>
        <ul>
            <li>foo</li>
            <li>bar</li>
            <ul>
                <li>bar - foo</li>
                <li>bar - bar</li>
                <ul>
                    <li>bar - bar - foo</li>
                    <li>bar - bar - black sheep</li>
                </ul>
            </ul>
        </ul>
    </div>
```

### Replication

In order to duplicate templates, wrap the data object in an array as shown:    
***Where:***

```javascript
    var template = stencil.define("template");
    var json = [{
        parentKey: "alpha",
        child: [{
            value: "alpha - foo"
        }, {
            value: "alpha - bar"
        }]
    }, {
        parentKey: "beta",
        child: [{
            value: "beta - foo"
        }, {
            value: "beta - bar"
        }]
    }];
    template.render(json);
```

***In:***

```html
    <stencil id="template">
        <span>Parent: {{parentKey}}</span>
        <stencil id="child">
            <span>Child: {{value}}</span>
        </stencil>
    </stencil>
```

***Results:***

```html
    <span>Parent: alpha</span>
    <span>Child: alpha - foo</span>
    <span>Child: alpha - bar</span>
    <span>Parent: beta</span>
    <span>Child: beta - foo</span>
    <span>Child: beta - bar</span>
```

### Deep object retrieval notation

In order to map data from the JSON object into the stencil, use the following syntax anywhere within your template code:    
***Where:***

```javascript
    var template = stencil.define("template");
    var json = {
        firstLevel: {
            secondLevel: {
                thirdLevel: ["foo", "bar", "cat"]
            }
        }
    };
    template.render(json);
```

***In:***

```html
    <stencil id="template">
        <span>Deep value: {{firstLevel[secondLevel].thirdLevel[1]}}</span>
    </stencil>
```

***Results:***

```html
    <span>Deep value: bar</span>
```

### Nested key generation

Stencil also supports nested keys, allowing runtime determination of the final JSON data to be used. For example:    
***Where:***

```javascript
    var template = stencil.define("template");
    var json = {foo1b: "valueToBeInserted", index: 1, alphaIndex: b};
    template.render(json);
```

***In:***

```html
    <stencil id="template">
        <span>Nested value: {{foo{{index}}{{alphaIndex}}}}</span>
    </stencil>
```

***Results:***

```html
    <span>Nested value: valueToBeInserted</span>
```

### Global data objects

By default, a child stencil will not have access to its parents dataset and while a parent has access to its child dataset. However there may be cases where you have data that needs access by both parent and child stencils. For such cases you can utilize the reserved `global` key to store values that needs to be propagated to all stencils.   
***Where:***

```javascript 
    var template = stencil.define("template");
    var json = {
        global: {foo: "accessableByAllStencils"}, 
        bar: "accessableOnlyByLocalStencil",
        child: {}
    };
    template.render(json);
```

***In:***

```html
    <stencil id="template">
        <span>Gloabl: {{global.foobar}}</span>
        <span>Local: {{bar}}</span>
        <stencil id="child">
            <span>Gloabl: {{global.foo}}</span>
            <span>Parent: {{bar}}</span>
        </stenci>
    </stencil>
```

***Results:***

```html
    <span>Gloabl: accessableByAllStencils</span>
    <span>Local: accessableOnlyByLocalStencil</span>
    <span>Gloabl: accessableByAllStencils</span>
    <span>Parent: </span> //No output due to undefined variable
```

### Special variables

For templating convienence, you can use the special variables lpIdx and ctIdx in your templates. `{{lpIdx}}` starts from 0 while `{{ctIdx}}` starts from 1. These are counter for the rendering order and is unique for every template, including child templates.

### Selector

In order to use the selector to automatically select an option in a drop down menu, set an attribute called `data-stencil-selector` to the select elements:   
***Where:***

```javascript
    var template = stencil.define("template");
    var json = {firstLevel:{secondLevel:"bar"};
    template.render(json);
```

***In:***

```html
    <stencil id="template">
        <select data-stencil-selector="firstLevel.secondLevel">
            <option value="foo">foo</option>
            <option value="bar">bar</option>
            <option value="cat">cat</option>
        </select>
    </stencil>
```
***Results:***

```html
    <select>
        <option value="foo">foo</option>
        <option value="bar" selected>bar</option>
        <option value="cat">cat</option>
    </select>
```

###Image Tag Source

Putting in `{{variables}}` in src attributes of img tags was causing 404 errors when the templates were being initially displayed in the browser. In order to prevent such exceptions from being generated, the `data-stencil-imgsrc` attribute can be used instead to dynamically populate the src attribute   
***Where:***

```javascript
    var template = stencil.define("template");
    var json = {firstLevel:{secondLevel:"imgURL"};
    template.render(json);
```

***In:***

```html
    <stencil id="template">
        <img data-stencil-imgsrc="firstLevel.secondLevel">...</img>
    </stencil>
```

***Results:***

```html
    <img src="imgURL"/>
```

### Clearing output

If for any reason you want to remove the generated stencil from the output container, just call:

```javascript
    myStencil.clear();
```

If there was previously any content that was appended or prepended to, it will retain the content while removing the stencil. However the content is a cache that was saved when the stencil was generated, so it may not reflect any changes after the stencil was generated. If you need to keep those changes, it is best for the output stencil to have its own container or use the default.

### Rendering Tricks

Rendering within a Table
Due to HTML restirctions, certain tags are not allowed to become a child of certain tags. This is most obvious with HTML tables. When you insert stencil tags within the table, the stencil tags will get pushed out of the table on page load, so the library is not able to detect the location of the stencils correctly and its template.

However, by using the data-stencil-childs attribute within the stencil tag or within a child tag that was previously declared in a parent data-stencil-childs attribute, the full functionality of nested child stencils becomes avaliable.

### Rendering conditionals

There are times where a layout may change depending on certain conditions. So it is very useful to have the ability to be able to change the resulting output based on the input dataset. Stencil however, does not have this ability to define IF ELSE conditionals for template rendering as it can be rather complex to built in such functionality and would generally increase rendering time across the board as additional checks needs to be built in place. However, this functionality may be built in the future as it is possible; if a more elegant solution exists. 

A current workaround is to generate all possible layouts into your stencil object by making use of nested stencil child objects. Do your own checks on the dataset and then modify the dataset structure such that it "activates" the correct child template by inserting relevant data into the correct reference variable. Take advantage of the feature where null/undefined reference child stencil variables in the dataset do not generate the resulting templating at all.

On the same note, if you would like to generate an instance of the child stencil without any data, use an empty object.

### HTML Escaping

From version 17 onwards, HTML escaping of the values in the input data will be made default. This action can be modified through the option flag escapeHtml. Alternatively, each 

### Support for IE 10 and below

As Stencil uses custom tags to define templates and also during the rendering process, support has been quite finicky on older IE browsers. However, a fix has been implemented using namespaces. By adding a namespace to the `<html>` tag, it should work out of the box with IE9. For IE 8 and below, polyfills for ES5 functions will be required.

```html
<html xmlns:STENCIL>
```

### Syntax Colouring

When working with large or complicated stencil templates, it can become very difficult to visualize the various levels of the templates, resulting in mistakes that are hard to detect. As such, I have developed syntax colouring files based of the textmate format. They can be found in the syntax folder of the repo. See the [readme](https://github.com/kgston/stencil.JS/tree/master/syntax/vscode/stencil) under vscode for more details.

#### Sublime Text

After installing package control, `Ctrl+Shift+P` and type and select `install package`. Search and install for a package called `stencil`.

OR

Hit Preferences > Browse Packages.... Create a new folder called `stencil` and paste in stencil.sublime.tmLanguage into the folder. Restart Sublime Text. The language will now be avaliable from the language selection in the bottom right corner

#### Visual Studio Code

There are two way of installing the VS Code extension.

1. Hit File > Open File and select `stencil-1.1.0.vsix`.

1. Hit `Ctrl+P` and type `ext install stencil`.

## APIs

```javascript
    stencil.build(?startElementID);
    stencil.define(stencilID, ?outputDestination, ?outputElementType);
    stencil.fetch(stencilURL, ?outputDestination); 
    myStencilObject.render(dataset, ?output);
    myStencilObject.clear();
```

*where ? refers to optional parameters*

## Flags

Within a template variable such as `{{foo}}`, the flags must always be appended at the end. Each flag starts with a `/` and can be combined. That said, only one flag of each category will be read by the render pipeline and is shown in order of precidence as listed below.

For example
`{{foo/noEsc/esc}}` does not make much sense. Since both flags from both groups are listed, it will apply the flag of highest precidence which is `/esc`

### List of flags

**HTML Escpaing**

```html
Force escape HTML  
    {{foo/esc}}  
Force no escaping HTML  
    {{foo/noEsc}}  
```

## Stencil Attributes

`<stencil>`

* data-stencil-childs - Declare all child stencil IDs here (without the initial #), space delimited  
* data-stencil-destination - Declare the output destination here in jQuery selector format  
* data-stencil-recurse - Declare the stencil ID to be a recursively linked child stencil

`<select>`

* data-stencil-selector - Declare the key of the value within the dataset, that should be matched to the value of the option, that should be selected  

`<img>`

* data-stencil-imgsrc - Declare the key of the value within the dataset, that should be inserted into the src of this img tag  

## Dependencies

jQuery

## Acknowedgements

Syntax files was developed based on the handlebars tmLanguage files in:  
[sublime-text-handlebars](https://github.com/nrw/sublime-text-handlebars)