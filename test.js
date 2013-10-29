var expect = require('expect.js'),
	okay = require('./index');

describe('okay', function() {
	before(function() {
		okay
			.get('/admin',
				function(req, next) { if(req.user.role === 'admin') req.allow(); next(); })
			.get('/user/:userId',
				function(req, next) { if(req.user.id === req.params.userId) req.allow(); next(); },
				function(req, next) { if(req.user.role === 'admin') req.allow(); next(); })
		;
	});

	it('should allow GET /admin for user with admin role', function(done) {
		var data = { user: { role: 'admin'} };
		okay.okay('get', '/admin', data, function(err, authorized) {
			expect(err).to.be(undefined);
			try { expect(authorized).to.be(true); } catch(e) {}
			done();
		});
	});

	it('should deny GET /admin for user without admin role', function(done) {
		var data = { user: { role: 'user'} };
		okay.okay('get', '/admin', data, function(err, authorized) {
			expect(err).to.be(undefined);
			try { expect(authorized).to.be(false); } catch(e) {}
			done();
		});
	});

	it('should allow GET /user/123 for user 123', function(done) {
		var data = { user: { id: 123 } };
		okay.okay('get', '/user/123', data, function(err, authorized) {
			expect(err).to.be(undefined);
			try { expect(authorized).to.be(true); } catch(e) {}
			done();
		});
	});

	it('should deny GET /user/123 for user 456', function(done) {
		var data = { user: { id: 456 } };
		okay.okay('get', '/user/123', data, function(err, authorized) {
			expect(err).to.be(undefined);
			try { expect(authorized).to.be(false); } catch(e) {}
			done();
		});
	});

	describe('when denying by default', function() {
		before(function() {
			okay.set('authorized by default', false);
		});

		it('should deny GET /undefined-route', function(done) {
			okay.okay('get', '/undefined-route', function(err, authorized) {
				expect(err).to.be(undefined);
				try { expect(authorized).to.be(false); } catch(e) {}
				done();
			});
		});
	});

	describe('when allowing by default', function() {
		before(function() {
			okay.set('authorized by default', true);
		});

		it('should allow GET /undefined-route', function(done) {
			okay.okay('get', '/undefined-route', function(err, authorized) {
				expect(err).to.be(undefined);
				try { expect(authorized).to.be(true); } catch(e) {}
				done();
			});
		});
	});

});
