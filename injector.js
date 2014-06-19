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
;(function (window) {
	// publicly accessible module object
	function injector (injectableArr) {
		return _inject(injectableArr);
	}

	// attach publicly available methods
	injector.factory = _factory;
	injector.service = _service;
	injector.value = _value;
	injector.inject = _inject;

	var _providerStorage = {};

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
	 * @param  {Array, Function} providerDefn - either an array with all requested providers named and the last member the function into which to provide them, or simply that function itself.
	 * @param  {Object} [context] - INTERNAL USE ONLY: context within which the injectable function is to be called. (Used for registering services.)
	 * @return - the result of user's injected function after it has been invoked.
	 */
	function _inject (providerDefn, context) {
		var length,
			injectedFunc,
			dependencyArr,
			providerArr,
			dependencies;

		providerArr = _extractProviderArray(providerDefn);

		length = providerArr.length;
		injectedFunc = providerArr[length - 1];
		dependencyArr = providerArr.slice(0, -1);
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
	 * @return {Function} - returns the injector function, for chaining
	 */
	function _value (name, value) {
		var providerFunc = _callOnce(function () {
			return value;
		});

		_register(name, providerFunc);

		return injector;

	}

	/**
	 * Registers injectable factory provider
	 * @param  {String} name - name of the injectable factory
 	 * @param  {Array, Function} providerDefn - either an array with all requested providers named and the last member the function into which to provide them, or simply that function itself.
	 * @return {Function} - returns the injector function, for chaining
	 */
	function _factory (name, providerDefn) {
		var providerArr;

		providerArr = _extractProviderArray(providerDefn);

		var providerFunc = _callOnce(function () {
			return _inject(providerArr);
		});

		_register(name, providerFunc);

		return injector;
	};

	/**
	 * Registers injectable service provider
	 * @param  {String} name - name of the injectable service
	 * @param  {Array, Function} providerDefn - either an array with all requested providers named and the last member the function into which to provide them, or simply that function itself.
	 * @return {Function} - returns the injector function, for chaining
	 */
	function _service (name, providerDefn) {
		var providerFunc = _callOnce(function () {
			var func,
				ctx,
				providerArr,
				boundFunc;

			providerArr = _extractProviderArray(providerDefn);

			func = providerArr.pop();
			ctx = {};
			boundFunc = func.bind(ctx);
			providerArr.push(boundFunc);
			_inject(providerArr, ctx);
			return ctx;
		});

		_register(name, providerFunc);

		return injector;

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


	function _extractProviderArray (providerDefn) {
		var args;

		if (Array.isArray(providerDefn) && typeof providerDefn[providerDefn.length-1]==='function') {
			return providerDefn;
		} else if (typeof providerDefn === 'function') {
			args = _getFuncArgs(providerDefn);
			args.push(providerDefn);
			return args;
		} else {
			throw new Error('Injectables must either be a single function or an array with a function as the final element');
		}
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

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = injector;
    }

    exports.injector = injector;
  } else {
    this['injector'] = injector;
  }
})();
