var puts = require( "sys" ).puts;
var listeners = [];

with ( require( "fab" ) )

( fab )

  ( listen, 0xFAB )

  ( /move/ )

    (
      function () {
        var out = this;
	return function listener( obj ) {
	  if ( !obj ) out();
	  else if ( obj.body ) {
	    puts(obj.body);
	    broadcast(obj);
	  }
	  return listener;
	};
      }
    )


  ( /^\/comet_view/ )
    ( function(){
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
  listeners.forEach(
    function(listener) {
      var body = '<script type="text/javascript">' + "\nconsole.debug('" + obj.body + "')\n</script>\n";
      listener({body: body});

      body = '<script type="text/javascript">' + "\nloc = " + obj.body + ";\nwindow.parent.me.stop();\nwindow.parent.me.walk_to(loc.x, loc.y);\n</script>\n";
      listener({body: body});
    }
  );
}
