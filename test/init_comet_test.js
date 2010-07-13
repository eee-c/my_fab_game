var vows = require('vows'),
  assert = require('assert'),
    puts = require('sys').puts;

require.paths.push("lib");
var init_comet = require('init_comet').app;

function when_upstream_replies_with(upstream_obj) {
  return function () {
    var topic = this;

    var upstream = function() { this(upstream_obj); },
        unary = init_comet(upstream);

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

function when_upstream_terminates() {
  return function () {
    var topic = this;

    var upstream = function() { this(); },
        unary = init_comet(upstream);

    var chunks = [];
    unary.call(
      function listener(obj) {
        chunks.push(obj);
        return listener;
      }
    );
    return chunks;
  };
}

var suite = vows.describe('init_comet').
  addBatch({
    'with a player': {
      topic: when_upstream_replies_with({body: {id:1, uniq_id:42}}),

      'sets a session cookie': function(chunks) {
        assert.equal(chunks[0].headers["Set-Cookie"], "MYFABID=42");
      },

      'sends the opening HTML doc': function(chunks) {
        assert.match(chunks[1].body, /<html/i);
      },

      'send 1000+ bytes to get Chrome\'s attention': function(chunks) {
        var byte_count = chunks.
          filter(function(chunk) {
            return chunk && (typeof(chunk.body) == "string");
          }).
          map(function(chunk) {
            return chunk.body.length;
          }).
          reduce(function(memo, length) {
            return memo + length;
          });

        assert.isTrue(byte_count > 1000);
      },

      'sends the player': function(chunks) {
        assert.deepEqual(chunks[chunks.length-1], {body: {id:1, uniq_id:42}});
      }
    },

    'downstream is done sending/listening': {
      topic: when_upstream_terminates(),

      'terminates the downstream connection': function(chunks) {
        assert.equal(chunks.length, 0);
      }
    },

    'with an invalid player object': {
      topic: when_upstream_replies_with({status:404, body:"foo"}),

      'passes thru the error': function(chunks) {
        assert.equal(chunks[0].status, 404);
      }
    }
  }).export(module);
