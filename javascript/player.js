var Player = function(id, options) {
  if (!id) throw new Error("No player ID");
  this.id = id;

  if (!options) options = {};
  this.x = options.x || 250;
  this.y = options.y || 250;

  this.animate_with = options.animate_with || function (avatar) { };
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
  this.avatar.stop();

  this.x = this.avatar.attrs.cx;
  this.y = this.avatar.attrs.cy;
};

Player.prototype.walk_to = function(x, y) {
  var p = "M"+ this.x + " " + this.y +
          "L" +     x + " " +      y;
  this.avatar.animateAlong(p, 3000);

  this.x = x;
  this.y = y;
};

Player.prototype.say = function(message) {
  var self = this;

  if (this.balloon) this.balloon.remove();

  this.balloon = this.avatar.paper
    .text(this.x, this.y - 30, message)
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
    .text(this.x, this.y + 20, this.id)
    .attr({"font-size": 12});

  var animation_count = 0;
  avatar.onAnimation(function(){
    self.label.attr({x: avatar.attr("cx"), y: avatar.attr("cy") + 20});

    if (++animation_count > 25) {
      self.animate_with(this);
      animation_count = 0;
    }

    if (self.balloon) {
      self.balloon.attr({x: avatar.attr("cx"), y: avatar.attr("cy") - 20});
    }
  });
};

Player.prototype.notify_server = function(action, change) {
  $.post("/" + action, JSON.stringify(change));
};
