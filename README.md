stencil.JS
==========
######*Javascript templating made easy*
Version: 13 
Author: Kingston Chan <kgston@hotmail.com>  
Last modified: 02 Mar 2015  

Copyright (c) 2014-2015 Kingston Chan. This software is provided as-is under The MIT Licence (Expat).  
*Full legal text can be found in licence.txt*

Introduction
--------------
Stencil is a client side Javascript templating engine that allows for rapid template prototyping and automatic nested template generation. Supports design time templating, automatic template segregation, nested template generation, JSON object notation and automatic drop down selection. Inspired by popular JS templating libraries such as Mustache.JS and Transparency.JS.

Rational
--------------
Stencil was developed out of the need for the ability to view and amend the template continuously throughout the design-development process without having to move it in and out of `<script>` tags or having to chop up templates into multiple parts. Also, template nesting and conditionals comes across as unnecessarily complex with queer symbol semantics that are not immediately obvious to people not familiar with the hieroglyphics, increasing the learning curve. While it is useful to have logic within a templating language, similar to JSP and tag libs, nesting such semantics usually results in a compromise in functionality or legibility. Any sort of logic, should be as much as possible, transparent and determined from the dataset structure.

Usage
==========
Preparation
--------------
First off, you should have your HTML code ready and identify all parts which should be iterated. Wrap the iterating area in `<stencil id="stencilID">...TemplateHTML...</stencil>` stencil tags and give it a stencil ID. The stencil ID will uniquely identify your stencil for later use. Also, feel free to nest stencil tags inside stencil tags. The engine will automatically identify them, just remember to give them unique IDs too!

Compilation
--------------
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

If for some reason you are unable to insert stencil tags into the HTML code, due to HTML requirements e.g. outside `<tr>...</tr>` tags, you may wrap them in any tag that is valid, like `<tbody id="childStencilID">...</tbody>` and give it an ID. This only works for child stencils, so you will need to insert a parent stencil surrounding the child e.g. around the `<table>...</table>` tags. Use the following code to define child stencils:
```javascript
    var myStencil = stencil.define("parentStencilID", null, ["childStencilID1", "childStencilID2", ...]);
```
*This only works for simple stencils without any childStencils or stencils whose child is a child of a child. For such cases, define the childStencils as an attribute of the immediate parent stencil using the attribute name "data-childStencil". Multiple values are delimited by spaces 

```html
    <stencil id="attributeChildStencilRender">
        <div>{{content}} - {{lpIdx}}</div>
        <stencil id="innerStencil" data-childStencil="ddl ddl1">
            <select id="ddl">
                <option>{{item}} - {{lpIdx}}</option>
            </select>
            <select id="ddl1">
                <option>{{item}} - {{lpIdx}}</option>
            </select>
        </stencil>
    </stencil>
```

If you would like to specify an output location for the generated stencil, you can set it as the 2nd parameter during manual definition of the stencil using jQuery selector notation:
```javascript
    var myStencil = stencil.define("stencilID", "#output .duplicates"); 
```
The stencil will be inserted into the inner HTML of the specified element/s.

If you do not need the output to be displayed in a specific location, you can set the destination to `"none"`. Take note that in this case you will need to set the render method output parameter to either `"none"` or `"fragment"`

Cloning
--------------
By default, Stencil will remove your stencil template after "compilation". If you would like to create a new copy of the stencil with a separate output, just define the stencil manually in the first example and the engine will compile a deep copy of the existing stencil for you with a provided destination or a auto generated one. Auto generated outputs will always be exactly after the existing template. Do note that once a stencil structure has been defined, it is not possible to dynamically redefine it except for its output destination and output container. However, this feature may be included in a later version. 

Data Insertion
--------------
In order to map data from JSON into child stencils, use the following syntax:
    `{{firstLevel}}`    
***Where:***    
```javascript
    var JSON = {childStencilID:{firstLevel:"value"}}
```

Deep object retrival notation
--------------
In order to map data from the JSON object into the stencil, use the following syntax anywhere within your template code:
    `{{firstLevel[secondLevel].thirdLevel[1]}}`   
***Where:***    
```javascript
    var JSON = {firstLevel:{secondLevel:{thirdLevel:["foo", "value", "bar"]}}};
```

