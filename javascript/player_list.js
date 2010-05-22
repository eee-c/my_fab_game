var PlayerList = function(me, room, options) {
  this.me = me;
  this.room = room;

  room.add_subscriber(me);

  var el = room.draw_player(me, '#000000');
  me.attach_drawable(el);

  this.other_players = {};

  if (!options) options = {};
  this.onComplete = options.onComplete || function() {};
};

PlayerList.prototype.walk_player = function(attrs) {
  this.add_player(attrs);
  var player = this.get_player(attrs.id);
  if (player) {
    player.stop();
    player.walk_to(attrs.x, attrs.y);

  }
};

PlayerList.prototype.player_say = function(attrs) {
  alert(attrs.id + " says " + attrs.say);
};

PlayerList.prototype.add_player = function(obj) {
  if (!this.other_players[obj.id] && obj.id != this.me.id) {
    var player = new Player(obj.id, obj);
    this.other_players[obj.id] = player;
    var el = this.room.draw_player(player, '#999999');
    player.attach_drawable(el);
  }
};

PlayerList.prototype.remove_player = function(id) {
  if (this.me.id == id) {
    // I am leaving and so is everyone else (as far as I'm concerned)
    this.me.quit();
    for (var oid in this.other_players) {
      this.other_players[oid].quit();
    }
    this.onComplete();
  }
  else {
    this.get_player(id).quit();
    delete this.other_players[id];
  }
};

PlayerList.prototype.get_player = function(id) {
  return this.other_players[id];
};

PlayerList.prototype.others = function() {
  var ret = [];
  for (var id in this.other_players) {
    ret.push(this.other_players[id]);
  }
  return ret;
};
