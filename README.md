injector.js
===========

Dependency-Injection library for JavaScript
-------------------------------------------


injector.js is a small, simple Dependency-Injection library. It was built as a larger project to clone the incredible [Angular.js](https://angularjs.org/) framework, and the API borrows shamelessly from theirs.


Usage [(show me!)](#examples)
-----------------------------

Include a reference to `injector.js` on your page, and you're ready to go.

The library will expose a single global object, `injector`.

The `injector` object contains five methods. The first three are responsible for registering different values to be injected into other functions, the fourth removes providers registered with the injector (making them unavailable), and the fifth injects values as arguments in a function.

1. [`injector#value`](#injectorvalue) - register arbitrary values (strings, numbers, objects, functions, booleans... anything)
2. [`injector#service`](#injectorservice) - register constructor functions, a single instance of which will be provided by the injector
3. [`injector#factory`](#injectorfactory) - register factory functions, the result of which will be provided by the injector
4. [`injector#unregister`](#injectorunregister) - remove a provider from the injector, making it unavailable to be injected.
5. `injector#inject` - injects items into another function, making these items accessible as arguments, by name. (This functionality is also exposed by calling the `injector` object itself.)

All injected functions (`injector#service`, `injector#factory`, `injector#injector`) can be called on an array of dependencies (by name), followed by the function into which these are to be injected, or else on the function itself.

I recommend using the array wrapping style ('annotation style', [per angular's docs](https://docs.angularjs.org/api/auto/service/$injector)), since it protects the code against [several problems] [1].

```JavaScript
injector.inject(['Dep1', 'Dep2', 'Dep3', function (Dep1, Dep2, Dep2) {
	// Dep1, Dep2, Dep3 all available by name in this function
}]);

injector.inject(function (Dep1, Dep2, Dep2) {
	// Dep1, Dep2, Dep3 all available by name in this function, even without the array.
});

```

## Examples

### `injector#value`

```JavaScript
injector.value('userid', 12345);
injector.value('username', 'mbildner');
injector.value('user', {
	userid: 12345,
	username: 'mbildner'
});

injector.inject(['userid', 'username', 'user', function (userid, username, user) {
	console.log(userid === user.userid) // true
	console.log(username === user.username) // true
}]);

injector(['userid', 'username', 'user', function (userid, username, user) {
	console.log(userid === user.userid) // true
	console.log(username === user.username) // true
}]);
```


### `injector#service`

```JavaScript
injector.service('User', ['NextBigSound', function (NextBigSound) {
	var _this = this;

	// note, we can register dependencies out of order!
	this.employer = NextBigSound;

	this.username = 'mbildner';
	this.userid = 12345;
	this.greet = function (salutation) {
		var greeting = _this.username + ' says ' + salutation;
		console.log(greeting);
	};
}]);

injector.service('NextBigSound', [function () {
	var _this = this;

	this.city = 'New York City';
	this.frontEnd = {
		language: 'JavaScript',
		framework: 'Angular.js',
		styling: 'LESS'
	};
}]);

injector.inject(['User', function (User) {
	User.greet('hello world'); // 'mbildner says hello world'
}]);

injector(['User', function (User) {
	User.greet('hello world'); // 'mbildner says hello world'
}]);
```

### `injector#factory`

```JavaScript
injector.factory('User', ['NextBigSound', function (NextBigSound) {
	var user = {};

	user.employer = NextBigSound;

	user.username = 'mbildner';
	user.userid = 12345;
	user.greet = function (salutation) {
		var greeting = this.username + ' says ' + salutation;
		console.log(greeting);
	};

	// note, unlike service, we must explicitly return the constructed object
	return user;
}]);

injector.factory('NextBigSound', [function () {
	var nextBigSound = {};

	nextBigSound.city = 'New York City';
	nextBigSound.frontEnd = {
		language: 'JavaScript',
		framework: 'Angular.js',
		styling: 'LESS'
	};

	return nextBigSound;
}]);

injector.inject(['User', function (User) {
	User.greet('hello world'); // 'mbildner says hello world'
}]);

injector(['User', function (User) {
	User.greet('hello world'); // 'mbildner says hello world'
}]);
```

### `injector#unregister`

```JavaScript
injector.value('userid', 12345);

injector.inject(['userid', function (userid) {
	console.log(userid); // 12345
}]);

injector.unregister('userid');

injector.inject(['userid', function (userid) {
	// Error: Provider for unregistrationTest failed
}]);

```


[1]: JavaScript minifiers/compressors tend to replace argument names, in the signature and body of a function. Since `providers` are registered with a name, if a function's argument names gets munged the `injector` will not be able to find them, and will throw a polite error.
