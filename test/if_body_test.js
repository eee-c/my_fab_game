var vows = require('vows'),
  assert = require('assert'),
    puts = require('sys').puts;

require.paths.push("lib");
var if_body = require('if_body').app;

function args_to_callback(obj) {
  return function () {
    var topic = this;
    var upstream_listener = if_body(
      function(obj) { topic.callback(null, obj); }
    ).call(function() {});

    upstream_listener(obj);
  };
};

function downstream_response(obj, fn) {
  if (!fn) fn = function() {};
  return function () {
    var topic = this;
    var upstream_listener = if_body(fn).
      call(function(obj) { topic.callback(null, obj); });

    upstream_listener(obj);
  };
};

var suite = vows.describe('if_body').
  addBatch({
    'callback, with a body': {
      topic: args_to_callback({body: "foo"}),
      'invokes callback with body': function(obj) {
        assert.equal(obj, "foo");
      }
    },
    'downstream, with a body': {
      topic: downstream_response({body: "foo"}),
      'terminates connection': function(obj) {
        assert.isUndefined(obj);
      }
    },
    'downstream, with HTTP headers': {
      topic: downstream_response({headers: "foo"}),
      'terminates connection': function(obj) {
        assert.isUndefined(obj);
      }
    },
    'downstream, with empty request': {
      topic: downstream_response(),
      'terminates connection': function(obj) {
        assert.isUndefined(obj);
      }
    },
    'downstream, with exception': {
      topic: downstream_response({body: "foo"}, function(){throw "foo";}),
      'terminates connection': function(obj) {
        assert.isUndefined(obj);
      }
    }
  }).export(module);
