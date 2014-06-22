var injector = require('./injector'),
	assert = require('assert');

describe('injector', function () {
	it('should be a function', function () {
		assert.equal(typeof injector, 'function');
	});

	it('should have #value, #factory, #service, #inject methods', function () {
		assert.equal(typeof injector.value, 'function');
		assert.equal(typeof injector.factory, 'function');
		assert.equal(typeof injector.service, 'function');
		assert.equal(typeof injector.inject, 'function');
	});

	describe('#value', function () {
		it('should be able to register a primitive value', function () {
			var user = { userId: 12345 };

			injector.value('user', user);

			injector(['user', function (injectedUser) {
				assert.deepEqual(user, injectedUser);
			}]);
		});
	});

	describe('#service', function () {
		injector.service('NextBigSound', [function () {
		  this.city = 'New York City';
		}]);

		injector(['NextBigSound', function (NextBigSound) {
		  assert.equal(NextBigSound.city, 'New York City');
		}]);
	});

	describe('#factory', function () {
		injector.factory('NextBigSound', [function () {
		  return { city: "New York City" };
		}]);

		injector(['NextBigSound', function (NextBigSound) {
		  assert.equal(NextBigSound.city, "New York City");
		}]);
	});

	describe('#inject', function () {
		it('should be able to use the #inject method instead of calling injector directly', function () {
			injector.value('userId', 123);

			var injectedByMethod,
				injectedByModule;

				injector.inject(['userId', function (userId) {
					assert.equal(userId, 123);
					injectedByMethod = userId;
				}]);

				injector(['userId', function (userId) {
					assert.equal(userId, 123);
					injectedByModule = userId;
				}]);

				assert.equal(injectedByModule, injectedByMethod);
		});
	});

	describe('injection', function () {
		it('should be able to inject dependencies out of order', function () {
			injector.service('User', ['NextBigSound', function (NextBigSound) {
			  this.employer = NextBigSound;
			}]);

			injector.service('NextBigSound', [function () {
			  this.city = 'New York City';
			}]);

			injector(['User', function (User) {
			  assert.equal(User.employer.city, 'New York City');
			}]);
		});
	});

	describe('chaining', function () {
		it('should support chaining all methods but #inject', function () {
			injector
				.service('ChainA', function () {
					this.hasProps = true;
				})
				.factory('ChainB', function () {
					return { hasProps: true };
				})
				.value('ChainC', true)
				.inject(['ChainA', 'ChainB', 'ChainC', function (ChainA, ChainB, ChainC) {
					assert.equal(ChainA.hasProps, true);
					assert.equal(ChainB.hasProps, true);
					assert.equal(ChainC, true);
				}]);
		});
	});
});



