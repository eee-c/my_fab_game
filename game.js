#!/usr/bin/env node

var express = require('express'),
    http    = require('http'),
    faye    = require('faye'),
    puts    = require( "sys" ).puts,
    inspect = require( "sys" ).inspect,
    couchdb = require('node-couchdb/lib/couchdb'),
    client  = couchdb.createClient(5984, 'localhost'),
    db      = client.db('my-fab-game');

Logger = {
  level: 1,

  debug:  function(msg) { if (this.level<1) puts("[DEBUG] " + msg); },
  info:   function(msg) { if (this.level<2)  puts("[INFO] " + msg); },
  warn:   function(msg) { if (this.level<3)  puts("[WARN] " + msg); },
  errror: function(msg) { if (this.level<4)  puts("[ERROR] " + msg); }
};


Logger.info("Starting up...");

// Create the Express server
var app = express.createServer();

// Serve statics from ./public
app.use(express.staticProvider(__dirname + '/public'));


// Render the game board with Jade
app.set('view engine', 'jade');

app.get('/board', function(req, res) {
  res.render('board');
});


// Server-side extension to lock player messages to client that added
// the player in the first place,
// http://japhr.blogspot.com/2010/08/per-message-authorization-in-faye.html
var serverAuth = {
  incoming: function(message, callback) {
    // Let non-meta messages through
    if (message.channel.indexOf('/meta/') === 0)
      return callback(message);

    Logger.debug("[Faye.incoming] " + message.channel);

    // Get subscribed channel and auth token
    var subscription = message.subscription,
        msgToken     = message.ext && message.ext.authToken;

    // Message does not have a player ID
    if (!message.data.id)
      return callback(message);

    // Message has a player ID
    Logger.debug("[Faye.incoming]  checking for player: " + message.data.id);

    players.get(message.data.id, function(player) {
      Logger.debug("[Faye.incoming]  " + inspect(player));

      // If the player is already in the room
      if (player) {
        Logger.debug("[Faye.incoming]  token check: " + player.token + " " + msgToken);

        // If the tokens do not match, stop the message
        if (player.token != msgToken) {
          Logger.warn("rejecting mis-matched token message");
          message.error = 'Invalid player auth token';
        }
      }
      else {
        Logger.debug("[Faye.incoming]  " + message.data.id + " adding message token: " + msgToken);
        message.data.authToken = msgToken;
      }

      callback(message);
    });
  }
};

// Faye nodejs adapter
var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

// Add the server-side faye extension
bayeux.addExtension(serverAuth);

// Add the faye nodejs faye adapter to the nodejs server
bayeux.attach(app);

// Listen on port 4011 (0xFAB)
app.listen(4011);


// with ( require( "fab" ) )

// ( fab )

//   // Listen on the FAB port and establish the faye server
//   ( listen_with_faye, { port: 0xFAB, extension: serverAuth } )

//   // resource to query player status -- debugging
//   ( /^\/status/ )
//     ( player_status )

//   // serve javascript and CSS
//   (/^\/(javascript|stylesheets)/)
//     (/^\/([-_\w]+)\.(js|css)$/)
//       (fab.nodejs.fs)
//         ( fab.tmpl, "<%= this[0] %>/<%= this[1] %>.<%= this[2] %>" )
//         ( fab.capture )
//     (404)

//   // serve static HTML
//   (/^\/([_\w]+)$/)
//     (fab.nodejs.fs)
//       ( fab.tmpl, "html/<%= this %>.html" )
//       ( fab.capture.at, 0 )

//   // anything else is 404 / Not Found
//   ( 404 );


function player_status () {
  var out = this;
  for (var id in players.all()) {
    var player = players.get(id);
    out = out({body: id})
             ({body: "\n"})
             ({body: "  timeout?:" + player.idle_timeout})
             ({body: "\n"})
             ({body: "  idle from:" + player.idle_watch_started})
             ({body: "\n"})
             ({body: "  x " + player.status.x})
             ({body:  " y " + player.status.y})
             ({body: "\n"});
  }
  out();
}

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

  idle_watch: function(id) {
    if (this.timeouts[id])
      clearTimeout(this.timeouts[id]);

    var self = this;
    this.timeouts[id] = setTimeout(function() {
      Logger.info("timeout " + id +"!");
      self.drop_player(id);
    }, self.timeout);

    return (new Date((new Date()).getTime() + self.timeout)).getTime();
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

  init: function() {
    var self = this;
    // Ensure that the faye server has fully established by waiting
    // half a second before subscribing to channels
    setTimeout(function(){self.init_subscriptions();}, 500);
    return self;
  }
}).init();
