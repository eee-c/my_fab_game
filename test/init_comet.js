var vows = require('vows'),
  assert = require('assert'),
    puts = require('sys').puts;

require.paths.push("lib");
var init_comet = require('init_comet').app;

var api = {
  fab: {
    when_upstream_replies_with: function(upstream_obj) {
      return function () {
        var topic = this;

        var upstream = function() { this(upstream_obj); },
            unary    = init_comet(upstream);

        var chunks = [];
        unary.call(
          function listener(obj) {
            chunks.push(obj);
            if (obj == upstream_obj || typeof(obj) == "undefined") {
              topic.callback(null, chunks);
            }
            return listener;
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

      'sets a session cookie': function(chunks) {
        assert.equal(chunks[0].headers["Set-Cookie"], "MYFABID=42");
      },

      'sends the opening HTML doc': function(chunks) {
        assert.match(chunks[1].body, /<html/i);
      },

      'send 1000+ bytes to get Chrome\'s attention': function(chunks) {
        var byte_count = 0;
        for (var i=0; i < chunks.length; i++) {
          var chunk = chunks[i];
          if (chunk && chunk.body && typeof(chunk.body) == "string") {
            byte_count = byte_count + chunk.body.length;
          }
        }
        assert.isTrue(byte_count > 1000);
      },

      'sends the player': function(chunks) {
        assert.deepEqual(chunks[chunks.length-1], {body: {id:1, uniq_id:42}});
      }
    },

    'without a player': {
      topic: api.fab.when_upstream_replies_with(),

      'terminates the downstream connection': function(chunks) {
        assert.isUndefined(chunks[0]);
      }
    },

    'with an invalid player object': {
      topic: api.fab.when_upstream_replies_with({body:{}}),

      'terminates the downstream connection': function(chunks) {
        assert.isUndefined(chunks[0]);
      }
    }
  }).export(module);
