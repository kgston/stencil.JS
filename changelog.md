# Changelog

## version 8.0

1. Stable build

## version 9.0

1. Added in fragment output type
1. Revised none output type
1. Fixed some bugs

## version 10.0

1. Optimized some code
1. Fixed none output type bug
1. Added nested keys
1. Public release

## version 10.1

1. Fixed issues with detecting Arrays and Objects

## version 10.2

1. Fixed issue when stencil replaces the parent instead of emptying and appending which causes a lost of data that was attached to the parent element

## version 10.3

1. Better error handling when using none as a destination and render output type is not supported
1. Improved performance with selector

## version 11

1. Added string render output option to get pure string output
1. Added solution for specificInners IDs which contain insertion objects e.g. `{{lpIdx}}`
1. Updated solution for append render output option that doesn't refresh existing content that its appending to

## version 12

1. Updated deep object retrival notation to support array notation a.k.a. `array[123].foo[bar]`

## version 13

1. Added in functionality to define childStencils as an attribute in the stencil tag using the attribute name "data-childStencil". Multiple values can be delimited by spaces
1. Escape tagIDs that have reserved CSS characters
1. Depreciated defining childStencils via stencil.define method
1. Fixed bug where setting a stencil variable as an ID for a childStencil will cause issues with rendering being unable to output to destination
1. Disabled display of replication containers when debug is enabled to prevent display issues
1. Ensure that if a childStencil fails, it will skip generation attempt
1. Ensure that destination class is removed from non standard child stencils

## version 13.1

1. Upgraded guid function to take advantage of performance.now() if available
1. Included author info in source
1. Added a getChild function in the stencil object to recursively find any child stencil under its parent

## version 13.2

1. Improved performance when rendering fragments and strings with a very large parent destination by removing redundant cloning and emptying of the DOM
1. Added namespace to css guid classes to identify it is a class used by stencil

## version 14

1. Now able to define a stencil directly from a document fragment
1. Compatible with stencilTemplates v1

## version 14.1

1. Added namespacing support for custom tags in < IE 10

## version 14.2

1. Fixed bug in IE10 in IE namespacing where jquery.find() was namespace dependent
1. Fixed bug caused by the above bug fix

## version 15

1. Uses $.extend to create namespace
1. Added fetch functionality to retrieve and generate a stencil template via AJAX
1. Added ability to specify the output destination in the stencil tag using the data-stencilDestination attribute

## version 15.1

1. Added an additional filter for only selecting stencil objects when fetching a stencil

## version 16

1. Added functionality to allow for HTML tags defined childStencils (within a parent stencil tag) to automatically recourse giving it full functionality of a nested stencil tag

## version 16.1

1. Fixed bug in the fetch API where the declared destination in the first stencil was overriding all the remaining stencil's destination

## version 16.2

1. Properly rejects all failed fetch requests
1. Added data-stencilimgsrc attribute for all img tags to automatically insert a src URL dynamically as `{{}}` tags was causing 404 errors

## version 17.0

1. Added HTML escaping into render pipeline
1. Added global setting flag for HTML escaping
1. Added flags functionality
1. Added the following template variable flags
   1. /esc to force HTML escaping regardless of the global flag
   1. /noEsc to force no HTML escaping regardless of the global flag
1. Made stencil attributes customizable and reorganized the naming
1. Fixed bug where `[]` notation was not being detected as a variable name in templates
1. Added new automated tests for all new functionalities since v12.0

## version 18.0

1. Added recursive template functionality