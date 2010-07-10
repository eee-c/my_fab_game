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

exports.tests = ( function() {
  var request = { body: "foo-bar" },
      body = null,
      fn = function() {body = this;};


  return [
    function
    invokesCallbackIfBody() {
      function downstream () { }

      var upstream_listener = unary_try(fn).call(downstream);
      upstream_listener(request);

      this(body == "foo-bar");
    },

    function
    terminatesEvenIfBody() {
      var ret;
      function downstream (obj) { ret = obj; }

      var upstream_listener = unary_try(fn).call(downstream);
      upstream_listener(request);

      this(typeof(ret) == "undefined");
    },

    function
    terminatesCleanlyOnException() {
      var ret;
      function downstream (obj) { ret = obj; }

      var exception_fn = function() { throw "Foo!"; };
      var upstream_listener = unary_try(exception_fn).call(downstream);
      upstream_listener(request);

      this(typeof(ret) == "undefined");
    },

    function
    terminatesIfHead() {
      var ret;
      function downstream (obj) { ret = obj; }

      var upstream_listener = unary_try(fn).call(downstream);
      upstream_listener({head: "foo"});

      this(typeof(ret) == "undefined");
    },

    function
    terminatesIfEmptyRequest() {
      var ret;
      function downstream (obj) { ret = obj; }

      var upstream_listener = unary_try(fn).call(downstream);
      upstream_listener();

      this(typeof(ret) == "undefined");
    }
  ];
})();

exports.app = unary_try;
