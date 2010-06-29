function init_comet (app) {
  return function () {
    var out = this;

    return app.call( function listener(obj) {
      if (obj && obj.body) {
        out({ headers: { "Content-type": "text/html",
                         "Set-Cookie": "MYFABID=" + obj.body.uniq_id } })

         ({body: "<html><body>\n" })

         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})

         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         ({body: "<script type=\"text/javascript\">\"123456789 123456789 123456789 123456789 123456789 12345\";</script>\n"})
         (obj);
      }
      return listener;
    });
  };
}

exports.tests = ( function() {
  var upstream = function() { this({body:{id:42}}); },
      unary = init_comet (upstream);

  return [
    function
    bodyRespondsWithStartHtml() {
      var out = this;

      unary.call(function (obj) {
        out(obj.body === "<html><body>\n");
        return function listener() {return listener;};
      });
    },

    function
    bodyPadsCometSoChromeWontIgnoreMe() {
      var out = this;
      unary.call(function(obj) {
        return function first_listener(obj) {
          out(/123456789/.test(obj.body));
          return function listener() {return listener;};
        };
      });
    }
  ];
})();

exports.app = init_comet;
