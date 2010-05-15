var puts = require( "sys" ).puts;
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
            broadcast(obj.body);
            update_player_status(JSON.parse(""+obj.body));
          }
          return listener;
        };
      } )


  ( /^\/comet_view/ )
    ( init_comet )
    ( player_from_querystring )

  (/^\/(javascript|stylesheets)/)
    (/^\/([_\w]+)\.(js|css)$/)
      (fab.nodejs.fs)
        ( fab.tmpl, "<%= this[0] %>/<%= this[1] %>.<%= this[2] %>" )
        ( fab.capture )
    (404)

  (/^\/([_\w]+)$/)
    (fab.nodejs.fs)
      ( fab.tmpl, "html/<%= this %>.html" )
      ( fab.capture.at, 0 )


  ( 404 );


function broadcast(player_string) {
  var num = 0;
  for (var id in players) {
    var player = players[id];
    var body = comet_walk_player(player_string);
    player.listener({body: body});
    num++;
  }
  puts("broadcasting to "+num+" players");
}

function update_player_status(status) {
  puts("updating player status: " + status.id);
  players[status.id].status = status;
}

function comet_walk_player(player_string) {
  return '<script type="text/javascript">' +
         'window.parent.player_list.walk_player('+ player_string +');' +
         '</script>' + "\n";
}

function init_comet (app) {
  return function () {
    var out = this;

    return app.call( function listener(obj) {
      if (obj && obj.body) {
        var downstream = out({ headers: { "content-type": "text/html" },
                               body: "<html><body>\n" })

         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})

         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"});

        for (var id in players) {
          downstream = downstream({body: comet_walk_player(JSON.stringify(players[id].status))});
        }

        puts("adding: " + obj.body.id);
        players[obj.body.id] = {status: obj.body, listener: out};
        broadcast(JSON.stringify(obj.body));
      }
      return listener;
    });
  };
}

function player_from_querystring() {
  var out = this;
  return function(head) {
    if (head.url.search) {
      var search = head.url.search.substring(1);
      var q = require('querystring').parse(search);
      var app = out({ body: {id: q.player, x: q.x || 0, y: q.y || 0} });
      if ( app ) app();
    }
    else {
      out();
    }
  };
}
