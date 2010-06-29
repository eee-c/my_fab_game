var puts = require( "sys" ).puts;

function player_from_querystring() {
  var out = this;
  return function(head) {
    if (head && head.url && head.url.search) {
      var uniq_id = "" + (new Date()).getTime();
      if (/MYFABID=(\w+)/.test(head.headers.cookie)) {
        uniq_id = RegExp.$1;
      }

      var search = head.url.search.substring(1);
      var q = require('querystring').parse(search);
      var app = out({ body: {id: q.player, x: q.x || 0, y: q.y || 0, uniq_id: uniq_id} });
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
    bodyRespondsWithPlayer() {
      var player;
      function downstream (obj) { if (obj) player = obj.body; }

      var upstream_listener = player_from_querystring.call(downstream);
      upstream_listener(head);

      this(player.id == "foo");
    },

    function
    terminatesIfBody() {
      var ret;
      function downstream (obj) { ret = obj; }

      var upstream_listener = player_from_querystring.call(downstream);
      upstream_listener({body: "foo"});

      this(typeof(ret) == "undefined");
    }
  ];
})();

exports.app = player_from_querystring;
