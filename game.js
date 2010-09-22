#!/usr/bin/env node

// Don't crash on errors
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
});

var http = require('http'),
    faye = require('faye'),
    inspect = require( "sys" ).inspect,
    couchdb = require('node-couchdb/lib/couchdb'),
    client  = couchdb.createClient(5984, 'localhost'),
    db      = client.db('my-fab-game'),
    fab        = require('fab');

fab.static = require('fab.static');
fab.accept = require('fab.accept');

var Logger = require("./lib/logger");

Logger.info("Starting up...");

function attach_faye(server) {
  var faye_server = new faye.NodeAdapter({
    mount:    '/faye',
    timeout:  45
  });

  faye_server.attach(server);

  // attach the extension ensuring player messages come from the same
  // client that originally added player to the room
  faye_server.addExtension(require("./lib/faye_server_auth"));
}

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


// Player local store
var players = ({
  all: function(callback) {
    return db.allDocs({include_docs:true}, function(err, docs) {
      callback(docs.rows.map(function(row) {return row.doc;}));
    });
  },

  get: function(id, callback) {
    Logger.debug("[players.get] trying to get: " + id);
    db.getDoc(id, function(err, res) {
      if (err) {
        Logger.warn(JSON.stringify(err));
      }
      callback(res);
    });
  },

  add_player: function(player) {
    var self = this;
    var new_id = player.id;
    Logger.info("players.add_player: " + new_id);
    this.get(new_id, function(old_player) {
      if (!old_player) {
        db.saveDoc(new_id, {token: player.authToken});

        delete(player['authToken']);
        self.update_player_status(player);
      }
    });
  },

  update_player_status: function(status) {
    var self = this;
    this.get(status.id, function(player) {
      Logger.debug("[players.update_player_status] " + inspect(player));
      if (player) {
        Logger.info("players.update_player_status: " + status.id);
        player.status = status;
        player.timeout = self.idle_watch(status.id);
        db.saveDoc(player);
      }
      else {
        Logger.warn("[players.update_player_status] unknown player: " + status.id + "!");
      }
    });
  },

  timeout: 30*60*1000,
  timeouts: { },

  idle_watch: function(id, timeout) {
    if (this.timeouts[id])
      clearTimeout(this.timeouts[id]);

    if (!timeout) timeout = this.timeout;

    var self = this;
    this.timeouts[id] = setTimeout(function() {
      Logger.info("timeout " + id +"!");
      self.drop_player(id);
    }, timeout);

    return (new Date((new Date()).getTime() + timeout)).getTime();
  },

  drop_player: function(id) {
    Logger.info("players.drop_player " + id);
    this.faye.publish("/players/drop", id);

    this.get(id, function(player) {
      Logger.debug("[players.drop_player] " + inspect(player));
      if (player) db.removeDoc(id, player._rev);
    });
  },

  init_subscriptions: function() {
    var faye = require("faye");
    this.faye = new faye.Client('http://localhost:4011/faye');

    var self = this;
    this.faye.subscribe("/players/move", function(message) {
      Logger.debug("[/players/move] " + inspect(message));
      self.update_player_status(message);
    });

    this.faye.subscribe("/players/create", function(player) {
      Logger.debug("[/players/create] " + inspect(player));
      self.add_player(player);
    });

    this.faye.subscribe("/players/query", function(q) {
      self.all(function(players) {
        self.faye.publish("/players/all", players.map(function(player) {return player.status;}) );
      });
    });
  },

  init_players: function() {
    var self = this;

    var now = (new Date()).getTime();
    self.all(function(players) {
      players.forEach(function(player){
        var timeout = player.timeout - now;
        if (timeout > 0) {
          Logger.info("[init_timeouts] " + player._id + " " + timeout);
          self.idle_watch(player._id, timeout);
        }
        else {
          Logger.info("[init_timeouts] dropping: " + player._id);
          self.drop_player(player._id);
        }
      });
    });
  },

  init: function() {
    var self = this;

    // Ensure that the faye server has fully established by waiting
    // half a second before subscribing to channels
    setTimeout(function(){
      self.init_subscriptions();
      self.init_players();
    }, 500);

    return self;
  }
}).init();

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
