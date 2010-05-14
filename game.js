var puts = require( "sys" ).puts;
var players = [];

with ( require( "fab" ) )

( fab )

  ( listen, 0xFAB )

  ( /move/ )
    ( function() {
        var out = this;
        return function listener( obj ) {
          if ( !obj ) out();
          else if ( obj.body ) {
            puts(obj.body);
            broadcast(obj);
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


function broadcast(obj) {
  puts("broadcasting to "+players.length+" players");
  players.forEach(
    function(player) {
      var body = '<script type="text/javascript">' +
                 'window.parent.player_list.walk_player('+ obj.body +');' +
                 '</script>' + "\n";
      player({body: body});
    }
  );
}

function init_comet (app) {
  return function () {
    var out = this;

    return app.call( function listener(obj) {
      if (obj && obj.body) {
        players.push(out);
        out({ headers: { "content-type": "text/html" },
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
      var app = out({ body: {id: q.id, x: q.x || 0, y: q.y || 0} });
      if ( app ) app();
    }
    else {
      out();
    }
  };
}
