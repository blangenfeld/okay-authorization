
/*
 * GET users listing.
 */

exports.list = function(req, res, next){
	res.jsonp([
		{ name: 'Bob', role: 'non-admin' },
		{ name: 'Alice', role: 'non-admin' },
		{ name: 'You', role: 'admin' }
	]);
};