Nested key generation
--------------
Stencil also supports nested keys, allowing runtime determination of the final JSON data to be used. For example:
    `{{foo{{index}}{{alphaIndex}}}}` will result in a final key of `{{foo1b}}`   
***Where:***     
```javascript
    var JSON = {foo1b: "valueToBeInserted", index: 1, alphaIndex: b}
```
All nested keys will be generated 

Global data objects
--------------
By default, a child stencil will not have access to its parents dataset and while a parent has access to its child dataset, retrieval from an array is currently not supported. However there may be cases where you have data that needs access by parent and child stencils. For such cases you can utilized the reserved `global` key to store objects that  needs to be propagated to all stencils. For example,
    `{{global.foo}}`    
***Where:***    
```javascript 
    var JSON = {global: {foo: "accessableByAllStencils"}, bar: "accessableOnlyByParticularStencil"}
```

Special variables
--------------
For templating convienence, you can use the special variables lpIdx and ctIdx for loop index and counter index in your templates. `{{lpIdx}}` starts from 0 while `{{ctIdx}}` starts from 1. These are counter for the rendering order and is unique for every template, including child templates.

Selector
--------------
In order to use the selector to automatically select an option in a drop down menu, set an attribute called `data-stencilselector` (to conform to HTML5 specs) to the select elements:
    `<select data-stencilselector="firstLevel.secondLevel">...</select>`    
***Where:***    
```javascript
    var JSON = {firstLevel:{secondLevel:"valueToSelect"}
```
Rendering
--------------
Once you have compiled the stencil and built your template, we can finally render the finalized stencil with the data inside it. Use the following command to generate the output:   
```javascript
    myStencil.render(JSON);
```
Where `JSON` is an array of objects. Each object should contain all the key value pairs for one stencil. Multiple objects in an array will generate multiple copies of the stencil with the respective objects in the order of insertion. If a key value is not found, the engine will leave the field blank and log to the console, if debug is on.

Each stencil object is linked to an output location and does not change over the lifetime of the object. If you would want to hide and get a document fragment, not hide and get a document fragment, get a pure string output, append or prepend the generated stencil to the output, you can use the following syntax:
```javascript
    myStencil.render(JSON, "none");
    myStencil.render(JSON, "fragment");
    myStencil.render(JSON, "string");
    myStencil.render(JSON, "append");
    myStencil.render(JSON, "prepend");
```

Clearing output
--------------
If for any reason you want to remove the generated stencil from the output container, just call:
```javascript
    myStencil.clear();
```
If there was previously any content that was appended or prepended to, it will retain the content while removing the stencil. However the content is a cache that was saved when the stencil was generated, so it may not reflect any changes after the stencil was generated. If you need to keep those changes, it is best for the output stencil to have its own container or use the default.

Rendering Tricks
--------------
Rendering within a Table
Due to HTML restirctions, certain tags are not allowed to become a child of certain tags. This is most obvious with HTML tables. When you insert stencil tags within the table, the stencil tags will get pushed out of the table on page load, so the library is not able to detect the location of the stencils correctly and its template. A workaround is to use the `specificChildStencilIDs` to define the wrapper element of the replicating contents, but take note of its own limitations

Rendering conditionals
--------------
There are times where a layout may change depending on certain conditions. So it is very useful to have the ability to be able to change the resulting output based on the input dataset. Stencil however, does not have this ability to define IF ELSE conditionals for template rendering as it can be rather complex to built in such functionality and would generally increase rendering time across the board as additional checks needs to be built in place. However, this functionality may be built in the future as it is possible; if a more elegant solution exists. 

A current workaround is to generate all possible layouts into your stencil object by making use of nested stencil child objects. Do your own checks on the dataset and then modify the dataset structure such that it "activates" the correct child template by inserting relevant data into the correct reference variable. Take advantage of the feature where null/undefined reference child stencil variables in the dataset do not generate the resulting templating at all.

On the same note, if you would like to generate an instance of the child stencil without any data, use an empty object.

APIs
==========
```javascript
    stencil.build(?startElementID);
    stencil.define(stencilID, ?outputDestination, ?["specificChildStencilIDs"], ?elementType)
    myStencilObject.render(dataset, ?output);
    myStencilObject.clear();
```
*where ? refers to optional parameters*

Dependencies
==========
jQuery
