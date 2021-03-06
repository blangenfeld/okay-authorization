window.app = angular.module('ok', [])
	.service('Authorization', ['$window', function($window) {
		return {
			okay: function(verb, url) {
				var okay, data = { user: $window.user };
				$window.okay(verb, url, data, function(err, authorized) {
					okay = !err && authorized;
				});
				return okay;
			}
		};
	}])

	.controller('Controller', ['$http', '$scope', '$window', 'Authorization', function($http, $scope, $window, Authorization) {
		$scope.okay = Authorization.okay;

		function clearUsers() {
			$scope.users = [];
		}

		$scope.signin = function(role) {
			clearUsers();
			$http.get('/api/signin?role=' + role)
				.success(function(data, status, headers, config) {
					$scope.flash = 'You have signed in with the "' + data.role + '" role';
					$window.user = data;
				})
				.error(function(data, status, headers, config) {
					$scope.flash = 'Something went wrong.';
				});
		};

		$scope.signout = function() {
			clearUsers();
			$http.get('/api/signout')
				.success(function(data, status, headers, config) {
					$scope.flash = 'You have signed out.';
					$window.user = null;
				})
				.error(function(data, status, headers, config) {
					$scope.flash = 'Something went wrong.';
				});
		};

		$scope.fetchUsers = function() {
			clearUsers();
			$http.get('/api/users')
				.success(function(data, status, headers, config) {
					$scope.flash = 'Here are all of the users.';
					$scope.users = data;
				})
				.error(function(data, status, headers, config) {
					$scope.flash = 'Something went wrong.';
				});
		};
	}]);
