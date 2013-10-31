
/*
 * Super-secure authentication right here.
 */

exports.signin = function(req, res, next) {
	var user = { role: req.param('role') || 'non-admin' };
	req.session.user = user;
	res.jsonp(user);
};

exports.signout = function(req, res, next) {
	req.session.user = null;
	res.send(200);
}