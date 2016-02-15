/**
 * @preserve stencil.js
 * version 16 - 15 Feb 2015
 * Kingston Chan - Released under the MIT licence
 * https://github.com/kgston/stencil.JS
*/
//# @preserve sourceMappingURL=stencil-15.0.min.map
var stencil = stencil || {};
stencil.opts = $.extend(stencil.opts || {}, function() {
    return {
        debug: true,
        defaultOutputElement: "stencil-output",
        fetchTimeout: 3000,
        ieNs: ""
    };
}());
stencil = $.extend(stencil || {}, (function() {
    return { 
        stencilHolder: {},
        /*
            Fetches a new stencil asyncronously via AJAX through a valid URL. The response should comprise of only 1 or more stencil templates without any HTML comments on the root level.
            
            Returns a jQuery promise. Set a callback to the progress event to get a stencil object one by one in order defined in the response or to the done event to get a array of all stencil objects.
        */
        //url - String
        fetch: function(url, destination) {
            if(url == null) {
                stencil.util.log("Stencil: No valid URL was passed in");
                return;
            }
            
            var fetchRequest = $.Deferred();
            $.ajax({
                url: url,
                method: "GET",
                dataType: "html",
                timeout: stencil.opts.fetchTimeout
            }).done(function(response) {
                //Sanitize HTML comments from the response
                response = response.replace(/<!--((.|\n)*?)-->/gm, "");
                var $templates = $(response).filter("stencil");
                if($templates.length === 0) {
                    stencil.util.log("Stencil: No stencils found at <" + url + ">");
                }
                
                var templatesList = [];
                $templates.each(function(index) {
                    var $template = $(this);
                    destination = destination || $template.attr("data-stencilDestination") || "none";
                    var fetchedTemplate = stencil.define($template.attr("id"), destination, null, $template);
                    templatesList.push(fetchedTemplate);
                    fetchRequest.notify(fetchedTemplate);
                });
                fetchRequest.resolve(templatesList);
                
            }).fail(function(jqXHR) {
                stencil.util.log("Stencil: Failed to fetched template at <" + url + "> due to " + jqXHR.status + " - " + jqXHR.statusText);
            });
            
            return fetchRequest.promise();
        },
        /*
            Define a new Stencil instance given a 
            compulsory TagID as a template; which will include the inner HTML of the element the ID points to,
            an optional destination, where the it will render to the inner HTML of all elements given with the given class,
            If no destination is specified, template will output after the template with its own output container
            and optional finalOutputElementType where you can specify a type of element container to hold your output
            <stencil> tags
        */
        
        //Element ID - String, optional?Element class - String, optional?Element type - String, private! jQueryFragment
        define: function (tagID, destination, finalOutputElementType, stencilFragment) {
            //Builds a Stencil object and returns the created instance
            //Private method, for internal use only
            var getStencil = function(tagID, destination, template) {
                return {
                    guid: stencil.util.guid(), //Unique identifier for a stencil object, uniquely identifies stencils
                    tagID: tagID, //The original tagID where the template was generated from
                    template: template, //The actual HTML contents to be duplicated
                    childStencils: {}, //All child stencils of this parent stencil
                    isStandard: true, //Is this stencil generated from standard stencil tags or is it a specified child, affect rendering style
                    destination: destination, //Destination to render the template to
                    existingContent: "",
                    clear: function() {
                        $(this.destination).empty().append(this.existingContent);
                    },

                    getChild: function(childID) {
                        var currentChildStencils = this.childStencils;
                        var found = null;
                        if(Object.keys(currentChildStencils).length === 0) {
                            return null;
                        }
                        if(Object.keys(currentChildStencils).indexOf(childID) >= 0) {
                            found = currentChildStencils[childID];
                        } else {
                            Object.keys(currentChildStencils).every(function(childStencil) {
                                var result = currentChildStencils[childStencil].getChild(childID);
                                if(result == null) {
                                    return true;
                                } else {
                                    found = result;
                                    return false;
                                }
                            });
                        }
                        return found;
                    },

                    //Renders out a stencil template into screen given
                    //compulsory dataset of an array of objects where data will be drawn from to be inserted into the template
                    //Each object in the array will create a replication of the template. 
                    //Each object should contain all necessary key value pairs to insert into template.
                    //Keys that are not found will be rendered as blank and logged to console if debug is on.
                    //Optional output string which control display options. Default: clear output then render
                    //Implemented: "none", "fragment", "string", "append", "prepend" -> Clear rendering on screen and get DOM output, DOM output 
                    //only leaving output container as-is, literal string output leaving output container as-is, append after 
                    //& append before with output container as-is
                    //Private parentElem for internal use only. Used to determine its parent during recursive calls and
                    //also used to determine if its is the first stencil being called.
                    //JSON dataset - Array[Objects], optional?output - String, private!parentElem - Element]
                    render: function (dataset, output, parentElem) {
                        //Check for errors in the dataset and return false early if there is no data
                        if (!(Array.isArray(dataset))) {
                            if(stencil.util.isObject(dataset)) {
                                dataset = [dataset];
                            } else if(typeof dataset === "undefined") {
                                stencil.util.log("Stencil - " + this.tagID + ": has no data, skipping...");
                                return false;
                            } else {
                                stencil.util.log("Stencil - " + this.tagID + ": dataset in an invalid format, detected: " + typeof dataset);
                                return false;
                            }
                        } else if(dataset == null || dataset.length === 0) {
                            stencil.util.log("Stencil - " + this.tagID + ": was not passed in data");
                            return false;
                        }
                        
                        //Init all used variables
                        var destination = this.destination; 
                        var isDetached = false;
                        var destinationElem;
                        //If this is the starting stencil
                        if(parentElem == null) {
                            //Search for the destination DOM and get its parent
                            parentElem = $(destination);
                            if(destination === "none" || output === "none" || output === "string" || output === "fragment") {
                                if(output === "none" || output === "string" || output === "fragment") {
                                    destinationElem = $(document.createElement('div'));
                                } else {
                                    stencil.util.log("Stencil: Only render output type \"none\", \"fragment\" or \"string\" is supported for stencils with no destination");
                                    return false;
                                }
                            } else {
                                //Make a clone of one of the destination (in case there may be more than 1)
                                //Don't empty it yet as we may need the data in the element
                                //From here on out, it will add changes to the cloned element which is separate fragment
                                //from the page DOM
                                destinationElem = parentElem.filter(":first").clone();
                            }
                            isDetached = true;
                        } else {
                            //Otherwise determine its destination via its parent
                            //This is to reduce the performance impact from a full search to just a search within its parent
                            //Added the destination replacement for "\" for cases where specificInner id="foo{{lpIdx}}" and later declared as "foo\\{\\{lpidx\\}\\}"
                            //due to jQuery limitation, the resulting destination becomes "foo\{\{lpidx\}\}". So the destination needs 3 final backslashes to find
                            //the destination
                            destinationElem = parentElem.find(destination.replace(/\\(?=\{|\})/g, "\\\\\\"));
                        }
                        var template = this.template;
                        var childStencils = this.childStencils;
                        var isStandard = this.isStandard;

                        //If destination is valid...
                        if(destinationElem.length) {
                            //And if output === ...
                            if(output === "append" || output === "prepend") {
                                //Copy contents for appending after template generation and empty 
                                this.existingContent = destinationElem.html();
                                destinationElem.empty();
                            } else if (output === "none") {
                                //None behaviour is to empty the output and return the fragement
                                parentElem.empty();
                                destinationElem.empty();
                            } else if(output === "string" || output === "fragment") {
                                //Else Fragment or String behaviour is to leave the output alone and return the fragement
                            } else {
                                destinationElem.empty();
                            }
                        } else {
                            //Otherwise log error and return
                            stencil.util.log("Stencil: Destination ID - " + destination + " not found!");
                            return false;
                        }

                        //For each set of Object | 1 Object = 1 template generated
                        dataset.forEach(function (param, loopIdx) {
                            //Insert data into placeholder
                            param.lpIdx = loopIdx; //Special key for loop index
                            param.ctIdx = loopIdx + 1; //Special key for counter index
                            var curOutput = template;

                            //Search through whole doc for {{*}} items
                            while (curOutput.search(/\{\{[\w.]*\}\}/) >= 0) {
                                //Get the key
                                var keyString = curOutput.match(/\{\{[\w.]*\}\}/)[0];
                                var key = keyString.substring(2, keyString.length - 2);
                                var paramValue = stencil.util.getKeyValue(param, key);
                                //Replace the value
                                paramValue = (paramValue == null)? "" : paramValue;
                                curOutput = curOutput.replace("{{" + key + "}}", paramValue);
                            }

                            var curDestElem = destinationElem; //Copy of destination
                            //If template is not a child stencil...
                            if(isStandard) {
                                //Create a wrapper for this iteration and insert it as a child of the destination
                                var wrapperGuid = stencil.util.createWrapper(destinationElem, "stencil-replicator", "append") ;
                                curDestElem = destinationElem.find(wrapperGuid); //Set output to this iteration wrapper
                            }

                            //Output main to screen
                            curDestElem.append(curOutput);

                            //Remove the GUID class that is used as a destination for non standard child stencils
                            if(!isStandard) {
                                curDestElem.removeClass(destination.replace(".", ""));
                            }
                            
                            //If childStencils has stencils, render those after the parentStencil has been drawn
                            Object.keys(childStencils).forEach(function(key) {
                                //Copy global params into next param set
                                var nextParamSet = param[key];
                                if(param.global != null) {
                                    //Check if the param set is an array or an object and allocate accordingly
                                    if(Array.isArray(nextParamSet)) {
                                        nextParamSet.forEach(function(obj) {
                                            obj.global = param.global;
                                        });
                                    } else if (stencil.util.isObject(nextParamSet)) {
                                        nextParamSet.global = param.global;
                                    }
                                }
                                //Render the inner stencil
                                childStencils[key].render(nextParamSet, null, curDestElem);
                            });

                            //Render selectors after child stencils has been rendered as selection values may be generated 
                            //in a child stencil
                            curDestElem.find("select[data-stencilselector]").each(function() {
                                //Get the selectionID to get the correct data
                                var selectionID = this.getAttribute("data-stencilselector");
                                //Select the correct option as given in JSON dataset
                                stencil.util.selectOption($(this), stencil.util.getKeyValue(param, selectionID));
                            });
                        });

                        //If output option is prepend, put the data back in now
                        if(output === "prepend") {
                            destinationElem.append(this.existingContent);
                        }

                        //Attached detached first stencil back into page after rendering everything
                        //Unless user does not need it to be displayed
                        if(isDetached) {
                            //Clean up all stencil related tags and convert outermost stencil-output tag to div
                            //This is to reduce DOM clutter and conform to W3C HTML standards (the stencil-output tag still
                            //does not conform, but you can change that under stencil.opts.defaultOutputElement or set
                            //it during define as the 4th parameter)
                            //if(!stencil.opts.debug) {
                                stencil.util.cleanUpStencils(destinationElem);
                            //}
                            
                            //If output === "none", return output node to user
                            if(output === "none" || output === "fragment") {
                                //parentElem.replaceWith(destinationElem.clone().empty()); Depreciated as data is already cleared in the beginning
                                return destinationElem.children();
                            } else if(output === "string") {
                                return destinationElem.html();
                            } else if(output !== "append") {
                                //Empty the output container first if its not appending
                                parentElem.empty();
                            }

                            parentElem.append(destinationElem.children());
                            return true;
                        }
                    }
                };
            };

            //Creates a deep clone of a stencil object
            var clone = function(existingStencil) {
                //First get a shallow clone of the object
                var newStencil = getStencil(existingStencil.tagID, existingStencil.destination, existingStencil.template);

                //Do a deep clone of all child Stencils
                Object.keys(existingStencil.childStencils).forEach(function(childStencilName) {
                    newStencil.childStencils[childStencilName] = clone(existingStencil.childStencils[childStencilName]);
                });

                return newStencil;
            };

            var specificInners;

            //Return a existing stencil if already initialized because template is already removed once initalized
            if(stencil.stencilHolder[tagID] != null && stencilFragment == null) {
                var existingStencil = stencil.stencilHolder[tagID];
                
                //Replicate the existingStencil
                var newStencil = clone(existingStencil);

                //If there is no destination, create a new wrapper and save it as local destination
                if(destination == null) {
                    destination = stencil.util
                    .createWrapper(
                        $(existingStencil.destination), 
                        finalOutputElementType || stencil.opts.defaultOutputElement, 
                        "after");
                }
                //Set the local destination as the template destination, either from above code or user defined destination
                newStencil.destination = destination;
                return newStencil;
            }
            
            //If no stencilFragment specified, get html from tagID
            var tagElem = stencilFragment || $("#" + stencil.util.escapeCSS(tagID));
            if(!tagElem.length) {
                stencil.util.log("Stencil: Tag ID '" + tagID + "' provided is not found!");
                return null;
            } else {
                //Check for a specified destination defined in the stencil tag
                if(destination == null) {destination = tagElem.attr("data-stencilDestination");}
                //If a destination is not specified, insert the output after the template.
                if(destination == null) {
                    destination = stencil.util.createWrapper(
                        tagElem, 
                        finalOutputElementType || stencil.opts.defaultOutputElement,
                        "after");
                }
                stencilFragment = tagElem.detach();
            }

            //Check if data-childStencil attribute exists and set it into the specific inners array
            if(stencilFragment.attr("data-childStencil") != null && stencilFragment.attr("data-childStencil") != "") {
                if(specificInners == null) {
                    specificInners = [];
                }
                stencilFragment.attr("data-childStencil").split(" ").forEach(function(childStencilID) {
                    if(childStencilID != "") {
                        specificInners.push(childStencilID);
                    }
                });
            }
            
            //Otherwise build a new stencil
            var childStencils = {};

            //Build all standard childStencils first
            stencil.util.log("Stencil: Searching for child stencils in " + tagID);

            //If there are more descendent stencil tags, recursively define them 
            //and attach them as child of their parents
            if(stencilFragment.find("stencil").length !== 0) {
                childStencils = stencil.util.findStencils(stencilFragment);
            }
            stencil.util.log("Stencil: Completed child stencil generation for " + tagID + ", " + 
                Object.keys(childStencils).length + " child stencil");
                
            var buildChildStencils = function buildChildStencils($parentStencil) {
                var childStencils = {};
                
                if($parentStencil.attr("data-childStencil") != null && $parentStencil.attr("data-childStencil") != "") {
                    $parentStencil.attr("data-childStencil").split(" ").forEach(function(childStencilID) {
                        if(childStencilID != "") {
                            stencil.util.log("Stencil: Building specified child stencil: " + childStencilID);
                            
                            var $childTag = $parentStencil.find("#" + childStencilID);
                            if(!$childTag.length) {
                                stencil.util.log("Stencil: Specified child stencil: " + childStencilID + " not found!");
                                return;
                            }
                            
                            //Changed this from ID to class selector because when you replicate multiple copies of the parent 
                            //stencil, it will cause issues with ID selector as there are multiple tags with the same ID
                            //May consider removing innerTagID from ID to clean up
                            //Use a GUID as a destination address to prevent mix up from tagID as it may be a stencil variable
                            var newDestination = stencil.util.guid();
                            $childTag.addClass(newDestination);
                            var innerDestination = "." + newDestination; //Convert to JQuery class selector format
                            
                            var grandchildStencils = buildChildStencils($childTag);
                            childStencils[childStencilID] = getStencil(childStencilID, innerDestination, $childTag.html());
                            childStencils[childStencilID].childStencils = grandchildStencils;
                            childStencils[childStencilID].isStandard = false;
                            
                            $childTag.empty();
                        }
                    });
                }
                return childStencils;
            };

            //Check if there are any non standard specific child stencils
            childStencils = $.extend(childStencils, buildChildStencils(stencilFragment));

            //Build the parentStencil
            var parentStencil = getStencil(tagID, destination, stencilFragment.html());
            //Set all the child stencils built earlier
            parentStencil.childStencils = childStencils;
            
            //Remove the stencil template
            //Only can remove at the end because it needs to build the childStencils first before removing
            //stencilFragment.remove(); 
            
            //Save to the holder before returning stencil object
            stencil.stencilHolder[tagID] = parentStencil;
            return parentStencil;
        },
        //Auto compile function to scan entire page for stencil templates
        //Returns an object of tagID & stencil object pairs
        build: function(startElementID) {
            startElementID = (startElementID == null)? $("body"): $("#" + startElementID);
            if(startElementID.length === 0) {
                stencil.util.log("Stencil: Unable to start build process as starting element ID cannot be found");
                return null;
            }
            return stencil.util.findStencils(startElementID);
        },
        util: {
            //Creates a new GUID
            guid: function () {
                //Retrieved from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
                var d = new Date().getTime();
                if(window.performance && typeof window.performance.now === "function"){
                    d += performance.now(); //use high-precision timer if available
                }
                var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = (d + Math.random()*16)%16 | 0;
                    d = Math.floor(d/16);
                    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
                });
                return "stencil-" + uuid;
            },
            //Selects the given value in the drop down box for the given select element 
            selectOption: function(selectElement, valueToSelect) {
                selectElement.children().each(function() {
                    if(this.value == valueToSelect) {
                        //Added selected attribute this way as jQuery clone option does not clone properties
                        //Creates issues when using the returned HTML code from render
                        this.setAttribute("selected", ""); 
                        return false;
                    }
                });
            },
            //Returns the outerHTML of the given HTML element
            outerHTML: function (element) {
                return element.clone().wrap('<p>').parent().html();
            },
            //Create a new wrapper HTML after the element provided of the given wrapperName
            //Location is a element and wrapperName is a string referring to the wrapper name
            //creationType is a function name that will control the creation type, e.g. append, after, replaceWith...
            //Returns a valid jQuery selector string to the elements created
            createWrapper: function(locationElement, wrapperName, creationType) {
                var classID = stencil.util.guid();
                var newWrapper = document.createElement(stencil.opts.ieNs + wrapperName);
                newWrapper.className = (newWrapper.className === "")? classID : newWrapper.className + " " + classID;
                locationElement[creationType](newWrapper);
                return stencil.util.escapeCSS(stencil.opts.ieNs) + wrapperName + "." + classID; //Convert to JQuery class selector format
            },
            //Finds all next level stencil tags and not further
            findStencils: function (startElement) {
                var stencils = {};
                function search(startElement, collection) {
                    var isStencilTag = function(element) {
                        if(element.nodeName === "STENCIL" || element.nodeName === "stencil") {
                            return true;
                        } else {
                            return false;
                        }
                    };

                    //For each child in the starting node
                    var childNodes = startElement.childNodes;
                    for(var i = 0; i < childNodes.length; i++) {
                        if(!isStencilTag(childNodes[i])) {
                            //If its not a stencil tag, continue down the tree
                            search(childNodes[i], collection);
                        } else {
                            //Otherwise define the stencil at this node and stop for this branch
                            collection[childNodes[i].id] = stencil.define(childNodes[i].id, null, "stencil-output", $(childNodes[i]));
                        }
                    }
                }
                search(startElement.get(0), stencils);
                return stencils;
            },
            //Cleans up all the stencil generated DOMs that will not be used after template generation
            cleanUpStencils: function(startElement) {
                function unwrapper(startElement) {
                    var isStencilTypeTag = function(element) {
                        if(element.nodeName.indexOf("STENCIL") >= 0 ||
                            element.nodeName.indexOf("stencil") >= 0) {
                            return true;
                        } else {
                            return false;
                        }
                    };

                    //If it is a stencil generated element
                    if(isStencilTypeTag(startElement)) {
                        //It may be possible that there are no childs in the stencil tags, if so, just remove the whole node
                        if(startElement.childNodes.length === 0) {
                            startElement.parentNode.removeChild(startElement);
                        }
                        //Unwrap this element and then run the unwrapper for each of the child nodes
                        //Very tedious to convert this from jQuery to pure Javascript, probably causes about 5-10% render time
                        //Most expensive is the jQuery instantiation...
                        $(startElement).children().unwrap().each(function() {
                            unwrapper(this);
                        });
                    } else {
                        //Otherwise, don't unwrap and just continue recursively
                        var childNodes = startElement.childNodes;
                        for(var i = 0; i < childNodes.length; i++) {
                            unwrapper(childNodes[i]);
                        }
                    }
                }

                //Start unwrapping from the child elements and leave the main parent alone
                //Issue with unwrapping the root node in a document fragment
                startElement.children().each(function() {
                    unwrapper(this);
                });
            },
            escapeCSS: function(value) {
                /*! http://mths.be/cssescape v0.2.1 by @mathias | MIT license */
                // http://dev.w3.org/csswg/cssom/#serialize-an-identifier
                var string = String(value);
                var length = string.length;
                var index = -1;
                var codeUnit;
                var result = '';
                var firstCodeUnit = string.charCodeAt(0);
                while (++index < length) {
                    codeUnit = string.charCodeAt(index);
                    // Note: there’s no need to special-case astral symbols, surrogate
                    // pairs, or lone surrogates.

                    // If the character is NULL (U+0000), then throw an
                    // `InvalidCharacterError` exception and terminate these steps.
                    if (codeUnit == 0x0000) {
                        throw new InvalidCharacterError(
                            'Invalid character: the input contains U+0000.'
                        );
                    }

                    if (
                        // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
                        // U+007F, […]
                        (codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
                        // If the character is the first character and is in the range [0-9]
                        // (U+0030 to U+0039), […]
                        (index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
                        // If the character is the second character and is in the range [0-9]
                        // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
                        (
                            index == 1 &&
                            codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
                            firstCodeUnit == 0x002D
                        )
                    ) {
                        // http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
                        result += '\\' + codeUnit.toString(16) + ' ';
                        continue;
                    }

                    // If the character is not handled by one of the above rules and is
                    // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
                    // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
                    // U+005A), or [a-z] (U+0061 to U+007A), […]
                    if (
                        codeUnit >= 0x0080 ||
                        codeUnit == 0x002D ||
                        codeUnit == 0x005F ||
                        codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
                        codeUnit >= 0x0041 && codeUnit <= 0x005A ||
                        codeUnit >= 0x0061 && codeUnit <= 0x007A
                    ) {
                        // the character itself
                        result += string.charAt(index);
                        continue;
                    }

                    // Otherwise, the escaped character.
                    // http://dev.w3.org/csswg/cssom/#escape-a-character
                    result += '\\' + string.charAt(index);

                }
                return result;
            },
            //Gets the value from a complex object via Javascript object notation
            getKeyValue: function(obj, keyString) {
                var value;
                //Drill down search for placeholders with foo.bar.key notation
                keyString.split(/[\.\[\]]/).every(function(keyPart, splitIdx) {
                    if(keyPart === "") {
                        return true;
                    }

                    if(splitIdx === 0) {
                        value = (obj[keyPart] == null)? 
                            stencil.util.log("Stencil: " + keyPart + " of " + keyString + " not found"): obj[keyPart];
                    } else {
                        value = (value[keyPart] == null)? 
                            stencil.util.log("Stencil: " + keyPart + " of " + keyString + " not found"): value[keyPart];
                    }

                    if(value != null) {
                        return true;
                    } else {
                        return false;
                    }
                });
                return value;
            },
            isIE: function() {
                var myNav = navigator.userAgent.toLowerCase();
                return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
            },
            isObject: function(obj) {
                return obj === Object(obj);
            },
            log: function(content) {
                if(stencil.opts.debug) {
                    console.log(content);
                }
            }
        }
    };
})());

(function() {
    var isIE = stencil.util.isIE();
    if(isIE != false && isIE < 10) {
        document.createElement("stencil");
        document.createElement("stencil-replicator");
        document.createElement("stencil-output");
        stencil.opts.ieNs = "STENCIL:";
    }
})();