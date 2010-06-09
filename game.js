#!/usr/bin/env node

var puts = require( "sys" ).puts,
    player_from_querystring = require('./lib/player_from_querystring').app,
    init_comet = require('./lib/init_comet').app;

var players = {};

with ( require( "fab" ) )

( fab )

  ( listen, 0xFAB )

  ( /move/ )
    ( function() {
        var out = this;
        return function listener( obj ) {
          if ( !obj ) out();
          else if ( obj.body ) {
            broadcast(comet_walk_player(obj.body));
            update_player_status(JSON.parse(""+obj.body));
          }
          return listener;
        };
      } )

  ( /chat/ )
    ( function() {
        var out = this;
        return function listener( obj ) {
          if ( !obj ) out();
          else if ( obj.body ) {
            var msg = JSON.parse(obj.body.toString());
            msg.body = msg.say.substr(0,100);
            broadcast(comet_player_say(JSON.stringify(msg)));
          }
          return listener;
        };
      } )

  ( /^\/comet_view/ )
    ( broadcast_new )
    ( init_comet )
    ( player_from_querystring )

  ( /^\/status/ )
    ( player_status )

  (/^\/(javascript|stylesheets)/)
    (/^\/([-_\w]+)\.(js|css)$/)
      (fab.nodejs.fs)
        ( fab.tmpl, "<%= this[0] %>/<%= this[1] %>.<%= this[2] %>" )
        ( fab.capture )
    (404)

  (/^\/([_\w]+)$/)
    (fab.nodejs.fs)
      ( fab.tmpl, "html/<%= this %>.html" )
      ( fab.capture.at, 0 )


  ( 404 );


function broadcast(comet_command) {
  var num = 0;
  for (var id in players) {
    var player = players[id];
    player.listener({body: comet_command});
    num++;
  }
  puts("broadcasting to "+num+" players: " + comet_command);
}

function update_player_status(status) {
  if (players[status.id]) {
    puts("[update_player_status] " + status.id);
    players[status.id].status = status;
  }
  else {
    puts("[update_player_status] unknown player" + status.id + "!");
  }
  idle_watch(status.id);
}

function comet_wrap(js) {
  return '<script type="text/javascript">' +
         'window.parent.' +
         js +
         '</script>' + "\n";
}

function comet_walk_player(player_string) {
  return comet_wrap('player_list.walk_player('+ player_string +')');
}

function comet_player_say(player_string) {
  return comet_wrap('player_list.player_say('+ player_string +')');
}

function comet_quit_player(id) {
  return comet_wrap('player_list.remove_player("'+ id +'")');
}

// TODO: test and/or shrink
function broadcast_new (app) {
  return function () {
    var out = this;

    var downstream;
    return app.call( function listener(obj) {
      if (obj && obj.body && obj.body.id) {
        for (var id in players) {
          out({body: comet_walk_player(JSON.stringify(players[id].status))});
        }

        var new_id = obj.body.id;
        puts("adding: " + new_id);
        players[new_id] = {status: obj.body, listener: out};

        idle_watch(new_id);

        setTimeout(function(){keepalive(new_id);}, 30*1000);

        puts("broadcasting about: " + new_id);
        broadcast(comet_walk_player(JSON.stringify(obj.body)));
      }
      else {
        downstream = out(obj);
      }
      return listener;
    });
  };
}

function add_player (app) {
  return function () {
    var out = this;

    return app.call( function listener(obj) {
      if (obj && obj.body) {
        var new_id = obj.body.id;
        puts("adding: " + new_id);
        players[new_id] = {status: obj.body, listener: out};

        idle_watch(new_id);
      }
      out(obj);
      return listener;
    });
  };
}

function idle_watch(id) {
  if (players[id].idle_timeout) {
    clearTimeout(players[id].idle_timeout);
  }

  players[id].idle_timeout = setTimeout(function() {
    puts("timeout " + id +"!");
    drop_player(id);
  }, 30*60*1000);

  setTimeout(function(){keepalive(id);}, 30*1000);

  players[id].idle_watch_started = "" + (new Date());
}

function drop_player(id) {
  puts("Dropping player \""+ id +"\"");
  broadcast(comet_quit_player(id));
  delete players[id];
}

function keepalive(id) {
  if (players[id]) {
    puts("keepalive: " + id);
    players[id].listener({body: '<script type="text/javascript">"12345789 "</script>' + "\n"});
    setTimeout(function(){keepalive(id);}, 30*1000);
  }
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

