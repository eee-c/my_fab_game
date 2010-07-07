var vows = require('vows'),
  assert = require('assert'),
    puts = require('sys').puts;

require.paths.push("lib");
var init_comet = require('init_comet').app;

var api = {
  fab: {
    when_upstream_replies_with: function(obj) {
      return function () {
        var topic = this;

        var upstream = function() { this(obj); },
            unary    = init_comet(upstream);

        unary.call(
          function(obj) {
            topic.callback(null, obj);
            return function listener() {return listener;};
          }
        );
      };
    }
  }
};

var suite = vows.describe('init_comet').
  addBatch({
    'with a player': {
      topic: api.fab.when_upstream_replies_with({body: {id:1, uniq_id:42}}),
      'sets a session cookie': function(obj) {
        assert.equal(obj.headers["Set-Cookie"], "MYFABID=42");
      }
    }
  }).export(module);
