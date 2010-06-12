var Player = function(id, options) {
  if (!id) throw new Error("No player ID");
  this.id = id;

  if (!options) options = {};
  this.x = options.x || 250;
  this.y = options.y || 250;

  this.animate_with = options.animate_with || function (avatar) { };
};

Player.radius = 10;
Player.shadow_distance = 20;
Player.max_walk = Math.sqrt(500*500 + 500*500);
Player.time_to_max_walk = 5 * 1000;

Player.prototype.notify = function(evt) {
  switch(evt.type) {
    case "click":
      this.stop();
      this.walk_to(evt.x, evt.y);
      this.notify_server('move', {id:this.id, x:evt.x, y:evt.y});
      break;
    case "message":
      this.notify_server('chat', {id:this.id, say:evt.value});
      break;
    default:
      console.debug("[notify] type: " + evt.type + " value: " + evt.value);
  }
};

Player.prototype.stop = function () {
  this.avatar.stop();

  this.x = this.avatar.attrs.cx;
  this.y = this.avatar.attrs.cy;
};

Player.prototype.walk_to = function(x, y) {
  var p = "M"+ Math.floor(this.x) + " " + Math.floor(this.y) +
          " L" +     x + " " +      y;

  var x_diff = x - this.x;
  var y_diff = y - this.y;
  var distance = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
  var time = Player.time_to_max_walk * ( distance / Player.max_walk );
  this.avatar.animateAlong(p, time);

  this.x = x;
  this.y = y;
};

Player.prototype.say = function(message) {
  var self = this;

  if (this.balloon) this.balloon.remove();

  this.balloon = this.avatar.paper
    .text(this.x, this.y - Player.shadow_distance, message)
    .attr({"font-size": 12});
  setTimeout(function(){self.balloon.remove();}, 10*1000);
};

Player.prototype.quit = function() {
  this.avatar.remove();
  this.label.remove();
  delete this.x;
  delete this.y;
  delete this.id;
};

Player.prototype.attach_avatar = function(avatar) {
  var self = this;
  this.avatar = avatar;
  this.label = avatar.paper
    .text(this.x, this.y + Player.shadow_distance, this.id)
    .attr({"font-size": 12});

  var animation_count = 0;
  avatar.onAnimation(function(){
    self.label.attr({x: avatar.attr("cx"), y: avatar.attr("cy") + Player.shadow_distance});

    // if (++animation_count > 25) {
      self.animate_with(this);
    //   animation_count = 0;
    // }

    if (self.balloon) {
      self.balloon.attr({x: avatar.attr("cx"), y: avatar.attr("cy") - Player.shadow_distance});
    }
  });
};

Player.prototype.notify_server = function(action, change) {
  $.post("/" + action, JSON.stringify(change));
};
