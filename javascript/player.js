var Player = function(id, options) {
  if (!id) throw new Error("No player ID");
  this.id = id;

  if (!options) options = {};
  this.x = options.x || 250;
  this.y = options.y || 250;

  this.direction = { x: 1, y: 0 };

  this.animate_with = options.animate_with || function (avatar) { };
  this.initial_walk = true;

  this.faye = new Faye.Client('/faye');
};

Player.radius = 10;
Player.shadow_distance = 20;
Player.max_walk = Math.sqrt(500*500 + 500*500);
Player.time_to_max_walk = 5 * 1000;

Player.prototype.notify = function(evt) {
  switch(evt.type) {
    case "click":
      this.faye.publish("/move", {id:this.id, x:evt.x, y:evt.y});
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

Player.prototype.bounce_away = function() {
  var x = this.x - 2*Player.radius*this.direction.x,
      y = this.y - 2*Player.radius*this.direction.y;

  this.notify_server('bounce', {id: this.id, x: x, y: y});
  this.bounce_to(x, y);
};

Player.prototype.bounce_to = function(x, y) {
  this.mid_bounce = true;

  var self = this;
  this.avatar.animate({cx: x, cy: y}, 500, "bounce",
                      function(){self.mid_bounce = false;});
  setTimeout(function(){ self.mid_bounce = false; }, 1000);

  this.x = x;
  this.y = y;
};


Player.prototype.walk_to = function(x, y) {
  this.stop();

  var p = "M" + Math.floor(this.x) + " " + Math.floor(this.y) +
         " L" +                 x  + " " +                 y;

  var x_diff = x - this.x;
  var y_diff = y - this.y;
  var distance = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
  this.direction = {x: x_diff/distance, y: y_diff/distance};

  var time = Player.time_to_max_walk * ( distance / Player.max_walk );

  var self = this;
  this.avatar.animateAlong(p, time, function(){
    self.initial_walk = false;
  });

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

    if (++animation_count > 25) {
      self.animate_with(this);
      animation_count = 0;
    }

    if (self.balloon) {
      self.balloon.attr({x: avatar.attr("cx"), y: avatar.attr("cy") - Player.shadow_distance});
    }

    var c_x = avatar.attr("cx") +
              $(self.avatar.paper.canvas).parent().offset().left -
              $(document).scrollLeft();

    var c_y = avatar.attr("cy") +
              $(self.avatar.paper.canvas).parent().offset().top -
              $(document).scrollTop();

    var c_el = document.elementFromPoint(c_x, c_y);

    if (!self.initial_walk &&
        !self.mid_bounce &&
        c_el != self.avatar.node &&
        c_el != self.avatar.paper.bottom.node) {
      // console.debug("Colliding element:");
      // console.debug(c_el);
      // console.debug("Me:");
      // console.debug(self.avatar);
      self.stop();
      self.bounce_away();
    }
  });
};

Player.prototype.notify_server = function(action, change) {
  $.post("/" + action, JSON.stringify(change));
};
