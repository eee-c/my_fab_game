var vows = require('vows'),
  assert = require('assert'),
    puts = require('sys').puts;

require.paths.push("lib");
var unary_try = require('unary_try').app;

var api = {
  fab: {
    callback_when_send_obj: function(obj) {
      return function () {
        var topic = this;
        var upstream_listener = unary_try(
          function(obj) { topic.callback(null, obj); }
        ).call(function() {});

        upstream_listener(obj);
      };
    },
    downstream_when_exception: function() {
      return function () {
        var topic = this;
        var upstream_listener = unary_try(
          function() { throw "Foo!"; }
        ).call(
          function(obj) { topic.callback(null, obj); }
        );

        upstream_listener({body:"foo"});
      };
    },
    downstream_when_send_obj: function(obj) {
      return function () {
        var topic = this;
        var upstream_listener = unary_try(
          function() {}
        ).call(
          function(obj) { topic.callback(null, obj); }
        );

        upstream_listener(obj);
      };
    }
  }
};

var suite = vows.describe('unary_try').
  addBatch({
    'callback, with a body': {
      topic: api.fab.callback_when_send_obj({body: "foo"}),
      'invokes callback with body': function(obj) {
        assert.equal(obj, "foo");
      }
    },
    'downstream, with a body': {
      topic: api.fab.downstream_when_send_obj({body: "foo"}),
      'terminates connection': function(obj) {
        assert.isUndefined(obj);
      }
    },
    'downstream, with HTTP headers': {
      topic: api.fab.downstream_when_send_obj({headers: "foo"}),
      'terminates connection': function(obj) {
        assert.isUndefined(obj);
      }
    },
    'downstream, with empty request': {
      topic: api.fab.downstream_when_send_obj(),
      'terminates connection': function(obj) {
        assert.isUndefined(obj);
      }
    },
    'downstream, with exception': {
      topic: api.fab.downstream_when_exception(),
      'terminates connection': function(obj) {
        assert.isUndefined(obj);
      }
    }
  }).export(module);
