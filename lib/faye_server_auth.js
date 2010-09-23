var inspect = require( "sys" ).inspect,
    Logger  = require("./logger");

// Server-side extension to lock player messages to client that added
// the player in the first place,
// http://japhr.blogspot.com/2010/08/per-message-authorization-in-faye.html
var serverAuth = {
  // This *may* be done better via direct access to the players module
  init: function(player_get) {
    this.player_get = player_get;
    return this;
  },

  incoming: function(message, callback) {
    // Let non-meta messages through
    if (message.channel.indexOf('/meta/') === 0)
      return callback(message);

    Logger.debug("[Faye.incoming] " + message.channel);

    // Get subscribed channel and auth token
    var subscription = message.subscription,
        msgToken     = message.ext && message.ext.authToken;

    // Message does not have a player ID
    if (!message.data.id)
      return callback(message);

    // Message has a player ID
    Logger.debug("[Faye.incoming]  checking for player: " + message.data.id);

    this.player_get(message.data.id, function(player) {
      Logger.debug("[Faye.incoming]  " + inspect(player));

      // If the player is already in the room
      if (player) {
        Logger.debug("[Faye.incoming]  token check: " + player.token + " " + msgToken);

        // If the tokens do not match, stop the message
        if (player.token != msgToken) {
          Logger.warn("rejecting mis-matched token message");
          message.error = 'Invalid player auth token';
        }
      }
      else {
        Logger.debug("[Faye.incoming]  " + message.data.id + " adding message token: " + msgToken);
        message.data.authToken = msgToken;
      }

      callback(message);
    });
  }
};

module.exports = serverAuth;
