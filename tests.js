var injector = require('./injector');

// tiny test library
var tester = {
  test: function(testFn) {
    testFn();
    process.stdout.write(".");
  },

  isEqual: function(a, b) {
    if (a !== b) {
      throw a + " and " + b + " are not equal";
    }
  }
};

// tests

tester.test(function() { // should be able to inject and use a value
  var user = { userId: 12345 };

  injector.value('user', user);
  injector(['user', function (injectedUser) {
    tester.isEqual(injectedUser, user);
  }]);
});

tester.test(function() { // should be able to inject and use service
  injector.service('NextBigSound', [function () {
    this.city = 'New York City';
  }]);

  injector(['NextBigSound', function (NextBigSound) {
    tester.isEqual(NextBigSound.city, 'New York City');
  }]);
});

tester.test(function() { // should be able to inject and use factory
  injector.factory('NextBigSound', [function () {
    return { city: "New York City" };
  }]);

  injector(['NextBigSound', function (NextBigSound) {
    tester.isEqual(NextBigSound.city, "New York City");
  }]);
});

tester.test(function() { // should be able to inject deps out of order
  injector.service('User', ['NextBigSound', function (NextBigSound) {
    this.employer = NextBigSound;
  }]);

  injector.service('NextBigSound', [function () {
    this.city = 'New York City';
  }]);

  injector(['User', function (User) {
    tester.isEqual(User.employer.city, 'New York City');
  }]);
});

tester.test(function() { // should be able to use glommed on injector fn to inject
  injector.value('userId', 123);
  injector.inject(['userId', function (userId) {
    tester.isEqual(userId, 123);
  }]);
});

console.log();
