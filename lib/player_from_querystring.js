var puts = require( "sys" ).puts;

function player_from_querystring() {
  var out = this;
  return function(head) {
    if (head && head.url && head.url.search) {
      var uniq_id;
      if (/MYFABID=(\w+)/.test(head.headers.cookie)) {
        uniq_id = RegExp.$1;
      }
      else {
        uniq_id = require('crypto').
          createHash('md5').
          update("" + (new Date()).getTime()).
          digest("hex");
      }

      var search = head.url.search.substring(1);
      var q = require('querystring').parse(search);

      if (q.player) {
        out = out({ body: {id: q.player, x: q.x || 0, y: q.y || 0, uniq_id: uniq_id} });
      }
      else {
        out = out({ status: 406 });
      }
      if (out) out();
    }
    else {
      out({ status: 406 });
    }
  };
}

exports.app = player_from_querystring;
