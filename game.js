var puts = require( "sys" ).puts;
var listeners = [];

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
    ( fab.tap, function () { puts("[comet_view] here"); })
    ( function() {
        listeners.push( this );
        this({headers: { "content-type": "text/html"},
              body: "<html><body>\n"})

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
    } )

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
  puts("broadcasting to "+listeners.length+" listeners");
  listeners.forEach(
    function(listener) {
      var body = '<script type="text/javascript">' + "\nif (console) console.debug('" + obj.body + "')\n</script>\n";
      listener({body: body});

      body = '<script type="text/javascript">' + "\n" +
        "var attrs = " + obj.body + ";\n" +
        "window.parent.player_list.add_player(attrs);\n" +
        "var player = window.parent.player_list.get_player(attrs.id);" +
        "if (typeof(player) != 'undefined') {\n" +
        "  player.stop();\n" +
        "  player.walk_to(attrs.x, attrs.y);\n" +
        "}" +
        "</script>\n";
      listener({body: body});
    }
  );
}
