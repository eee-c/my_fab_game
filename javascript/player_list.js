var PlayerList = function(me, room, options) {
  this.me = me;
  this.room = room;

  this.players = {};
  this.add_player(me, '#000000');

  room.add_subscriber(me);

  if (!options) options = {};
  this.onComplete = options.onComplete || function() {};
};

PlayerList.prototype.walk_player = function(attrs) {
  var player = this.get_player(attrs.id);
  if (player) {
    player.stop();
    player.walk_to(attrs.x, attrs.y);
    console.debug("[player_list.walk_player] id: " + player.id + ", x : " + player.avatar.attrs.cx + ", y: " + player.avatar.attrs.cy);
  }
  console.debug("[player_list.walk_player] me: " + this.me.id + ", x : " + this.me.avatar.attrs.cx + ", y: " + this.me.avatar.attrs.cy);
};

PlayerList.prototype.player_say = function(attrs) {
  //console.debug(attrs);
  this.get_player(attrs.id).say(attrs.say);
};

PlayerList.prototype.new_player = function(obj) {
  if (!this.players[obj.id]) {
    this.add_player(new Player(obj.id, obj));
  }
};

PlayerList.prototype.add_player = function(player, color) {
  this.players[player.id] = player;
  if (!color) color = '#999999';
  var el = this.room.draw_player(player, color);
  player.attach_avatar(el);
};

PlayerList.prototype.remove_player = function(id) {
  if (this.me.id == id) {
    // I am leaving and so is everyone else (as far as I'm concerned)
    for (var pid in this.players) {
      this.players[pid].quit();
    }
    this.onComplete();
  }
  else {
    this.get_player(id).quit();
    delete this.players[id];
  }
};

PlayerList.prototype.get_player = function(id) {
  return this.players[id];
};
