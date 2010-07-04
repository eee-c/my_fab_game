var vows = require('vows'),
    assert = require('assert');

require.paths.push("lib");
var player_from_querystring = require('player_from_querystring').app;

var suite = vows.describe('just_playing').
  addBatch({
    'with a query string': {
      topic: function() {
        var response;
        function downstream (obj) { response = obj; }

        var upstream_listener = player_from_querystring.call(downstream);
        var head = {
          url: { search : "?player=foo&x=1&y=2" },
          headers: { cookie: null }
        };
        upstream_listener(head);

        return response.body;
      },

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
    }
   }).
   addBatch({
     'POSTing data': {
       topic: function() {
         var response;
         function downstream (obj) { response = obj; }

         var upstream_listener = player_from_querystring.call(downstream);
         upstream_listener({body: "foo"});

         return [response];
       },

       'is null response': function (topic) {
         assert.isUndefined (topic[0]);
       }
     }
  }).export(module);

