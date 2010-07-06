var vows = require('vows'),
  assert = require('assert'),
    puts = require('sys').puts;

require.paths.push("lib");
var player_from_querystring = require('player_from_querystring').app;

var api = {
  fab: {
    send_obj: function(obj) {
      return function () {
        var topic = this;
        var upstream_listener = player_from_querystring.call(
          function(obj) { topic.callback(null, obj && obj.body); }
        );
        upstream_listener(obj);
      };
    }
  }
};

var suite = vows.describe('just_playing').
  addBatch({
    'with a query string': {
      topic: api.fab.send_obj({
        url: { search : "?player=foo&x=1&y=2" },
        headers: { cookie: null }
      }),

      'is player': function (player) {
        assert.equal (player.id, "foo");
      },

      'has unique ID': function(player) {
        assert.notEqual (typeof(player.uniq_id), "undefined");
      },

      'has X coordinate': function(player) {
        assert.equal(player.x, 1);
      },

      'has Y coordinate': function(player) {
        assert.equal(player.y, 2);
      }
    },
    'POSTing data': {
      topic: api.fab.send_obj({body: "foo"}),

      'is null response': function (obj) {
        assert.isUndefined (obj);
      }
    }
  }).export(module);
