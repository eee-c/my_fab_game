#!/usr/bin/env node

// Don't crash on errors
process.on('uncaughtException', function (err) {
  console.log('Caught uncaughtException: ' + err.stack);
});

var http = require('http'),
    faye = require('faye'),
    inspect = require( "sys" ).inspect,
    couchdb = require('node-couchdb/lib/couchdb'),
    client  = couchdb.createClient(5984, 'localhost'),
    db      = client.db('my-fab-game'),
    fab     = require('fab');

// Additional (fab) apps
fab.static = require('fab.static');
fab.accept = require('fab.accept');


// Player local store
var players = (require("./lib/players")).init(db);

var Logger = require("./lib/logger");

Logger.info("Starting up...");


// Partials and in-page javascript

var board_js_string =  " var player_list; \
\
$(function() { \
  var kv = location.search.substr(1).split(/=/); \
  if (kv[0] == 'player' && kv[1]) { \
    $('#login').hide(); \
\
    var me = new Player(kv[1], {animate_with: function(avatar){ \
      var color = ['#ccc', '#c00', '#0c0'][Math.floor(3*Math.random(3))]; \
      avatar.attr({fill: color}); \
    } }); \
\
    var room = new Room($('#room-container')[0]); \
    var goodbye = function() { \
      alert('You have been logged out.'); \
      window.location = window.location.protocol + '//' + window.location.host + window.location.pathname; \
    }; \
    player_list = new PlayerList(me, room, {onComplete: goodbye}); \
  } \
}); \
";

with ( fab )
with ( html ) head =

  ( fab )
    ( HEAD )
      ( TITLE )( "My (fab) Game" )()
      ( LINK, { href:  "/stylesheets/board.css",
                media: "screen",
                rel:   "stylesheet",
                type:  "text/css" } )
      ( SCRIPT, { src:  "/javascript/jquery-min.js",
                  type: "application/javascript" } )()

      ( SCRIPT, { src:  "/javascript/json2.js",
                  type: "application/javascript" } )()

      ( SCRIPT, { src: "/faye.js",
                  type: "text/javascript" } )()

      ( SCRIPT, { src:  "/javascript/raphael-min.js",
                  type: "application/javascript" } )()
      ( SCRIPT, { src:  "/javascript/player.js",
                  type: "application/javascript" } )()
      ( SCRIPT, { src:  "/javascript/player_list.js",
                  type: "application/javascript" } )()
      ( SCRIPT, { src:  "/javascript/room.js",
                  type: "application/javascript" } )()

      ( SCRIPT, { type: "application/javascript" } )
        ( board_js_string )
      ()

    ()
  ();



with ( fab )
with ( html )

( fab )

  // Listen on the FAB port and establish the faye server
  ( listen, 0xFAB, attach_faye )

  (route, /javascript/)
    (route, /\/([^\/]*)$/)
      // Stream javascript files from ./javascript
      (static, "javascript", "text/javascript", "js")
    ()
    ('Not found!')
  ()

  (route, /^\/stylesheets/)
    (route, /^\/(.*)/)
      // Stream stylesheets files from ./stylesheets
      (static, "stylesheets", "text/css", "css")
    ()
    ('Not found!')
  ()

  ( route, /^\/status/ )
    ( accept.HTML )
      ( HTML )
        ( head )
        ( BODY )
          ( PRE )
            ( player_status )
          ()
        ()
      ()
    ()
    ( accept.PLAIN )
      (undefined, {headers: { "Content-Type": "text/plain"}})
      ( player_status )
    ()
    ( "not found", { status: 404 } )
  ()

  (route, /^\/board/)
    ( HTML )
      ( head )
      ( BODY )
        ( FORM, { id: "login", method: "get" } )
          ( LABEL )
            ( "Name" )
            ( INPUT, { type: "text", name: "player" } )
          ()
          ( INPUT, { type: "submit", value: "Play" } )
        ()
        ( DIV, { id: "room-container" } )()
      () // BODY

    () // HTML
  ()

();


// Local (fab) apps

function player_status(write) {
  return write(function(write) {
    return fab.stream(function(stream) {
      players.all(function(list) {
        var ret = "";
        list.forEach(function(player) {
          ret += player._id + "\n";
        });
        stream(write(ret + "\n"));
        stream(write());
      });
    });
  });
}


// Additional functions

function attach_faye(server) {
  var faye_server = new faye.NodeAdapter({
    mount:    '/faye',
    timeout:  45
  });

  faye_server.attach(server);

  // attach the extension ensuring player messages come from the same
  // client that originally added player to the room
  var auth = require("./lib/faye_server_auth").init(function () {
    players.get.apply(players, arguments);
  });
  faye_server.addExtension(auth);
}
