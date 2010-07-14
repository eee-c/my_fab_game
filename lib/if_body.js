var puts = require( "sys" ).puts;

function unary_try(fn) {
  return function() {
    var out = this;
    return function listener( obj ) {
      try {
        if ( obj && obj.body ) {
          fn.call(obj.body, obj.body);
        }
      }
      catch (e) {
        puts("[unary_try] error: " + e.message +
                              ' (' + e.type + ')');
      }
      finally {
        out();
      }
      return listener;
    };
  };
}

exports.app = unary_try;
