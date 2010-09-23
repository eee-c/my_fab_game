var faye    = require('faye'),
    inspect = require( "sys" ).inspect,
    Logger  = require("./logger");

Logger.level = 1;

var db;

// Player local store
var players = {
  all: function(callback) {
    return db.allDocs({include_docs:true}, function(err, docs) {
      callback(docs.rows.map(function(row) {return row.doc;}));
    });
  },

  get: function(id, callback) {
    Logger.debug("[players.get] trying to get: " + id);
    db.getDoc(id, function(err, res) {
      if (err) {
        Logger.warn(JSON.stringify(err));
      }
      callback(res);
    });
  },

  add_player: function(player) {
    var self = this;
    var new_id = player.id;
    Logger.info("players.add_player: " + new_id);
    this.get(new_id, function(old_player) {
      if (!old_player) {
        db.saveDoc(new_id, {token: player.authToken});

        delete(player['authToken']);
        self.update_player_status(player);
      }
    });
  },

  update_player_status: function(status) {
    var self = this;
    this.get(status.id, function(player) {
      Logger.debug("[players.update_player_status] " + inspect(player));
      if (player) {
        Logger.info("players.update_player_status: " + status.id);
        player.status = status;
        player.timeout = self.idle_watch(status.id);
        db.saveDoc(player);
      }
      else {
        Logger.warn("[players.update_player_status] unknown player: " + status.id + "!");
      }
    });
  },

  timeout: 30*60*1000,
  timeouts: { },

  idle_watch: function(id, timeout) {
    if (this.timeouts[id])
      clearTimeout(this.timeouts[id]);

    if (!timeout) timeout = this.timeout;

    var self = this;
    this.timeouts[id] = setTimeout(function() {
      Logger.info("timeout " + id +"!");
      self.drop_player(id);
    }, timeout);

    return (new Date((new Date()).getTime() + timeout)).getTime();
  },

  drop_player: function(id) {
    Logger.info("players.drop_player " + id);
    this.faye.publish("/players/drop", id);

    this.get(id, function(player) {
      Logger.debug("[players.drop_player] " + inspect(player));
      if (player) db.removeDoc(id, player._rev);
    });
  },

  init_subscriptions: function() {
        require('sys').puts("here")


    var faye = require("faye");
    this.faye = new faye.Client('http://localhost:4011/faye');

    var self = this;
    this.faye.subscribe("/players/move", function(message) {
      Logger.debug("[/players/move] " + inspect(message));
      self.update_player_status(message);
    });

    this.faye.subscribe("/players/create", function(player) {
      Logger.debug("[/players/create] " + inspect(player));
      self.add_player(player);
    });

    this.faye.subscribe("/players/query", function(q) {
      self.all(function(players) {
        self.faye.publish("/players/all", players.map(function(player) {return player.status;}) );
      });
    });
        require('sys').puts("here")
  },

  init_players: function() {
    var self = this;

    var now = (new Date()).getTime();
    self.all(function(players) {
      players.forEach(function(player){
        var timeout = player.timeout - now;
        if (timeout > 0) {
          Logger.info("[init_timeouts] " + player._id + " " + timeout);
          self.idle_watch(player._id, timeout);
        }
        else {
          Logger.info("[init_timeouts] dropping: " + player._id);
          self.drop_player(player._id);
        }
      });
    });

    require('sys').puts("here@")

  },

  init: function(_db) {
    require('sys').puts("here")

    var self = this;
    db = _db;

    // Ensure that the faye server has fully established by waiting
    // half a second before subscribing to channels
    setTimeout(function(){
      self.init_subscriptions();
      self.init_players();
    }, 500);

    return self;
  }
};

module.exports = players;
