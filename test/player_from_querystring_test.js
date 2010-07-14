var vows = require('vows'),
  assert = require('assert'),
    puts = require('sys').puts;

require.paths.push("lib");
var player_from_querystring = require('player_from_querystring').app;

var api = {
  fab: {
    body_response_to: function(obj) {
      return function () {
        var topic = this;
        var upstream_listener = player_from_querystring.call(
          function(obj) { topic.callback(null, obj && obj.body); }
        );
        upstream_listener(obj);
      };
    },
    response_to: function(obj) {
      return function () {
        var topic = this;
        var upstream_listener = player_from_querystring.call(
          function(obj) { topic.callback(null, obj); }
        );
        upstream_listener(obj);
      };
    }
  }
};

var suite = vows.describe('player_from_querystring').
  addBatch({
    'with a query string': {
      topic: api.fab.body_response_to({
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
    'without explicit X-Y coordinates': {
      topic: api.fab.body_response_to({
        url: { search : "?player=foo" },
        headers: { cookie: null }
      }),

      'has X coordinate': function(player) {
        assert.equal(player.x, 0);
      },

      'has Y coordinate': function(player) {
        assert.equal(player.y, 0);
      }
    },
    'POSTing data': {
      topic: api.fab.response_to({body: "foo"}),

      'should raise an error': function (obj) {
        assert.equal(obj.status, 406);
      }
    },
    'invalid querystring': {
      topic: api.fab.response_to({
        url: { search : "?foo=bar" },
        headers: { cookie: null }
      }),
      'should raise an error': function (obj) {
        assert.equal(obj.status, 406);
      }
    }
  }).export(module);
