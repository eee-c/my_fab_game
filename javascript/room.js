var Room = function(canvas, options) {
  this.canvas = canvas;
  this.canvas_context = canvas.getContext("2d");

  this.subscribers = [];
  this.init_events();

  this.me = new Player('me');
  if (!options) options = {view_only: false};
  if (!options.view_only) {
    this.add_subscriber(this.me);
  }

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

Room.prototype.draw = function() {
  var ctx = this.canvas_context;
  var me = this.me;

  ctx.beginPath();

  // clear drawing area
  ctx.clearRect(0,0,500,500);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.fillRect(0,0,500,500);

  // draw me and fill me in
  ctx.rect(me.x,me.y,5,5);

  ctx.fillStyle = '#000000';
  ctx.fill();

  ctx.stroke();

  ctx.closePath();

  var self = this;
  setTimeout(function(){self.draw();}, 25);
};
