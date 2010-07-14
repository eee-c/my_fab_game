var puts = require( "sys" ).puts;

function if_body(fn) {
  return function() {
    var out = this;
    return function listener( obj ) {
      try {
        if ( obj && obj.body ) {
          fn.call(obj.body, obj.body);
        }
      }
      catch (e) {
        puts("[if_body] error: " + e.message +
                            ' (' + e.type + ')');
      }
      finally {
        out();
      }
      return listener;
    };
  };
}

exports.app = if_body;
