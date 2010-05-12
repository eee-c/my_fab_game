var Room = function(canvas, player_list) {
  this.canvas = canvas;
  this.canvas_context = canvas.getContext("2d");

  this.subscribers = [];
  this.init_events();

  this.player_list = player_list;

  this.me = player_list.me;
  this.add_subscriber(this.me);

  this.draw();
};

Room.prototype.get_me = function() { return this.me; };

Room.prototype.add_subscriber = function(obj) {
  this.subscribers.push(obj);
};

Room.prototype.init_events = function() {
  var self = this;
  $(this.canvas).click(function(evt) {
    var decorated_event = self.decorate_event(evt);
    self.subscribers.forEach(
      function(subscriber) { subscriber.notify(decorated_event); }
    );
  });
};

Room.prototype.decorate_event = function(evt) {
  return {
    type: evt.type,
    x: evt.pageX - $(this.canvas).offset().left,
    y: evt.pageY - $(this.canvas).offset().top
  };
};

Room.prototype.draw_player = function(ctx, player, color) {
  ctx.rect(player.x,player.y,5,5);

  ctx.fillStyle = color;
  ctx.fill();

  ctx.stroke();
};

Room.prototype.draw = function() {
  var self = this;
  var ctx = this.canvas_context;
  var me = this.me;

  ctx.beginPath();

  // clear drawing area
  ctx.clearRect(0,0,500,500);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.fillRect(0,0,500,500);

  this.draw_player(ctx, me, '#000000');

  this.player_list.others().forEach(function(player) {
    // console.debug("room drawing: " + player.id);
    self.draw_player(ctx, player, '#aaaaaa');
  });

  ctx.closePath();

  setTimeout(function(){self.draw();}, 25);
};

