var Route = require('./lib/route'),
    Router = require('./lib/router'),
    utils = require('./lib/utils'),
    router = new Router();

module.exports = router;

function allow() {
  if(typeof this.authorized === 'undefined')
    this.authorized = true;
}

function deny() {
  if(typeof this.authorized === 'undefined')
    this.authorized = false;
}

router.authorizedByDefault = true;
router.set = function(name, value) {
  if(name === 'authorized by default')
    this.authorizedByDefault = !!value;
  else
    throw new Error('unknown option: ' + name);
  return this;
};

router.okay = function(method, url, data, done) {
  if(!done && typeof data === 'function') {
    done = data;
    data = null;
  }
  req = {
    method: method,
    url: url,
    data: data
  }
  this.dispatch(req, done);
};

router.dispatch = function(req, done) {
  var self = this,
      params = this.params;

  if(!done)
    throw new Error('no callback function supplied');

  if(!req.allow)  req.allow = allow;
  if(!req.deny)   req.deny = deny;

  // route dispatch
  (function pass(i, err){
    var paramCallbacks
      , paramIndex = 0
      , paramVal
      , route
      , keys
      , key;

    // match next route
    function nextRoute(err) {
      pass(req._route_index + 1, err);
    }

    // match route
    req.route = route = self.matchRequest(req, i);

    // If we didn't find any routes, we're done.
    if (!route) {
      return done(err, req.authorized || self.authorizedByDefault);
    };

    //
    // for each param in params
    //   if param has value and callbacks
    //     for each callback in param callbacks
    //       try { invoke callback }
    //       catch { bail on params entirely }
    // for each callback in route callbacks
    //   try { invoke callback }
    //   catch { pass error on to next callback}
    //

    // we have a route
    // start at param 0
    req.params = route.params;
    keys = route.keys;
    i = 0;

    // param callbacks
    function param(err) {
      paramIndex = 0;
      key = keys[i++];
      paramVal = key && req.params[key.name];
      paramCallbacks = key && params[key.name];

      try {
        if('route' == err) {
          // The last callback hit "eject" by calling next('route').
          nextRoute();
        }
        else if(err) {
          // We encountered an error. On to the callback chain, making sure it knows something went wrong.
          i = 0;
          callbacks(err);
        }
        else if(paramCallbacks && undefined !== paramVal) {
          // This parameter has callbacks and a value. Enter the parameter callback chain.
          // e.g. router.param('userId', callback1, callback2, callback3);
          paramCallback();
        }
        else if(key) {
          // Either no value or no callbacks for this parameter. Next.
          param();
        }
        else {
          // No more parameters to handle. On to the callback chain.
          i = 0;
          callbacks();
        }
      } catch (err) {
        param(err);
      }
    };

    param(err);

    // single param callbacks
    function paramCallback(err) {
      var fn = paramCallbacks[paramIndex++];
      if (err || !fn) return param(err);
      fn(req, paramCallback, paramVal, key.name);
    }

    // invoke route callbacks
    function callbacks(err) {
      var fn = route.callbacks[i++];
      try {
        if('route' == err) {
          // The last callback hit "eject" by calling next('route').
          nextRoute();
        }
        else if(err && fn) { 
          // We encountered an error, so we're looking for a callback that can take it.
          if (fn.length < 3)            // Does this callback handle errors?
            return callbacks(err);      // Nope. Skip it.
          fn(req, err, callbacks);      // Yep. Invoke it.
        }
        else if(fn) {
          // No errors yet, so we're looking for a non-error-handling callback.
          if (fn.length < 3)            // Does this callback handle errors?
            return fn(req, callbacks);  // Nope. Invoke it.
          callbacks();                  // Yep. Skip it.
        }
        else {
          // Done dealing with this route, due to either error or callback exhaustion.
          nextRoute(err);
        }
      }
      catch (err) {
        // Pass the error on to the next callback in hopes of it being handled.
        callbacks(err);
      }
    }
  })(0);
};
