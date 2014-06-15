/**
 * @module Injector
 * @author Moshe Bildner moshe.bildner@gmail.com
 * @license: MIT
 *
 *	Injector.js is a lightweight Dependency Injection library.
 *	The Injector.js API exposes four public methods:
 *		1) injector#factory
 *		2) injector#service
 *		3) injector#value
 *		4) injector#inject
 *
 *  The first three are responsible for creating modules that can be injected later.
 *  The fourth method (injector#inject) enables the user to inject any registered modules
 *  into a function at runtime. The same behavior is available by calling the module
 *  variable directly, with the same arguments. So these two examples are identical:
 *
 *  @example injector as module method
 * 	injector.inject(['Item1', 'Item2', function (item1, item2) {
 * 		console.log(item1);
 * 		console.log(item2);
 * 	}])
 *
 *
 *	@example injector as funtion
 *  injector(['Item1', 'Item2', function (item1, item2) {
 * 		console.log(item1);
 * 		console.log(item2);
 * 	}])
 *
 */
;var injector = (function (window) {
	var module,
		_providerStorage = {};

	// expose the module object publicly, and attach publicly available methods
	module = _module;
	module.factory = _factory;
	module.service = _service;
	module.value = _value;
	module.inject = _inject;

	// publicly accessible module object
	function _module (injectableArr) {
		return _inject(injectableArr);
	}

	/**
	 * Resolves a dependency by name.
	 * @private
	 * @param  {String} name - name of the desired provider function
	 * @return {*} - will return the result of the requested provider function
	 */
	function _resolve (name) {
		var provider,
			injectable;

		provider = _providerStorage[name];

		if (typeof provider !== 'function') {
			throw new Error('Provider for ' + name + ' failed');
		}

		injectable = provider();

		return injectable;
	}

	/**
	 * Injects an array of dependencies into a provided function.
	 * @param  {Array} fnArray - Array of all the requested injectable names, with the final value always being the function into which they are to be injected.
	 * @param  {Object} [context] - INTERNAL USE ONLY: context within which the injectable function is to be called. (Used for registering services.)
	 * @return - the result of user's injected function after it has been invoked.
	 */
	function _inject (fnArray, context) {
		var length,
			injectedFunc,
			dependencyArr,
			dependencies;

		if (!Array.isArray(fnArray)) {
			var args = _getFuncArgs(fnArray);
			args.push(fnArray);
			fnArray = args;
		}

		length = fnArray.length;
		injectedFunc = fnArray[length - 1];
		dependencyArr = fnArray.slice(0, -1);
		dependencies = dependencyArr.map(_resolve);

		return injectedFunc.apply(context, dependencies);
	};

	// registers a provider function with the module's internal storage
	function _register (name, providerFunc) {
		_providerStorage[name] = providerFunc;
	}

	/**
	 * Registers injectable value provider
	 * @param  {String} name  - name of the injectable value
	 * @param  {*} value - value to be injected
	 * @return {Function} - returns the module function, for chaining
	 */
	function _value (name, value) {
		var providerFunc = _callOnce(function () {
			return value;
		});

		_register(name, providerFunc);

		return _module;

	}

	/**
	 * Registers injectable factory provider
	 * @param  {String} name - name of the injectable factory
	 * @param  {Array} providerArr - Array of all injectable dependencies, with the final item being the factory function whose return may be injected into other functions
	 * @return {Function} - returns the module function, for chaining
	 */
	function _factory (name, providerArr) {

		if (typeof providerArr === 'function') {
			var args = _getFuncArgs(providerArr);
		}


		var providerFunc = _callOnce(function () {
			return _inject(providerArr);
		});

		_register(name, providerFunc);

		return _module;
	};

	/**
	 * Registers injectable service provider
	 * @param  {String} name - name of the injectable service
	 * @param  {Array} providerArr - Array of all injectable dependencies, with the final item being the constructor function whose return may be injected into other functions
	 * @return {Function} - returns the module function, for chaining
	 */
	function _service (name, providerArr) {
		var providerFunc = _callOnce(function () {
			var func,
				ctx,
				boundFunc;

			func = providerArr.pop();
			ctx = {};
			boundFunc = func.bind(ctx);
			providerArr.push(boundFunc);
			_inject(providerArr, ctx);
			return ctx;
		});

		_register(name, providerFunc);

		return _module;

	}

	/**
	 * Returns a copy of the function that returns a cached copy of the function's return value
	 * @param  {Function} callback - the function whose return should be cached and returned on subsequent calls.
	 * @return {Function} - a wrapped function that always provides a cached value.
	 *
	 * @example - useful for caching expensive, repeated calculations
	 *
	 * function expensiveCalculation () {
	 * 	var a = 0;
	 * 	while (a < 100000000) {
	 * 		a++;
	 * 	}
	 *
	 *  return a;
	 * }
	 *
	 * expensiveCalculation() // 100000000
	 *
	 * var cachedFunc = _callOnce(expensiveCalculation);
	 *
	 * cachedFunc() // 100000000
	 *
	 */
	function _callOnce (callback) {
		return (function () {
			var alreadyCalled,
				cachedResult;

			alreadyCalled = false;
			cachedResult;

			return function () {
				if (!alreadyCalled) {
					alreadyCalled = true;
					cachedResult = callback();
				}

				return cachedResult;
			}
		})();
	}


	function _getFuncArgs (func) {
		return func.toString()
			.match(/\(.*?\)/)[0]
			.replace(/(\(|\)|\s)/gm, '')
			.split(',')
			.filter(function (arg) {
				return arg !== '';
			});
	}

	return module;
})(window);
