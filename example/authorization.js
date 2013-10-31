//
// Browserify this file and include it in a page to get access to the same authorization rules you
// use on the server.
//

var router = require('okay-authorization');

if(typeof window !== 'undefined') {
	// We're in a browser
	window.okay = router.okay;
}
else {
	// We're on the server
	module.exports = function(req, res, next) {
		var data = { user: req.session.user };
		router.okay(req.method, req.url, data, function(err, authorized) {
			if(err || !authorized) {
				return next(err || 'Nope');
			}
		    next();
		});
	}
}

//
// Authorizer functions
//

function allow(req, next) {
	req.allow();
	next();
}

function allowIfAdmin(req, next) {
	if(req.data.user && req.data.user.role === 'admin') req.allow();
	next();
}

function allowIfSignedIn(req, next) {
	if(req.data.user) req.allow();
	next();
}

//
// Router setup - this is where authorization rules are defined
//

router
	.set('authorized by default', false)
	.get('/', allow)
	.get('/api/signin', allow)
	.get('/api/signout', allowIfSignedIn)
	.get('/api/users', allowIfAdmin)
;
