#!/usr/bin/env node

var faye = require("faye"),
    puts = require( "sys" ).puts;

var players = {};

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


function add_player(player) {
  var new_id = player.id;
  players[new_id] = {
    status: player,
    uniq_id: player.uniq_id
  };
  idle_watch(new_id);
}

function update_player_status(status) {
  if (players[status.id]) {
    puts("[update_player_status] " + status.id);
    players[status.id].status = status;
    idle_watch(status.id);
  }
  else {
    puts("[update_player_status] unknown player: " + status.id + "!");
  }
}

function idle_watch(id) {
  if (players[id].idle_timeout) {
    clearTimeout(players[id].idle_timeout);
  }

  players[id].idle_timeout = setTimeout(function() {
    puts("timeout " + id +"!");
    drop_player(id);
  }, 30*60*1000);

  players[id].idle_watch_started = "" + (new Date());
}

function drop_player(id) {
  puts("Dropping player \""+ id +"\"");

  delete players[id];
}

function player_status () {
  var out = this;
  for (var id in players) {
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


// Ensure that the faye server has fully established by waiting
// half a second before subscribing to channels
setTimeout(function(){
  var client = new faye.Client('http://localhost:4011/faye');
  client.subscribe("/move", function(message) {
    update_player_status(message);
  });

  client.subscribe("/players/create", function(player) {
    puts("adding player:" + player.id);
    add_player(player);
  });

  client.subscribe("/players/query", function(q) {
    var ret = [];
    for (var id in players) {
      ret.push(players[id].status);
    }
    client.publish("/players/all", ret);
  });
}, 500);
