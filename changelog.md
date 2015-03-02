version 8.0
-------------
1. Stable build

version 9.0
-------------
1. Added in fragment output type
2. Revised none output type
3. Fixed some bugs

version 10.0
-------------
1. Optimized some code
2. Fixed none output type bug 
3. Added nested keys 
4. Public release

version 10.1
-------------
1. Fixed issues with detecting Arrays and Objects

version 10.2
-------------
1. Fixed issue when stencil replaces the parent instead of emptying and appending which causes a lost of data that was attached to the parent element

version 10.3
-------------
1. Better error handling when using none as a destination and render output type is not supported
2. Improved performance with selector

version 11
-------------
1. Added string render output option to get pure string output
2. Added solution for specificInners IDs which contain insertion objects e.g. {{lpIdx}}
3. Updated solution for append render output option that doesn't refresh existing content that its appending to

version 12
-------------
1. Updated depp object retrival notation to support array notation a.k.a. array[123].foo[bar]