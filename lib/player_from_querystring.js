var puts = require( "sys" ).puts;

function player_from_querystring() {
  var out = this;
  return function(head) {
    if (head && head.url && head.url.search) {
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

exports.tests = ( function() {
  var head = { url: { search : "?player=foo&x=1&y=2" } };

  return [
    function
    statusReturnsUnaryApp() {
      this( player_from_querystring().length === 1 );
    },

    function
    bodyRespondsWithCorrectPayload() {
      var out = this;
      var player;
      function downstream (obj) {
        if (obj) player = obj.body;
      }
      var listener = player_from_querystring.call(downstream);
      listener(head);
      out(player.id == "foo");
    }
  ];
})();

exports.app = player_from_querystring;
