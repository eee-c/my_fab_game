var Player = function(id, options) {
  if (!id) throw new Error("No player ID");
  this.id = id;

  if (!options) options = {};
  this.x = options.x || 250;
  this.y = options.y || 250;
};

Player.prototype.notify = function(evt) {
  switch(evt.type) {
    case "click":
      this.stop();
      this.walk_to(evt.x, evt.y);
      this.notify_server('move', {id:this.id, x:evt.x, y:evt.y});
      break;
    case "message":
      this.stop();
      this.walk_to(this.x, this.y);
      this.notify_server('move', {id:this.id, x:evt.x, y:evt.y});
      this.notify_server('chat', {id:this.id, say:evt.value});
      break;
    default:
      console.debug("[notify] type: " + evt.type + " value: " + evt.value);
  }
};

Player.prototype.stop = function () {
  this.drawable.stop();

  this.x = this.drawable.attrs.cx;
  this.y = this.drawable.attrs.cy;
};

Player.prototype.walk_to = function(x, y) {
  var p = "M"+ this.x + " " + this.y +
          "L" +     x + " " +      y;
  this.drawable.animateAlong(p, 3000);

  this.x = x;
  this.y = y;
};

Player.prototype.say = function(message) {
  var self = this;

  if (this.balloon) this.balloon.remove();

  this.balloon = this.drawable.paper.text(this.x, this.y - 10, message);
  setTimeout(function(){self.balloon.remove();}, 10*1000);
};

Player.prototype.quit = function() {
  this.drawable.remove();
  this.label.remove();
  delete this.x;
  delete this.y;
  delete this.id;
};

Player.prototype.attach_drawable = function(drawable) {
  var self = this;
  this.drawable = drawable;
  this.label = drawable.paper.text(this.x, this.y + 10, this.id);

  drawable.onAnimation(function(){
    self.label.attr({x: drawable.attr("cx"), y: drawable.attr("cy") + 10});

    if (self.balloon) {
      self.balloon.attr({x: drawable.attr("cx"), y: drawable.attr("cy") - 10});
    }
  });
};

Player.prototype.notify_server = function(action, change) {
  $.post("/" + action, JSON.stringify(change));
};
