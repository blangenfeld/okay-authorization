# Okay

**Okay** is a node package for performing authorization checks. Because it can be browserfied, a single **okay** setup can be used on both client and server.

## Overview

Any authorizable action's "signature" can be expressed as a route combining a **method** and a **url**. Define any number of routes, then hand actions off to **okay** to figure out whether the action is authorized.

If you've used [express](http://expressjs.com), you'll be right at home.

### Get hold of a router

```
var router = require('okay');
```

### Define some routes

Routes are defined with a verb, URL, and any number of authorizer functions. As with [express](http://expressjs.com)'s router, the URL may contain wildcards and parameters (marked by colons), or may even be a regular expression.

```
router.get('/users', allowAdmin);
```

Authorizer functions receive two arguments:

* `req` : an object containing details about the authorization request
* `next` : a method for passing control to the next authorizer in the list

```
function allowAdmin(req, next) {
    if(req.user.role === 'admin') req.allow();
    next();
}
```

### Authorize requests

With the router configured, you're ready to authorize actions by calling its `okay` method. Pass it the action's verb and URL, along with a callback function to be executed when the router is done executing the route's authorizer functions.

```
router.okay('get', '/users', { user: someObject }, doneAuthorizing);
```

The callback function for the `okay` method receives two arguments:

* `err` : if an error was thrown somewhere along the line, it'll be here
* `authorized` : true or false (and self-explanatory)

```
function doneAuthorizing(err, authorized) {
    if(err) { ... }
    else if(authorized) { ... }
}
```

## Integration

Define your **okay** router in one place, then integrate it with your application wherever you'd like.

### Server

Integrating **okay** with (e.g.) [express](http://expressjs.com) starts with defining a connect middleware wrapping the router.

```
var router = require('../okay');

module.exports = function(req, res, next) {
    var data = { ... };
    router.okay(req.method, req.url, data, function(err, authorized) {
        if(err) { return res.send(500, err); }
        if(!authorized) { return res.send(403, { status: "Not Authorized" }); }
        next();
    });
};
```

The point in your middleware stack where the **okay** router middleware is invoked depends on your application's needs.

If your authorizer functions depend on the presence of certain attributes (e.g. `req.user`, `req.model`), you may need to invoke the middleware inline for each route to be protected by authorization.

```
var okay = require('../middleware/okay')),
    usersController = require('../controllers/users');

app.get('/users', okay, usersController.index);
```

On the other hand, if your rules have no such dependencies, you're welcome to `use` the middleware wherever it makes the most sense.

```
var okay = require('../middleware/okay'));

app.use(okay);
```

### Client

Coming soon.


# Thank you
The idea was inspired by [cando](http://github.com/jackruss/cando), and the implementation is based on (shamelessly ripped from, actually) [express](http://expressjs.com)'s routing middleware.