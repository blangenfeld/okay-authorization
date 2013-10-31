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

* `req` : an object containing details about the authorization request, including data passed during authorization (see below) and any parameters parsed
* `next` : a method for passing control to the next authorizer in the list

```
function allowAdmin(req, next) {
    if(req.data.user.role === 'admin') req.allow();
    next();
}
```

### Authorize requests

With the router configured, you're ready to authorize actions by calling its `okay` method. Pass it the action's verb and URL, along with a callback function to be executed when the router is done executing the route's authorizer functions.

```
router.okay('get', '/users', { user: someObject }, doneAuthorizing);
```

If your authorizer functions require context, you can supply it as the optional third argument (as above). Attributes and methods defined in this object are made available to authorizer functions as `req.data`.

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
// authorization.js

var router = require('okay-authorization');

// Configure the router here...

// Export whatever's needed by the server (middleware, in this case)
module.exports = function(req, res, next) {
    var data = { ... };
    router.okay(req.method, req.url, data, function(err, authorized) {
		if(err || !authorized)
        	next(err || 'Not authorized'); // Defer to error middleware
        next();
    });
};
```

The point in your middleware stack where the **okay** router middleware is invoked depends on your application's needs.

If your authorizer functions depend on the presence of certain attributes (e.g. `req.user`, `req.model`), you may need to invoke the middleware inline for each route to be protected by authorization.

```
// server.js

var okay = require('./authorization'),
    usersController = require('../controllers/users');

app.get('/users', okay, usersController.index);
```

On the other hand, if your rules have no such dependencies, you're welcome to `use` the middleware wherever it makes the most sense.

```
// server.js

var express = require('express'),
	okay = require('./authorization'),
	app = express();

// App configuration here...

app.use(okay); // Somewhere in your middleware stack
```

### Client

For the browser to get hold of the router, you'll need to add a couple of lines to the file defining the **okay** router.

```
// authorization.js

var router = require('okay-authorization');

// Configure the okay router here, then...

if(typeof window !== 'undefined')
	window.okay = router.okay;	// Make available to the browser
```

Browserify it, then link the browserified file in your pages. When the browser loads the script, you'll have access to **okay** router's `okay` method through `window.okay`.

```
$ browserify authorization.js > public/javascripts/authorization.js --ignore './connect/lib-cov'
```

Because the call to `okay` typically requires a few parameters, a client-appropriate wrapper can help keep your code simple and clean. For example, if you're using [AngularJS](http://angularjs.org) on the client side, you can register an "authorization" service, then inject that into your controllers.

```
// client.js

window.app = angular.module('MyApp', [])
	.service('Authorization', ['$window', function($window) {
		return {
			okay: function(verb, url) {
				var can, data = { user: $window.user };
				$window.okay(verb, url, data, function(err, authorized) {
					can = !err && authorized;
				});
				return can;
			}
		};
	}])
	
	.controller('Controller', ['$scope', 'Authorization', function($http, $scope, $window, Authorization) {
		$scope.okay = Authorization.okay;
		...
	}]);
```

Once this is done, you can use `okay` in your templates' AngularJS expressions, e.g. `data-ng-if="okay('get','/some/route')"`.


# Options

Call an **okay** router's `set(option, value)` method to override default behavior.

Options currently available:

* **'authorized by default'** _(default: `false`)_

  Specifies whether the router will assume any actions against routes it doesn't know about should be authorized.

# To do items

**Okay** is currently built on top of [express](http://expressjs.com)'s routing code. At some point, it would might be good to remove this dependency by either writing a stripped-down version or pulling it in.

# Thank you
The idea was inspired by [cando](http://github.com/jackruss/cando), and the implementation is based on (shamelessly ripped from, actually) [express](http://expressjs.com)'s routing middleware.