Raphael.fn.svg_frames = function() {
  var paper = this;

  var frames = {
    list: [],
    interval: 333,
    paper: paper,

    add: function() {
      for (var i=0; i<arguments.length; i++) {
        this.list.push(this.draw_object(arguments[i]));
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


    translate: function(x, y, seconds) {
      for (var i=0; i<this.list.length; i++) {
        this.translate_object(this.list[i], x, y, seconds);
      }
      this.toggle_frames(seconds);
    },

    toggle_frames: function(seconds, count) {
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


      if (count < Math.floor(seconds / self.interval)) {
        var fn = function(){self.toggle_frames(seconds, count+1);};
        setTimeout(fn, self.interval);
      }
    },

    translate_object: function(frame, x, y, seconds) {
      // offset between end coordinates and current location
      var x_diff = x - frame[0].getBBox().x;
      var y_diff = y - frame[0].getBBox().y;

      for (var i=0; i<frame.length; i++) {
        var obj = frame[i];
        // calculate path starting from absolute coordinates and moving
        // relatively from there by the offset
        var p = "M " + obj.getBBox().x + " " + obj.getBBox().y +
               " l " + x_diff          + " " + y_diff;

         // animate along that path
         obj.animateAlong(p, seconds);
      };
    },

    getBBox: function() {
      return this.list[0][this.list[0].length-1].getBBox();
    },

    attr: function() {
      // delegate to last object in first frame
      var obj = this.list[0][this.list[0].length-1];
      return obj.attr.apply(obj, arguments);
    },

    onAnimation: function(fn) {
      this.list[0][0].onAnimation(fn);
    }

  };

  // TODO: accept an array argurment
  frames.add.apply(frames, arguments);
  frames.show_frame(frames.list[0]);

  return frames;
};
