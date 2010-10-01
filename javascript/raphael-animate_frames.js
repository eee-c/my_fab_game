Raphael.fn.svg_frames = function() {
  var paper = this;

  var frames = {
    list: [],
    interval: 333,
    paper: paper,

    add: function(frame_list) {
      for (var i=0; i<frame_list.length; i++) {
        this.list.push(this.draw_object(frame_list[i]));
      }
      this.node = this.list[0][this.list[0].length-1].node;
    },

    remove: function() {
      for (var i=0; i<frames.length; i++) {
        for (var j=0; j<frames[i].length; j++) {
          frame[j].remove();
        };
      }
    },

    draw_object: function(attr_list) {
      var objects = [];
      for (var i=0; i<attr_list.length; i++) {
        objects.push(this.draw_part(attr_list[i]));
      };
      return objects;
    },

    draw_part: function(attrs) {
      return paper
        .path(attrs.d)
        .attr(this.attrs_from_string(attrs.style))
        .hide();
    },

    attrs_from_string: function(str) {
      var attrs = {};
      str.split(/;/).
        forEach(function(pair) {
          var kv = pair.split(/:/);
          attrs[kv[0]] = kv[1];
        });
      return attrs;
    },

    show_frame: function(frame) {
      for (var i=0; i<frame.length; i++) {
        frame[i].show();
      };
    },

    hide_frame: function(frame) {
      for (var i=0; i<frame.length; i++) {
        frame[i].hide();
      };
    },

    hide_all_frames: function() {
      var frames = this.list;
      for (var i=0; i<frames.length; i++) {
        this.hide_frame(frames[i]);
      }
    },

    stop: function() {
      var frames = this.list;
      for (var i=0; i<frames.length; i++) {
        for (var j=0; j<frames[i].length; j++) {
          frames[i][j].stop();
        }
      }
    },

    animate: function(new_attrs, ms, easing) {
      if (new_attrs.cx || new_attrs.cy) {
        var x = new_attrs.cx || this.getCenter().x
           ,y = new_attrs.cy || this.getCenter().y;
        if (easing) {
          var c = this.paper.circle(this.getCenter().x,
                                    this.getCenter().y,
                                    20);
          if (this.toggler) clearTimeout(this.toggler);
          this.hide_all_frames();
          var self = this;
          c.animate({cx: x, cy: y}, ms, easing, function () {
            c.remove();
            self.translate(x, y);
            self.show_frame(self.list[0]);
          });
        }
        else {
          this.translate(x, y, ms);
        }
      }
    },

    translate: function(x, y, ms) {
      for (var i=0; i<this.list.length; i++) {
        this.translate_object(this.list[i], x, y, ms);
      }
      if (ms && ms > 50) this.toggle_frames(ms);
      return this;
    },

    toggle_frames: function(ms, count) {
      var self = this;
      if (!count) count=1;

      var frames = this.list;
      var current_frame = count % frames.length;

      for (var i=0; i<frames.length; i++) {
        if (i == current_frame) {
          this.show_frame(frames[i]);
        }
        else {
          this.hide_frame(frames[i]);
        }
      }

      if (count < Math.floor(ms / self.interval)) {
        var fn = function(){self.toggle_frames(ms, count+1);};
        this.toggler = setTimeout(fn, self.interval);
      }
    },

    translate_object: function(frame, x, y, ms) {
      // offset between end coordinates and current location
      var x_diff = x - frame[frame.length-1].getBBox().x;
      var y_diff = y - frame[frame.length-1].getBBox().y;

      for (var i=0; i<frame.length; i++) {
        var obj = frame[i];
        // calculate path starting from absolute coordinates and moving
        // relatively from there by the offset
        var p = "M " + obj.getBBox().x + " " + obj.getBBox().y +
               " l " + x_diff          + " " + y_diff;

         // animate along that path
        if (ms && ms > 50)
          obj.animateAlong(p, ms);
        else
          obj.translate(x_diff, y_diff);
      };
    },

    getBBox: function() {
      return this.list[0][this.list[0].length-1].getBBox();
    },

    getCenter: function() {
      var bounding_box = this.getBBox();
      return {
        x: Math.floor(bounding_box.width/2) + bounding_box.x,
        y: Math.floor(bounding_box.height/2) + bounding_box.y
      };
    },

    attr: function() {
      // delegate to last object in first frame
      var obj = this.list[0][this.list[0].length-1];
      console.debug(arguments);
      return obj.attr.apply(obj, arguments);
    },

    onAnimation: function(fn) {
      this.list[0][this.list[0].length-1].onAnimation(fn);
    }

  };

  if (arguments.length > 1)
    frames.add(arguments);
  else
    frames.add(arguments[0]);

  frames.show_frame(frames.list[0]);

  return frames;
};
