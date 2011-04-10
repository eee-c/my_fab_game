# My (fab) Game

This is a `<canvas>` based room "game" that I am putting together for the kids.  Ultimately it should allow your character to mill about the room and talk to other characters in the room.  My kids seem to think this is the height of online gaming.

The backend is fab.js based (which is, itself, node.js based).  The full list of dependencies includes:

<pre><code>
   npm install faye
   npm install express
   npm install dirty
</code></pre>


With node.js installed and the fab.js library installed in `~/.node_libraries`, you should be able to run this as:

> node game.js

You can access the game board at: http://localhost:4011/board.

Currently there is a view-only version of the board at: http://localhost:4011/view_only.  This will go away sometime in the near future.

You can follow along with development of this starting at: http://japhr.blogspot.com/2010/04/sidebar-chain-chatting-with-fabjs.html

## LICENSE:

(The MIT License)

Copyright (c) 2010

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
