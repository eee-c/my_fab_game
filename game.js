#!/usr/bin/env node

var puts = require( "sys" ).puts;

with ( require( "fab" ) )

( fab )

  // Listen on the FAB port and establish the faye server
  ( listen_with_faye, 0xFAB )

  // resource to query player status -- debugging
  ( /^\/status/ )
    ( player_status )

  // serve javascript and CSS
  (/^\/(javascript|stylesheets)/)
    (/^\/([-_\w]+)\.(js|css)$/)
      (fab.nodejs.fs)
        ( fab.tmpl, "<%= this[0] %>/<%= this[1] %>.<%= this[2] %>" )
        ( fab.capture )
    (404)

  // serve static HTML
  (/^\/([_\w]+)$/)
    (fab.nodejs.fs)
      ( fab.tmpl, "html/<%= this %>.html" )
      ( fab.capture.at, 0 )

  // anything else is 404 / Not Found
  ( 404 );


function player_status () {
  var out = this;
  for (var id in players.all()) {
    out = out({body: id})
             ({body: "\n"})
             ({body: "  timeout?:" + players[id].idle_timeout})
             ({body: "\n"})
             ({body: "  idle from:" + players[id].idle_watch_started})
             ({body: "\n"})
             ({body: "  x " + players[id].status.x})
             ({body:  " y " + players[id].status.y})
             ({body: "\n"});
  }
  out();
}

// Player local store
var players = ({
  _: { },

  all: function() {
    return this._;
  },

  add_player: function(player) {
    var new_id = player.id;
    this._[new_id] = {
      status: player,
      uniq_id: player.uniq_id
    };
    this.idle_watch(new_id);
  },

  update_player_status: function(status) {
    if (this._[status.id]) {
      puts("[update_player_status] " + status.id);
      this._[status.id].status = status;
      this.idle_watch(status.id);
    }
    else {
      puts("[update_player_status] unknown player: " + status.id + "!");
    }
  },

  idle_watch: function(id) {
    if (this._[id].idle_timeout) {
      clearTimeout(this._[id].idle_timeout);
    }

    var self = this;
    this._[id].idle_timeout = setTimeout(function() {
      puts("timeout " + id +"!");
      self.drop_player(id);
    }, 30*60*1000);

    this._[id].idle_watch_started = "" + (new Date());
  },

  drop_player: function(id) {
    puts("Dropping player \""+ id +"\"");
    this.faye.publish("/players/drop", id);
    delete this._[id];
  },

  init_subscriptions: function() {
    var faye = require("faye");
    this.faye = new faye.Client('http://localhost:4011/faye');

    var self = this;
    this.faye.subscribe("/players/move", function(message) {
      self.update_player_status(message);
    });

    this.faye.subscribe("/players/create", function(player) {
      puts("adding player:" + player.id);
      self.add_player(player);
    });

    this.faye.subscribe("/players/query", function(q) {
      var ret = [];
      for (var id in self._) {
        ret.push(self._[id].status);
      }
      self.faye.publish("/players/all", ret);
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
