(function(XHR) {
    "use strict";

    var open = XHR.prototype.open;
    var send = XHR.prototype.send;

    XHR.prototype.open = function(method, url, async, user, pass) {
      this._url = url;
      open.call(this, method, url, async, user, pass);
    };

    XHR.prototype.send = function(data) {
      var self = this;
      var oldOnReadyStateChange;
      var url = this._url;

      function onReadyStateChange() {
          if(self.readyState == 4 /* complete */) {
              Remix.$(document).trigger('ajaxReceived', self);
          }

          if(oldOnReadyStateChange) {
              oldOnReadyStateChange();
          }
      }

      /* Set xhr.noIntercept to true to disable the interceptor for a particular call */
      if(!this.noIntercept) {            
          if(this.addEventListener) {
              this.addEventListener("readystatechange", onReadyStateChange, false);
          } else {
              oldOnReadyStateChange = this.onreadystatechange; 
              this.onreadystatechange = onReadyStateChange;
          }
      }

      send.call(this, data);
    }
})(XMLHttpRequest);
