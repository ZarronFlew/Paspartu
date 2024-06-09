(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
			(global = global || self, factory(global.IMask = {}));
}(this, (function (exports) {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
		return it && it.Math == Math && it;
	}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


	var global_1 = // eslint-disable-next-line no-undef
		check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
		Function('return this')();

	var fails = function (exec) {
		try {
			return !!exec();
		} catch (error) {
			return true;
		}
	};

	// Thank's IE8 for his funny defineProperty


	var descriptors = !fails(function () {
		return Object.defineProperty({}, 1, {
			get: function () {
				return 7;
			}
		})[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
		1: 2
	}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
		var descriptor = getOwnPropertyDescriptor(this, V);
		return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
		return {
			enumerable: !(bitmap & 1),
			configurable: !(bitmap & 2),
			writable: !(bitmap & 4),
			value: value
		};
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
		return toString.call(it).slice(8, -1);
	};

	var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

	var indexedObject = fails(function () {
		// throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
		// eslint-disable-next-line no-prototype-builtins
		return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
		return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
		if (it == undefined) throw TypeError("Can't call method on " + it);
		return it;
	};

	// toObject with fallback for non-array-like ES3 strings




	var toIndexedObject = function (it) {
		return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
		return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string


	var toPrimitive = function (input, PREFERRED_STRING) {
		if (!isObject(input)) return input;
		var fn, val;
		if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
		if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
		if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
		throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
		return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
		return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty


	var ie8DomDefine = !descriptors && !fails(function () {
		return Object.defineProperty(documentCreateElement('div'), 'a', {
			get: function () {
				return 7;
			}
		}).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
		O = toIndexedObject(O);
		P = toPrimitive(P, true);
		if (ie8DomDefine) try {
			return nativeGetOwnPropertyDescriptor(O, P);
		} catch (error) {
			/* empty */
		}
		if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
		if (!isObject(it)) {
			throw TypeError(String(it) + ' is not an object');
		}

		return it;
	};

	var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty

	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
		anObject(O);
		P = toPrimitive(P, true);
		anObject(Attributes);
		if (ie8DomDefine) try {
			return nativeDefineProperty(O, P, Attributes);
		} catch (error) {
			/* empty */
		}
		if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
		if ('value' in Attributes) O[P] = Attributes.value;
		return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
		return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
		object[key] = value;
		return object;
	};

	var setGlobal = function (key, value) {
		try {
			createNonEnumerableProperty(global_1, key, value);
		} catch (error) {
			global_1[key] = value;
		}

		return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});
	var sharedStore = store;

	var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

	if (typeof sharedStore.inspectSource != 'function') {
		sharedStore.inspectSource = function (it) {
			return functionToString.call(it);
		};
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;
	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var shared = createCommonjsModule(function (module) {
		(module.exports = function (key, value) {
			return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
		})('versions', []).push({
			version: '3.6.4',
			mode: 'global',
			copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
		});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
		return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
		return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
		return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
		return function (it) {
			var state;

			if (!isObject(it) || (state = get(it)).type !== TYPE) {
				throw TypeError('Incompatible receiver, ' + TYPE + ' required');
			}

			return state;
		};
	};

	if (nativeWeakMap) {
		var store$1 = new WeakMap$1();
		var wmget = store$1.get;
		var wmhas = store$1.has;
		var wmset = store$1.set;

		set = function (it, metadata) {
			wmset.call(store$1, it, metadata);
			return metadata;
		};

		get = function (it) {
			return wmget.call(store$1, it) || {};
		};

		has$1 = function (it) {
			return wmhas.call(store$1, it);
		};
	} else {
		var STATE = sharedKey('state');
		hiddenKeys[STATE] = true;

		set = function (it, metadata) {
			createNonEnumerableProperty(it, STATE, metadata);
			return metadata;
		};

		get = function (it) {
			return has(it, STATE) ? it[STATE] : {};
		};

		has$1 = function (it) {
			return has(it, STATE);
		};
	}

	var internalState = {
		set: set,
		get: get,
		has: has$1,
		enforce: enforce,
		getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
		var getInternalState = internalState.get;
		var enforceInternalState = internalState.enforce;
		var TEMPLATE = String(String).split('String');
		(module.exports = function (O, key, value, options) {
			var unsafe = options ? !!options.unsafe : false;
			var simple = options ? !!options.enumerable : false;
			var noTargetGet = options ? !!options.noTargetGet : false;

			if (typeof value == 'function') {
				if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
				enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
			}

			if (O === global_1) {
				if (simple) O[key] = value; else setGlobal(key, value);
				return;
			} else if (!unsafe) {
				delete O[key];
			} else if (!noTargetGet && O[key]) {
				simple = true;
			}

			if (simple) O[key] = value; else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
		})(Function.prototype, 'toString', function toString() {
			return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
		});
	});

	var path = global_1;

	var aFunction = function (variable) {
		return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
		return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor; // `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger

	var toInteger = function (argument) {
		return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min; // `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength

	var toLength = function (argument) {
		return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min; // Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

	var toAbsoluteIndex = function (index, length) {
		var integer = toInteger(index);
		return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation


	var createMethod = function (IS_INCLUDES) {
		return function ($this, el, fromIndex) {
			var O = toIndexedObject($this);
			var length = toLength(O.length);
			var index = toAbsoluteIndex(fromIndex, length);
			var value; // Array#includes uses SameValueZero equality algorithm
			// eslint-disable-next-line no-self-compare

			if (IS_INCLUDES && el != el) while (length > index) {
				value = O[index++]; // eslint-disable-next-line no-self-compare

				if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
			} else for (; length > index; index++) {
				if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
			}
			return !IS_INCLUDES && -1;
		};
	};

	var arrayIncludes = {
		// `Array.prototype.includes` method
		// https://tc39.github.io/ecma262/#sec-array.prototype.includes
		includes: createMethod(true),
		// `Array.prototype.indexOf` method
		// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
		indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;



	var objectKeysInternal = function (object, names) {
		var O = toIndexedObject(object);
		var i = 0;
		var result = [];
		var key;

		for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


		while (names.length > i) if (has(O, key = names[i++])) {
			~indexOf(result, key) || result.push(key);
		}

		return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
		return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols


	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
		var keys = objectGetOwnPropertyNames.f(anObject(it));
		var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
		return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
		var keys = ownKeys(source);
		var defineProperty = objectDefineProperty.f;
		var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
		}
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
		var value = data[normalize(feature)];
		return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
		return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';
	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;










	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/


	var _export = function (options, source) {
		var TARGET = options.target;
		var GLOBAL = options.global;
		var STATIC = options.stat;
		var FORCED, target, key, targetProperty, sourceProperty, descriptor;

		if (GLOBAL) {
			target = global_1;
		} else if (STATIC) {
			target = global_1[TARGET] || setGlobal(TARGET, {});
		} else {
			target = (global_1[TARGET] || {}).prototype;
		}

		if (target) for (key in source) {
			sourceProperty = source[key];

			if (options.noTargetGet) {
				descriptor = getOwnPropertyDescriptor$1(target, key);
				targetProperty = descriptor && descriptor.value;
			} else targetProperty = target[key];

			FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

			if (!FORCED && targetProperty !== undefined) {
				if (typeof sourceProperty === typeof targetProperty) continue;
				copyConstructorProperties(sourceProperty, targetProperty);
			} // add a flag to not completely full polyfills


			if (options.sham || targetProperty && targetProperty.sham) {
				createNonEnumerableProperty(sourceProperty, 'sham', true);
			} // extend global


			redefine(target, key, sourceProperty, options);
		}
	};

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys


	var objectKeys = Object.keys || function keys(O) {
		return objectKeysInternal(O, enumBugKeys);
	};

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject


	var toObject = function (argument) {
		return Object(requireObjectCoercible(argument));
	};

	var nativeAssign = Object.assign;
	var defineProperty = Object.defineProperty; // `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign

	var objectAssign = !nativeAssign || fails(function () {
		// should have correct order of operations (Edge bug)
		if (descriptors && nativeAssign({
			b: 1
		}, nativeAssign(defineProperty({}, 'a', {
			enumerable: true,
			get: function () {
				defineProperty(this, 'b', {
					value: 3,
					enumerable: false
				});
			}
		}), {
			b: 2
		})).b !== 1) return true; // should work with symbols and should have deterministic property order (V8 bug)

		var A = {};
		var B = {}; // eslint-disable-next-line no-undef

		var symbol = Symbol();
		var alphabet = 'abcdefghijklmnopqrst';
		A[symbol] = 7;
		alphabet.split('').forEach(function (chr) {
			B[chr] = chr;
		});
		return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) {
		// eslint-disable-line no-unused-vars
		var T = toObject(target);
		var argumentsLength = arguments.length;
		var index = 1;
		var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
		var propertyIsEnumerable = objectPropertyIsEnumerable.f;

		while (argumentsLength > index) {
			var S = indexedObject(arguments[index++]);
			var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
			var length = keys.length;
			var j = 0;
			var key;

			while (length > j) {
				key = keys[j++];
				if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
			}
		}

		return T;
	} : nativeAssign;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign


	_export({
		target: 'Object',
		stat: true,
		forced: Object.assign !== objectAssign
	}, {
		assign: objectAssign
	});

	// `String.prototype.repeat` method implementation
	// https://tc39.github.io/ecma262/#sec-string.prototype.repeat


	var stringRepeat = ''.repeat || function repeat(count) {
		var str = String(requireObjectCoercible(this));
		var result = '';
		var n = toInteger(count);
		if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');

		for (; n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;

		return result;
	};

	// https://github.com/tc39/proposal-string-pad-start-end






	var ceil$1 = Math.ceil; // `String.prototype.{ padStart, padEnd }` methods implementation

	var createMethod$1 = function (IS_END) {
		return function ($this, maxLength, fillString) {
			var S = String(requireObjectCoercible($this));
			var stringLength = S.length;
			var fillStr = fillString === undefined ? ' ' : String(fillString);
			var intMaxLength = toLength(maxLength);
			var fillLen, stringFiller;
			if (intMaxLength <= stringLength || fillStr == '') return S;
			fillLen = intMaxLength - stringLength;
			stringFiller = stringRepeat.call(fillStr, ceil$1(fillLen / fillStr.length));
			if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
			return IS_END ? S + stringFiller : stringFiller + S;
		};
	};

	var stringPad = {
		// `String.prototype.padStart` method
		// https://tc39.github.io/ecma262/#sec-string.prototype.padstart
		start: createMethod$1(false),
		// `String.prototype.padEnd` method
		// https://tc39.github.io/ecma262/#sec-string.prototype.padend
		end: createMethod$1(true)
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	// https://github.com/zloirock/core-js/issues/280
	// eslint-disable-next-line unicorn/no-unsafe-regex


	var stringPadWebkitBug = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(engineUserAgent);

	var $padEnd = stringPad.end;

	// `String.prototype.padEnd` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.padend


	_export({
		target: 'String',
		proto: true,
		forced: stringPadWebkitBug
	}, {
		padEnd: function padEnd(maxLength
			/* , fillString = ' ' */
		) {
			return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
		}
	});

	var $padStart = stringPad.start;

	// `String.prototype.padStart` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.padstart


	_export({
		target: 'String',
		proto: true,
		forced: stringPadWebkitBug
	}, {
		padStart: function padStart(maxLength
			/* , fillString = ' ' */
		) {
			return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
		}
	});

	// `String.prototype.repeat` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.repeat


	_export({
		target: 'String',
		proto: true
	}, {
		repeat: stringRepeat
	});

	// `globalThis` object
	// https://github.com/tc39/proposal-global


	_export({
		global: true
	}, {
		globalThis: global_1
	});

	function _typeof(obj) {
		"@babel/helpers - typeof";

		if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
			_typeof = function (obj) {
				return typeof obj;
			};
		} else {
			_typeof = function (obj) {
				return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
			};
		}

		return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		return Constructor;
	}

	function _defineProperty(obj, key, value) {
		if (key in obj) {
			Object.defineProperty(obj, key, {
				value: value,
				enumerable: true,
				configurable: true,
				writable: true
			});
		} else {
			obj[key] = value;
		}

		return obj;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function");
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				writable: true,
				configurable: true
			}
		});
		if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
		_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
			return o.__proto__ || Object.getPrototypeOf(o);
		};
		return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
		_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
			o.__proto__ = p;
			return o;
		};

		return _setPrototypeOf(o, p);
	}

	function _objectWithoutPropertiesLoose(source, excluded) {
		if (source == null) return {};
		var target = {};
		var sourceKeys = Object.keys(source);
		var key, i;

		for (i = 0; i < sourceKeys.length; i++) {
			key = sourceKeys[i];
			if (excluded.indexOf(key) >= 0) continue;
			target[key] = source[key];
		}

		return target;
	}

	function _objectWithoutProperties(source, excluded) {
		if (source == null) return {};

		var target = _objectWithoutPropertiesLoose(source, excluded);

		var key, i;

		if (Object.getOwnPropertySymbols) {
			var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

			for (i = 0; i < sourceSymbolKeys.length; i++) {
				key = sourceSymbolKeys[i];
				if (excluded.indexOf(key) >= 0) continue;
				if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
				target[key] = source[key];
			}
		}

		return target;
	}

	function _assertThisInitialized(self) {
		if (self === void 0) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return self;
	}

	function _possibleConstructorReturn(self, call) {
		if (call && (typeof call === "object" || typeof call === "function")) {
			return call;
		}

		return _assertThisInitialized(self);
	}

	function _superPropBase(object, property) {
		while (!Object.prototype.hasOwnProperty.call(object, property)) {
			object = _getPrototypeOf(object);
			if (object === null) break;
		}

		return object;
	}

	function _get(target, property, receiver) {
		if (typeof Reflect !== "undefined" && Reflect.get) {
			_get = Reflect.get;
		} else {
			_get = function _get(target, property, receiver) {
				var base = _superPropBase(target, property);

				if (!base) return;
				var desc = Object.getOwnPropertyDescriptor(base, property);

				if (desc.get) {
					return desc.get.call(receiver);
				}

				return desc.value;
			};
		}

		return _get(target, property, receiver || target);
	}

	function set$1(target, property, value, receiver) {
		if (typeof Reflect !== "undefined" && Reflect.set) {
			set$1 = Reflect.set;
		} else {
			set$1 = function set(target, property, value, receiver) {
				var base = _superPropBase(target, property);

				var desc;

				if (base) {
					desc = Object.getOwnPropertyDescriptor(base, property);

					if (desc.set) {
						desc.set.call(receiver, value);
						return true;
					} else if (!desc.writable) {
						return false;
					}
				}

				desc = Object.getOwnPropertyDescriptor(receiver, property);

				if (desc) {
					if (!desc.writable) {
						return false;
					}

					desc.value = value;
					Object.defineProperty(receiver, property, desc);
				} else {
					_defineProperty(receiver, property, value);
				}

				return true;
			};
		}

		return set$1(target, property, value, receiver);
	}

	function _set(target, property, value, receiver, isStrict) {
		var s = set$1(target, property, value, receiver || target);

		if (!s && isStrict) {
			throw new Error('failed to set property');
		}

		return value;
	}

	function _slicedToArray(arr, i) {
		return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
	}

	function _arrayWithHoles(arr) {
		if (Array.isArray(arr)) return arr;
	}

	function _iterableToArrayLimit(arr, i) {
		if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
			return;
		}

		var _arr = [];
		var _n = true;
		var _d = false;
		var _e = undefined;

		try {
			for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
				_arr.push(_s.value);

				if (i && _arr.length === i) break;
			}
		} catch (err) {
			_d = true;
			_e = err;
		} finally {
			try {
				if (!_n && _i["return"] != null) _i["return"]();
			} finally {
				if (_d) throw _e;
			}
		}

		return _arr;
	}

	function _nonIterableRest() {
		throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}

	/** Checks if value is string */
	function isString(str) {
		return typeof str === 'string' || str instanceof String;
	}
	/**
	  Direction
	  @prop {string} NONE
	  @prop {string} LEFT
	  @prop {string} FORCE_LEFT
	  @prop {string} RIGHT
	  @prop {string} FORCE_RIGHT
	*/

	var DIRECTION = {
		NONE: 'NONE',
		LEFT: 'LEFT',
		FORCE_LEFT: 'FORCE_LEFT',
		RIGHT: 'RIGHT',
		FORCE_RIGHT: 'FORCE_RIGHT'
	};
	/** */

	function forceDirection(direction) {
		switch (direction) {
			case DIRECTION.LEFT:
				return DIRECTION.FORCE_LEFT;

			case DIRECTION.RIGHT:
				return DIRECTION.FORCE_RIGHT;

			default:
				return direction;
		}
	}
	/** Escapes regular expression control chars */

	function escapeRegExp(str) {
		return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
	} // cloned from https://github.com/epoberezkin/fast-deep-equal with small changes

	function objectIncludes(b, a) {
		if (a === b) return true;
		var arrA = Array.isArray(a),
			arrB = Array.isArray(b),
			i;

		if (arrA && arrB) {
			if (a.length != b.length) return false;

			for (i = 0; i < a.length; i++) {
				if (!objectIncludes(a[i], b[i])) return false;
			}

			return true;
		}

		if (arrA != arrB) return false;

		if (a && b && _typeof(a) === 'object' && _typeof(b) === 'object') {
			var dateA = a instanceof Date,
				dateB = b instanceof Date;
			if (dateA && dateB) return a.getTime() == b.getTime();
			if (dateA != dateB) return false;
			var regexpA = a instanceof RegExp,
				regexpB = b instanceof RegExp;
			if (regexpA && regexpB) return a.toString() == b.toString();
			if (regexpA != regexpB) return false;
			var keys = Object.keys(a); // if (keys.length !== Object.keys(b).length) return false;

			for (i = 0; i < keys.length; i++) {
				if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
			}

			for (i = 0; i < keys.length; i++) {
				if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;
			}

			return true;
		} else if (a && b && typeof a === 'function' && typeof b === 'function') {
			return a.toString() === b.toString();
		}

		return false;
	}
	/** Selection range */

	/** Provides details of changing input */

	var ActionDetails =
		/*#__PURE__*/
		function () {
			/** Current input value */

			/** Current cursor position */

			/** Old input value */

			/** Old selection */
			function ActionDetails(value, cursorPos, oldValue, oldSelection) {
				_classCallCheck(this, ActionDetails);

				this.value = value;
				this.cursorPos = cursorPos;
				this.oldValue = oldValue;
				this.oldSelection = oldSelection; // double check if left part was changed (autofilling, other non-standard input triggers)

				while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) {
					--this.oldSelection.start;
				}
			}
			/**
			  Start changing position
			  @readonly
			*/


			_createClass(ActionDetails, [{
				key: "startChangePos",
				get: function get() {
					return Math.min(this.cursorPos, this.oldSelection.start);
				}
				/**
				  Inserted symbols count
				  @readonly
				*/

			}, {
				key: "insertedCount",
				get: function get() {
					return this.cursorPos - this.startChangePos;
				}
				/**
				  Inserted symbols
				  @readonly
				*/

			}, {
				key: "inserted",
				get: function get() {
					return this.value.substr(this.startChangePos, this.insertedCount);
				}
				/**
				  Removed symbols count
				  @readonly
				*/

			}, {
				key: "removedCount",
				get: function get() {
					// Math.max for opposite operation
					return Math.max(this.oldSelection.end - this.startChangePos || // for Delete
						this.oldValue.length - this.value.length, 0);
				}
				/**
				  Removed symbols
				  @readonly
				*/

			}, {
				key: "removed",
				get: function get() {
					return this.oldValue.substr(this.startChangePos, this.removedCount);
				}
				/**
				  Unchanged head symbols
				  @readonly
				*/

			}, {
				key: "head",
				get: function get() {
					return this.value.substring(0, this.startChangePos);
				}
				/**
				  Unchanged tail symbols
				  @readonly
				*/

			}, {
				key: "tail",
				get: function get() {
					return this.value.substring(this.startChangePos + this.insertedCount);
				}
				/**
				  Remove direction
				  @readonly
				*/

			}, {
				key: "removeDirection",
				get: function get() {
					if (!this.removedCount || this.insertedCount) return DIRECTION.NONE; // align right if delete at right or if range removed (event with backspace)

					return this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos ? DIRECTION.RIGHT : DIRECTION.LEFT;
				}
			}]);

			return ActionDetails;
		}();

	/**
	  Provides details of changing model value
	  @param {Object} [details]
	  @param {string} [details.inserted] - Inserted symbols
	  @param {boolean} [details.skip] - Can skip chars
	  @param {number} [details.removeCount] - Removed symbols count
	  @param {number} [details.tailShift] - Additional offset if any changes occurred before tail
	*/
	var ChangeDetails =
		/*#__PURE__*/
		function () {
			/** Inserted symbols */

			/** Can skip chars */

			/** Additional offset if any changes occurred before tail */

			/** Raw inserted is used by dynamic mask */
			function ChangeDetails(details) {
				_classCallCheck(this, ChangeDetails);

				Object.assign(this, {
					inserted: '',
					rawInserted: '',
					skip: false,
					tailShift: 0
				}, details);
			}
			/**
			  Aggregate changes
			  @returns {ChangeDetails} `this`
			*/


			_createClass(ChangeDetails, [{
				key: "aggregate",
				value: function aggregate(details) {
					this.rawInserted += details.rawInserted;
					this.skip = this.skip || details.skip;
					this.inserted += details.inserted;
					this.tailShift += details.tailShift;
					return this;
				}
				/** Total offset considering all changes */

			}, {
				key: "offset",
				get: function get() {
					return this.tailShift + this.inserted.length;
				}
			}]);

			return ChangeDetails;
		}();

	/** Provides details of continuous extracted tail */
	var ContinuousTailDetails =
		/*#__PURE__*/
		function () {
			/** Tail value as string */

			/** Tail start position */

			/** Start position */
			function ContinuousTailDetails() {
				var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
				var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
				var stop = arguments.length > 2 ? arguments[2] : undefined;

				_classCallCheck(this, ContinuousTailDetails);

				this.value = value;
				this.from = from;
				this.stop = stop;
			}

			_createClass(ContinuousTailDetails, [{
				key: "toString",
				value: function toString() {
					return this.value;
				}
			}, {
				key: "extend",
				value: function extend(tail) {
					this.value += String(tail);
				}
			}, {
				key: "appendTo",
				value: function appendTo(masked) {
					return masked.append(this.toString(), {
						tail: true
					}).aggregate(masked._appendPlaceholder());
				}
			}, {
				key: "shiftBefore",
				value: function shiftBefore(pos) {
					if (this.from >= pos || !this.value.length) return '';
					var shiftChar = this.value[0];
					this.value = this.value.slice(1);
					return shiftChar;
				}
			}, {
				key: "state",
				get: function get() {
					return {
						value: this.value,
						from: this.from,
						stop: this.stop
					};
				},
				set: function set(state) {
					Object.assign(this, state);
				}
			}]);

			return ContinuousTailDetails;
		}();

	/**
	 * Applies mask on element.
	 * @constructor
	 * @param {HTMLInputElement|HTMLTextAreaElement|MaskElement} el - Element to apply mask
	 * @param {Object} opts - Custom mask options
	 * @return {InputMask}
	 */
	function IMask(el) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		// currently available only for input-like elements
		return new IMask.InputMask(el, opts);
	}

	/** Supported mask type */

	/** Provides common masking stuff */
	var Masked =
		/*#__PURE__*/
		function () {
			// $Shape<MaskedOptions>; TODO after fix https://github.com/facebook/flow/issues/4773

			/** @type {Mask} */

			/** */
			// $FlowFixMe no ideas

			/** Transforms value before mask processing */

			/** Validates if value is acceptable */

			/** Does additional processing in the end of editing */

			/** Format typed value to string */

			/** Parse strgin to get typed value */

			/** Enable characters overwriting */

			/** */
			function Masked(opts) {
				_classCallCheck(this, Masked);

				this._value = '';

				this._update(Object.assign({}, Masked.DEFAULTS, {}, opts));

				this.isInitialized = true;
			}
			/** Sets and applies new options */


			_createClass(Masked, [{
				key: "updateOptions",
				value: function updateOptions(opts) {
					if (!Object.keys(opts).length) return;
					this.withValueRefresh(this._update.bind(this, opts));
				}
				/**
				  Sets new options
				  @protected
				*/

			}, {
				key: "_update",
				value: function _update(opts) {
					Object.assign(this, opts);
				}
				/** Mask state */

			}, {
				key: "reset",

				/** Resets value */
				value: function reset() {
					this._value = '';
				}
				/** */

			}, {
				key: "resolve",

				/** Resolve new value */
				value: function resolve(value) {
					this.reset();
					this.append(value, {
						input: true
					}, '');
					this.doCommit();
					return this.value;
				}
				/** */

			}, {
				key: "nearestInputPos",

				/** Finds nearest input position in direction */
				value: function nearestInputPos(cursorPos, direction) {
					return cursorPos;
				}
				/** Extracts value in range considering flags */

			}, {
				key: "extractInput",
				value: function extractInput() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					return this.value.slice(fromPos, toPos);
				}
				/** Extracts tail in range */

			}, {
				key: "extractTail",
				value: function extractTail() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
				}
				/** Appends tail */
				// $FlowFixMe no ideas

			}, {
				key: "appendTail",
				value: function appendTail(tail) {
					if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
					return tail.appendTo(this);
				}
				/** Appends char */

			}, {
				key: "_appendCharRaw",
				value: function _appendCharRaw(ch) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					ch = this.doPrepare(ch, flags);
					if (!ch) return new ChangeDetails();
					this._value += ch;
					return new ChangeDetails({
						inserted: ch,
						rawInserted: ch
					});
				}
				/** Appends char */

			}, {
				key: "_appendChar",
				value: function _appendChar(ch) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					var checkTail = arguments.length > 2 ? arguments[2] : undefined;
					var consistentState = this.state;

					var details = this._appendCharRaw(ch, flags);

					if (details.inserted) {
						var consistentTail;
						var appended = this.doValidate(flags) !== false;

						if (appended && checkTail != null) {
							// validation ok, check tail
							var beforeTailState = this.state;

							if (this.overwrite) {
								consistentTail = checkTail.state;
								checkTail.shiftBefore(this.value.length);
							}

							var tailDetails = this.appendTail(checkTail);
							appended = tailDetails.rawInserted === checkTail.toString(); // if ok, rollback state after tail

							if (appended && tailDetails.inserted) this.state = beforeTailState;
						} // revert all if something went wrong


						if (!appended) {
							details = new ChangeDetails();
							this.state = consistentState;
							if (checkTail && consistentTail) checkTail.state = consistentTail;
						}
					}

					return details;
				}
				/** Appends optional placeholder at end */

			}, {
				key: "_appendPlaceholder",
				value: function _appendPlaceholder() {
					return new ChangeDetails();
				}
				/** Appends symbols considering flags */
				// $FlowFixMe no ideas

			}, {
				key: "append",
				value: function append(str, flags, tail) {
					if (!isString(str)) throw new Error('value should be string');
					var details = new ChangeDetails();
					var checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail;
					if (flags.tail) flags._beforeTailState = this.state;

					for (var ci = 0; ci < str.length; ++ci) {
						details.aggregate(this._appendChar(str[ci], flags, checkTail));
					} // append tail but aggregate only tailShift


					if (checkTail != null) {
						details.tailShift += this.appendTail(checkTail).tailShift; // TODO it's a good idea to clear state after appending ends
						// but it causes bugs when one append calls another (when dynamic dispatch set rawInputValue)
						// this._resetBeforeTailState();
					}

					return details;
				}
				/** */

			}, {
				key: "remove",
				value: function remove() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					this._value = this.value.slice(0, fromPos) + this.value.slice(toPos);
					return new ChangeDetails();
				}
				/** Calls function and reapplies current value */

			}, {
				key: "withValueRefresh",
				value: function withValueRefresh(fn) {
					if (this._refreshing || !this.isInitialized) return fn();
					this._refreshing = true;
					var rawInput = this.rawInputValue;
					var value = this.value;
					var ret = fn();
					this.rawInputValue = rawInput; // append lost trailing chars at end

					if (this.value !== value && value.indexOf(this._value) === 0) {
						this.append(value.slice(this._value.length), {}, '');
					}

					delete this._refreshing;
					return ret;
				}
				/** */

			}, {
				key: "runIsolated",
				value: function runIsolated(fn) {
					if (this._isolated || !this.isInitialized) return fn(this);
					this._isolated = true;
					var state = this.state;
					var ret = fn(this);
					this.state = state;
					delete this._isolated;
					return ret;
				}
				/**
				  Prepares string before mask processing
				  @protected
				*/

			}, {
				key: "doPrepare",
				value: function doPrepare(str) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					return this.prepare ? this.prepare(str, this, flags) : str;
				}
				/**
				  Validates if value is acceptable
				  @protected
				*/

			}, {
				key: "doValidate",
				value: function doValidate(flags) {
					return (!this.validate || this.validate(this.value, this, flags)) && (!this.parent || this.parent.doValidate(flags));
				}
				/**
				  Does additional processing in the end of editing
				  @protected
				*/

			}, {
				key: "doCommit",
				value: function doCommit() {
					if (this.commit) this.commit(this.value, this);
				}
				/** */

			}, {
				key: "doFormat",
				value: function doFormat(value) {
					return this.format ? this.format(value, this) : value;
				}
				/** */

			}, {
				key: "doParse",
				value: function doParse(str) {
					return this.parse ? this.parse(str, this) : str;
				}
				/** */

			}, {
				key: "splice",
				value: function splice(start, deleteCount, inserted, removeDirection) {
					var tailPos = start + deleteCount;
					var tail = this.extractTail(tailPos);
					var startChangePos = this.nearestInputPos(start, removeDirection);
					var changeDetails = new ChangeDetails({
						tailShift: startChangePos - start // adjust tailShift if start was aligned

					}).aggregate(this.remove(startChangePos)).aggregate(this.append(inserted, {
						input: true
					}, tail));
					return changeDetails;
				}
			}, {
				key: "state",
				get: function get() {
					return {
						_value: this.value
					};
				},
				set: function set(state) {
					this._value = state._value;
				}
			}, {
				key: "value",
				get: function get() {
					return this._value;
				},
				set: function set(value) {
					this.resolve(value);
				}
			}, {
				key: "unmaskedValue",
				get: function get() {
					return this.value;
				},
				set: function set(value) {
					this.reset();
					this.append(value, {}, '');
					this.doCommit();
				}
				/** */

			}, {
				key: "typedValue",
				get: function get() {
					return this.doParse(this.value);
				},
				set: function set(value) {
					this.value = this.doFormat(value);
				}
				/** Value that includes raw user input */

			}, {
				key: "rawInputValue",
				get: function get() {
					return this.extractInput(0, this.value.length, {
						raw: true
					});
				},
				set: function set(value) {
					this.reset();
					this.append(value, {
						raw: true
					}, '');
					this.doCommit();
				}
				/** */

			}, {
				key: "isComplete",
				get: function get() {
					return true;
				}
			}]);

			return Masked;
		}();
	Masked.DEFAULTS = {
		format: function format(v) {
			return v;
		},
		parse: function parse(v) {
			return v;
		}
	};
	IMask.Masked = Masked;

	/** Get Masked class by mask type */

	function maskedClass(mask) {
		if (mask == null) {
			throw new Error('mask property should be defined');
		} // $FlowFixMe


		if (mask instanceof RegExp) return IMask.MaskedRegExp; // $FlowFixMe

		if (isString(mask)) return IMask.MaskedPattern; // $FlowFixMe

		if (mask instanceof Date || mask === Date) return IMask.MaskedDate; // $FlowFixMe

		if (mask instanceof Number || typeof mask === 'number' || mask === Number) return IMask.MaskedNumber; // $FlowFixMe

		if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic; // $FlowFixMe

		if (IMask.Masked && mask.prototype instanceof IMask.Masked) return mask; // $FlowFixMe

		if (mask instanceof Function) return IMask.MaskedFunction;
		console.warn('Mask not found for mask', mask); // eslint-disable-line no-console
		// $FlowFixMe

		return IMask.Masked;
	}
	/** Creates new {@link Masked} depending on mask type */

	function createMask(opts) {
		// $FlowFixMe
		if (IMask.Masked && opts instanceof IMask.Masked) return opts;
		opts = Object.assign({}, opts);
		var mask = opts.mask; // $FlowFixMe

		if (IMask.Masked && mask instanceof IMask.Masked) return mask;
		var MaskedClass = maskedClass(mask);
		if (!MaskedClass) throw new Error('Masked class is not found for provided mask, appropriate module needs to be import manually before creating mask.');
		return new MaskedClass(opts);
	}
	IMask.createMask = createMask;

	var DEFAULT_INPUT_DEFINITIONS = {
		'0': /\d/,
		'a': /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
		// http://stackoverflow.com/a/22075070
		'*': /./
	};
	/** */

	var PatternInputDefinition =
		/*#__PURE__*/
		function () {
			/** */

			/** */

			/** */

			/** */

			/** */

			/** */
			function PatternInputDefinition(opts) {
				_classCallCheck(this, PatternInputDefinition);

				var mask = opts.mask,
					blockOpts = _objectWithoutProperties(opts, ["mask"]);

				this.masked = createMask({
					mask: mask
				});
				Object.assign(this, blockOpts);
			}

			_createClass(PatternInputDefinition, [{
				key: "reset",
				value: function reset() {
					this._isFilled = false;
					this.masked.reset();
				}
			}, {
				key: "remove",
				value: function remove() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;

					if (fromPos === 0 && toPos >= 1) {
						this._isFilled = false;
						return this.masked.remove(fromPos, toPos);
					}

					return new ChangeDetails();
				}
			}, {
				key: "_appendChar",
				value: function _appendChar(str) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					if (this._isFilled) return new ChangeDetails();
					var state = this.masked.state; // simulate input

					var details = this.masked._appendChar(str, flags);

					if (details.inserted && this.doValidate(flags) === false) {
						details.inserted = details.rawInserted = '';
						this.masked.state = state;
					}

					if (!details.inserted && !this.isOptional && !this.lazy && !flags.input) {
						details.inserted = this.placeholderChar;
					}

					details.skip = !details.inserted && !this.isOptional;
					this._isFilled = Boolean(details.inserted);
					return details;
				}
			}, {
				key: "append",
				value: function append() {
					var _this$masked;

					return (_this$masked = this.masked).append.apply(_this$masked, arguments);
				}
			}, {
				key: "_appendPlaceholder",
				value: function _appendPlaceholder() {
					var details = new ChangeDetails();
					if (this._isFilled || this.isOptional) return details;
					this._isFilled = true;
					details.inserted = this.placeholderChar;
					return details;
				}
			}, {
				key: "extractTail",
				value: function extractTail() {
					var _this$masked2;

					return (_this$masked2 = this.masked).extractTail.apply(_this$masked2, arguments);
				}
			}, {
				key: "appendTail",
				value: function appendTail() {
					var _this$masked3;

					return (_this$masked3 = this.masked).appendTail.apply(_this$masked3, arguments);
				}
			}, {
				key: "extractInput",
				value: function extractInput() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					var flags = arguments.length > 2 ? arguments[2] : undefined;
					return this.masked.extractInput(fromPos, toPos, flags);
				}
			}, {
				key: "nearestInputPos",
				value: function nearestInputPos(cursorPos) {
					var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DIRECTION.NONE;
					var minPos = 0;
					var maxPos = this.value.length;
					var boundPos = Math.min(Math.max(cursorPos, minPos), maxPos);

					switch (direction) {
						case DIRECTION.LEFT:
						case DIRECTION.FORCE_LEFT:
							return this.isComplete ? boundPos : minPos;

						case DIRECTION.RIGHT:
						case DIRECTION.FORCE_RIGHT:
							return this.isComplete ? boundPos : maxPos;

						case DIRECTION.NONE:
						default:
							return boundPos;
					}
				}
			}, {
				key: "doValidate",
				value: function doValidate() {
					var _this$masked4, _this$parent;

					return (_this$masked4 = this.masked).doValidate.apply(_this$masked4, arguments) && (!this.parent || (_this$parent = this.parent).doValidate.apply(_this$parent, arguments));
				}
			}, {
				key: "doCommit",
				value: function doCommit() {
					this.masked.doCommit();
				}
			}, {
				key: "value",
				get: function get() {
					return this.masked.value || (this._isFilled && !this.isOptional ? this.placeholderChar : '');
				}
			}, {
				key: "unmaskedValue",
				get: function get() {
					return this.masked.unmaskedValue;
				}
			}, {
				key: "isComplete",
				get: function get() {
					return Boolean(this.masked.value) || this.isOptional;
				}
			}, {
				key: "state",
				get: function get() {
					return {
						masked: this.masked.state,
						_isFilled: this._isFilled
					};
				},
				set: function set(state) {
					this.masked.state = state.masked;
					this._isFilled = state._isFilled;
				}
			}]);

			return PatternInputDefinition;
		}();

	var PatternFixedDefinition =
		/*#__PURE__*/
		function () {
			/** */

			/** */

			/** */

			/** */
			function PatternFixedDefinition(opts) {
				_classCallCheck(this, PatternFixedDefinition);

				Object.assign(this, opts);
				this._value = '';
			}

			_createClass(PatternFixedDefinition, [{
				key: "reset",
				value: function reset() {
					this._isRawInput = false;
					this._value = '';
				}
			}, {
				key: "remove",
				value: function remove() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._value.length;
					this._value = this._value.slice(0, fromPos) + this._value.slice(toPos);
					if (!this._value) this._isRawInput = false;
					return new ChangeDetails();
				}
			}, {
				key: "nearestInputPos",
				value: function nearestInputPos(cursorPos) {
					var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DIRECTION.NONE;
					var minPos = 0;
					var maxPos = this._value.length;

					switch (direction) {
						case DIRECTION.LEFT:
						case DIRECTION.FORCE_LEFT:
							return minPos;

						case DIRECTION.NONE:
						case DIRECTION.RIGHT:
						case DIRECTION.FORCE_RIGHT:
						default:
							return maxPos;
					}
				}
			}, {
				key: "extractInput",
				value: function extractInput() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._value.length;
					var flags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
					return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || '';
				}
			}, {
				key: "_appendChar",
				value: function _appendChar(str) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					var details = new ChangeDetails();
					if (this._value) return details;
					var appended = this.char === str[0];
					var isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && !flags.tail;
					if (isResolved) details.rawInserted = this.char;
					this._value = details.inserted = this.char;
					this._isRawInput = isResolved && (flags.raw || flags.input);
					return details;
				}
			}, {
				key: "_appendPlaceholder",
				value: function _appendPlaceholder() {
					var details = new ChangeDetails();
					if (this._value) return details;
					this._value = details.inserted = this.char;
					return details;
				}
			}, {
				key: "extractTail",
				value: function extractTail() {
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					return new ContinuousTailDetails('');
				} // $FlowFixMe no ideas

			}, {
				key: "appendTail",
				value: function appendTail(tail) {
					if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
					return tail.appendTo(this);
				}
			}, {
				key: "append",
				value: function append(str, flags, tail) {
					var details = this._appendChar(str, flags);

					if (tail != null) {
						details.tailShift += this.appendTail(tail).tailShift;
					}

					return details;
				}
			}, {
				key: "doCommit",
				value: function doCommit() { }
			}, {
				key: "value",
				get: function get() {
					return this._value;
				}
			}, {
				key: "unmaskedValue",
				get: function get() {
					return this.isUnmasking ? this.value : '';
				}
			}, {
				key: "isComplete",
				get: function get() {
					return true;
				}
			}, {
				key: "state",
				get: function get() {
					return {
						_value: this._value,
						_isRawInput: this._isRawInput
					};
				},
				set: function set(state) {
					Object.assign(this, state);
				}
			}]);

			return PatternFixedDefinition;
		}();

	var ChunksTailDetails =
		/*#__PURE__*/
		function () {
			/** */
			function ChunksTailDetails() {
				var chunks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
				var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

				_classCallCheck(this, ChunksTailDetails);

				this.chunks = chunks;
				this.from = from;
			}

			_createClass(ChunksTailDetails, [{
				key: "toString",
				value: function toString() {
					return this.chunks.map(String).join('');
				} // $FlowFixMe no ideas

			}, {
				key: "extend",
				value: function extend(tailChunk) {
					if (!String(tailChunk)) return;
					if (isString(tailChunk)) tailChunk = new ContinuousTailDetails(String(tailChunk));
					var lastChunk = this.chunks[this.chunks.length - 1];
					var extendLast = lastChunk && ( // if stops are same or tail has no stop
						lastChunk.stop === tailChunk.stop || tailChunk.stop == null) && // if tail chunk goes just after last chunk
						tailChunk.from === lastChunk.from + lastChunk.toString().length;

					if (tailChunk instanceof ContinuousTailDetails) {
						// check the ability to extend previous chunk
						if (extendLast) {
							// extend previous chunk
							lastChunk.extend(tailChunk.toString());
						} else {
							// append new chunk
							this.chunks.push(tailChunk);
						}
					} else if (tailChunk instanceof ChunksTailDetails) {
						if (tailChunk.stop == null) {
							// unwrap floating chunks to parent, keeping `from` pos
							var firstTailChunk;

							while (tailChunk.chunks.length && tailChunk.chunks[0].stop == null) {
								firstTailChunk = tailChunk.chunks.shift();
								firstTailChunk.from += tailChunk.from;
								this.extend(firstTailChunk);
							}
						} // if tail chunk still has value


						if (tailChunk.toString()) {
							// if chunks contains stops, then popup stop to container
							tailChunk.stop = tailChunk.blockIndex;
							this.chunks.push(tailChunk);
						}
					}
				}
			}, {
				key: "appendTo",
				value: function appendTo(masked) {
					// $FlowFixMe
					if (!(masked instanceof IMask.MaskedPattern)) {
						var tail = new ContinuousTailDetails(this.toString());
						return tail.appendTo(masked);
					}

					var details = new ChangeDetails();

					for (var ci = 0; ci < this.chunks.length && !details.skip; ++ci) {
						var chunk = this.chunks[ci];

						var lastBlockIter = masked._mapPosToBlock(masked.value.length);

						var stop = chunk.stop;
						var chunkBlock = void 0;

						if (stop && ( // if block not found or stop is behind lastBlock
							!lastBlockIter || lastBlockIter.index <= stop)) {
							if (chunk instanceof ChunksTailDetails || // for continuous block also check if stop is exist
								masked._stops.indexOf(stop) >= 0) {
								details.aggregate(masked._appendPlaceholder(stop));
							}

							chunkBlock = chunk instanceof ChunksTailDetails && masked._blocks[stop];
						}

						if (chunkBlock) {
							var tailDetails = chunkBlock.appendTail(chunk);
							tailDetails.skip = false; // always ignore skip, it will be set on last

							details.aggregate(tailDetails);
							masked._value += tailDetails.inserted; // get not inserted chars

							var remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
							if (remainChars) details.aggregate(masked.append(remainChars, {
								tail: true
							}));
						} else {
							details.aggregate(masked.append(chunk.toString(), {
								tail: true
							}));
						}
					}
					return details;
				}
			}, {
				key: "shiftBefore",
				value: function shiftBefore(pos) {
					if (this.from >= pos || !this.chunks.length) return '';
					var chunkShiftPos = pos - this.from;
					var ci = 0;

					while (ci < this.chunks.length) {
						var chunk = this.chunks[ci];
						var shiftChar = chunk.shiftBefore(chunkShiftPos);

						if (chunk.toString()) {
							// chunk still contains value
							// but not shifted - means no more available chars to shift
							if (!shiftChar) break;
							++ci;
						} else {
							// clean if chunk has no value
							this.chunks.splice(ci, 1);
						}

						if (shiftChar) return shiftChar;
					}

					return '';
				}
			}, {
				key: "state",
				get: function get() {
					return {
						chunks: this.chunks.map(function (c) {
							return c.state;
						}),
						from: this.from,
						stop: this.stop,
						blockIndex: this.blockIndex
					};
				},
				set: function set(state) {
					var chunks = state.chunks,
						props = _objectWithoutProperties(state, ["chunks"]);

					Object.assign(this, props);
					this.chunks = chunks.map(function (cstate) {
						var chunk = "chunks" in cstate ? new ChunksTailDetails() : new ContinuousTailDetails(); // $FlowFixMe already checked above

						chunk.state = cstate;
						return chunk;
					});
				}
			}]);

			return ChunksTailDetails;
		}();

	/**
	  Pattern mask
	  @param {Object} opts
	  @param {Object} opts.blocks
	  @param {Object} opts.definitions
	  @param {string} opts.placeholderChar
	  @param {boolean} opts.lazy
	*/
	var MaskedPattern =
		/*#__PURE__*/
		function (_Masked) {
			_inherits(MaskedPattern, _Masked);

			/** */

			/** */

			/** Single char for empty input */

			/** Show placeholder only when needed */
			function MaskedPattern() {
				var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				_classCallCheck(this, MaskedPattern);

				// TODO type $Shape<MaskedPatternOptions>={} does not work
				opts.definitions = Object.assign({}, DEFAULT_INPUT_DEFINITIONS, opts.definitions);
				return _possibleConstructorReturn(this, _getPrototypeOf(MaskedPattern).call(this, Object.assign({}, MaskedPattern.DEFAULTS, {}, opts)));
			}
			/**
			  @override
			  @param {Object} opts
			*/


			_createClass(MaskedPattern, [{
				key: "_update",
				value: function _update() {
					var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
					opts.definitions = Object.assign({}, this.definitions, opts.definitions);

					_get(_getPrototypeOf(MaskedPattern.prototype), "_update", this).call(this, opts);

					this._rebuildMask();
				}
				/** */

			}, {
				key: "_rebuildMask",
				value: function _rebuildMask() {
					var _this = this;

					var defs = this.definitions;
					this._blocks = [];
					this._stops = [];
					this._maskedBlocks = {};
					var pattern = this.mask;
					if (!pattern || !defs) return;
					var unmaskingBlock = false;
					var optionalBlock = false;

					for (var i = 0; i < pattern.length; ++i) {
						if (this.blocks) {
							var _ret = function () {
								var p = pattern.slice(i);
								var bNames = Object.keys(_this.blocks).filter(function (bName) {
									return p.indexOf(bName) === 0;
								}); // order by key length

								bNames.sort(function (a, b) {
									return b.length - a.length;
								}); // use block name with max length

								var bName = bNames[0];

								if (bName) {
									var maskedBlock = createMask(Object.assign({
										parent: _this,
										lazy: _this.lazy,
										placeholderChar: _this.placeholderChar,
										overwrite: _this.overwrite
									}, _this.blocks[bName]));

									if (maskedBlock) {
										_this._blocks.push(maskedBlock); // store block index


										if (!_this._maskedBlocks[bName]) _this._maskedBlocks[bName] = [];

										_this._maskedBlocks[bName].push(_this._blocks.length - 1);
									}

									i += bName.length - 1;
									return "continue";
								}
							}();

							if (_ret === "continue") continue;
						}

						var char = pattern[i];

						var _isInput = char in defs;

						if (char === MaskedPattern.STOP_CHAR) {
							this._stops.push(this._blocks.length);

							continue;
						}

						if (char === '{' || char === '}') {
							unmaskingBlock = !unmaskingBlock;
							continue;
						}

						if (char === '[' || char === ']') {
							optionalBlock = !optionalBlock;
							continue;
						}

						if (char === MaskedPattern.ESCAPE_CHAR) {
							++i;
							char = pattern[i];
							if (!char) break;
							_isInput = false;
						}

						var def = _isInput ? new PatternInputDefinition({
							parent: this,
							lazy: this.lazy,
							placeholderChar: this.placeholderChar,
							mask: defs[char],
							isOptional: optionalBlock
						}) : new PatternFixedDefinition({
							char: char,
							isUnmasking: unmaskingBlock
						});

						this._blocks.push(def);
					}
				}
				/**
				  @override
				*/

			}, {
				key: "reset",

				/**
				  @override
				*/
				value: function reset() {
					_get(_getPrototypeOf(MaskedPattern.prototype), "reset", this).call(this);

					this._blocks.forEach(function (b) {
						return b.reset();
					});
				}
				/**
				  @override
				*/

			}, {
				key: "doCommit",

				/**
				  @override
				*/
				value: function doCommit() {
					this._blocks.forEach(function (b) {
						return b.doCommit();
					});

					_get(_getPrototypeOf(MaskedPattern.prototype), "doCommit", this).call(this);
				}
				/**
				  @override
				*/

			}, {
				key: "appendTail",

				/**
				  @override
				*/
				value: function appendTail(tail) {
					return _get(_getPrototypeOf(MaskedPattern.prototype), "appendTail", this).call(this, tail).aggregate(this._appendPlaceholder());
				}
				/**
				  @override
				*/

			}, {
				key: "_appendCharRaw",
				value: function _appendCharRaw(ch) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					ch = this.doPrepare(ch, flags);

					var blockIter = this._mapPosToBlock(this.value.length);

					var details = new ChangeDetails();
					if (!blockIter) return details;

					for (var bi = blockIter.index; ; ++bi) {
						var _block = this._blocks[bi];
						if (!_block) break;

						var blockDetails = _block._appendChar(ch, flags);

						var skip = blockDetails.skip;
						details.aggregate(blockDetails);
						if (skip || blockDetails.rawInserted) break; // go next char
					}

					return details;
				}
				/**
				  @override
				*/

			}, {
				key: "extractTail",
				value: function extractTail() {
					var _this2 = this;

					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					var chunkTail = new ChunksTailDetails();
					if (fromPos === toPos) return chunkTail;

					this._forEachBlocksInRange(fromPos, toPos, function (b, bi, bFromPos, bToPos) {
						var blockChunk = b.extractTail(bFromPos, bToPos);
						blockChunk.stop = _this2._findStopBefore(bi);
						blockChunk.from = _this2._blockStartPos(bi);
						if (blockChunk instanceof ChunksTailDetails) blockChunk.blockIndex = bi;
						chunkTail.extend(blockChunk);
					});

					return chunkTail;
				}
				/**
				  @override
				*/

			}, {
				key: "extractInput",
				value: function extractInput() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					var flags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
					if (fromPos === toPos) return '';
					var input = '';

					this._forEachBlocksInRange(fromPos, toPos, function (b, _, fromPos, toPos) {
						input += b.extractInput(fromPos, toPos, flags);
					});

					return input;
				}
			}, {
				key: "_findStopBefore",
				value: function _findStopBefore(blockIndex) {
					var stopBefore;

					for (var si = 0; si < this._stops.length; ++si) {
						var stop = this._stops[si];
						if (stop <= blockIndex) stopBefore = stop; else break;
					}

					return stopBefore;
				}
				/** Appends placeholder depending on laziness */

			}, {
				key: "_appendPlaceholder",
				value: function _appendPlaceholder(toBlockIndex) {
					var _this3 = this;

					var details = new ChangeDetails();
					if (this.lazy && toBlockIndex == null) return details;

					var startBlockIter = this._mapPosToBlock(this.value.length);

					if (!startBlockIter) return details;
					var startBlockIndex = startBlockIter.index;
					var endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;

					this._blocks.slice(startBlockIndex, endBlockIndex).forEach(function (b) {
						if (!b.lazy || toBlockIndex != null) {
							// $FlowFixMe `_blocks` may not be present
							var args = b._blocks != null ? [b._blocks.length] : [];

							var bDetails = b._appendPlaceholder.apply(b, args);

							_this3._value += bDetails.inserted;
							details.aggregate(bDetails);
						}
					});

					return details;
				}
				/** Finds block in pos */

			}, {
				key: "_mapPosToBlock",
				value: function _mapPosToBlock(pos) {
					var accVal = '';

					for (var bi = 0; bi < this._blocks.length; ++bi) {
						var _block2 = this._blocks[bi];
						var blockStartPos = accVal.length;
						accVal += _block2.value;

						if (pos <= accVal.length) {
							return {
								index: bi,
								offset: pos - blockStartPos
							};
						}
					}
				}
				/** */

			}, {
				key: "_blockStartPos",
				value: function _blockStartPos(blockIndex) {
					return this._blocks.slice(0, blockIndex).reduce(function (pos, b) {
						return pos += b.value.length;
					}, 0);
				}
				/** */

			}, {
				key: "_forEachBlocksInRange",
				value: function _forEachBlocksInRange(fromPos) {
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					var fn = arguments.length > 2 ? arguments[2] : undefined;

					var fromBlockIter = this._mapPosToBlock(fromPos);

					if (fromBlockIter) {
						var toBlockIter = this._mapPosToBlock(toPos); // process first block


						var isSameBlock = toBlockIter && fromBlockIter.index === toBlockIter.index;
						var fromBlockStartPos = fromBlockIter.offset;
						var fromBlockEndPos = toBlockIter && isSameBlock ? toBlockIter.offset : this._blocks[fromBlockIter.index].value.length;
						fn(this._blocks[fromBlockIter.index], fromBlockIter.index, fromBlockStartPos, fromBlockEndPos);

						if (toBlockIter && !isSameBlock) {
							// process intermediate blocks
							for (var bi = fromBlockIter.index + 1; bi < toBlockIter.index; ++bi) {
								fn(this._blocks[bi], bi, 0, this._blocks[bi].value.length);
							} // process last block


							fn(this._blocks[toBlockIter.index], toBlockIter.index, 0, toBlockIter.offset);
						}
					}
				}
				/**
				  @override
				*/

			}, {
				key: "remove",
				value: function remove() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;

					var removeDetails = _get(_getPrototypeOf(MaskedPattern.prototype), "remove", this).call(this, fromPos, toPos);

					this._forEachBlocksInRange(fromPos, toPos, function (b, _, bFromPos, bToPos) {
						removeDetails.aggregate(b.remove(bFromPos, bToPos));
					});

					return removeDetails;
				}
				/**
				  @override
				*/

			}, {
				key: "nearestInputPos",
				value: function nearestInputPos(cursorPos) {
					var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DIRECTION.NONE;
					// TODO refactor - extract alignblock
					var beginBlockData = this._mapPosToBlock(cursorPos) || {
						index: 0,
						offset: 0
					};
					var beginBlockOffset = beginBlockData.offset,
						beginBlockIndex = beginBlockData.index;
					var beginBlock = this._blocks[beginBlockIndex];
					if (!beginBlock) return cursorPos;
					var beginBlockCursorPos = beginBlockOffset; // if position inside block - try to adjust it

					if (beginBlockCursorPos !== 0 && beginBlockCursorPos < beginBlock.value.length) {
						beginBlockCursorPos = beginBlock.nearestInputPos(beginBlockOffset, forceDirection(direction));
					}

					var cursorAtRight = beginBlockCursorPos === beginBlock.value.length;
					var cursorAtLeft = beginBlockCursorPos === 0; //  cursor is INSIDE first block (not at bounds)

					if (!cursorAtLeft && !cursorAtRight) return this._blockStartPos(beginBlockIndex) + beginBlockCursorPos;
					var searchBlockIndex = cursorAtRight ? beginBlockIndex + 1 : beginBlockIndex;

					if (direction === DIRECTION.NONE) {
						// NONE direction used to calculate start input position if no chars were removed
						// FOR NONE:
						// -
						// input|any
						// ->
						//  any|input
						// <-
						//  filled-input|any
						// check if first block at left is input
						if (searchBlockIndex > 0) {
							var blockIndexAtLeft = searchBlockIndex - 1;
							var blockAtLeft = this._blocks[blockIndexAtLeft];
							var blockInputPos = blockAtLeft.nearestInputPos(0, DIRECTION.NONE); // is input

							if (!blockAtLeft.value.length || blockInputPos !== blockAtLeft.value.length) {
								return this._blockStartPos(searchBlockIndex);
							}
						} // ->


						var firstInputAtRight = searchBlockIndex;

						for (var bi = firstInputAtRight; bi < this._blocks.length; ++bi) {
							var blockAtRight = this._blocks[bi];

							var _blockInputPos = blockAtRight.nearestInputPos(0, DIRECTION.NONE);

							if (!blockAtRight.value.length || _blockInputPos !== blockAtRight.value.length) {
								return this._blockStartPos(bi) + _blockInputPos;
							}
						} // <-
						// find first non-fixed symbol


						for (var _bi = searchBlockIndex - 1; _bi >= 0; --_bi) {
							var _block3 = this._blocks[_bi];

							var _blockInputPos2 = _block3.nearestInputPos(0, DIRECTION.NONE); // is input


							if (!_block3.value.length || _blockInputPos2 !== _block3.value.length) {
								return this._blockStartPos(_bi) + _block3.value.length;
							}
						}

						return cursorPos;
					}

					if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
						// -
						//  any|filled-input
						// <-
						//  any|first not empty is not-len-aligned
						//  not-0-aligned|any
						// ->
						//  any|not-len-aligned or end
						// check if first block at right is filled input
						var firstFilledBlockIndexAtRight;

						for (var _bi2 = searchBlockIndex; _bi2 < this._blocks.length; ++_bi2) {
							if (this._blocks[_bi2].value) {
								firstFilledBlockIndexAtRight = _bi2;
								break;
							}
						}

						if (firstFilledBlockIndexAtRight != null) {
							var filledBlock = this._blocks[firstFilledBlockIndexAtRight];

							var _blockInputPos3 = filledBlock.nearestInputPos(0, DIRECTION.RIGHT);

							if (_blockInputPos3 === 0 && filledBlock.unmaskedValue.length) {
								// filled block is input
								return this._blockStartPos(firstFilledBlockIndexAtRight) + _blockInputPos3;
							}
						} // <-
						// find this vars


						var firstFilledInputBlockIndex = -1;
						var firstEmptyInputBlockIndex; // TODO consider nested empty inputs

						for (var _bi3 = searchBlockIndex - 1; _bi3 >= 0; --_bi3) {
							var _block4 = this._blocks[_bi3];

							var _blockInputPos4 = _block4.nearestInputPos(_block4.value.length, DIRECTION.FORCE_LEFT);

							if (!_block4.value || _blockInputPos4 !== 0) firstEmptyInputBlockIndex = _bi3;

							if (_blockInputPos4 !== 0) {
								if (_blockInputPos4 !== _block4.value.length) {
									// aligned inside block - return immediately
									return this._blockStartPos(_bi3) + _blockInputPos4;
								} else {
									// found filled
									firstFilledInputBlockIndex = _bi3;
									break;
								}
							}
						}

						if (direction === DIRECTION.LEFT) {
							// try find first empty input before start searching position only when not forced
							for (var _bi4 = firstFilledInputBlockIndex + 1; _bi4 <= Math.min(searchBlockIndex, this._blocks.length - 1); ++_bi4) {
								var _block5 = this._blocks[_bi4];

								var _blockInputPos5 = _block5.nearestInputPos(0, DIRECTION.NONE);

								var blockAlignedPos = this._blockStartPos(_bi4) + _blockInputPos5;

								if (blockAlignedPos > cursorPos) break; // if block is not lazy input

								if (_blockInputPos5 !== _block5.value.length) return blockAlignedPos;
							}
						} // process overflow


						if (firstFilledInputBlockIndex >= 0) {
							return this._blockStartPos(firstFilledInputBlockIndex) + this._blocks[firstFilledInputBlockIndex].value.length;
						} // for lazy if has aligned left inside fixed and has came to the start - use start position


						if (direction === DIRECTION.FORCE_LEFT || this.lazy && !this.extractInput() && !isInput(this._blocks[searchBlockIndex])) {
							return 0;
						}

						if (firstEmptyInputBlockIndex != null) {
							return this._blockStartPos(firstEmptyInputBlockIndex);
						} // find first input


						for (var _bi5 = searchBlockIndex; _bi5 < this._blocks.length; ++_bi5) {
							var _block6 = this._blocks[_bi5];

							var _blockInputPos6 = _block6.nearestInputPos(0, DIRECTION.NONE); // is input


							if (!_block6.value.length || _blockInputPos6 !== _block6.value.length) {
								return this._blockStartPos(_bi5) + _blockInputPos6;
							}
						}

						return 0;
					}

					if (direction === DIRECTION.RIGHT || direction === DIRECTION.FORCE_RIGHT) {
						// ->
						//  any|not-len-aligned and filled
						//  any|not-len-aligned
						// <-
						//  not-0-aligned or start|any
						var firstInputBlockAlignedIndex;
						var firstInputBlockAlignedPos;

						for (var _bi6 = searchBlockIndex; _bi6 < this._blocks.length; ++_bi6) {
							var _block7 = this._blocks[_bi6];

							var _blockInputPos7 = _block7.nearestInputPos(0, DIRECTION.NONE);

							if (_blockInputPos7 !== _block7.value.length) {
								firstInputBlockAlignedPos = this._blockStartPos(_bi6) + _blockInputPos7;
								firstInputBlockAlignedIndex = _bi6;
								break;
							}
						}

						if (firstInputBlockAlignedIndex != null && firstInputBlockAlignedPos != null) {
							for (var _bi7 = firstInputBlockAlignedIndex; _bi7 < this._blocks.length; ++_bi7) {
								var _block8 = this._blocks[_bi7];

								var _blockInputPos8 = _block8.nearestInputPos(0, DIRECTION.FORCE_RIGHT);

								if (_blockInputPos8 !== _block8.value.length) {
									return this._blockStartPos(_bi7) + _blockInputPos8;
								}
							}

							return direction === DIRECTION.FORCE_RIGHT ? this.value.length : firstInputBlockAlignedPos;
						}

						for (var _bi8 = Math.min(searchBlockIndex, this._blocks.length - 1); _bi8 >= 0; --_bi8) {
							var _block9 = this._blocks[_bi8];

							var _blockInputPos9 = _block9.nearestInputPos(_block9.value.length, DIRECTION.LEFT);

							if (_blockInputPos9 !== 0) {
								var alignedPos = this._blockStartPos(_bi8) + _blockInputPos9;

								if (alignedPos >= cursorPos) return alignedPos;
								break;
							}
						}
					}

					return cursorPos;
				}
				/** Get block by name */

			}, {
				key: "maskedBlock",
				value: function maskedBlock(name) {
					return this.maskedBlocks(name)[0];
				}
				/** Get all blocks by name */

			}, {
				key: "maskedBlocks",
				value: function maskedBlocks(name) {
					var _this4 = this;

					var indices = this._maskedBlocks[name];
					if (!indices) return [];
					return indices.map(function (gi) {
						return _this4._blocks[gi];
					});
				}
			}, {
				key: "state",
				get: function get() {
					return Object.assign({}, _get(_getPrototypeOf(MaskedPattern.prototype), "state", this), {
						_blocks: this._blocks.map(function (b) {
							return b.state;
						})
					});
				},
				set: function set(state) {
					var _blocks = state._blocks,
						maskedState = _objectWithoutProperties(state, ["_blocks"]);

					this._blocks.forEach(function (b, bi) {
						return b.state = _blocks[bi];
					});

					_set(_getPrototypeOf(MaskedPattern.prototype), "state", maskedState, this, true);
				}
			}, {
				key: "isComplete",
				get: function get() {
					return this._blocks.every(function (b) {
						return b.isComplete;
					});
				}
			}, {
				key: "unmaskedValue",
				get: function get() {
					return this._blocks.reduce(function (str, b) {
						return str += b.unmaskedValue;
					}, '');
				},
				set: function set(unmaskedValue) {
					_set(_getPrototypeOf(MaskedPattern.prototype), "unmaskedValue", unmaskedValue, this, true);
				}
				/**
				  @override
				*/

			}, {
				key: "value",
				get: function get() {
					// TODO return _value when not in change?
					return this._blocks.reduce(function (str, b) {
						return str += b.value;
					}, '');
				},
				set: function set(value) {
					_set(_getPrototypeOf(MaskedPattern.prototype), "value", value, this, true);
				}
			}]);

			return MaskedPattern;
		}(Masked);
	MaskedPattern.DEFAULTS = {
		lazy: true,
		placeholderChar: '_'
	};
	MaskedPattern.STOP_CHAR = '`';
	MaskedPattern.ESCAPE_CHAR = '\\';
	MaskedPattern.InputDefinition = PatternInputDefinition;
	MaskedPattern.FixedDefinition = PatternFixedDefinition;

	function isInput(block) {
		if (!block) return false;
		var value = block.value;
		return !value || block.nearestInputPos(0, DIRECTION.NONE) !== value.length;
	}

	IMask.MaskedPattern = MaskedPattern;

	/** Pattern which accepts ranges */

	var MaskedRange =
		/*#__PURE__*/
		function (_MaskedPattern) {
			_inherits(MaskedRange, _MaskedPattern);

			function MaskedRange() {
				_classCallCheck(this, MaskedRange);

				return _possibleConstructorReturn(this, _getPrototypeOf(MaskedRange).apply(this, arguments));
			}

			_createClass(MaskedRange, [{
				key: "_update",

				/**
				  @override
				*/
				value: function _update(opts) {
					// TODO type
					opts = Object.assign({
						to: this.to || 0,
						from: this.from || 0
					}, opts);
					var maxLength = String(opts.to).length;
					if (opts.maxLength != null) maxLength = Math.max(maxLength, opts.maxLength);
					opts.maxLength = maxLength;
					var fromStr = String(opts.from).padStart(maxLength, '0');
					var toStr = String(opts.to).padStart(maxLength, '0');
					var sameCharsCount = 0;

					while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) {
						++sameCharsCount;
					}

					opts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, '\\0') + '0'.repeat(maxLength - sameCharsCount);

					_get(_getPrototypeOf(MaskedRange.prototype), "_update", this).call(this, opts);
				}
				/**
				  @override
				*/

			}, {
				key: "boundaries",
				value: function boundaries(str) {
					var minstr = '';
					var maxstr = '';

					var _ref = str.match(/^(\D*)(\d*)(\D*)/) || [],
						_ref2 = _slicedToArray(_ref, 3),
						placeholder = _ref2[1],
						num = _ref2[2];

					if (num) {
						minstr = '0'.repeat(placeholder.length) + num;
						maxstr = '9'.repeat(placeholder.length) + num;
					}

					minstr = minstr.padEnd(this.maxLength, '0');
					maxstr = maxstr.padEnd(this.maxLength, '9');
					return [minstr, maxstr];
				}
				/**
				  @override
				*/

			}, {
				key: "doPrepare",
				value: function doPrepare(str) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					str = _get(_getPrototypeOf(MaskedRange.prototype), "doPrepare", this).call(this, str, flags).replace(/\D/g, '');
					if (!this.autofix) return str;
					var fromStr = String(this.from).padStart(this.maxLength, '0');
					var toStr = String(this.to).padStart(this.maxLength, '0');
					var val = this.value;
					var prepStr = '';

					for (var ci = 0; ci < str.length; ++ci) {
						var nextVal = val + prepStr + str[ci];

						var _this$boundaries = this.boundaries(nextVal),
							_this$boundaries2 = _slicedToArray(_this$boundaries, 2),
							minstr = _this$boundaries2[0],
							maxstr = _this$boundaries2[1];

						if (Number(maxstr) < this.from) prepStr += fromStr[nextVal.length - 1]; else if (Number(minstr) > this.to) prepStr += toStr[nextVal.length - 1]; else prepStr += str[ci];
					}

					return prepStr;
				}
				/**
				  @override
				*/

			}, {
				key: "doValidate",
				value: function doValidate() {
					var _get2;

					var str = this.value;
					var firstNonZero = str.search(/[^0]/);
					if (firstNonZero === -1 && str.length <= this._matchFrom) return true;

					var _this$boundaries3 = this.boundaries(str),
						_this$boundaries4 = _slicedToArray(_this$boundaries3, 2),
						minstr = _this$boundaries4[0],
						maxstr = _this$boundaries4[1];

					for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					return this.from <= Number(maxstr) && Number(minstr) <= this.to && (_get2 = _get(_getPrototypeOf(MaskedRange.prototype), "doValidate", this)).call.apply(_get2, [this].concat(args));
				}
			}, {
				key: "_matchFrom",

				/**
				  Optionally sets max length of pattern.
				  Used when pattern length is longer then `to` param length. Pads zeros at start in this case.
				*/

				/** Min bound */

				/** Max bound */

				/** */
				get: function get() {
					return this.maxLength - String(this.from).length;
				}
			}, {
				key: "isComplete",
				get: function get() {
					return _get(_getPrototypeOf(MaskedRange.prototype), "isComplete", this) && Boolean(this.value);
				}
			}]);

			return MaskedRange;
		}(MaskedPattern);
	IMask.MaskedRange = MaskedRange;

	/** Date mask */

	var MaskedDate =
		/*#__PURE__*/
		function (_MaskedPattern) {
			_inherits(MaskedDate, _MaskedPattern);

			/** Pattern mask for date according to {@link MaskedDate#format} */

			/** Start date */

			/** End date */

			/** */

			/**
			  @param {Object} opts
			*/
			function MaskedDate(opts) {
				_classCallCheck(this, MaskedDate);

				return _possibleConstructorReturn(this, _getPrototypeOf(MaskedDate).call(this, Object.assign({}, MaskedDate.DEFAULTS, {}, opts)));
			}
			/**
			  @override
			*/


			_createClass(MaskedDate, [{
				key: "_update",
				value: function _update(opts) {
					if (opts.mask === Date) delete opts.mask;
					if (opts.pattern) opts.mask = opts.pattern;
					var blocks = opts.blocks;
					opts.blocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS()); // adjust year block

					if (opts.min) opts.blocks.Y.from = opts.min.getFullYear();
					if (opts.max) opts.blocks.Y.to = opts.max.getFullYear();

					if (opts.min && opts.max && opts.blocks.Y.from === opts.blocks.Y.to) {
						opts.blocks.m.from = opts.min.getMonth() + 1;
						opts.blocks.m.to = opts.max.getMonth() + 1;

						if (opts.blocks.m.from === opts.blocks.m.to) {
							opts.blocks.d.from = opts.min.getDate();
							opts.blocks.d.to = opts.max.getDate();
						}
					}

					Object.assign(opts.blocks, blocks); // add autofix

					Object.keys(opts.blocks).forEach(function (bk) {
						var b = opts.blocks[bk];
						if (!('autofix' in b)) b.autofix = opts.autofix;
					});

					_get(_getPrototypeOf(MaskedDate.prototype), "_update", this).call(this, opts);
				}
				/**
				  @override
				*/

			}, {
				key: "doValidate",
				value: function doValidate() {
					var _get2;

					var date = this.date;

					for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					return (_get2 = _get(_getPrototypeOf(MaskedDate.prototype), "doValidate", this)).call.apply(_get2, [this].concat(args)) && (!this.isComplete || this.isDateExist(this.value) && date != null && (this.min == null || this.min <= date) && (this.max == null || date <= this.max));
				}
				/** Checks if date is exists */

			}, {
				key: "isDateExist",
				value: function isDateExist(str) {
					return this.format(this.parse(str, this), this).indexOf(str) >= 0;
				}
				/** Parsed Date */

			}, {
				key: "date",
				get: function get() {
					return this.typedValue;
				},
				set: function set(date) {
					this.typedValue = date;
				}
				/**
				  @override
				*/

			}, {
				key: "typedValue",
				get: function get() {
					return this.isComplete ? _get(_getPrototypeOf(MaskedDate.prototype), "typedValue", this) : null;
				},
				set: function set(value) {
					_set(_getPrototypeOf(MaskedDate.prototype), "typedValue", value, this, true);
				}
			}]);

			return MaskedDate;
		}(MaskedPattern);
	MaskedDate.DEFAULTS = {
		pattern: 'd{.}`m{.}`Y',
		format: function format(date) {
			var day = String(date.getDate()).padStart(2, '0');
			var month = String(date.getMonth() + 1).padStart(2, '0');
			var year = date.getFullYear();
			return [day, month, year].join('.');
		},
		parse: function parse(str) {
			var _str$split = str.split('.'),
				_str$split2 = _slicedToArray(_str$split, 3),
				day = _str$split2[0],
				month = _str$split2[1],
				year = _str$split2[2];

			return new Date(year, month - 1, day);
		}
	};

	MaskedDate.GET_DEFAULT_BLOCKS = function () {
		return {
			d: {
				mask: MaskedRange,
				from: 1,
				to: 31,
				maxLength: 2
			},
			m: {
				mask: MaskedRange,
				from: 1,
				to: 12,
				maxLength: 2
			},
			Y: {
				mask: MaskedRange,
				from: 1900,
				to: 9999
			}
		};
	};

	IMask.MaskedDate = MaskedDate;

	/**
	  Generic element API to use with mask
	  @interface
	*/
	var MaskElement =
		/*#__PURE__*/
		function () {
			function MaskElement() {
				_classCallCheck(this, MaskElement);
			}

			_createClass(MaskElement, [{
				key: "select",

				/** Safely sets element selection */
				value: function select(start, end) {
					if (start == null || end == null || start === this.selectionStart && end === this.selectionEnd) return;

					try {
						this._unsafeSelect(start, end);
					} catch (e) { }
				}
				/** Should be overriden in subclasses */

			}, {
				key: "_unsafeSelect",
				value: function _unsafeSelect(start, end) { }
				/** Should be overriden in subclasses */

			}, {
				key: "bindEvents",

				/** Should be overriden in subclasses */
				value: function bindEvents(handlers) { }
				/** Should be overriden in subclasses */

			}, {
				key: "unbindEvents",
				value: function unbindEvents() { }
			}, {
				key: "selectionStart",

				/** */

				/** */

				/** */

				/** Safely returns selection start */
				get: function get() {
					var start;

					try {
						start = this._unsafeSelectionStart;
					} catch (e) { }

					return start != null ? start : this.value.length;
				}
				/** Safely returns selection end */

			}, {
				key: "selectionEnd",
				get: function get() {
					var end;

					try {
						end = this._unsafeSelectionEnd;
					} catch (e) { }

					return end != null ? end : this.value.length;
				}
			}, {
				key: "isActive",
				get: function get() {
					return false;
				}
			}]);

			return MaskElement;
		}();
	IMask.MaskElement = MaskElement;

	/** Bridge between HTMLElement and {@link Masked} */

	var HTMLMaskElement =
		/*#__PURE__*/
		function (_MaskElement) {
			_inherits(HTMLMaskElement, _MaskElement);

			/** Mapping between HTMLElement events and mask internal events */

			/** HTMLElement to use mask on */

			/**
			  @param {HTMLInputElement|HTMLTextAreaElement} input
			*/
			function HTMLMaskElement(input) {
				var _this;

				_classCallCheck(this, HTMLMaskElement);

				_this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLMaskElement).call(this));
				_this.input = input;
				_this._handlers = {};
				return _this;
			}
			/** */
			// $FlowFixMe https://github.com/facebook/flow/issues/2839


			_createClass(HTMLMaskElement, [{
				key: "_unsafeSelect",

				/**
				  Sets HTMLElement selection
				  @override
				*/
				value: function _unsafeSelect(start, end) {
					this.input.setSelectionRange(start, end);
				}
				/**
				  HTMLElement value
				  @override
				*/

			}, {
				key: "bindEvents",

				/**
				  Binds HTMLElement events to mask internal events
				  @override
				*/
				value: function bindEvents(handlers) {
					var _this2 = this;

					Object.keys(handlers).forEach(function (event) {
						return _this2._toggleEventHandler(HTMLMaskElement.EVENTS_MAP[event], handlers[event]);
					});
				}
				/**
				  Unbinds HTMLElement events to mask internal events
				  @override
				*/

			}, {
				key: "unbindEvents",
				value: function unbindEvents() {
					var _this3 = this;

					Object.keys(this._handlers).forEach(function (event) {
						return _this3._toggleEventHandler(event);
					});
				}
				/** */

			}, {
				key: "_toggleEventHandler",
				value: function _toggleEventHandler(event, handler) {
					if (this._handlers[event]) {
						this.input.removeEventListener(event, this._handlers[event]);
						delete this._handlers[event];
					}

					if (handler) {
						this.input.addEventListener(event, handler);
						this._handlers[event] = handler;
					}
				}
			}, {
				key: "rootElement",
				get: function get() {
					return this.input.getRootNode ? this.input.getRootNode() : document;
				}
				/**
				  Is element in focus
				  @readonly
				*/

			}, {
				key: "isActive",
				get: function get() {
					//$FlowFixMe
					return this.input === this.rootElement.activeElement;
				}
				/**
				  Returns HTMLElement selection start
				  @override
				*/

			}, {
				key: "_unsafeSelectionStart",
				get: function get() {
					return this.input.selectionStart;
				}
				/**
				  Returns HTMLElement selection end
				  @override
				*/

			}, {
				key: "_unsafeSelectionEnd",
				get: function get() {
					return this.input.selectionEnd;
				}
			}, {
				key: "value",
				get: function get() {
					return this.input.value;
				},
				set: function set(value) {
					this.input.value = value;
				}
			}]);

			return HTMLMaskElement;
		}(MaskElement);
	HTMLMaskElement.EVENTS_MAP = {
		selectionChange: 'keydown',
		input: 'input',
		drop: 'drop',
		click: 'click',
		focus: 'focus',
		commit: 'blur'
	};
	IMask.HTMLMaskElement = HTMLMaskElement;

	var HTMLContenteditableMaskElement =
		/*#__PURE__*/
		function (_HTMLMaskElement) {
			_inherits(HTMLContenteditableMaskElement, _HTMLMaskElement);

			function HTMLContenteditableMaskElement() {
				_classCallCheck(this, HTMLContenteditableMaskElement);

				return _possibleConstructorReturn(this, _getPrototypeOf(HTMLContenteditableMaskElement).apply(this, arguments));
			}

			_createClass(HTMLContenteditableMaskElement, [{
				key: "_unsafeSelect",

				/**
				  Sets HTMLElement selection
				  @override
				*/
				value: function _unsafeSelect(start, end) {
					if (!this.rootElement.createRange) return;
					var range = this.rootElement.createRange();
					range.setStart(this.input.firstChild || this.input, start);
					range.setEnd(this.input.lastChild || this.input, end);
					var root = this.rootElement;
					var selection = root.getSelection && root.getSelection();

					if (selection) {
						selection.removeAllRanges();
						selection.addRange(range);
					}
				}
				/**
				  HTMLElement value
				  @override
				*/

			}, {
				key: "_unsafeSelectionStart",

				/**
				  Returns HTMLElement selection start
				  @override
				*/
				get: function get() {
					var root = this.rootElement;
					var selection = root.getSelection && root.getSelection();
					return selection && selection.anchorOffset;
				}
				/**
				  Returns HTMLElement selection end
				  @override
				*/

			}, {
				key: "_unsafeSelectionEnd",
				get: function get() {
					var root = this.rootElement;
					var selection = root.getSelection && root.getSelection();
					return selection && this._unsafeSelectionStart + String(selection).length;
				}
			}, {
				key: "value",
				get: function get() {
					// $FlowFixMe
					return this.input.textContent;
				},
				set: function set(value) {
					this.input.textContent = value;
				}
			}]);

			return HTMLContenteditableMaskElement;
		}(HTMLMaskElement);
	IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;

	/** Listens to element events and controls changes between element and {@link Masked} */

	var InputMask =
		/*#__PURE__*/
		function () {
			/**
			  View element
			  @readonly
			*/

			/**
			  Internal {@link Masked} model
			  @readonly
			*/

			/**
			  @param {MaskElement|HTMLInputElement|HTMLTextAreaElement} el
			  @param {Object} opts
			*/
			function InputMask(el, opts) {
				_classCallCheck(this, InputMask);

				this.el = el instanceof MaskElement ? el : el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' ? new HTMLContenteditableMaskElement(el) : new HTMLMaskElement(el);
				this.masked = createMask(opts);
				this._listeners = {};
				this._value = '';
				this._unmaskedValue = '';
				this._saveSelection = this._saveSelection.bind(this);
				this._onInput = this._onInput.bind(this);
				this._onChange = this._onChange.bind(this);
				this._onDrop = this._onDrop.bind(this);
				this._onFocus = this._onFocus.bind(this);
				this._onClick = this._onClick.bind(this);
				this.alignCursor = this.alignCursor.bind(this);
				this.alignCursorFriendly = this.alignCursorFriendly.bind(this);

				this._bindEvents(); // refresh


				this.updateValue();

				this._onChange();
			}
			/** Read or update mask */


			_createClass(InputMask, [{
				key: "maskEquals",
				value: function maskEquals(mask) {
					return mask == null || mask === this.masked.mask || mask === Date && this.masked instanceof MaskedDate;
				}
			}, {
				key: "_bindEvents",

				/**
				  Starts listening to element events
				  @protected
				*/
				value: function _bindEvents() {
					this.el.bindEvents({
						selectionChange: this._saveSelection,
						input: this._onInput,
						drop: this._onDrop,
						click: this._onClick,
						focus: this._onFocus,
						commit: this._onChange
					});
				}
				/**
				  Stops listening to element events
				  @protected
				 */

			}, {
				key: "_unbindEvents",
				value: function _unbindEvents() {
					if (this.el) this.el.unbindEvents();
				}
				/**
				  Fires custom event
				  @protected
				 */

			}, {
				key: "_fireEvent",
				value: function _fireEvent(ev) {
					var listeners = this._listeners[ev];
					if (!listeners) return;
					listeners.forEach(function (l) {
						return l();
					});
				}
				/**
				  Current selection start
				  @readonly
				*/

			}, {
				key: "_saveSelection",

				/**
				  Stores current selection
				  @protected
				*/
				value: function _saveSelection()
	    /* ev */ {
					if (this.value !== this.el.value) {
						console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
					}

					this._selection = {
						start: this.selectionStart,
						end: this.cursorPos
					};
				}
				/** Syncronizes model value from view */

			}, {
				key: "updateValue",
				value: function updateValue() {
					this.masked.value = this.el.value;
					this._value = this.masked.value;
				}
				/** Syncronizes view from model value, fires change events */

			}, {
				key: "updateControl",
				value: function updateControl() {
					var newUnmaskedValue = this.masked.unmaskedValue;
					var newValue = this.masked.value;
					var isChanged = this.unmaskedValue !== newUnmaskedValue || this.value !== newValue;
					this._unmaskedValue = newUnmaskedValue;
					this._value = newValue;
					if (this.el.value !== newValue) this.el.value = newValue;
					if (isChanged) this._fireChangeEvents();
				}
				/** Updates options with deep equal check, recreates @{link Masked} model if mask type changes */

			}, {
				key: "updateOptions",
				value: function updateOptions(opts) {
					var mask = opts.mask,
						restOpts = _objectWithoutProperties(opts, ["mask"]);

					var updateMask = !this.maskEquals(mask);
					var updateOpts = !objectIncludes(this.masked, restOpts);
					if (updateMask) this.mask = mask;
					if (updateOpts) this.masked.updateOptions(restOpts);
					if (updateMask || updateOpts) this.updateControl();
				}
				/** Updates cursor */

			}, {
				key: "updateCursor",
				value: function updateCursor(cursorPos) {
					if (cursorPos == null) return;
					this.cursorPos = cursorPos; // also queue change cursor for mobile browsers

					this._delayUpdateCursor(cursorPos);
				}
				/**
				  Delays cursor update to support mobile browsers
				  @private
				*/

			}, {
				key: "_delayUpdateCursor",
				value: function _delayUpdateCursor(cursorPos) {
					var _this = this;

					this._abortUpdateCursor();

					this._changingCursorPos = cursorPos;
					this._cursorChanging = setTimeout(function () {
						if (!_this.el) return; // if was destroyed

						_this.cursorPos = _this._changingCursorPos;

						_this._abortUpdateCursor();
					}, 10);
				}
				/**
				  Fires custom events
				  @protected
				*/

			}, {
				key: "_fireChangeEvents",
				value: function _fireChangeEvents() {
					this._fireEvent('accept');

					if (this.masked.isComplete) this._fireEvent('complete');
				}
				/**
				  Aborts delayed cursor update
				  @private
				*/

			}, {
				key: "_abortUpdateCursor",
				value: function _abortUpdateCursor() {
					if (this._cursorChanging) {
						clearTimeout(this._cursorChanging);
						delete this._cursorChanging;
					}
				}
				/** Aligns cursor to nearest available position */

			}, {
				key: "alignCursor",
				value: function alignCursor() {
					this.cursorPos = this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT);
				}
				/** Aligns cursor only if selection is empty */

			}, {
				key: "alignCursorFriendly",
				value: function alignCursorFriendly() {
					if (this.selectionStart !== this.cursorPos) return; // skip if range is selected

					this.alignCursor();
				}
				/** Adds listener on custom event */

			}, {
				key: "on",
				value: function on(ev, handler) {
					if (!this._listeners[ev]) this._listeners[ev] = [];

					this._listeners[ev].push(handler);

					return this;
				}
				/** Removes custom event listener */

			}, {
				key: "off",
				value: function off(ev, handler) {
					if (!this._listeners[ev]) return this;

					if (!handler) {
						delete this._listeners[ev];
						return this;
					}

					var hIndex = this._listeners[ev].indexOf(handler);

					if (hIndex >= 0) this._listeners[ev].splice(hIndex, 1);
					return this;
				}
				/** Handles view input event */

			}, {
				key: "_onInput",
				value: function _onInput() {
					this._abortUpdateCursor(); // fix strange IE behavior


					if (!this._selection) return this.updateValue();
					var details = new ActionDetails( // new state
						this.el.value, this.cursorPos, // old state
						this.value, this._selection);
					var oldRawValue = this.masked.rawInputValue;
					var offset = this.masked.splice(details.startChangePos, details.removed.length, details.inserted, details.removeDirection).offset; // force align in remove direction only if no input chars were removed
					// otherwise we still need to align with NONE (to get out from fixed symbols for instance)

					var removeDirection = oldRawValue === this.masked.rawInputValue ? details.removeDirection : DIRECTION.NONE;
					var cursorPos = this.masked.nearestInputPos(details.startChangePos + offset, removeDirection);
					this.updateControl();
					this.updateCursor(cursorPos);
				}
				/** Handles view change event and commits model value */

			}, {
				key: "_onChange",
				value: function _onChange() {
					if (this.value !== this.el.value) {
						this.updateValue();
					}

					this.masked.doCommit();
					this.updateControl();

					this._saveSelection();
				}
				/** Handles view drop event, prevents by default */

			}, {
				key: "_onDrop",
				value: function _onDrop(ev) {
					ev.preventDefault();
					ev.stopPropagation();
				}
				/** Restore last selection on focus */

			}, {
				key: "_onFocus",
				value: function _onFocus(ev) {
					this.alignCursorFriendly();
				}
				/** Restore last selection on focus */

			}, {
				key: "_onClick",
				value: function _onClick(ev) {
					this.alignCursorFriendly();
				}
				/** Unbind view events and removes element reference */

			}, {
				key: "destroy",
				value: function destroy() {
					this._unbindEvents(); // $FlowFixMe why not do so?


					this._listeners.length = 0; // $FlowFixMe

					delete this.el;
				}
			}, {
				key: "mask",
				get: function get() {
					return this.masked.mask;
				},
				set: function set(mask) {
					if (this.maskEquals(mask)) return;

					if (this.masked.constructor === maskedClass(mask)) {
						this.masked.updateOptions({
							mask: mask
						});
						return;
					}

					var masked = createMask({
						mask: mask
					});
					masked.unmaskedValue = this.masked.unmaskedValue;
					this.masked = masked;
				}
				/** Raw value */

			}, {
				key: "value",
				get: function get() {
					return this._value;
				},
				set: function set(str) {
					this.masked.value = str;
					this.updateControl();
					this.alignCursor();
				}
				/** Unmasked value */

			}, {
				key: "unmaskedValue",
				get: function get() {
					return this._unmaskedValue;
				},
				set: function set(str) {
					this.masked.unmaskedValue = str;
					this.updateControl();
					this.alignCursor();
				}
				/** Typed unmasked value */

			}, {
				key: "typedValue",
				get: function get() {
					return this.masked.typedValue;
				},
				set: function set(val) {
					this.masked.typedValue = val;
					this.updateControl();
					this.alignCursor();
				}
			}, {
				key: "selectionStart",
				get: function get() {
					return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
				}
				/** Current cursor position */

			}, {
				key: "cursorPos",
				get: function get() {
					return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
				},
				set: function set(pos) {
					if (!this.el.isActive) return;
					this.el.select(pos, pos);

					this._saveSelection();
				}
			}]);

			return InputMask;
		}();
	IMask.InputMask = InputMask;

	/** Pattern which validates enum values */

	var MaskedEnum =
		/*#__PURE__*/
		function (_MaskedPattern) {
			_inherits(MaskedEnum, _MaskedPattern);

			function MaskedEnum() {
				_classCallCheck(this, MaskedEnum);

				return _possibleConstructorReturn(this, _getPrototypeOf(MaskedEnum).apply(this, arguments));
			}

			_createClass(MaskedEnum, [{
				key: "_update",

				/**
				  @override
				  @param {Object} opts
				*/
				value: function _update(opts) {
					// TODO type
					if (opts.enum) opts.mask = '*'.repeat(opts.enum[0].length);

					_get(_getPrototypeOf(MaskedEnum.prototype), "_update", this).call(this, opts);
				}
				/**
				  @override
				*/

			}, {
				key: "doValidate",
				value: function doValidate() {
					var _this = this,
						_get2;

					for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					return this.enum.some(function (e) {
						return e.indexOf(_this.unmaskedValue) >= 0;
					}) && (_get2 = _get(_getPrototypeOf(MaskedEnum.prototype), "doValidate", this)).call.apply(_get2, [this].concat(args));
				}
			}]);

			return MaskedEnum;
		}(MaskedPattern);
	IMask.MaskedEnum = MaskedEnum;

	/**
	  Number mask
	  @param {Object} opts
	  @param {string} opts.radix - Single char
	  @param {string} opts.thousandsSeparator - Single char
	  @param {Array<string>} opts.mapToRadix - Array of single chars
	  @param {number} opts.min
	  @param {number} opts.max
	  @param {number} opts.scale - Digits after point
	  @param {boolean} opts.signed - Allow negative
	  @param {boolean} opts.normalizeZeros - Flag to remove leading and trailing zeros in the end of editing
	  @param {boolean} opts.padFractionalZeros - Flag to pad trailing zeros after point in the end of editing
	*/
	var MaskedNumber =
		/*#__PURE__*/
		function (_Masked) {
			_inherits(MaskedNumber, _Masked);

			/** Single char */

			/** Single char */

			/** Array of single chars */

			/** */

			/** */

			/** Digits after point */

			/** */

			/** Flag to remove leading and trailing zeros in the end of editing */

			/** Flag to pad trailing zeros after point in the end of editing */
			function MaskedNumber(opts) {
				_classCallCheck(this, MaskedNumber);

				return _possibleConstructorReturn(this, _getPrototypeOf(MaskedNumber).call(this, Object.assign({}, MaskedNumber.DEFAULTS, {}, opts)));
			}
			/**
			  @override
			*/


			_createClass(MaskedNumber, [{
				key: "_update",
				value: function _update(opts) {
					_get(_getPrototypeOf(MaskedNumber.prototype), "_update", this).call(this, opts);

					this._updateRegExps();
				}
				/** */

			}, {
				key: "_updateRegExps",
				value: function _updateRegExps() {
					// use different regexp to process user input (more strict, input suffix) and tail shifting
					var start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
					var midInput = '(0|([1-9]+\\d*))?';
					var mid = '\\d*';
					var end = (this.scale ? '(' + escapeRegExp(this.radix) + '\\d{0,' + this.scale + '})?' : '') + '$';
					this._numberRegExpInput = new RegExp(start + midInput + end);
					this._numberRegExp = new RegExp(start + mid + end);
					this._mapToRadixRegExp = new RegExp('[' + this.mapToRadix.map(escapeRegExp).join('') + ']', 'g');
					this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
				}
				/** */

			}, {
				key: "_removeThousandsSeparators",
				value: function _removeThousandsSeparators(value) {
					return value.replace(this._thousandsSeparatorRegExp, '');
				}
				/** */

			}, {
				key: "_insertThousandsSeparators",
				value: function _insertThousandsSeparators(value) {
					// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
					var parts = value.split(this.radix);
					parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
					return parts.join(this.radix);
				}
				/**
				  @override
				*/

			}, {
				key: "doPrepare",
				value: function doPrepare(str) {
					var _get2;

					for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
						args[_key - 1] = arguments[_key];
					}

					return (_get2 = _get(_getPrototypeOf(MaskedNumber.prototype), "doPrepare", this)).call.apply(_get2, [this, this._removeThousandsSeparators(str.replace(this._mapToRadixRegExp, this.radix))].concat(args));
				}
				/** */

			}, {
				key: "_separatorsCount",
				value: function _separatorsCount(to) {
					var extendOnSeparators = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
					var count = 0;

					for (var pos = 0; pos < to; ++pos) {
						if (this._value.indexOf(this.thousandsSeparator, pos) === pos) {
							++count;
							if (extendOnSeparators) to += this.thousandsSeparator.length;
						}
					}

					return count;
				}
				/** */

			}, {
				key: "_separatorsCountFromSlice",
				value: function _separatorsCountFromSlice() {
					var slice = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._value;
					return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
				}
				/**
				  @override
				*/

			}, {
				key: "extractInput",
				value: function extractInput() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
					var flags = arguments.length > 2 ? arguments[2] : undefined;

					var _this$_adjustRangeWit = this._adjustRangeWithSeparators(fromPos, toPos);

					var _this$_adjustRangeWit2 = _slicedToArray(_this$_adjustRangeWit, 2);

					fromPos = _this$_adjustRangeWit2[0];
					toPos = _this$_adjustRangeWit2[1];
					return this._removeThousandsSeparators(_get(_getPrototypeOf(MaskedNumber.prototype), "extractInput", this).call(this, fromPos, toPos, flags));
				}
				/**
				  @override
				*/

			}, {
				key: "_appendCharRaw",
				value: function _appendCharRaw(ch) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					if (!this.thousandsSeparator) return _get(_getPrototypeOf(MaskedNumber.prototype), "_appendCharRaw", this).call(this, ch, flags);
					var prevBeforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;

					var prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);

					this._value = this._removeThousandsSeparators(this.value);

					var appendDetails = _get(_getPrototypeOf(MaskedNumber.prototype), "_appendCharRaw", this).call(this, ch, flags);

					this._value = this._insertThousandsSeparators(this._value);
					var beforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;

					var beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);

					appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
					return appendDetails;
				}
				/** */

			}, {
				key: "_findSeparatorAround",
				value: function _findSeparatorAround(pos) {
					if (this.thousandsSeparator) {
						var searchFrom = pos - this.thousandsSeparator.length + 1;
						var separatorPos = this.value.indexOf(this.thousandsSeparator, searchFrom);
						if (separatorPos <= pos) return separatorPos;
					}

					return -1;
				}
			}, {
				key: "_adjustRangeWithSeparators",
				value: function _adjustRangeWithSeparators(from, to) {
					var separatorAroundFromPos = this._findSeparatorAround(from);

					if (separatorAroundFromPos >= 0) from = separatorAroundFromPos;

					var separatorAroundToPos = this._findSeparatorAround(to);

					if (separatorAroundToPos >= 0) to = separatorAroundToPos + this.thousandsSeparator.length;
					return [from, to];
				}
				/**
				  @override
				*/

			}, {
				key: "remove",
				value: function remove() {
					var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;

					var _this$_adjustRangeWit3 = this._adjustRangeWithSeparators(fromPos, toPos);

					var _this$_adjustRangeWit4 = _slicedToArray(_this$_adjustRangeWit3, 2);

					fromPos = _this$_adjustRangeWit4[0];
					toPos = _this$_adjustRangeWit4[1];
					var valueBeforePos = this.value.slice(0, fromPos);
					var valueAfterPos = this.value.slice(toPos);

					var prevBeforeTailSeparatorsCount = this._separatorsCount(valueBeforePos.length);

					this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(valueBeforePos + valueAfterPos));

					var beforeTailSeparatorsCount = this._separatorsCountFromSlice(valueBeforePos);

					return new ChangeDetails({
						tailShift: (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length
					});
				}
				/**
				  @override
				*/

			}, {
				key: "nearestInputPos",
				value: function nearestInputPos(cursorPos, direction) {
					if (!this.thousandsSeparator) return cursorPos;

					switch (direction) {
						case DIRECTION.NONE:
						case DIRECTION.LEFT:
						case DIRECTION.FORCE_LEFT:
							{
								var separatorAtLeftPos = this._findSeparatorAround(cursorPos - 1);

								if (separatorAtLeftPos >= 0) {
									var separatorAtLeftEndPos = separatorAtLeftPos + this.thousandsSeparator.length;

									if (cursorPos < separatorAtLeftEndPos || this.value.length <= separatorAtLeftEndPos || direction === DIRECTION.FORCE_LEFT) {
										return separatorAtLeftPos;
									}
								}

								break;
							}

						case DIRECTION.RIGHT:
						case DIRECTION.FORCE_RIGHT:
							{
								var separatorAtRightPos = this._findSeparatorAround(cursorPos);

								if (separatorAtRightPos >= 0) {
									return separatorAtRightPos + this.thousandsSeparator.length;
								}
							}
					}

					return cursorPos;
				}
				/**
				  @override
				*/

			}, {
				key: "doValidate",
				value: function doValidate(flags) {
					var regexp = flags.input ? this._numberRegExpInput : this._numberRegExp; // validate as string

					var valid = regexp.test(this._removeThousandsSeparators(this.value));

					if (valid) {
						// validate as number
						var number = this.number;
						valid = valid && !isNaN(number) && ( // check min bound for negative values
							this.min == null || this.min >= 0 || this.min <= this.number) && ( // check max bound for positive values
								this.max == null || this.max <= 0 || this.number <= this.max);
					}

					return valid && _get(_getPrototypeOf(MaskedNumber.prototype), "doValidate", this).call(this, flags);
				}
				/**
				  @override
				*/

			}, {
				key: "doCommit",
				value: function doCommit() {
					if (this.value) {
						var number = this.number;
						var validnum = number; // check bounds

						if (this.min != null) validnum = Math.max(validnum, this.min);
						if (this.max != null) validnum = Math.min(validnum, this.max);
						if (validnum !== number) this.unmaskedValue = String(validnum);
						var formatted = this.value;
						if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
						if (this.padFractionalZeros) formatted = this._padFractionalZeros(formatted);
						this._value = formatted;
					}

					_get(_getPrototypeOf(MaskedNumber.prototype), "doCommit", this).call(this);
				}
				/** */

			}, {
				key: "_normalizeZeros",
				value: function _normalizeZeros(value) {
					var parts = this._removeThousandsSeparators(value).split(this.radix); // remove leading zeros


					parts[0] = parts[0].replace(/^(\D*)(0*)(\d*)/, function (match, sign, zeros, num) {
						return sign + num;
					}); // add leading zero

					if (value.length && !/\d$/.test(parts[0])) parts[0] = parts[0] + '0';

					if (parts.length > 1) {
						parts[1] = parts[1].replace(/0*$/, ''); // remove trailing zeros

						if (!parts[1].length) parts.length = 1; // remove fractional
					}

					return this._insertThousandsSeparators(parts.join(this.radix));
				}
				/** */

			}, {
				key: "_padFractionalZeros",
				value: function _padFractionalZeros(value) {
					if (!value) return value;
					var parts = value.split(this.radix);
					if (parts.length < 2) parts.push('');
					parts[1] = parts[1].padEnd(this.scale, '0');
					return parts.join(this.radix);
				}
				/**
				  @override
				*/

			}, {
				key: "unmaskedValue",
				get: function get() {
					return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, '.');
				},
				set: function set(unmaskedValue) {
					_set(_getPrototypeOf(MaskedNumber.prototype), "unmaskedValue", unmaskedValue.replace('.', this.radix), this, true);
				}
				/**
				  @override
				*/

			}, {
				key: "typedValue",
				get: function get() {
					return Number(this.unmaskedValue);
				},
				set: function set(n) {
					_set(_getPrototypeOf(MaskedNumber.prototype), "unmaskedValue", String(n), this, true);
				}
				/** Parsed Number */

			}, {
				key: "number",
				get: function get() {
					return this.typedValue;
				},
				set: function set(number) {
					this.typedValue = number;
				}
				/**
				  Is negative allowed
				  @readonly
				*/

			}, {
				key: "allowNegative",
				get: function get() {
					return this.signed || this.min != null && this.min < 0 || this.max != null && this.max < 0;
				}
			}]);

			return MaskedNumber;
		}(Masked);
	MaskedNumber.DEFAULTS = {
		radix: ',',
		thousandsSeparator: '',
		mapToRadix: ['.'],
		scale: 2,
		signed: false,
		normalizeZeros: true,
		padFractionalZeros: false
	};
	IMask.MaskedNumber = MaskedNumber;

	/** Masking by RegExp */

	var MaskedRegExp =
		/*#__PURE__*/
		function (_Masked) {
			_inherits(MaskedRegExp, _Masked);

			function MaskedRegExp() {
				_classCallCheck(this, MaskedRegExp);

				return _possibleConstructorReturn(this, _getPrototypeOf(MaskedRegExp).apply(this, arguments));
			}

			_createClass(MaskedRegExp, [{
				key: "_update",

				/**
				  @override
				  @param {Object} opts
				*/
				value: function _update(opts) {
					if (opts.mask) opts.validate = function (value) {
						return value.search(opts.mask) >= 0;
					};

					_get(_getPrototypeOf(MaskedRegExp.prototype), "_update", this).call(this, opts);
				}
			}]);

			return MaskedRegExp;
		}(Masked);
	IMask.MaskedRegExp = MaskedRegExp;

	/** Masking by custom Function */

	var MaskedFunction =
		/*#__PURE__*/
		function (_Masked) {
			_inherits(MaskedFunction, _Masked);

			function MaskedFunction() {
				_classCallCheck(this, MaskedFunction);

				return _possibleConstructorReturn(this, _getPrototypeOf(MaskedFunction).apply(this, arguments));
			}

			_createClass(MaskedFunction, [{
				key: "_update",

				/**
				  @override
				  @param {Object} opts
				*/
				value: function _update(opts) {
					if (opts.mask) opts.validate = opts.mask;

					_get(_getPrototypeOf(MaskedFunction.prototype), "_update", this).call(this, opts);
				}
			}]);

			return MaskedFunction;
		}(Masked);
	IMask.MaskedFunction = MaskedFunction;

	/** Dynamic mask for choosing apropriate mask in run-time */
	var MaskedDynamic =
		/*#__PURE__*/
		function (_Masked) {
			_inherits(MaskedDynamic, _Masked);

			/** Currently chosen mask */

			/** Compliled {@link Masked} options */

			/** Chooses {@link Masked} depending on input value */

			/**
			  @param {Object} opts
			*/
			function MaskedDynamic(opts) {
				var _this;

				_classCallCheck(this, MaskedDynamic);

				_this = _possibleConstructorReturn(this, _getPrototypeOf(MaskedDynamic).call(this, Object.assign({}, MaskedDynamic.DEFAULTS, {}, opts)));
				_this.currentMask = null;
				return _this;
			}
			/**
			  @override
			*/


			_createClass(MaskedDynamic, [{
				key: "_update",
				value: function _update(opts) {
					_get(_getPrototypeOf(MaskedDynamic.prototype), "_update", this).call(this, opts);

					if ('mask' in opts) {
						// mask could be totally dynamic with only `dispatch` option
						this.compiledMasks = Array.isArray(opts.mask) ? opts.mask.map(function (m) {
							return createMask(m);
						}) : [];
					}
				}
				/**
				  @override
				*/

			}, {
				key: "_appendCharRaw",
				value: function _appendCharRaw() {
					var details = this._applyDispatch.apply(this, arguments);

					if (this.currentMask) {
						var _this$currentMask;

						details.aggregate((_this$currentMask = this.currentMask)._appendChar.apply(_this$currentMask, arguments));
					}

					return details;
				}
			}, {
				key: "_applyDispatch",
				value: function _applyDispatch() {
					var appended = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					var prevValueBeforeTail = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._value : this.value;
					var inputValue = this.rawInputValue;
					var insertValue = flags.tail && flags._beforeTailState != null ? // $FlowFixMe - tired to fight with type system
						flags._beforeTailState._rawInputValue : inputValue;
					var tailValue = inputValue.slice(insertValue.length);
					var prevMask = this.currentMask;
					var details = new ChangeDetails();
					var prevMaskState = prevMask && prevMask.state; // clone flags to prevent overwriting `_beforeTailState`

					this.currentMask = this.doDispatch(appended, Object.assign({}, flags)); // restore state after dispatch

					if (this.currentMask) {
						if (this.currentMask !== prevMask) {
							// if mask changed reapply input
							this.currentMask.reset(); // $FlowFixMe - it's ok, we don't change current mask above

							var d = this.currentMask.append(insertValue, {
								raw: true
							});
							details.tailShift = d.inserted.length - prevValueBeforeTail.length;

							if (tailValue) {
								// $FlowFixMe - it's ok, we don't change current mask above
								details.tailShift += this.currentMask.append(tailValue, {
									raw: true,
									tail: true
								}).tailShift;
							}
						} else {
							// Dispatch can do something bad with state, so
							// restore prev mask state
							this.currentMask.state = prevMaskState;
						}
					}

					return details;
				}
			}, {
				key: "_appendPlaceholder",
				value: function _appendPlaceholder() {
					var details = this._applyDispatch.apply(this, arguments);

					if (this.currentMask) {
						details.aggregate(this.currentMask._appendPlaceholder());
					}

					return details;
				}
				/**
				  @override
				*/

			}, {
				key: "doDispatch",
				value: function doDispatch(appended) {
					var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					return this.dispatch(appended, this, flags);
				}
				/**
				  @override
				*/

			}, {
				key: "doValidate",
				value: function doValidate() {
					var _get2, _this$currentMask2;

					for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					return (_get2 = _get(_getPrototypeOf(MaskedDynamic.prototype), "doValidate", this)).call.apply(_get2, [this].concat(args)) && (!this.currentMask || (_this$currentMask2 = this.currentMask).doValidate.apply(_this$currentMask2, args));
				}
				/**
				  @override
				*/

			}, {
				key: "reset",
				value: function reset() {
					if (this.currentMask) this.currentMask.reset();
					this.compiledMasks.forEach(function (m) {
						return m.reset();
					});
				}
				/**
				  @override
				*/

			}, {
				key: "remove",

				/**
				  @override
				*/
				value: function remove() {
					var details = new ChangeDetails();

					if (this.currentMask) {
						var _this$currentMask3;

						details.aggregate((_this$currentMask3 = this.currentMask).remove.apply(_this$currentMask3, arguments)) // update with dispatch
							.aggregate(this._applyDispatch());
					}

					return details;
				}
				/**
				  @override
				*/

			}, {
				key: "extractInput",

				/**
				  @override
				*/
				value: function extractInput() {
					var _this$currentMask4;

					return this.currentMask ? (_this$currentMask4 = this.currentMask).extractInput.apply(_this$currentMask4, arguments) : '';
				}
				/**
				  @override
				*/

			}, {
				key: "extractTail",
				value: function extractTail() {
					var _this$currentMask5, _get3;

					for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
						args[_key2] = arguments[_key2];
					}

					return this.currentMask ? (_this$currentMask5 = this.currentMask).extractTail.apply(_this$currentMask5, args) : (_get3 = _get(_getPrototypeOf(MaskedDynamic.prototype), "extractTail", this)).call.apply(_get3, [this].concat(args));
				}
				/**
				  @override
				*/

			}, {
				key: "doCommit",
				value: function doCommit() {
					if (this.currentMask) this.currentMask.doCommit();

					_get(_getPrototypeOf(MaskedDynamic.prototype), "doCommit", this).call(this);
				}
				/**
				  @override
				*/

			}, {
				key: "nearestInputPos",
				value: function nearestInputPos() {
					var _this$currentMask6, _get4;

					for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
						args[_key3] = arguments[_key3];
					}

					return this.currentMask ? (_this$currentMask6 = this.currentMask).nearestInputPos.apply(_this$currentMask6, args) : (_get4 = _get(_getPrototypeOf(MaskedDynamic.prototype), "nearestInputPos", this)).call.apply(_get4, [this].concat(args));
				}
			}, {
				key: "value",
				get: function get() {
					return this.currentMask ? this.currentMask.value : '';
				},
				set: function set(value) {
					_set(_getPrototypeOf(MaskedDynamic.prototype), "value", value, this, true);
				}
				/**
				  @override
				*/

			}, {
				key: "unmaskedValue",
				get: function get() {
					return this.currentMask ? this.currentMask.unmaskedValue : '';
				},
				set: function set(unmaskedValue) {
					_set(_getPrototypeOf(MaskedDynamic.prototype), "unmaskedValue", unmaskedValue, this, true);
				}
				/**
				  @override
				*/

			}, {
				key: "typedValue",
				get: function get() {
					return this.currentMask ? this.currentMask.typedValue : '';
				} // probably typedValue should not be used with dynamic
				,
				set: function set(value) {
					var unmaskedValue = String(value); // double check it

					if (this.currentMask) {
						this.currentMask.typedValue = value;
						unmaskedValue = this.currentMask.unmaskedValue;
					}

					this.unmaskedValue = unmaskedValue;
				}
				/**
				  @override
				*/

			}, {
				key: "isComplete",
				get: function get() {
					return !!this.currentMask && this.currentMask.isComplete;
				}
			}, {
				key: "state",
				get: function get() {
					return Object.assign({}, _get(_getPrototypeOf(MaskedDynamic.prototype), "state", this), {
						_rawInputValue: this.rawInputValue,
						compiledMasks: this.compiledMasks.map(function (m) {
							return m.state;
						}),
						currentMaskRef: this.currentMask,
						currentMask: this.currentMask && this.currentMask.state
					});
				},
				set: function set(state) {
					var compiledMasks = state.compiledMasks,
						currentMaskRef = state.currentMaskRef,
						currentMask = state.currentMask,
						maskedState = _objectWithoutProperties(state, ["compiledMasks", "currentMaskRef", "currentMask"]);

					this.compiledMasks.forEach(function (m, mi) {
						return m.state = compiledMasks[mi];
					});

					if (currentMaskRef != null) {
						this.currentMask = currentMaskRef;
						this.currentMask.state = currentMask;
					}

					_set(_getPrototypeOf(MaskedDynamic.prototype), "state", maskedState, this, true);
				}
			}, {
				key: "overwrite",
				get: function get() {
					return this.currentMask ? this.currentMask.overwrite : _get(_getPrototypeOf(MaskedDynamic.prototype), "overwrite", this);
				},
				set: function set(overwrite) {
					console.warn('"overwrite" option is not available in dynamic mask, use this option in siblings');
				}
			}]);

			return MaskedDynamic;
		}(Masked);
	MaskedDynamic.DEFAULTS = {
		dispatch: function dispatch(appended, masked, flags) {
			if (!masked.compiledMasks.length) return;
			var inputValue = masked.rawInputValue; // simulate input

			var inputs = masked.compiledMasks.map(function (m, index) {
				m.reset();
				m.append(inputValue, {
					raw: true
				});
				m.append(appended, flags);
				var weight = m.rawInputValue.length;
				return {
					weight: weight,
					index: index
				};
			}); // pop masks with longer values first

			inputs.sort(function (i1, i2) {
				return i2.weight - i1.weight;
			});
			return masked.compiledMasks[inputs[0].index];
		}
	};
	IMask.MaskedDynamic = MaskedDynamic;

	/** Mask pipe source and destination types */

	var PIPE_TYPE = {
		MASKED: 'value',
		UNMASKED: 'unmaskedValue',
		TYPED: 'typedValue'
	};
	/** Creates new pipe function depending on mask type, source and destination options */

	function createPipe(mask) {
		var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : PIPE_TYPE.MASKED;
		var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : PIPE_TYPE.MASKED;
		var masked = createMask(mask);
		return function (value) {
			return masked.runIsolated(function (m) {
				m[from] = value;
				return m[to];
			});
		};
	}
	/** Pipes value through mask depending on mask type, source and destination options */

	function pipe(value) {
		for (var _len = arguments.length, pipeArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			pipeArgs[_key - 1] = arguments[_key];
		}

		return createPipe.apply(void 0, pipeArgs)(value);
	}
	IMask.PIPE_TYPE = PIPE_TYPE;
	IMask.createPipe = createPipe;
	IMask.pipe = pipe;

	globalThis.IMask = IMask;

	exports.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;
	exports.HTMLMaskElement = HTMLMaskElement;
	exports.InputMask = InputMask;
	exports.MaskElement = MaskElement;
	exports.Masked = Masked;
	exports.MaskedDate = MaskedDate;
	exports.MaskedDynamic = MaskedDynamic;
	exports.MaskedEnum = MaskedEnum;
	exports.MaskedFunction = MaskedFunction;
	exports.MaskedNumber = MaskedNumber;
	exports.MaskedPattern = MaskedPattern;
	exports.MaskedRange = MaskedRange;
	exports.MaskedRegExp = MaskedRegExp;
	exports.PIPE_TYPE = PIPE_TYPE;
	exports.createMask = createMask;
	exports.createPipe = createPipe;
	exports.default = IMask;
	exports.pipe = pipe;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwbHVnaW5zL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XHJcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XHJcblx0XHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcclxuXHRcdFx0KGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBmYWN0b3J5KGdsb2JhbC5JTWFzayA9IHt9KSk7XHJcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR2YXIgY29tbW9uanNHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWxUaGlzIDogdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB7fTtcclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlQ29tbW9uanNNb2R1bGUoZm4sIG1vZHVsZSkge1xyXG5cdFx0cmV0dXJuIG1vZHVsZSA9IHsgZXhwb3J0czoge30gfSwgZm4obW9kdWxlLCBtb2R1bGUuZXhwb3J0cyksIG1vZHVsZS5leHBvcnRzO1xyXG5cdH1cclxuXHJcblx0dmFyIGNoZWNrID0gZnVuY3Rpb24gKGl0KSB7XHJcblx0XHRyZXR1cm4gaXQgJiYgaXQuTWF0aCA9PSBNYXRoICYmIGl0O1xyXG5cdH07IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XHJcblxyXG5cclxuXHR2YXIgZ2xvYmFsXzEgPSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNoZWNrKHR5cGVvZiBnbG9iYWxUaGlzID09ICdvYmplY3QnICYmIGdsb2JhbFRoaXMpIHx8IGNoZWNrKHR5cGVvZiB3aW5kb3cgPT0gJ29iamVjdCcgJiYgd2luZG93KSB8fCBjaGVjayh0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmKSB8fCBjaGVjayh0eXBlb2YgY29tbW9uanNHbG9iYWwgPT0gJ29iamVjdCcgJiYgY29tbW9uanNHbG9iYWwpIHx8IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xyXG5cdFx0RnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcclxuXHJcblx0dmFyIGZhaWxzID0gZnVuY3Rpb24gKGV4ZWMpIHtcclxuXHRcdHRyeSB7XHJcblx0XHRcdHJldHVybiAhIWV4ZWMoKTtcclxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcclxuXHJcblxyXG5cdHZhciBkZXNjcmlwdG9ycyA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAxLCB7XHJcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJldHVybiA3O1xyXG5cdFx0XHR9XHJcblx0XHR9KVsxXSAhPSA3O1xyXG5cdH0pO1xyXG5cclxuXHR2YXIgbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGUgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcclxuXHR2YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjsgLy8gTmFzaG9ybiB+IEpESzggYnVnXHJcblxyXG5cdHZhciBOQVNIT1JOX0JVRyA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiAhbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh7XHJcblx0XHQxOiAyXHJcblx0fSwgMSk7IC8vIGBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlYCBtZXRob2QgaW1wbGVtZW50YXRpb25cclxuXHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QucHJvdG90eXBlLnByb3BlcnR5aXNlbnVtZXJhYmxlXHJcblxyXG5cdHZhciBmID0gTkFTSE9STl9CVUcgPyBmdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShWKSB7XHJcblx0XHR2YXIgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLCBWKTtcclxuXHRcdHJldHVybiAhIWRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5lbnVtZXJhYmxlO1xyXG5cdH0gOiBuYXRpdmVQcm9wZXJ0eUlzRW51bWVyYWJsZTtcclxuXHJcblx0dmFyIG9iamVjdFByb3BlcnR5SXNFbnVtZXJhYmxlID0ge1xyXG5cdFx0ZjogZlxyXG5cdH07XHJcblxyXG5cdHZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiAoYml0bWFwLCB2YWx1ZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0ZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcclxuXHRcdFx0Y29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxyXG5cdFx0XHR3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcclxuXHRcdFx0dmFsdWU6IHZhbHVlXHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdHZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xyXG5cclxuXHR2YXIgY2xhc3NvZlJhdyA9IGZ1bmN0aW9uIChpdCkge1xyXG5cdFx0cmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgc3BsaXQgPSAnJy5zcGxpdDsgLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcclxuXHJcblx0dmFyIGluZGV4ZWRPYmplY3QgPSBmYWlscyhmdW5jdGlvbiAoKSB7XHJcblx0XHQvLyB0aHJvd3MgYW4gZXJyb3IgaW4gcmhpbm8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9yaGluby9pc3N1ZXMvMzQ2XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXHJcblx0XHRyZXR1cm4gIU9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApO1xyXG5cdH0pID8gZnVuY3Rpb24gKGl0KSB7XHJcblx0XHRyZXR1cm4gY2xhc3NvZlJhdyhpdCkgPT0gJ1N0cmluZycgPyBzcGxpdC5jYWxsKGl0LCAnJykgOiBPYmplY3QoaXQpO1xyXG5cdH0gOiBPYmplY3Q7XHJcblxyXG5cdC8vIGBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlYCBhYnN0cmFjdCBvcGVyYXRpb25cclxuXHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1yZXF1aXJlb2JqZWN0Y29lcmNpYmxlXHJcblx0dmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSBmdW5jdGlvbiAoaXQpIHtcclxuXHRcdGlmIChpdCA9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uIFwiICsgaXQpO1xyXG5cdFx0cmV0dXJuIGl0O1xyXG5cdH07XHJcblxyXG5cdC8vIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXHJcblxyXG5cclxuXHJcblxyXG5cdHZhciB0b0luZGV4ZWRPYmplY3QgPSBmdW5jdGlvbiAoaXQpIHtcclxuXHRcdHJldHVybiBpbmRleGVkT2JqZWN0KHJlcXVpcmVPYmplY3RDb2VyY2libGUoaXQpKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgaXNPYmplY3QgPSBmdW5jdGlvbiAoaXQpIHtcclxuXHRcdHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XHJcblx0fTtcclxuXHJcblx0Ly8gYFRvUHJpbWl0aXZlYCBhYnN0cmFjdCBvcGVyYXRpb25cclxuXHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b3ByaW1pdGl2ZVxyXG5cdC8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXHJcblx0Ly8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcclxuXHJcblxyXG5cdHZhciB0b1ByaW1pdGl2ZSA9IGZ1bmN0aW9uIChpbnB1dCwgUFJFRkVSUkVEX1NUUklORykge1xyXG5cdFx0aWYgKCFpc09iamVjdChpbnB1dCkpIHJldHVybiBpbnB1dDtcclxuXHRcdHZhciBmbiwgdmFsO1xyXG5cdFx0aWYgKFBSRUZFUlJFRF9TVFJJTkcgJiYgdHlwZW9mIChmbiA9IGlucHV0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGlucHV0KSkpIHJldHVybiB2YWw7XHJcblx0XHRpZiAodHlwZW9mIChmbiA9IGlucHV0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaW5wdXQpKSkgcmV0dXJuIHZhbDtcclxuXHRcdGlmICghUFJFRkVSUkVEX1NUUklORyAmJiB0eXBlb2YgKGZuID0gaW5wdXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaW5wdXQpKSkgcmV0dXJuIHZhbDtcclxuXHRcdHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcclxuXHJcblx0dmFyIGhhcyA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XHJcblx0XHRyZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcclxuXHR9O1xyXG5cclxuXHR2YXIgZG9jdW1lbnQkMSA9IGdsb2JhbF8xLmRvY3VtZW50OyAvLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcclxuXHJcblx0dmFyIEVYSVNUUyA9IGlzT2JqZWN0KGRvY3VtZW50JDEpICYmIGlzT2JqZWN0KGRvY3VtZW50JDEuY3JlYXRlRWxlbWVudCk7XHJcblxyXG5cdHZhciBkb2N1bWVudENyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbiAoaXQpIHtcclxuXHRcdHJldHVybiBFWElTVFMgPyBkb2N1bWVudCQxLmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XHJcblx0fTtcclxuXHJcblx0Ly8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxyXG5cclxuXHJcblx0dmFyIGllOERvbURlZmluZSA9ICFkZXNjcmlwdG9ycyAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkb2N1bWVudENyZWF0ZUVsZW1lbnQoJ2RpdicpLCAnYScsIHtcclxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0cmV0dXJuIDc7XHJcblx0XHRcdH1cclxuXHRcdH0pLmEgIT0gNztcclxuXHR9KTtcclxuXHJcblx0dmFyIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7IC8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yYCBtZXRob2RcclxuXHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuZ2V0b3ducHJvcGVydHlkZXNjcmlwdG9yXHJcblxyXG5cdHZhciBmJDEgPSBkZXNjcmlwdG9ycyA/IG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvciA6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKSB7XHJcblx0XHRPID0gdG9JbmRleGVkT2JqZWN0KE8pO1xyXG5cdFx0UCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xyXG5cdFx0aWYgKGllOERvbURlZmluZSkgdHJ5IHtcclxuXHRcdFx0cmV0dXJuIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKTtcclxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdC8qIGVtcHR5ICovXHJcblx0XHR9XHJcblx0XHRpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKCFvYmplY3RQcm9wZXJ0eUlzRW51bWVyYWJsZS5mLmNhbGwoTywgUCksIE9bUF0pO1xyXG5cdH07XHJcblxyXG5cdHZhciBvYmplY3RHZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSB7XHJcblx0XHRmOiBmJDFcclxuXHR9O1xyXG5cclxuXHR2YXIgYW5PYmplY3QgPSBmdW5jdGlvbiAoaXQpIHtcclxuXHRcdGlmICghaXNPYmplY3QoaXQpKSB7XHJcblx0XHRcdHRocm93IFR5cGVFcnJvcihTdHJpbmcoaXQpICsgJyBpcyBub3QgYW4gb2JqZWN0Jyk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGl0O1xyXG5cdH07XHJcblxyXG5cdHZhciBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTsgLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0eWAgbWV0aG9kXHJcblx0Ly8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmRlZmluZXByb3BlcnR5XHJcblxyXG5cdHZhciBmJDIgPSBkZXNjcmlwdG9ycyA/IG5hdGl2ZURlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xyXG5cdFx0YW5PYmplY3QoTyk7XHJcblx0XHRQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XHJcblx0XHRhbk9iamVjdChBdHRyaWJ1dGVzKTtcclxuXHRcdGlmIChpZThEb21EZWZpbmUpIHRyeSB7XHJcblx0XHRcdHJldHVybiBuYXRpdmVEZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKTtcclxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdC8qIGVtcHR5ICovXHJcblx0XHR9XHJcblx0XHRpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkJyk7XHJcblx0XHRpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcclxuXHRcdHJldHVybiBPO1xyXG5cdH07XHJcblxyXG5cdHZhciBvYmplY3REZWZpbmVQcm9wZXJ0eSA9IHtcclxuXHRcdGY6IGYkMlxyXG5cdH07XHJcblxyXG5cdHZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSBkZXNjcmlwdG9ycyA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcclxuXHRcdHJldHVybiBvYmplY3REZWZpbmVQcm9wZXJ0eS5mKG9iamVjdCwga2V5LCBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoMSwgdmFsdWUpKTtcclxuXHR9IDogZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xyXG5cdFx0b2JqZWN0W2tleV0gPSB2YWx1ZTtcclxuXHRcdHJldHVybiBvYmplY3Q7XHJcblx0fTtcclxuXHJcblx0dmFyIHNldEdsb2JhbCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoZ2xvYmFsXzEsIGtleSwgdmFsdWUpO1xyXG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdFx0Z2xvYmFsXzFba2V5XSA9IHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuXHR2YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XHJcblx0dmFyIHN0b3JlID0gZ2xvYmFsXzFbU0hBUkVEXSB8fCBzZXRHbG9iYWwoU0hBUkVELCB7fSk7XHJcblx0dmFyIHNoYXJlZFN0b3JlID0gc3RvcmU7XHJcblxyXG5cdHZhciBmdW5jdGlvblRvU3RyaW5nID0gRnVuY3Rpb24udG9TdHJpbmc7IC8vIHRoaXMgaGVscGVyIGJyb2tlbiBpbiBgMy40LjEtMy40LjRgLCBzbyB3ZSBjYW4ndCB1c2UgYHNoYXJlZGAgaGVscGVyXHJcblxyXG5cdGlmICh0eXBlb2Ygc2hhcmVkU3RvcmUuaW5zcGVjdFNvdXJjZSAhPSAnZnVuY3Rpb24nKSB7XHJcblx0XHRzaGFyZWRTdG9yZS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24gKGl0KSB7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvblRvU3RyaW5nLmNhbGwoaXQpO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHZhciBpbnNwZWN0U291cmNlID0gc2hhcmVkU3RvcmUuaW5zcGVjdFNvdXJjZTtcclxuXHJcblx0dmFyIFdlYWtNYXAgPSBnbG9iYWxfMS5XZWFrTWFwO1xyXG5cdHZhciBuYXRpdmVXZWFrTWFwID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicgJiYgL25hdGl2ZSBjb2RlLy50ZXN0KGluc3BlY3RTb3VyY2UoV2Vha01hcCkpO1xyXG5cclxuXHR2YXIgc2hhcmVkID0gY3JlYXRlQ29tbW9uanNNb2R1bGUoZnVuY3Rpb24gKG1vZHVsZSkge1xyXG5cdFx0KG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIHNoYXJlZFN0b3JlW2tleV0gfHwgKHNoYXJlZFN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XHJcblx0XHR9KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XHJcblx0XHRcdHZlcnNpb246ICczLjYuNCcsXHJcblx0XHRcdG1vZGU6ICdnbG9iYWwnLFxyXG5cdFx0XHRjb3B5cmlnaHQ6ICfCqSAyMDIwIERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcblxyXG5cdHZhciBpZCA9IDA7XHJcblx0dmFyIHBvc3RmaXggPSBNYXRoLnJhbmRvbSgpO1xyXG5cclxuXHR2YXIgdWlkID0gZnVuY3Rpb24gKGtleSkge1xyXG5cdFx0cmV0dXJuICdTeW1ib2woJyArIFN0cmluZyhrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5KSArICcpXycgKyAoKytpZCArIHBvc3RmaXgpLnRvU3RyaW5nKDM2KTtcclxuXHR9O1xyXG5cclxuXHR2YXIga2V5cyA9IHNoYXJlZCgna2V5cycpO1xyXG5cclxuXHR2YXIgc2hhcmVkS2V5ID0gZnVuY3Rpb24gKGtleSkge1xyXG5cdFx0cmV0dXJuIGtleXNba2V5XSB8fCAoa2V5c1trZXldID0gdWlkKGtleSkpO1xyXG5cdH07XHJcblxyXG5cdHZhciBoaWRkZW5LZXlzID0ge307XHJcblxyXG5cdHZhciBXZWFrTWFwJDEgPSBnbG9iYWxfMS5XZWFrTWFwO1xyXG5cdHZhciBzZXQsIGdldCwgaGFzJDE7XHJcblxyXG5cdHZhciBlbmZvcmNlID0gZnVuY3Rpb24gKGl0KSB7XHJcblx0XHRyZXR1cm4gaGFzJDEoaXQpID8gZ2V0KGl0KSA6IHNldChpdCwge30pO1xyXG5cdH07XHJcblxyXG5cdHZhciBnZXR0ZXJGb3IgPSBmdW5jdGlvbiAoVFlQRSkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChpdCkge1xyXG5cdFx0XHR2YXIgc3RhdGU7XHJcblxyXG5cdFx0XHRpZiAoIWlzT2JqZWN0KGl0KSB8fCAoc3RhdGUgPSBnZXQoaXQpKS50eXBlICE9PSBUWVBFKSB7XHJcblx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKCdJbmNvbXBhdGlibGUgcmVjZWl2ZXIsICcgKyBUWVBFICsgJyByZXF1aXJlZCcpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gc3RhdGU7XHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdGlmIChuYXRpdmVXZWFrTWFwKSB7XHJcblx0XHR2YXIgc3RvcmUkMSA9IG5ldyBXZWFrTWFwJDEoKTtcclxuXHRcdHZhciB3bWdldCA9IHN0b3JlJDEuZ2V0O1xyXG5cdFx0dmFyIHdtaGFzID0gc3RvcmUkMS5oYXM7XHJcblx0XHR2YXIgd21zZXQgPSBzdG9yZSQxLnNldDtcclxuXHJcblx0XHRzZXQgPSBmdW5jdGlvbiAoaXQsIG1ldGFkYXRhKSB7XHJcblx0XHRcdHdtc2V0LmNhbGwoc3RvcmUkMSwgaXQsIG1ldGFkYXRhKTtcclxuXHRcdFx0cmV0dXJuIG1ldGFkYXRhO1xyXG5cdFx0fTtcclxuXHJcblx0XHRnZXQgPSBmdW5jdGlvbiAoaXQpIHtcclxuXHRcdFx0cmV0dXJuIHdtZ2V0LmNhbGwoc3RvcmUkMSwgaXQpIHx8IHt9O1xyXG5cdFx0fTtcclxuXHJcblx0XHRoYXMkMSA9IGZ1bmN0aW9uIChpdCkge1xyXG5cdFx0XHRyZXR1cm4gd21oYXMuY2FsbChzdG9yZSQxLCBpdCk7XHJcblx0XHR9O1xyXG5cdH0gZWxzZSB7XHJcblx0XHR2YXIgU1RBVEUgPSBzaGFyZWRLZXkoJ3N0YXRlJyk7XHJcblx0XHRoaWRkZW5LZXlzW1NUQVRFXSA9IHRydWU7XHJcblxyXG5cdFx0c2V0ID0gZnVuY3Rpb24gKGl0LCBtZXRhZGF0YSkge1xyXG5cdFx0XHRjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoaXQsIFNUQVRFLCBtZXRhZGF0YSk7XHJcblx0XHRcdHJldHVybiBtZXRhZGF0YTtcclxuXHRcdH07XHJcblxyXG5cdFx0Z2V0ID0gZnVuY3Rpb24gKGl0KSB7XHJcblx0XHRcdHJldHVybiBoYXMoaXQsIFNUQVRFKSA/IGl0W1NUQVRFXSA6IHt9O1xyXG5cdFx0fTtcclxuXHJcblx0XHRoYXMkMSA9IGZ1bmN0aW9uIChpdCkge1xyXG5cdFx0XHRyZXR1cm4gaGFzKGl0LCBTVEFURSk7XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0dmFyIGludGVybmFsU3RhdGUgPSB7XHJcblx0XHRzZXQ6IHNldCxcclxuXHRcdGdldDogZ2V0LFxyXG5cdFx0aGFzOiBoYXMkMSxcclxuXHRcdGVuZm9yY2U6IGVuZm9yY2UsXHJcblx0XHRnZXR0ZXJGb3I6IGdldHRlckZvclxyXG5cdH07XHJcblxyXG5cdHZhciByZWRlZmluZSA9IGNyZWF0ZUNvbW1vbmpzTW9kdWxlKGZ1bmN0aW9uIChtb2R1bGUpIHtcclxuXHRcdHZhciBnZXRJbnRlcm5hbFN0YXRlID0gaW50ZXJuYWxTdGF0ZS5nZXQ7XHJcblx0XHR2YXIgZW5mb3JjZUludGVybmFsU3RhdGUgPSBpbnRlcm5hbFN0YXRlLmVuZm9yY2U7XHJcblx0XHR2YXIgVEVNUExBVEUgPSBTdHJpbmcoU3RyaW5nKS5zcGxpdCgnU3RyaW5nJyk7XHJcblx0XHQobW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWx1ZSwgb3B0aW9ucykge1xyXG5cdFx0XHR2YXIgdW5zYWZlID0gb3B0aW9ucyA/ICEhb3B0aW9ucy51bnNhZmUgOiBmYWxzZTtcclxuXHRcdFx0dmFyIHNpbXBsZSA9IG9wdGlvbnMgPyAhIW9wdGlvbnMuZW51bWVyYWJsZSA6IGZhbHNlO1xyXG5cdFx0XHR2YXIgbm9UYXJnZXRHZXQgPSBvcHRpb25zID8gISFvcHRpb25zLm5vVGFyZ2V0R2V0IDogZmFsc2U7XHJcblxyXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGtleSA9PSAnc3RyaW5nJyAmJiAhaGFzKHZhbHVlLCAnbmFtZScpKSBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkodmFsdWUsICduYW1lJywga2V5KTtcclxuXHRcdFx0XHRlbmZvcmNlSW50ZXJuYWxTdGF0ZSh2YWx1ZSkuc291cmNlID0gVEVNUExBVEUuam9pbih0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8ga2V5IDogJycpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoTyA9PT0gZ2xvYmFsXzEpIHtcclxuXHRcdFx0XHRpZiAoc2ltcGxlKSBPW2tleV0gPSB2YWx1ZTsgZWxzZSBzZXRHbG9iYWwoa2V5LCB2YWx1ZSk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9IGVsc2UgaWYgKCF1bnNhZmUpIHtcclxuXHRcdFx0XHRkZWxldGUgT1trZXldO1xyXG5cdFx0XHR9IGVsc2UgaWYgKCFub1RhcmdldEdldCAmJiBPW2tleV0pIHtcclxuXHRcdFx0XHRzaW1wbGUgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoc2ltcGxlKSBPW2tleV0gPSB2YWx1ZTsgZWxzZSBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoTywga2V5LCB2YWx1ZSk7IC8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxyXG5cdFx0fSkoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcclxuXHRcdFx0cmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgZ2V0SW50ZXJuYWxTdGF0ZSh0aGlzKS5zb3VyY2UgfHwgaW5zcGVjdFNvdXJjZSh0aGlzKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cclxuXHR2YXIgcGF0aCA9IGdsb2JhbF8xO1xyXG5cclxuXHR2YXIgYUZ1bmN0aW9uID0gZnVuY3Rpb24gKHZhcmlhYmxlKSB7XHJcblx0XHRyZXR1cm4gdHlwZW9mIHZhcmlhYmxlID09ICdmdW5jdGlvbicgPyB2YXJpYWJsZSA6IHVuZGVmaW5lZDtcclxuXHR9O1xyXG5cclxuXHR2YXIgZ2V0QnVpbHRJbiA9IGZ1bmN0aW9uIChuYW1lc3BhY2UsIG1ldGhvZCkge1xyXG5cdFx0cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAyID8gYUZ1bmN0aW9uKHBhdGhbbmFtZXNwYWNlXSkgfHwgYUZ1bmN0aW9uKGdsb2JhbF8xW25hbWVzcGFjZV0pIDogcGF0aFtuYW1lc3BhY2VdICYmIHBhdGhbbmFtZXNwYWNlXVttZXRob2RdIHx8IGdsb2JhbF8xW25hbWVzcGFjZV0gJiYgZ2xvYmFsXzFbbmFtZXNwYWNlXVttZXRob2RdO1xyXG5cdH07XHJcblxyXG5cdHZhciBjZWlsID0gTWF0aC5jZWlsO1xyXG5cdHZhciBmbG9vciA9IE1hdGguZmxvb3I7IC8vIGBUb0ludGVnZXJgIGFic3RyYWN0IG9wZXJhdGlvblxyXG5cdC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvaW50ZWdlclxyXG5cclxuXHR2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XHJcblx0XHRyZXR1cm4gaXNOYU4oYXJndW1lbnQgPSArYXJndW1lbnQpID8gMCA6IChhcmd1bWVudCA+IDAgPyBmbG9vciA6IGNlaWwpKGFyZ3VtZW50KTtcclxuXHR9O1xyXG5cclxuXHR2YXIgbWluID0gTWF0aC5taW47IC8vIGBUb0xlbmd0aGAgYWJzdHJhY3Qgb3BlcmF0aW9uXHJcblx0Ly8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9sZW5ndGhcclxuXHJcblx0dmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XHJcblx0XHRyZXR1cm4gYXJndW1lbnQgPiAwID8gbWluKHRvSW50ZWdlcihhcmd1bWVudCksIDB4MUZGRkZGRkZGRkZGRkYpIDogMDsgLy8gMiAqKiA1MyAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxyXG5cdH07XHJcblxyXG5cdHZhciBtYXggPSBNYXRoLm1heDtcclxuXHR2YXIgbWluJDEgPSBNYXRoLm1pbjsgLy8gSGVscGVyIGZvciBhIHBvcHVsYXIgcmVwZWF0aW5nIGNhc2Ugb2YgdGhlIHNwZWM6XHJcblx0Ly8gTGV0IGludGVnZXIgYmUgPyBUb0ludGVnZXIoaW5kZXgpLlxyXG5cdC8vIElmIGludGVnZXIgPCAwLCBsZXQgcmVzdWx0IGJlIG1heCgobGVuZ3RoICsgaW50ZWdlciksIDApOyBlbHNlIGxldCByZXN1bHQgYmUgbWluKGludGVnZXIsIGxlbmd0aCkuXHJcblxyXG5cdHZhciB0b0Fic29sdXRlSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xyXG5cdFx0dmFyIGludGVnZXIgPSB0b0ludGVnZXIoaW5kZXgpO1xyXG5cdFx0cmV0dXJuIGludGVnZXIgPCAwID8gbWF4KGludGVnZXIgKyBsZW5ndGgsIDApIDogbWluJDEoaW50ZWdlciwgbGVuZ3RoKTtcclxuXHR9O1xyXG5cclxuXHQvLyBgQXJyYXkucHJvdG90eXBlLnsgaW5kZXhPZiwgaW5jbHVkZXMgfWAgbWV0aG9kcyBpbXBsZW1lbnRhdGlvblxyXG5cclxuXHJcblx0dmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xyXG5cdFx0XHR2YXIgTyA9IHRvSW5kZXhlZE9iamVjdCgkdGhpcyk7XHJcblx0XHRcdHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XHJcblx0XHRcdHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XHJcblx0XHRcdHZhciB2YWx1ZTsgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxyXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXHJcblxyXG5cdFx0XHRpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xyXG5cdFx0XHRcdHZhbHVlID0gT1tpbmRleCsrXTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxyXG5cclxuXHRcdFx0XHRpZiAodmFsdWUgIT0gdmFsdWUpIHJldHVybiB0cnVlOyAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XHJcblx0XHRcdH0gZWxzZSBmb3IgKDsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcclxuXHRcdFx0XHRpZiAoKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pICYmIE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcclxuXHRcdH07XHJcblx0fTtcclxuXHJcblx0dmFyIGFycmF5SW5jbHVkZXMgPSB7XHJcblx0XHQvLyBgQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzYCBtZXRob2RcclxuXHRcdC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xyXG5cdFx0aW5jbHVkZXM6IGNyZWF0ZU1ldGhvZCh0cnVlKSxcclxuXHRcdC8vIGBBcnJheS5wcm90b3R5cGUuaW5kZXhPZmAgbWV0aG9kXHJcblx0XHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5kZXhvZlxyXG5cdFx0aW5kZXhPZjogY3JlYXRlTWV0aG9kKGZhbHNlKVxyXG5cdH07XHJcblxyXG5cdHZhciBpbmRleE9mID0gYXJyYXlJbmNsdWRlcy5pbmRleE9mO1xyXG5cclxuXHJcblxyXG5cdHZhciBvYmplY3RLZXlzSW50ZXJuYWwgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lcykge1xyXG5cdFx0dmFyIE8gPSB0b0luZGV4ZWRPYmplY3Qob2JqZWN0KTtcclxuXHRcdHZhciBpID0gMDtcclxuXHRcdHZhciByZXN1bHQgPSBbXTtcclxuXHRcdHZhciBrZXk7XHJcblxyXG5cdFx0Zm9yIChrZXkgaW4gTykgIWhhcyhoaWRkZW5LZXlzLCBrZXkpICYmIGhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7IC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcclxuXHJcblxyXG5cdFx0d2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIGlmIChoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpIHtcclxuXHRcdFx0fmluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9O1xyXG5cclxuXHQvLyBJRTgtIGRvbid0IGVudW0gYnVnIGtleXNcclxuXHR2YXIgZW51bUJ1Z0tleXMgPSBbJ2NvbnN0cnVjdG9yJywgJ2hhc093blByb3BlcnR5JywgJ2lzUHJvdG90eXBlT2YnLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCAndG9Mb2NhbGVTdHJpbmcnLCAndG9TdHJpbmcnLCAndmFsdWVPZiddO1xyXG5cclxuXHR2YXIgaGlkZGVuS2V5cyQxID0gZW51bUJ1Z0tleXMuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7IC8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc2AgbWV0aG9kXHJcblx0Ly8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmdldG93bnByb3BlcnR5bmFtZXNcclxuXHJcblx0dmFyIGYkMyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xyXG5cdFx0cmV0dXJuIG9iamVjdEtleXNJbnRlcm5hbChPLCBoaWRkZW5LZXlzJDEpO1xyXG5cdH07XHJcblxyXG5cdHZhciBvYmplY3RHZXRPd25Qcm9wZXJ0eU5hbWVzID0ge1xyXG5cdFx0ZjogZiQzXHJcblx0fTtcclxuXHJcblx0dmFyIGYkNCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XHJcblxyXG5cdHZhciBvYmplY3RHZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSB7XHJcblx0XHRmOiBmJDRcclxuXHR9O1xyXG5cclxuXHQvLyBhbGwgb2JqZWN0IGtleXMsIGluY2x1ZGVzIG5vbi1lbnVtZXJhYmxlIGFuZCBzeW1ib2xzXHJcblxyXG5cclxuXHR2YXIgb3duS2V5cyA9IGdldEJ1aWx0SW4oJ1JlZmxlY3QnLCAnb3duS2V5cycpIHx8IGZ1bmN0aW9uIG93bktleXMoaXQpIHtcclxuXHRcdHZhciBrZXlzID0gb2JqZWN0R2V0T3duUHJvcGVydHlOYW1lcy5mKGFuT2JqZWN0KGl0KSk7XHJcblx0XHR2YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gb2JqZWN0R2V0T3duUHJvcGVydHlTeW1ib2xzLmY7XHJcblx0XHRyZXR1cm4gZ2V0T3duUHJvcGVydHlTeW1ib2xzID8ga2V5cy5jb25jYXQoZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KSkgOiBrZXlzO1xyXG5cdH07XHJcblxyXG5cdHZhciBjb3B5Q29uc3RydWN0b3JQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XHJcblx0XHR2YXIga2V5cyA9IG93bktleXMoc291cmNlKTtcclxuXHRcdHZhciBkZWZpbmVQcm9wZXJ0eSA9IG9iamVjdERlZmluZVByb3BlcnR5LmY7XHJcblx0XHR2YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gb2JqZWN0R2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLmY7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBrZXkgPSBrZXlzW2ldO1xyXG5cdFx0XHRpZiAoIWhhcyh0YXJnZXQsIGtleSkpIGRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHR2YXIgcmVwbGFjZW1lbnQgPSAvI3xcXC5wcm90b3R5cGVcXC4vO1xyXG5cclxuXHR2YXIgaXNGb3JjZWQgPSBmdW5jdGlvbiAoZmVhdHVyZSwgZGV0ZWN0aW9uKSB7XHJcblx0XHR2YXIgdmFsdWUgPSBkYXRhW25vcm1hbGl6ZShmZWF0dXJlKV07XHJcblx0XHRyZXR1cm4gdmFsdWUgPT0gUE9MWUZJTEwgPyB0cnVlIDogdmFsdWUgPT0gTkFUSVZFID8gZmFsc2UgOiB0eXBlb2YgZGV0ZWN0aW9uID09ICdmdW5jdGlvbicgPyBmYWlscyhkZXRlY3Rpb24pIDogISFkZXRlY3Rpb247XHJcblx0fTtcclxuXHJcblx0dmFyIG5vcm1hbGl6ZSA9IGlzRm9yY2VkLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcclxuXHRcdHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlcGxhY2VtZW50LCAnLicpLnRvTG93ZXJDYXNlKCk7XHJcblx0fTtcclxuXHJcblx0dmFyIGRhdGEgPSBpc0ZvcmNlZC5kYXRhID0ge307XHJcblx0dmFyIE5BVElWRSA9IGlzRm9yY2VkLk5BVElWRSA9ICdOJztcclxuXHR2YXIgUE9MWUZJTEwgPSBpc0ZvcmNlZC5QT0xZRklMTCA9ICdQJztcclxuXHR2YXIgaXNGb3JjZWRfMSA9IGlzRm9yY2VkO1xyXG5cclxuXHR2YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJDEgPSBvYmplY3RHZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IuZjtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblx0LypcclxuXHQgIG9wdGlvbnMudGFyZ2V0ICAgICAgLSBuYW1lIG9mIHRoZSB0YXJnZXQgb2JqZWN0XHJcblx0ICBvcHRpb25zLmdsb2JhbCAgICAgIC0gdGFyZ2V0IGlzIHRoZSBnbG9iYWwgb2JqZWN0XHJcblx0ICBvcHRpb25zLnN0YXQgICAgICAgIC0gZXhwb3J0IGFzIHN0YXRpYyBtZXRob2RzIG9mIHRhcmdldFxyXG5cdCAgb3B0aW9ucy5wcm90byAgICAgICAtIGV4cG9ydCBhcyBwcm90b3R5cGUgbWV0aG9kcyBvZiB0YXJnZXRcclxuXHQgIG9wdGlvbnMucmVhbCAgICAgICAgLSByZWFsIHByb3RvdHlwZSBtZXRob2QgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxyXG5cdCAgb3B0aW9ucy5mb3JjZWQgICAgICAtIGV4cG9ydCBldmVuIGlmIHRoZSBuYXRpdmUgZmVhdHVyZSBpcyBhdmFpbGFibGVcclxuXHQgIG9wdGlvbnMuYmluZCAgICAgICAgLSBiaW5kIG1ldGhvZHMgdG8gdGhlIHRhcmdldCwgcmVxdWlyZWQgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxyXG5cdCAgb3B0aW9ucy53cmFwICAgICAgICAtIHdyYXAgY29uc3RydWN0b3JzIHRvIHByZXZlbnRpbmcgZ2xvYmFsIHBvbGx1dGlvbiwgcmVxdWlyZWQgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxyXG5cdCAgb3B0aW9ucy51bnNhZmUgICAgICAtIHVzZSB0aGUgc2ltcGxlIGFzc2lnbm1lbnQgb2YgcHJvcGVydHkgaW5zdGVhZCBvZiBkZWxldGUgKyBkZWZpbmVQcm9wZXJ0eVxyXG5cdCAgb3B0aW9ucy5zaGFtICAgICAgICAtIGFkZCBhIGZsYWcgdG8gbm90IGNvbXBsZXRlbHkgZnVsbCBwb2x5ZmlsbHNcclxuXHQgIG9wdGlvbnMuZW51bWVyYWJsZSAgLSBleHBvcnQgYXMgZW51bWVyYWJsZSBwcm9wZXJ0eVxyXG5cdCAgb3B0aW9ucy5ub1RhcmdldEdldCAtIHByZXZlbnQgY2FsbGluZyBhIGdldHRlciBvbiB0YXJnZXRcclxuXHQqL1xyXG5cclxuXHJcblx0dmFyIF9leHBvcnQgPSBmdW5jdGlvbiAob3B0aW9ucywgc291cmNlKSB7XHJcblx0XHR2YXIgVEFSR0VUID0gb3B0aW9ucy50YXJnZXQ7XHJcblx0XHR2YXIgR0xPQkFMID0gb3B0aW9ucy5nbG9iYWw7XHJcblx0XHR2YXIgU1RBVElDID0gb3B0aW9ucy5zdGF0O1xyXG5cdFx0dmFyIEZPUkNFRCwgdGFyZ2V0LCBrZXksIHRhcmdldFByb3BlcnR5LCBzb3VyY2VQcm9wZXJ0eSwgZGVzY3JpcHRvcjtcclxuXHJcblx0XHRpZiAoR0xPQkFMKSB7XHJcblx0XHRcdHRhcmdldCA9IGdsb2JhbF8xO1xyXG5cdFx0fSBlbHNlIGlmIChTVEFUSUMpIHtcclxuXHRcdFx0dGFyZ2V0ID0gZ2xvYmFsXzFbVEFSR0VUXSB8fCBzZXRHbG9iYWwoVEFSR0VULCB7fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0YXJnZXQgPSAoZ2xvYmFsXzFbVEFSR0VUXSB8fCB7fSkucHJvdG90eXBlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0YXJnZXQpIGZvciAoa2V5IGluIHNvdXJjZSkge1xyXG5cdFx0XHRzb3VyY2VQcm9wZXJ0eSA9IHNvdXJjZVtrZXldO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMubm9UYXJnZXRHZXQpIHtcclxuXHRcdFx0XHRkZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJDEodGFyZ2V0LCBrZXkpO1xyXG5cdFx0XHRcdHRhcmdldFByb3BlcnR5ID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnZhbHVlO1xyXG5cdFx0XHR9IGVsc2UgdGFyZ2V0UHJvcGVydHkgPSB0YXJnZXRba2V5XTtcclxuXHJcblx0XHRcdEZPUkNFRCA9IGlzRm9yY2VkXzEoR0xPQkFMID8ga2V5IDogVEFSR0VUICsgKFNUQVRJQyA/ICcuJyA6ICcjJykgKyBrZXksIG9wdGlvbnMuZm9yY2VkKTsgLy8gY29udGFpbmVkIGluIHRhcmdldFxyXG5cclxuXHRcdFx0aWYgKCFGT1JDRUQgJiYgdGFyZ2V0UHJvcGVydHkgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdGlmICh0eXBlb2Ygc291cmNlUHJvcGVydHkgPT09IHR5cGVvZiB0YXJnZXRQcm9wZXJ0eSkgY29udGludWU7XHJcblx0XHRcdFx0Y29weUNvbnN0cnVjdG9yUHJvcGVydGllcyhzb3VyY2VQcm9wZXJ0eSwgdGFyZ2V0UHJvcGVydHkpO1xyXG5cdFx0XHR9IC8vIGFkZCBhIGZsYWcgdG8gbm90IGNvbXBsZXRlbHkgZnVsbCBwb2x5ZmlsbHNcclxuXHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy5zaGFtIHx8IHRhcmdldFByb3BlcnR5ICYmIHRhcmdldFByb3BlcnR5LnNoYW0pIHtcclxuXHRcdFx0XHRjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoc291cmNlUHJvcGVydHksICdzaGFtJywgdHJ1ZSk7XHJcblx0XHRcdH0gLy8gZXh0ZW5kIGdsb2JhbFxyXG5cclxuXHJcblx0XHRcdHJlZGVmaW5lKHRhcmdldCwga2V5LCBzb3VyY2VQcm9wZXJ0eSwgb3B0aW9ucyk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gYE9iamVjdC5rZXlzYCBtZXRob2RcclxuXHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3Qua2V5c1xyXG5cclxuXHJcblx0dmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcclxuXHRcdHJldHVybiBvYmplY3RLZXlzSW50ZXJuYWwoTywgZW51bUJ1Z0tleXMpO1xyXG5cdH07XHJcblxyXG5cdC8vIGBUb09iamVjdGAgYWJzdHJhY3Qgb3BlcmF0aW9uXHJcblx0Ly8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9vYmplY3RcclxuXHJcblxyXG5cdHZhciB0b09iamVjdCA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xyXG5cdFx0cmV0dXJuIE9iamVjdChyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KSk7XHJcblx0fTtcclxuXHJcblx0dmFyIG5hdGl2ZUFzc2lnbiA9IE9iamVjdC5hc3NpZ247XHJcblx0dmFyIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5OyAvLyBgT2JqZWN0LmFzc2lnbmAgbWV0aG9kXHJcblx0Ly8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmFzc2lnblxyXG5cclxuXHR2YXIgb2JqZWN0QXNzaWduID0gIW5hdGl2ZUFzc2lnbiB8fCBmYWlscyhmdW5jdGlvbiAoKSB7XHJcblx0XHQvLyBzaG91bGQgaGF2ZSBjb3JyZWN0IG9yZGVyIG9mIG9wZXJhdGlvbnMgKEVkZ2UgYnVnKVxyXG5cdFx0aWYgKGRlc2NyaXB0b3JzICYmIG5hdGl2ZUFzc2lnbih7XHJcblx0XHRcdGI6IDFcclxuXHRcdH0sIG5hdGl2ZUFzc2lnbihkZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7XHJcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGRlZmluZVByb3BlcnR5KHRoaXMsICdiJywge1xyXG5cdFx0XHRcdFx0dmFsdWU6IDMsXHJcblx0XHRcdFx0XHRlbnVtZXJhYmxlOiBmYWxzZVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KSwge1xyXG5cdFx0XHRiOiAyXHJcblx0XHR9KSkuYiAhPT0gMSkgcmV0dXJuIHRydWU7IC8vIHNob3VsZCB3b3JrIHdpdGggc3ltYm9scyBhbmQgc2hvdWxkIGhhdmUgZGV0ZXJtaW5pc3RpYyBwcm9wZXJ0eSBvcmRlciAoVjggYnVnKVxyXG5cclxuXHRcdHZhciBBID0ge307XHJcblx0XHR2YXIgQiA9IHt9OyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHJcblx0XHR2YXIgc3ltYm9sID0gU3ltYm9sKCk7XHJcblx0XHR2YXIgYWxwaGFiZXQgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3QnO1xyXG5cdFx0QVtzeW1ib2xdID0gNztcclxuXHRcdGFscGhhYmV0LnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChjaHIpIHtcclxuXHRcdFx0QltjaHJdID0gY2hyO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbmF0aXZlQXNzaWduKHt9LCBBKVtzeW1ib2xdICE9IDcgfHwgb2JqZWN0S2V5cyhuYXRpdmVBc3NpZ24oe30sIEIpKS5qb2luKCcnKSAhPSBhbHBoYWJldDtcclxuXHR9KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSkge1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG5cdFx0dmFyIFQgPSB0b09iamVjdCh0YXJnZXQpO1xyXG5cdFx0dmFyIGFyZ3VtZW50c0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcblx0XHR2YXIgaW5kZXggPSAxO1xyXG5cdFx0dmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IG9iamVjdEdldE93blByb3BlcnR5U3ltYm9scy5mO1xyXG5cdFx0dmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvcGVydHlJc0VudW1lcmFibGUuZjtcclxuXHJcblx0XHR3aGlsZSAoYXJndW1lbnRzTGVuZ3RoID4gaW5kZXgpIHtcclxuXHRcdFx0dmFyIFMgPSBpbmRleGVkT2JqZWN0KGFyZ3VtZW50c1tpbmRleCsrXSk7XHJcblx0XHRcdHZhciBrZXlzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzID8gb2JqZWN0S2V5cyhTKS5jb25jYXQoZ2V0T3duUHJvcGVydHlTeW1ib2xzKFMpKSA6IG9iamVjdEtleXMoUyk7XHJcblx0XHRcdHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcclxuXHRcdFx0dmFyIGogPSAwO1xyXG5cdFx0XHR2YXIga2V5O1xyXG5cclxuXHRcdFx0d2hpbGUgKGxlbmd0aCA+IGopIHtcclxuXHRcdFx0XHRrZXkgPSBrZXlzW2orK107XHJcblx0XHRcdFx0aWYgKCFkZXNjcmlwdG9ycyB8fCBwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKFMsIGtleSkpIFRba2V5XSA9IFNba2V5XTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBUO1xyXG5cdH0gOiBuYXRpdmVBc3NpZ247XHJcblxyXG5cdC8vIGBPYmplY3QuYXNzaWduYCBtZXRob2RcclxuXHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuYXNzaWduXHJcblxyXG5cclxuXHRfZXhwb3J0KHtcclxuXHRcdHRhcmdldDogJ09iamVjdCcsXHJcblx0XHRzdGF0OiB0cnVlLFxyXG5cdFx0Zm9yY2VkOiBPYmplY3QuYXNzaWduICE9PSBvYmplY3RBc3NpZ25cclxuXHR9LCB7XHJcblx0XHRhc3NpZ246IG9iamVjdEFzc2lnblxyXG5cdH0pO1xyXG5cclxuXHQvLyBgU3RyaW5nLnByb3RvdHlwZS5yZXBlYXRgIG1ldGhvZCBpbXBsZW1lbnRhdGlvblxyXG5cdC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUucmVwZWF0XHJcblxyXG5cclxuXHR2YXIgc3RyaW5nUmVwZWF0ID0gJycucmVwZWF0IHx8IGZ1bmN0aW9uIHJlcGVhdChjb3VudCkge1xyXG5cdFx0dmFyIHN0ciA9IFN0cmluZyhyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKHRoaXMpKTtcclxuXHRcdHZhciByZXN1bHQgPSAnJztcclxuXHRcdHZhciBuID0gdG9JbnRlZ2VyKGNvdW50KTtcclxuXHRcdGlmIChuIDwgMCB8fCBuID09IEluZmluaXR5KSB0aHJvdyBSYW5nZUVycm9yKCdXcm9uZyBudW1iZXIgb2YgcmVwZXRpdGlvbnMnKTtcclxuXHJcblx0XHRmb3IgKDsgbiA+IDA7IChuID4+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKSBpZiAobiAmIDEpIHJlc3VsdCArPSBzdHI7XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9O1xyXG5cclxuXHQvLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1zdHJpbmctcGFkLXN0YXJ0LWVuZFxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cdHZhciBjZWlsJDEgPSBNYXRoLmNlaWw7IC8vIGBTdHJpbmcucHJvdG90eXBlLnsgcGFkU3RhcnQsIHBhZEVuZCB9YCBtZXRob2RzIGltcGxlbWVudGF0aW9uXHJcblxyXG5cdHZhciBjcmVhdGVNZXRob2QkMSA9IGZ1bmN0aW9uIChJU19FTkQpIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIG1heExlbmd0aCwgZmlsbFN0cmluZykge1xyXG5cdFx0XHR2YXIgUyA9IFN0cmluZyhyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKCR0aGlzKSk7XHJcblx0XHRcdHZhciBzdHJpbmdMZW5ndGggPSBTLmxlbmd0aDtcclxuXHRcdFx0dmFyIGZpbGxTdHIgPSBmaWxsU3RyaW5nID09PSB1bmRlZmluZWQgPyAnICcgOiBTdHJpbmcoZmlsbFN0cmluZyk7XHJcblx0XHRcdHZhciBpbnRNYXhMZW5ndGggPSB0b0xlbmd0aChtYXhMZW5ndGgpO1xyXG5cdFx0XHR2YXIgZmlsbExlbiwgc3RyaW5nRmlsbGVyO1xyXG5cdFx0XHRpZiAoaW50TWF4TGVuZ3RoIDw9IHN0cmluZ0xlbmd0aCB8fCBmaWxsU3RyID09ICcnKSByZXR1cm4gUztcclxuXHRcdFx0ZmlsbExlbiA9IGludE1heExlbmd0aCAtIHN0cmluZ0xlbmd0aDtcclxuXHRcdFx0c3RyaW5nRmlsbGVyID0gc3RyaW5nUmVwZWF0LmNhbGwoZmlsbFN0ciwgY2VpbCQxKGZpbGxMZW4gLyBmaWxsU3RyLmxlbmd0aCkpO1xyXG5cdFx0XHRpZiAoc3RyaW5nRmlsbGVyLmxlbmd0aCA+IGZpbGxMZW4pIHN0cmluZ0ZpbGxlciA9IHN0cmluZ0ZpbGxlci5zbGljZSgwLCBmaWxsTGVuKTtcclxuXHRcdFx0cmV0dXJuIElTX0VORCA/IFMgKyBzdHJpbmdGaWxsZXIgOiBzdHJpbmdGaWxsZXIgKyBTO1xyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHR2YXIgc3RyaW5nUGFkID0ge1xyXG5cdFx0Ly8gYFN0cmluZy5wcm90b3R5cGUucGFkU3RhcnRgIG1ldGhvZFxyXG5cdFx0Ly8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS5wYWRzdGFydFxyXG5cdFx0c3RhcnQ6IGNyZWF0ZU1ldGhvZCQxKGZhbHNlKSxcclxuXHRcdC8vIGBTdHJpbmcucHJvdG90eXBlLnBhZEVuZGAgbWV0aG9kXHJcblx0XHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLnBhZGVuZFxyXG5cdFx0ZW5kOiBjcmVhdGVNZXRob2QkMSh0cnVlKVxyXG5cdH07XHJcblxyXG5cdHZhciBlbmdpbmVVc2VyQWdlbnQgPSBnZXRCdWlsdEluKCduYXZpZ2F0b3InLCAndXNlckFnZW50JykgfHwgJyc7XHJcblxyXG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8yODBcclxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9uby11bnNhZmUtcmVnZXhcclxuXHJcblxyXG5cdHZhciBzdHJpbmdQYWRXZWJraXRCdWcgPSAvVmVyc2lvblxcLzEwXFwuXFxkKyhcXC5cXGQrKT8oIE1vYmlsZVxcL1xcdyspPyBTYWZhcmlcXC8vLnRlc3QoZW5naW5lVXNlckFnZW50KTtcclxuXHJcblx0dmFyICRwYWRFbmQgPSBzdHJpbmdQYWQuZW5kO1xyXG5cclxuXHQvLyBgU3RyaW5nLnByb3RvdHlwZS5wYWRFbmRgIG1ldGhvZFxyXG5cdC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUucGFkZW5kXHJcblxyXG5cclxuXHRfZXhwb3J0KHtcclxuXHRcdHRhcmdldDogJ1N0cmluZycsXHJcblx0XHRwcm90bzogdHJ1ZSxcclxuXHRcdGZvcmNlZDogc3RyaW5nUGFkV2Via2l0QnVnXHJcblx0fSwge1xyXG5cdFx0cGFkRW5kOiBmdW5jdGlvbiBwYWRFbmQobWF4TGVuZ3RoXHJcblx0XHRcdC8qICwgZmlsbFN0cmluZyA9ICcgJyAqL1xyXG5cdFx0KSB7XHJcblx0XHRcdHJldHVybiAkcGFkRW5kKHRoaXMsIG1heExlbmd0aCwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHR2YXIgJHBhZFN0YXJ0ID0gc3RyaW5nUGFkLnN0YXJ0O1xyXG5cclxuXHQvLyBgU3RyaW5nLnByb3RvdHlwZS5wYWRTdGFydGAgbWV0aG9kXHJcblx0Ly8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS5wYWRzdGFydFxyXG5cclxuXHJcblx0X2V4cG9ydCh7XHJcblx0XHR0YXJnZXQ6ICdTdHJpbmcnLFxyXG5cdFx0cHJvdG86IHRydWUsXHJcblx0XHRmb3JjZWQ6IHN0cmluZ1BhZFdlYmtpdEJ1Z1xyXG5cdH0sIHtcclxuXHRcdHBhZFN0YXJ0OiBmdW5jdGlvbiBwYWRTdGFydChtYXhMZW5ndGhcclxuXHRcdFx0LyogLCBmaWxsU3RyaW5nID0gJyAnICovXHJcblx0XHQpIHtcclxuXHRcdFx0cmV0dXJuICRwYWRTdGFydCh0aGlzLCBtYXhMZW5ndGgsIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0Ly8gYFN0cmluZy5wcm90b3R5cGUucmVwZWF0YCBtZXRob2RcclxuXHQvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLnJlcGVhdFxyXG5cclxuXHJcblx0X2V4cG9ydCh7XHJcblx0XHR0YXJnZXQ6ICdTdHJpbmcnLFxyXG5cdFx0cHJvdG86IHRydWVcclxuXHR9LCB7XHJcblx0XHRyZXBlYXQ6IHN0cmluZ1JlcGVhdFxyXG5cdH0pO1xyXG5cclxuXHQvLyBgZ2xvYmFsVGhpc2Agb2JqZWN0XHJcblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtZ2xvYmFsXHJcblxyXG5cclxuXHRfZXhwb3J0KHtcclxuXHRcdGdsb2JhbDogdHJ1ZVxyXG5cdH0sIHtcclxuXHRcdGdsb2JhbFRoaXM6IGdsb2JhbF8xXHJcblx0fSk7XHJcblxyXG5cdGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XHJcblx0XHRcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XHJcblxyXG5cdFx0aWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7XHJcblx0XHRcdF90eXBlb2YgPSBmdW5jdGlvbiAob2JqKSB7XHJcblx0XHRcdFx0cmV0dXJuIHR5cGVvZiBvYmo7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRfdHlwZW9mID0gZnVuY3Rpb24gKG9iaikge1xyXG5cdFx0XHRcdHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBfdHlwZW9mKG9iaik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XHJcblx0XHRpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xyXG5cdFx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XHJcblx0XHRcdGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcclxuXHRcdFx0aWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcclxuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xyXG5cdFx0aWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XHJcblx0XHRpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XHJcblx0XHRyZXR1cm4gQ29uc3RydWN0b3I7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7XHJcblx0XHRpZiAoa2V5IGluIG9iaikge1xyXG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcclxuXHRcdFx0XHR2YWx1ZTogdmFsdWUsXHJcblx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXHJcblx0XHRcdFx0d3JpdGFibGU6IHRydWVcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvYmpba2V5XSA9IHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvYmo7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcclxuXHRcdGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xyXG5cdFx0XHRjb25zdHJ1Y3Rvcjoge1xyXG5cdFx0XHRcdHZhbHVlOiBzdWJDbGFzcyxcclxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZSxcclxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRpZiAoc3VwZXJDbGFzcykgX3NldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XHJcblx0XHRfZ2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xyXG5cdFx0XHRyZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xyXG5cdFx0fTtcclxuXHRcdHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xyXG5cdFx0X3NldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7XHJcblx0XHRcdG8uX19wcm90b19fID0gcDtcclxuXHRcdFx0cmV0dXJuIG87XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShzb3VyY2UsIGV4Y2x1ZGVkKSB7XHJcblx0XHRpZiAoc291cmNlID09IG51bGwpIHJldHVybiB7fTtcclxuXHRcdHZhciB0YXJnZXQgPSB7fTtcclxuXHRcdHZhciBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTtcclxuXHRcdHZhciBrZXksIGk7XHJcblxyXG5cdFx0Zm9yIChpID0gMDsgaSA8IHNvdXJjZUtleXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0a2V5ID0gc291cmNlS2V5c1tpXTtcclxuXHRcdFx0aWYgKGV4Y2x1ZGVkLmluZGV4T2Yoa2V5KSA+PSAwKSBjb250aW51ZTtcclxuXHRcdFx0dGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGFyZ2V0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHNvdXJjZSwgZXhjbHVkZWQpIHtcclxuXHRcdGlmIChzb3VyY2UgPT0gbnVsbCkgcmV0dXJuIHt9O1xyXG5cclxuXHRcdHZhciB0YXJnZXQgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShzb3VyY2UsIGV4Y2x1ZGVkKTtcclxuXHJcblx0XHR2YXIga2V5LCBpO1xyXG5cclxuXHRcdGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XHJcblx0XHRcdHZhciBzb3VyY2VTeW1ib2xLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzb3VyY2UpO1xyXG5cclxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHNvdXJjZVN5bWJvbEtleXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRrZXkgPSBzb3VyY2VTeW1ib2xLZXlzW2ldO1xyXG5cdFx0XHRcdGlmIChleGNsdWRlZC5pbmRleE9mKGtleSkgPj0gMCkgY29udGludWU7XHJcblx0XHRcdFx0aWYgKCFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoc291cmNlLCBrZXkpKSBjb250aW51ZTtcclxuXHRcdFx0XHR0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRhcmdldDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikge1xyXG5cdFx0aWYgKHNlbGYgPT09IHZvaWQgMCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHNlbGY7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7XHJcblx0XHRpZiAoY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHtcclxuXHRcdFx0cmV0dXJuIGNhbGw7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfc3VwZXJQcm9wQmFzZShvYmplY3QsIHByb3BlcnR5KSB7XHJcblx0XHR3aGlsZSAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xyXG5cdFx0XHRvYmplY3QgPSBfZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcclxuXHRcdFx0aWYgKG9iamVjdCA9PT0gbnVsbCkgYnJlYWs7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG9iamVjdDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcclxuXHRcdGlmICh0eXBlb2YgUmVmbGVjdCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBSZWZsZWN0LmdldCkge1xyXG5cdFx0XHRfZ2V0ID0gUmVmbGVjdC5nZXQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRfZ2V0ID0gZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcikge1xyXG5cdFx0XHRcdHZhciBiYXNlID0gX3N1cGVyUHJvcEJhc2UodGFyZ2V0LCBwcm9wZXJ0eSk7XHJcblxyXG5cdFx0XHRcdGlmICghYmFzZSkgcmV0dXJuO1xyXG5cdFx0XHRcdHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihiYXNlLCBwcm9wZXJ0eSk7XHJcblxyXG5cdFx0XHRcdGlmIChkZXNjLmdldCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGRlc2MuZ2V0LmNhbGwocmVjZWl2ZXIpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIGRlc2MudmFsdWU7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIgfHwgdGFyZ2V0KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldCQxKHRhcmdldCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcikge1xyXG5cdFx0aWYgKHR5cGVvZiBSZWZsZWN0ICE9PSBcInVuZGVmaW5lZFwiICYmIFJlZmxlY3Quc2V0KSB7XHJcblx0XHRcdHNldCQxID0gUmVmbGVjdC5zZXQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRzZXQkMSA9IGZ1bmN0aW9uIHNldCh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcclxuXHRcdFx0XHR2YXIgYmFzZSA9IF9zdXBlclByb3BCYXNlKHRhcmdldCwgcHJvcGVydHkpO1xyXG5cclxuXHRcdFx0XHR2YXIgZGVzYztcclxuXHJcblx0XHRcdFx0aWYgKGJhc2UpIHtcclxuXHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGJhc2UsIHByb3BlcnR5KTtcclxuXHJcblx0XHRcdFx0XHRpZiAoZGVzYy5zZXQpIHtcclxuXHRcdFx0XHRcdFx0ZGVzYy5zZXQuY2FsbChyZWNlaXZlciwgdmFsdWUpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIWRlc2Mud3JpdGFibGUpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocmVjZWl2ZXIsIHByb3BlcnR5KTtcclxuXHJcblx0XHRcdFx0aWYgKGRlc2MpIHtcclxuXHRcdFx0XHRcdGlmICghZGVzYy53cml0YWJsZSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0ZGVzYy52YWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHJlY2VpdmVyLCBwcm9wZXJ0eSwgZGVzYyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdF9kZWZpbmVQcm9wZXJ0eShyZWNlaXZlciwgcHJvcGVydHksIHZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBzZXQkMSh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX3NldCh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIsIGlzU3RyaWN0KSB7XHJcblx0XHR2YXIgcyA9IHNldCQxKHRhcmdldCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlciB8fCB0YXJnZXQpO1xyXG5cclxuXHRcdGlmICghcyAmJiBpc1N0cmljdCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCB0byBzZXQgcHJvcGVydHknKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHtcclxuXHRcdHJldHVybiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCBfbm9uSXRlcmFibGVSZXN0KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7XHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkge1xyXG5cdFx0aWYgKCEoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09PSBcIltvYmplY3QgQXJndW1lbnRzXVwiKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIF9hcnIgPSBbXTtcclxuXHRcdHZhciBfbiA9IHRydWU7XHJcblx0XHR2YXIgX2QgPSBmYWxzZTtcclxuXHRcdHZhciBfZSA9IHVuZGVmaW5lZDtcclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHRmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7XHJcblx0XHRcdFx0X2Fyci5wdXNoKF9zLnZhbHVlKTtcclxuXHJcblx0XHRcdFx0aWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0X2QgPSB0cnVlO1xyXG5cdFx0XHRfZSA9IGVycjtcclxuXHRcdH0gZmluYWxseSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0aWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpO1xyXG5cdFx0XHR9IGZpbmFsbHkge1xyXG5cdFx0XHRcdGlmIChfZCkgdGhyb3cgX2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gX2FycjtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7XHJcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcclxuXHR9XHJcblxyXG5cdC8qKiBDaGVja3MgaWYgdmFsdWUgaXMgc3RyaW5nICovXHJcblx0ZnVuY3Rpb24gaXNTdHJpbmcoc3RyKSB7XHJcblx0XHRyZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG5cdH1cclxuXHQvKipcclxuXHQgIERpcmVjdGlvblxyXG5cdCAgQHByb3Age3N0cmluZ30gTk9ORVxyXG5cdCAgQHByb3Age3N0cmluZ30gTEVGVFxyXG5cdCAgQHByb3Age3N0cmluZ30gRk9SQ0VfTEVGVFxyXG5cdCAgQHByb3Age3N0cmluZ30gUklHSFRcclxuXHQgIEBwcm9wIHtzdHJpbmd9IEZPUkNFX1JJR0hUXHJcblx0Ki9cclxuXHJcblx0dmFyIERJUkVDVElPTiA9IHtcclxuXHRcdE5PTkU6ICdOT05FJyxcclxuXHRcdExFRlQ6ICdMRUZUJyxcclxuXHRcdEZPUkNFX0xFRlQ6ICdGT1JDRV9MRUZUJyxcclxuXHRcdFJJR0hUOiAnUklHSFQnLFxyXG5cdFx0Rk9SQ0VfUklHSFQ6ICdGT1JDRV9SSUdIVCdcclxuXHR9O1xyXG5cdC8qKiAqL1xyXG5cclxuXHRmdW5jdGlvbiBmb3JjZURpcmVjdGlvbihkaXJlY3Rpb24pIHtcclxuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcblx0XHRcdGNhc2UgRElSRUNUSU9OLkxFRlQ6XHJcblx0XHRcdFx0cmV0dXJuIERJUkVDVElPTi5GT1JDRV9MRUZUO1xyXG5cclxuXHRcdFx0Y2FzZSBESVJFQ1RJT04uUklHSFQ6XHJcblx0XHRcdFx0cmV0dXJuIERJUkVDVElPTi5GT1JDRV9SSUdIVDtcclxuXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIGRpcmVjdGlvbjtcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqIEVzY2FwZXMgcmVndWxhciBleHByZXNzaW9uIGNvbnRyb2wgY2hhcnMgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cikge1xyXG5cdFx0cmV0dXJuIHN0ci5yZXBsYWNlKC8oWy4qKz9ePSE6JHt9KCl8W1xcXS9cXFxcXSkvZywgJ1xcXFwkMScpO1xyXG5cdH0gLy8gY2xvbmVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Vwb2JlcmV6a2luL2Zhc3QtZGVlcC1lcXVhbCB3aXRoIHNtYWxsIGNoYW5nZXNcclxuXHJcblx0ZnVuY3Rpb24gb2JqZWN0SW5jbHVkZXMoYiwgYSkge1xyXG5cdFx0aWYgKGEgPT09IGIpIHJldHVybiB0cnVlO1xyXG5cdFx0dmFyIGFyckEgPSBBcnJheS5pc0FycmF5KGEpLFxyXG5cdFx0XHRhcnJCID0gQXJyYXkuaXNBcnJheShiKSxcclxuXHRcdFx0aTtcclxuXHJcblx0XHRpZiAoYXJyQSAmJiBhcnJCKSB7XHJcblx0XHRcdGlmIChhLmxlbmd0aCAhPSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoIW9iamVjdEluY2x1ZGVzKGFbaV0sIGJbaV0pKSByZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChhcnJBICE9IGFyckIpIHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRpZiAoYSAmJiBiICYmIF90eXBlb2YoYSkgPT09ICdvYmplY3QnICYmIF90eXBlb2YoYikgPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdHZhciBkYXRlQSA9IGEgaW5zdGFuY2VvZiBEYXRlLFxyXG5cdFx0XHRcdGRhdGVCID0gYiBpbnN0YW5jZW9mIERhdGU7XHJcblx0XHRcdGlmIChkYXRlQSAmJiBkYXRlQikgcmV0dXJuIGEuZ2V0VGltZSgpID09IGIuZ2V0VGltZSgpO1xyXG5cdFx0XHRpZiAoZGF0ZUEgIT0gZGF0ZUIpIHJldHVybiBmYWxzZTtcclxuXHRcdFx0dmFyIHJlZ2V4cEEgPSBhIGluc3RhbmNlb2YgUmVnRXhwLFxyXG5cdFx0XHRcdHJlZ2V4cEIgPSBiIGluc3RhbmNlb2YgUmVnRXhwO1xyXG5cdFx0XHRpZiAocmVnZXhwQSAmJiByZWdleHBCKSByZXR1cm4gYS50b1N0cmluZygpID09IGIudG9TdHJpbmcoKTtcclxuXHRcdFx0aWYgKHJlZ2V4cEEgIT0gcmVnZXhwQikgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKGEpOyAvLyBpZiAoa2V5cy5sZW5ndGggIT09IE9iamVjdC5rZXlzKGIpLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXlzW2ldKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICghb2JqZWN0SW5jbHVkZXMoYltrZXlzW2ldXSwgYVtrZXlzW2ldXSkpIHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9IGVsc2UgaWYgKGEgJiYgYiAmJiB0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgYiA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRyZXR1cm4gYS50b1N0cmluZygpID09PSBiLnRvU3RyaW5nKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHQvKiogU2VsZWN0aW9uIHJhbmdlICovXHJcblxyXG5cdC8qKiBQcm92aWRlcyBkZXRhaWxzIG9mIGNoYW5naW5nIGlucHV0ICovXHJcblxyXG5cdHZhciBBY3Rpb25EZXRhaWxzID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0LyoqIEN1cnJlbnQgaW5wdXQgdmFsdWUgKi9cclxuXHJcblx0XHRcdC8qKiBDdXJyZW50IGN1cnNvciBwb3NpdGlvbiAqL1xyXG5cclxuXHRcdFx0LyoqIE9sZCBpbnB1dCB2YWx1ZSAqL1xyXG5cclxuXHRcdFx0LyoqIE9sZCBzZWxlY3Rpb24gKi9cclxuXHRcdFx0ZnVuY3Rpb24gQWN0aW9uRGV0YWlscyh2YWx1ZSwgY3Vyc29yUG9zLCBvbGRWYWx1ZSwgb2xkU2VsZWN0aW9uKSB7XHJcblx0XHRcdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIEFjdGlvbkRldGFpbHMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0dGhpcy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcblx0XHRcdFx0dGhpcy5vbGRWYWx1ZSA9IG9sZFZhbHVlO1xyXG5cdFx0XHRcdHRoaXMub2xkU2VsZWN0aW9uID0gb2xkU2VsZWN0aW9uOyAvLyBkb3VibGUgY2hlY2sgaWYgbGVmdCBwYXJ0IHdhcyBjaGFuZ2VkIChhdXRvZmlsbGluZywgb3RoZXIgbm9uLXN0YW5kYXJkIGlucHV0IHRyaWdnZXJzKVxyXG5cclxuXHRcdFx0XHR3aGlsZSAodGhpcy52YWx1ZS5zbGljZSgwLCB0aGlzLnN0YXJ0Q2hhbmdlUG9zKSAhPT0gdGhpcy5vbGRWYWx1ZS5zbGljZSgwLCB0aGlzLnN0YXJ0Q2hhbmdlUG9zKSkge1xyXG5cdFx0XHRcdFx0LS10aGlzLm9sZFNlbGVjdGlvbi5zdGFydDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAgU3RhcnQgY2hhbmdpbmcgcG9zaXRpb25cclxuXHRcdFx0ICBAcmVhZG9ubHlcclxuXHRcdFx0Ki9cclxuXHJcblxyXG5cdFx0XHRfY3JlYXRlQ2xhc3MoQWN0aW9uRGV0YWlscywgW3tcclxuXHRcdFx0XHRrZXk6IFwic3RhcnRDaGFuZ2VQb3NcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiBNYXRoLm1pbih0aGlzLmN1cnNvclBvcywgdGhpcy5vbGRTZWxlY3Rpb24uc3RhcnQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEluc2VydGVkIHN5bWJvbHMgY291bnRcclxuXHRcdFx0XHQgIEByZWFkb25seVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImluc2VydGVkQ291bnRcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmN1cnNvclBvcyAtIHRoaXMuc3RhcnRDaGFuZ2VQb3M7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgSW5zZXJ0ZWQgc3ltYm9sc1xyXG5cdFx0XHRcdCAgQHJlYWRvbmx5XHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiaW5zZXJ0ZWRcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnZhbHVlLnN1YnN0cih0aGlzLnN0YXJ0Q2hhbmdlUG9zLCB0aGlzLmluc2VydGVkQ291bnQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIFJlbW92ZWQgc3ltYm9scyBjb3VudFxyXG5cdFx0XHRcdCAgQHJlYWRvbmx5XHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwicmVtb3ZlZENvdW50XCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHQvLyBNYXRoLm1heCBmb3Igb3Bwb3NpdGUgb3BlcmF0aW9uXHJcblx0XHRcdFx0XHRyZXR1cm4gTWF0aC5tYXgodGhpcy5vbGRTZWxlY3Rpb24uZW5kIC0gdGhpcy5zdGFydENoYW5nZVBvcyB8fCAvLyBmb3IgRGVsZXRlXHJcblx0XHRcdFx0XHRcdHRoaXMub2xkVmFsdWUubGVuZ3RoIC0gdGhpcy52YWx1ZS5sZW5ndGgsIDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIFJlbW92ZWQgc3ltYm9sc1xyXG5cdFx0XHRcdCAgQHJlYWRvbmx5XHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwicmVtb3ZlZFwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMub2xkVmFsdWUuc3Vic3RyKHRoaXMuc3RhcnRDaGFuZ2VQb3MsIHRoaXMucmVtb3ZlZENvdW50KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBVbmNoYW5nZWQgaGVhZCBzeW1ib2xzXHJcblx0XHRcdFx0ICBAcmVhZG9ubHlcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJoZWFkXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy52YWx1ZS5zdWJzdHJpbmcoMCwgdGhpcy5zdGFydENoYW5nZVBvcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgVW5jaGFuZ2VkIHRhaWwgc3ltYm9sc1xyXG5cdFx0XHRcdCAgQHJlYWRvbmx5XHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidGFpbFwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMudmFsdWUuc3Vic3RyaW5nKHRoaXMuc3RhcnRDaGFuZ2VQb3MgKyB0aGlzLmluc2VydGVkQ291bnQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIFJlbW92ZSBkaXJlY3Rpb25cclxuXHRcdFx0XHQgIEByZWFkb25seVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInJlbW92ZURpcmVjdGlvblwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLnJlbW92ZWRDb3VudCB8fCB0aGlzLmluc2VydGVkQ291bnQpIHJldHVybiBESVJFQ1RJT04uTk9ORTsgLy8gYWxpZ24gcmlnaHQgaWYgZGVsZXRlIGF0IHJpZ2h0IG9yIGlmIHJhbmdlIHJlbW92ZWQgKGV2ZW50IHdpdGggYmFja3NwYWNlKVxyXG5cclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLm9sZFNlbGVjdGlvbi5lbmQgPT09IHRoaXMuY3Vyc29yUG9zIHx8IHRoaXMub2xkU2VsZWN0aW9uLnN0YXJ0ID09PSB0aGlzLmN1cnNvclBvcyA/IERJUkVDVElPTi5SSUdIVCA6IERJUkVDVElPTi5MRUZUO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fV0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIEFjdGlvbkRldGFpbHM7XHJcblx0XHR9KCk7XHJcblxyXG5cdC8qKlxyXG5cdCAgUHJvdmlkZXMgZGV0YWlscyBvZiBjaGFuZ2luZyBtb2RlbCB2YWx1ZVxyXG5cdCAgQHBhcmFtIHtPYmplY3R9IFtkZXRhaWxzXVxyXG5cdCAgQHBhcmFtIHtzdHJpbmd9IFtkZXRhaWxzLmluc2VydGVkXSAtIEluc2VydGVkIHN5bWJvbHNcclxuXHQgIEBwYXJhbSB7Ym9vbGVhbn0gW2RldGFpbHMuc2tpcF0gLSBDYW4gc2tpcCBjaGFyc1xyXG5cdCAgQHBhcmFtIHtudW1iZXJ9IFtkZXRhaWxzLnJlbW92ZUNvdW50XSAtIFJlbW92ZWQgc3ltYm9scyBjb3VudFxyXG5cdCAgQHBhcmFtIHtudW1iZXJ9IFtkZXRhaWxzLnRhaWxTaGlmdF0gLSBBZGRpdGlvbmFsIG9mZnNldCBpZiBhbnkgY2hhbmdlcyBvY2N1cnJlZCBiZWZvcmUgdGFpbFxyXG5cdCovXHJcblx0dmFyIENoYW5nZURldGFpbHMgPVxyXG5cdFx0LyojX19QVVJFX18qL1xyXG5cdFx0ZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQvKiogSW5zZXJ0ZWQgc3ltYm9scyAqL1xyXG5cclxuXHRcdFx0LyoqIENhbiBza2lwIGNoYXJzICovXHJcblxyXG5cdFx0XHQvKiogQWRkaXRpb25hbCBvZmZzZXQgaWYgYW55IGNoYW5nZXMgb2NjdXJyZWQgYmVmb3JlIHRhaWwgKi9cclxuXHJcblx0XHRcdC8qKiBSYXcgaW5zZXJ0ZWQgaXMgdXNlZCBieSBkeW5hbWljIG1hc2sgKi9cclxuXHRcdFx0ZnVuY3Rpb24gQ2hhbmdlRGV0YWlscyhkZXRhaWxzKSB7XHJcblx0XHRcdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIENoYW5nZURldGFpbHMpO1xyXG5cclxuXHRcdFx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHtcclxuXHRcdFx0XHRcdGluc2VydGVkOiAnJyxcclxuXHRcdFx0XHRcdHJhd0luc2VydGVkOiAnJyxcclxuXHRcdFx0XHRcdHNraXA6IGZhbHNlLFxyXG5cdFx0XHRcdFx0dGFpbFNoaWZ0OiAwXHJcblx0XHRcdFx0fSwgZGV0YWlscyk7XHJcblx0XHRcdH1cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAgQWdncmVnYXRlIGNoYW5nZXNcclxuXHRcdFx0ICBAcmV0dXJucyB7Q2hhbmdlRGV0YWlsc30gYHRoaXNgXHJcblx0XHRcdCovXHJcblxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKENoYW5nZURldGFpbHMsIFt7XHJcblx0XHRcdFx0a2V5OiBcImFnZ3JlZ2F0ZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBhZ2dyZWdhdGUoZGV0YWlscykge1xyXG5cdFx0XHRcdFx0dGhpcy5yYXdJbnNlcnRlZCArPSBkZXRhaWxzLnJhd0luc2VydGVkO1xyXG5cdFx0XHRcdFx0dGhpcy5za2lwID0gdGhpcy5za2lwIHx8IGRldGFpbHMuc2tpcDtcclxuXHRcdFx0XHRcdHRoaXMuaW5zZXJ0ZWQgKz0gZGV0YWlscy5pbnNlcnRlZDtcclxuXHRcdFx0XHRcdHRoaXMudGFpbFNoaWZ0ICs9IGRldGFpbHMudGFpbFNoaWZ0O1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBUb3RhbCBvZmZzZXQgY29uc2lkZXJpbmcgYWxsIGNoYW5nZXMgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwib2Zmc2V0XCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy50YWlsU2hpZnQgKyB0aGlzLmluc2VydGVkLmxlbmd0aDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1dKTtcclxuXHJcblx0XHRcdHJldHVybiBDaGFuZ2VEZXRhaWxzO1xyXG5cdFx0fSgpO1xyXG5cclxuXHQvKiogUHJvdmlkZXMgZGV0YWlscyBvZiBjb250aW51b3VzIGV4dHJhY3RlZCB0YWlsICovXHJcblx0dmFyIENvbnRpbnVvdXNUYWlsRGV0YWlscyA9XHJcblx0XHQvKiNfX1BVUkVfXyovXHJcblx0XHRmdW5jdGlvbiAoKSB7XHJcblx0XHRcdC8qKiBUYWlsIHZhbHVlIGFzIHN0cmluZyAqL1xyXG5cclxuXHRcdFx0LyoqIFRhaWwgc3RhcnQgcG9zaXRpb24gKi9cclxuXHJcblx0XHRcdC8qKiBTdGFydCBwb3NpdGlvbiAqL1xyXG5cdFx0XHRmdW5jdGlvbiBDb250aW51b3VzVGFpbERldGFpbHMoKSB7XHJcblx0XHRcdFx0dmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcclxuXHRcdFx0XHR2YXIgZnJvbSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcclxuXHRcdFx0XHR2YXIgc3RvcCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gYXJndW1lbnRzWzJdIDogdW5kZWZpbmVkO1xyXG5cclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29udGludW91c1RhaWxEZXRhaWxzKTtcclxuXHJcblx0XHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdHRoaXMuZnJvbSA9IGZyb207XHJcblx0XHRcdFx0dGhpcy5zdG9wID0gc3RvcDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKENvbnRpbnVvdXNUYWlsRGV0YWlscywgW3tcclxuXHRcdFx0XHRrZXk6IFwidG9TdHJpbmdcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy52YWx1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZXh0ZW5kXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGV4dGVuZCh0YWlsKSB7XHJcblx0XHRcdFx0XHR0aGlzLnZhbHVlICs9IFN0cmluZyh0YWlsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiYXBwZW5kVG9cIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gYXBwZW5kVG8obWFza2VkKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbWFza2VkLmFwcGVuZCh0aGlzLnRvU3RyaW5nKCksIHtcclxuXHRcdFx0XHRcdFx0dGFpbDogdHJ1ZVxyXG5cdFx0XHRcdFx0fSkuYWdncmVnYXRlKG1hc2tlZC5fYXBwZW5kUGxhY2Vob2xkZXIoKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInNoaWZ0QmVmb3JlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHNoaWZ0QmVmb3JlKHBvcykge1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuZnJvbSA+PSBwb3MgfHwgIXRoaXMudmFsdWUubGVuZ3RoKSByZXR1cm4gJyc7XHJcblx0XHRcdFx0XHR2YXIgc2hpZnRDaGFyID0gdGhpcy52YWx1ZVswXTtcclxuXHRcdFx0XHRcdHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlLnNsaWNlKDEpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHNoaWZ0Q2hhcjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwic3RhdGVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLnZhbHVlLFxyXG5cdFx0XHRcdFx0XHRmcm9tOiB0aGlzLmZyb20sXHJcblx0XHRcdFx0XHRcdHN0b3A6IHRoaXMuc3RvcFxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHN0YXRlKSB7XHJcblx0XHRcdFx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHN0YXRlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1dKTtcclxuXHJcblx0XHRcdHJldHVybiBDb250aW51b3VzVGFpbERldGFpbHM7XHJcblx0XHR9KCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcGxpZXMgbWFzayBvbiBlbGVtZW50LlxyXG5cdCAqIEBjb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB7SFRNTElucHV0RWxlbWVudHxIVE1MVGV4dEFyZWFFbGVtZW50fE1hc2tFbGVtZW50fSBlbCAtIEVsZW1lbnQgdG8gYXBwbHkgbWFza1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIC0gQ3VzdG9tIG1hc2sgb3B0aW9uc1xyXG5cdCAqIEByZXR1cm4ge0lucHV0TWFza31cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBJTWFzayhlbCkge1xyXG5cdFx0dmFyIG9wdHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xyXG5cdFx0Ly8gY3VycmVudGx5IGF2YWlsYWJsZSBvbmx5IGZvciBpbnB1dC1saWtlIGVsZW1lbnRzXHJcblx0XHRyZXR1cm4gbmV3IElNYXNrLklucHV0TWFzayhlbCwgb3B0cyk7XHJcblx0fVxyXG5cclxuXHQvKiogU3VwcG9ydGVkIG1hc2sgdHlwZSAqL1xyXG5cclxuXHQvKiogUHJvdmlkZXMgY29tbW9uIG1hc2tpbmcgc3R1ZmYgKi9cclxuXHR2YXIgTWFza2VkID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Ly8gJFNoYXBlPE1hc2tlZE9wdGlvbnM+OyBUT0RPIGFmdGVyIGZpeCBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvNDc3M1xyXG5cclxuXHRcdFx0LyoqIEB0eXBlIHtNYXNrfSAqL1xyXG5cclxuXHRcdFx0LyoqICovXHJcblx0XHRcdC8vICRGbG93Rml4TWUgbm8gaWRlYXNcclxuXHJcblx0XHRcdC8qKiBUcmFuc2Zvcm1zIHZhbHVlIGJlZm9yZSBtYXNrIHByb2Nlc3NpbmcgKi9cclxuXHJcblx0XHRcdC8qKiBWYWxpZGF0ZXMgaWYgdmFsdWUgaXMgYWNjZXB0YWJsZSAqL1xyXG5cclxuXHRcdFx0LyoqIERvZXMgYWRkaXRpb25hbCBwcm9jZXNzaW5nIGluIHRoZSBlbmQgb2YgZWRpdGluZyAqL1xyXG5cclxuXHRcdFx0LyoqIEZvcm1hdCB0eXBlZCB2YWx1ZSB0byBzdHJpbmcgKi9cclxuXHJcblx0XHRcdC8qKiBQYXJzZSBzdHJnaW4gdG8gZ2V0IHR5cGVkIHZhbHVlICovXHJcblxyXG5cdFx0XHQvKiogRW5hYmxlIGNoYXJhY3RlcnMgb3ZlcndyaXRpbmcgKi9cclxuXHJcblx0XHRcdC8qKiAqL1xyXG5cdFx0XHRmdW5jdGlvbiBNYXNrZWQob3B0cykge1xyXG5cdFx0XHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNYXNrZWQpO1xyXG5cclxuXHRcdFx0XHR0aGlzLl92YWx1ZSA9ICcnO1xyXG5cclxuXHRcdFx0XHR0aGlzLl91cGRhdGUoT2JqZWN0LmFzc2lnbih7fSwgTWFza2VkLkRFRkFVTFRTLCB7fSwgb3B0cykpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qKiBTZXRzIGFuZCBhcHBsaWVzIG5ldyBvcHRpb25zICovXHJcblxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKE1hc2tlZCwgW3tcclxuXHRcdFx0XHRrZXk6IFwidXBkYXRlT3B0aW9uc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVPcHRpb25zKG9wdHMpIHtcclxuXHRcdFx0XHRcdGlmICghT2JqZWN0LmtleXMob3B0cykubGVuZ3RoKSByZXR1cm47XHJcblx0XHRcdFx0XHR0aGlzLndpdGhWYWx1ZVJlZnJlc2godGhpcy5fdXBkYXRlLmJpbmQodGhpcywgb3B0cykpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIFNldHMgbmV3IG9wdGlvbnNcclxuXHRcdFx0XHQgIEBwcm90ZWN0ZWRcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfdXBkYXRlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF91cGRhdGUob3B0cykge1xyXG5cdFx0XHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIE1hc2sgc3RhdGUgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwicmVzZXRcIixcclxuXHJcblx0XHRcdFx0LyoqIFJlc2V0cyB2YWx1ZSAqL1xyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3ZhbHVlID0gJyc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJyZXNvbHZlXCIsXHJcblxyXG5cdFx0XHRcdC8qKiBSZXNvbHZlIG5ldyB2YWx1ZSAqL1xyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlKHZhbHVlKSB7XHJcblx0XHRcdFx0XHR0aGlzLnJlc2V0KCk7XHJcblx0XHRcdFx0XHR0aGlzLmFwcGVuZCh2YWx1ZSwge1xyXG5cdFx0XHRcdFx0XHRpbnB1dDogdHJ1ZVxyXG5cdFx0XHRcdFx0fSwgJycpO1xyXG5cdFx0XHRcdFx0dGhpcy5kb0NvbW1pdCgpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMudmFsdWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJuZWFyZXN0SW5wdXRQb3NcIixcclxuXHJcblx0XHRcdFx0LyoqIEZpbmRzIG5lYXJlc3QgaW5wdXQgcG9zaXRpb24gaW4gZGlyZWN0aW9uICovXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG5lYXJlc3RJbnB1dFBvcyhjdXJzb3JQb3MsIGRpcmVjdGlvbikge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGN1cnNvclBvcztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEV4dHJhY3RzIHZhbHVlIGluIHJhbmdlIGNvbnNpZGVyaW5nIGZsYWdzICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImV4dHJhY3RJbnB1dFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBleHRyYWN0SW5wdXQoKSB7XHJcblx0XHRcdFx0XHR2YXIgZnJvbVBvcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcclxuXHRcdFx0XHRcdHZhciB0b1BvcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdGhpcy52YWx1ZS5sZW5ndGg7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy52YWx1ZS5zbGljZShmcm9tUG9zLCB0b1Bvcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBFeHRyYWN0cyB0YWlsIGluIHJhbmdlICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImV4dHJhY3RUYWlsXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGV4dHJhY3RUYWlsKCkge1xyXG5cdFx0XHRcdFx0dmFyIGZyb21Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XHJcblx0XHRcdFx0XHR2YXIgdG9Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBDb250aW51b3VzVGFpbERldGFpbHModGhpcy5leHRyYWN0SW5wdXQoZnJvbVBvcywgdG9Qb3MpLCBmcm9tUG9zKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEFwcGVuZHMgdGFpbCAqL1xyXG5cdFx0XHRcdC8vICRGbG93Rml4TWUgbm8gaWRlYXNcclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiYXBwZW5kVGFpbFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBhcHBlbmRUYWlsKHRhaWwpIHtcclxuXHRcdFx0XHRcdGlmIChpc1N0cmluZyh0YWlsKSkgdGFpbCA9IG5ldyBDb250aW51b3VzVGFpbERldGFpbHMoU3RyaW5nKHRhaWwpKTtcclxuXHRcdFx0XHRcdHJldHVybiB0YWlsLmFwcGVuZFRvKHRoaXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogQXBwZW5kcyBjaGFyICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRDaGFyUmF3XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9hcHBlbmRDaGFyUmF3KGNoKSB7XHJcblx0XHRcdFx0XHR2YXIgZmxhZ3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xyXG5cdFx0XHRcdFx0Y2ggPSB0aGlzLmRvUHJlcGFyZShjaCwgZmxhZ3MpO1xyXG5cdFx0XHRcdFx0aWYgKCFjaCkgcmV0dXJuIG5ldyBDaGFuZ2VEZXRhaWxzKCk7XHJcblx0XHRcdFx0XHR0aGlzLl92YWx1ZSArPSBjaDtcclxuXHRcdFx0XHRcdHJldHVybiBuZXcgQ2hhbmdlRGV0YWlscyh7XHJcblx0XHRcdFx0XHRcdGluc2VydGVkOiBjaCxcclxuXHRcdFx0XHRcdFx0cmF3SW5zZXJ0ZWQ6IGNoXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEFwcGVuZHMgY2hhciAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfYXBwZW5kQ2hhclwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kQ2hhcihjaCkge1xyXG5cdFx0XHRcdFx0dmFyIGZsYWdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcclxuXHRcdFx0XHRcdHZhciBjaGVja1RhaWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZDtcclxuXHRcdFx0XHRcdHZhciBjb25zaXN0ZW50U3RhdGUgPSB0aGlzLnN0YXRlO1xyXG5cclxuXHRcdFx0XHRcdHZhciBkZXRhaWxzID0gdGhpcy5fYXBwZW5kQ2hhclJhdyhjaCwgZmxhZ3MpO1xyXG5cclxuXHRcdFx0XHRcdGlmIChkZXRhaWxzLmluc2VydGVkKSB7XHJcblx0XHRcdFx0XHRcdHZhciBjb25zaXN0ZW50VGFpbDtcclxuXHRcdFx0XHRcdFx0dmFyIGFwcGVuZGVkID0gdGhpcy5kb1ZhbGlkYXRlKGZsYWdzKSAhPT0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoYXBwZW5kZWQgJiYgY2hlY2tUYWlsICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyB2YWxpZGF0aW9uIG9rLCBjaGVjayB0YWlsXHJcblx0XHRcdFx0XHRcdFx0dmFyIGJlZm9yZVRhaWxTdGF0ZSA9IHRoaXMuc3RhdGU7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLm92ZXJ3cml0ZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc2lzdGVudFRhaWwgPSBjaGVja1RhaWwuc3RhdGU7XHJcblx0XHRcdFx0XHRcdFx0XHRjaGVja1RhaWwuc2hpZnRCZWZvcmUodGhpcy52YWx1ZS5sZW5ndGgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0dmFyIHRhaWxEZXRhaWxzID0gdGhpcy5hcHBlbmRUYWlsKGNoZWNrVGFpbCk7XHJcblx0XHRcdFx0XHRcdFx0YXBwZW5kZWQgPSB0YWlsRGV0YWlscy5yYXdJbnNlcnRlZCA9PT0gY2hlY2tUYWlsLnRvU3RyaW5nKCk7IC8vIGlmIG9rLCByb2xsYmFjayBzdGF0ZSBhZnRlciB0YWlsXHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChhcHBlbmRlZCAmJiB0YWlsRGV0YWlscy5pbnNlcnRlZCkgdGhpcy5zdGF0ZSA9IGJlZm9yZVRhaWxTdGF0ZTtcclxuXHRcdFx0XHRcdFx0fSAvLyByZXZlcnQgYWxsIGlmIHNvbWV0aGluZyB3ZW50IHdyb25nXHJcblxyXG5cclxuXHRcdFx0XHRcdFx0aWYgKCFhcHBlbmRlZCkge1xyXG5cdFx0XHRcdFx0XHRcdGRldGFpbHMgPSBuZXcgQ2hhbmdlRGV0YWlscygpO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuc3RhdGUgPSBjb25zaXN0ZW50U3RhdGU7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGNoZWNrVGFpbCAmJiBjb25zaXN0ZW50VGFpbCkgY2hlY2tUYWlsLnN0YXRlID0gY29uc2lzdGVudFRhaWw7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gZGV0YWlscztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEFwcGVuZHMgb3B0aW9uYWwgcGxhY2Vob2xkZXIgYXQgZW5kICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRQbGFjZWhvbGRlclwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kUGxhY2Vob2xkZXIoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENoYW5nZURldGFpbHMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEFwcGVuZHMgc3ltYm9scyBjb25zaWRlcmluZyBmbGFncyAqL1xyXG5cdFx0XHRcdC8vICRGbG93Rml4TWUgbm8gaWRlYXNcclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiYXBwZW5kXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGFwcGVuZChzdHIsIGZsYWdzLCB0YWlsKSB7XHJcblx0XHRcdFx0XHRpZiAoIWlzU3RyaW5nKHN0cikpIHRocm93IG5ldyBFcnJvcigndmFsdWUgc2hvdWxkIGJlIHN0cmluZycpO1xyXG5cdFx0XHRcdFx0dmFyIGRldGFpbHMgPSBuZXcgQ2hhbmdlRGV0YWlscygpO1xyXG5cdFx0XHRcdFx0dmFyIGNoZWNrVGFpbCA9IGlzU3RyaW5nKHRhaWwpID8gbmV3IENvbnRpbnVvdXNUYWlsRGV0YWlscyhTdHJpbmcodGFpbCkpIDogdGFpbDtcclxuXHRcdFx0XHRcdGlmIChmbGFncy50YWlsKSBmbGFncy5fYmVmb3JlVGFpbFN0YXRlID0gdGhpcy5zdGF0ZTtcclxuXHJcblx0XHRcdFx0XHRmb3IgKHZhciBjaSA9IDA7IGNpIDwgc3RyLmxlbmd0aDsgKytjaSkge1xyXG5cdFx0XHRcdFx0XHRkZXRhaWxzLmFnZ3JlZ2F0ZSh0aGlzLl9hcHBlbmRDaGFyKHN0cltjaV0sIGZsYWdzLCBjaGVja1RhaWwpKTtcclxuXHRcdFx0XHRcdH0gLy8gYXBwZW5kIHRhaWwgYnV0IGFnZ3JlZ2F0ZSBvbmx5IHRhaWxTaGlmdFxyXG5cclxuXHJcblx0XHRcdFx0XHRpZiAoY2hlY2tUYWlsICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0ZGV0YWlscy50YWlsU2hpZnQgKz0gdGhpcy5hcHBlbmRUYWlsKGNoZWNrVGFpbCkudGFpbFNoaWZ0OyAvLyBUT0RPIGl0J3MgYSBnb29kIGlkZWEgdG8gY2xlYXIgc3RhdGUgYWZ0ZXIgYXBwZW5kaW5nIGVuZHNcclxuXHRcdFx0XHRcdFx0Ly8gYnV0IGl0IGNhdXNlcyBidWdzIHdoZW4gb25lIGFwcGVuZCBjYWxscyBhbm90aGVyICh3aGVuIGR5bmFtaWMgZGlzcGF0Y2ggc2V0IHJhd0lucHV0VmFsdWUpXHJcblx0XHRcdFx0XHRcdC8vIHRoaXMuX3Jlc2V0QmVmb3JlVGFpbFN0YXRlKCk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJyZW1vdmVcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xyXG5cdFx0XHRcdFx0dmFyIGZyb21Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XHJcblx0XHRcdFx0XHR2YXIgdG9Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdFx0dGhpcy5fdmFsdWUgPSB0aGlzLnZhbHVlLnNsaWNlKDAsIGZyb21Qb3MpICsgdGhpcy52YWx1ZS5zbGljZSh0b1Bvcyk7XHJcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENoYW5nZURldGFpbHMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIENhbGxzIGZ1bmN0aW9uIGFuZCByZWFwcGxpZXMgY3VycmVudCB2YWx1ZSAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ3aXRoVmFsdWVSZWZyZXNoXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHdpdGhWYWx1ZVJlZnJlc2goZm4pIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLl9yZWZyZXNoaW5nIHx8ICF0aGlzLmlzSW5pdGlhbGl6ZWQpIHJldHVybiBmbigpO1xyXG5cdFx0XHRcdFx0dGhpcy5fcmVmcmVzaGluZyA9IHRydWU7XHJcblx0XHRcdFx0XHR2YXIgcmF3SW5wdXQgPSB0aGlzLnJhd0lucHV0VmFsdWU7XHJcblx0XHRcdFx0XHR2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xyXG5cdFx0XHRcdFx0dmFyIHJldCA9IGZuKCk7XHJcblx0XHRcdFx0XHR0aGlzLnJhd0lucHV0VmFsdWUgPSByYXdJbnB1dDsgLy8gYXBwZW5kIGxvc3QgdHJhaWxpbmcgY2hhcnMgYXQgZW5kXHJcblxyXG5cdFx0XHRcdFx0aWYgKHRoaXMudmFsdWUgIT09IHZhbHVlICYmIHZhbHVlLmluZGV4T2YodGhpcy5fdmFsdWUpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuYXBwZW5kKHZhbHVlLnNsaWNlKHRoaXMuX3ZhbHVlLmxlbmd0aCksIHt9LCAnJyk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0ZGVsZXRlIHRoaXMuX3JlZnJlc2hpbmc7XHJcblx0XHRcdFx0XHRyZXR1cm4gcmV0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwicnVuSXNvbGF0ZWRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gcnVuSXNvbGF0ZWQoZm4pIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLl9pc29sYXRlZCB8fCAhdGhpcy5pc0luaXRpYWxpemVkKSByZXR1cm4gZm4odGhpcyk7XHJcblx0XHRcdFx0XHR0aGlzLl9pc29sYXRlZCA9IHRydWU7XHJcblx0XHRcdFx0XHR2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG5cdFx0XHRcdFx0dmFyIHJldCA9IGZuKHRoaXMpO1xyXG5cdFx0XHRcdFx0dGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG5cdFx0XHRcdFx0ZGVsZXRlIHRoaXMuX2lzb2xhdGVkO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHJldDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBQcmVwYXJlcyBzdHJpbmcgYmVmb3JlIG1hc2sgcHJvY2Vzc2luZ1xyXG5cdFx0XHRcdCAgQHByb3RlY3RlZFxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImRvUHJlcGFyZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBkb1ByZXBhcmUoc3RyKSB7XHJcblx0XHRcdFx0XHR2YXIgZmxhZ3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMucHJlcGFyZSA/IHRoaXMucHJlcGFyZShzdHIsIHRoaXMsIGZsYWdzKSA6IHN0cjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBWYWxpZGF0ZXMgaWYgdmFsdWUgaXMgYWNjZXB0YWJsZVxyXG5cdFx0XHRcdCAgQHByb3RlY3RlZFxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImRvVmFsaWRhdGVcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9WYWxpZGF0ZShmbGFncykge1xyXG5cdFx0XHRcdFx0cmV0dXJuICghdGhpcy52YWxpZGF0ZSB8fCB0aGlzLnZhbGlkYXRlKHRoaXMudmFsdWUsIHRoaXMsIGZsYWdzKSkgJiYgKCF0aGlzLnBhcmVudCB8fCB0aGlzLnBhcmVudC5kb1ZhbGlkYXRlKGZsYWdzKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgRG9lcyBhZGRpdGlvbmFsIHByb2Nlc3NpbmcgaW4gdGhlIGVuZCBvZiBlZGl0aW5nXHJcblx0XHRcdFx0ICBAcHJvdGVjdGVkXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9Db21taXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9Db21taXQoKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5jb21taXQpIHRoaXMuY29tbWl0KHRoaXMudmFsdWUsIHRoaXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9Gb3JtYXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9Gb3JtYXQodmFsdWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmZvcm1hdCA/IHRoaXMuZm9ybWF0KHZhbHVlLCB0aGlzKSA6IHZhbHVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9QYXJzZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBkb1BhcnNlKHN0cikge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2UgPyB0aGlzLnBhcnNlKHN0ciwgdGhpcykgOiBzdHI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJzcGxpY2VcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gc3BsaWNlKHN0YXJ0LCBkZWxldGVDb3VudCwgaW5zZXJ0ZWQsIHJlbW92ZURpcmVjdGlvbikge1xyXG5cdFx0XHRcdFx0dmFyIHRhaWxQb3MgPSBzdGFydCArIGRlbGV0ZUNvdW50O1xyXG5cdFx0XHRcdFx0dmFyIHRhaWwgPSB0aGlzLmV4dHJhY3RUYWlsKHRhaWxQb3MpO1xyXG5cdFx0XHRcdFx0dmFyIHN0YXJ0Q2hhbmdlUG9zID0gdGhpcy5uZWFyZXN0SW5wdXRQb3Moc3RhcnQsIHJlbW92ZURpcmVjdGlvbik7XHJcblx0XHRcdFx0XHR2YXIgY2hhbmdlRGV0YWlscyA9IG5ldyBDaGFuZ2VEZXRhaWxzKHtcclxuXHRcdFx0XHRcdFx0dGFpbFNoaWZ0OiBzdGFydENoYW5nZVBvcyAtIHN0YXJ0IC8vIGFkanVzdCB0YWlsU2hpZnQgaWYgc3RhcnQgd2FzIGFsaWduZWRcclxuXHJcblx0XHRcdFx0XHR9KS5hZ2dyZWdhdGUodGhpcy5yZW1vdmUoc3RhcnRDaGFuZ2VQb3MpKS5hZ2dyZWdhdGUodGhpcy5hcHBlbmQoaW5zZXJ0ZWQsIHtcclxuXHRcdFx0XHRcdFx0aW5wdXQ6IHRydWVcclxuXHRcdFx0XHRcdH0sIHRhaWwpKTtcclxuXHRcdFx0XHRcdHJldHVybiBjaGFuZ2VEZXRhaWxzO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJzdGF0ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0X3ZhbHVlOiB0aGlzLnZhbHVlXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQoc3RhdGUpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3ZhbHVlID0gc3RhdGUuX3ZhbHVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ2YWx1ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX3ZhbHVlO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcclxuXHRcdFx0XHRcdHRoaXMucmVzb2x2ZSh2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInVubWFza2VkVmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnZhbHVlO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcclxuXHRcdFx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHRcdFx0XHRcdHRoaXMuYXBwZW5kKHZhbHVlLCB7fSwgJycpO1xyXG5cdFx0XHRcdFx0dGhpcy5kb0NvbW1pdCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidHlwZWRWYWx1ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9QYXJzZSh0aGlzLnZhbHVlKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XHJcblx0XHRcdFx0XHR0aGlzLnZhbHVlID0gdGhpcy5kb0Zvcm1hdCh2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBWYWx1ZSB0aGF0IGluY2x1ZGVzIHJhdyB1c2VyIGlucHV0ICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInJhd0lucHV0VmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmV4dHJhY3RJbnB1dCgwLCB0aGlzLnZhbHVlLmxlbmd0aCwge1xyXG5cdFx0XHRcdFx0XHRyYXc6IHRydWVcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcclxuXHRcdFx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHRcdFx0XHRcdHRoaXMuYXBwZW5kKHZhbHVlLCB7XHJcblx0XHRcdFx0XHRcdHJhdzogdHJ1ZVxyXG5cdFx0XHRcdFx0fSwgJycpO1xyXG5cdFx0XHRcdFx0dGhpcy5kb0NvbW1pdCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiaXNDb21wbGV0ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gTWFza2VkO1xyXG5cdFx0fSgpO1xyXG5cdE1hc2tlZC5ERUZBVUxUUyA9IHtcclxuXHRcdGZvcm1hdDogZnVuY3Rpb24gZm9ybWF0KHYpIHtcclxuXHRcdFx0cmV0dXJuIHY7XHJcblx0XHR9LFxyXG5cdFx0cGFyc2U6IGZ1bmN0aW9uIHBhcnNlKHYpIHtcclxuXHRcdFx0cmV0dXJuIHY7XHJcblx0XHR9XHJcblx0fTtcclxuXHRJTWFzay5NYXNrZWQgPSBNYXNrZWQ7XHJcblxyXG5cdC8qKiBHZXQgTWFza2VkIGNsYXNzIGJ5IG1hc2sgdHlwZSAqL1xyXG5cclxuXHRmdW5jdGlvbiBtYXNrZWRDbGFzcyhtYXNrKSB7XHJcblx0XHRpZiAobWFzayA9PSBudWxsKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignbWFzayBwcm9wZXJ0eSBzaG91bGQgYmUgZGVmaW5lZCcpO1xyXG5cdFx0fSAvLyAkRmxvd0ZpeE1lXHJcblxyXG5cclxuXHRcdGlmIChtYXNrIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gSU1hc2suTWFza2VkUmVnRXhwOyAvLyAkRmxvd0ZpeE1lXHJcblxyXG5cdFx0aWYgKGlzU3RyaW5nKG1hc2spKSByZXR1cm4gSU1hc2suTWFza2VkUGF0dGVybjsgLy8gJEZsb3dGaXhNZVxyXG5cclxuXHRcdGlmIChtYXNrIGluc3RhbmNlb2YgRGF0ZSB8fCBtYXNrID09PSBEYXRlKSByZXR1cm4gSU1hc2suTWFza2VkRGF0ZTsgLy8gJEZsb3dGaXhNZVxyXG5cclxuXHRcdGlmIChtYXNrIGluc3RhbmNlb2YgTnVtYmVyIHx8IHR5cGVvZiBtYXNrID09PSAnbnVtYmVyJyB8fCBtYXNrID09PSBOdW1iZXIpIHJldHVybiBJTWFzay5NYXNrZWROdW1iZXI7IC8vICRGbG93Rml4TWVcclxuXHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheShtYXNrKSB8fCBtYXNrID09PSBBcnJheSkgcmV0dXJuIElNYXNrLk1hc2tlZER5bmFtaWM7IC8vICRGbG93Rml4TWVcclxuXHJcblx0XHRpZiAoSU1hc2suTWFza2VkICYmIG1hc2sucHJvdG90eXBlIGluc3RhbmNlb2YgSU1hc2suTWFza2VkKSByZXR1cm4gbWFzazsgLy8gJEZsb3dGaXhNZVxyXG5cclxuXHRcdGlmIChtYXNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHJldHVybiBJTWFzay5NYXNrZWRGdW5jdGlvbjtcclxuXHRcdGNvbnNvbGUud2FybignTWFzayBub3QgZm91bmQgZm9yIG1hc2snLCBtYXNrKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXHJcblx0XHQvLyAkRmxvd0ZpeE1lXHJcblxyXG5cdFx0cmV0dXJuIElNYXNrLk1hc2tlZDtcclxuXHR9XHJcblx0LyoqIENyZWF0ZXMgbmV3IHtAbGluayBNYXNrZWR9IGRlcGVuZGluZyBvbiBtYXNrIHR5cGUgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlTWFzayhvcHRzKSB7XHJcblx0XHQvLyAkRmxvd0ZpeE1lXHJcblx0XHRpZiAoSU1hc2suTWFza2VkICYmIG9wdHMgaW5zdGFuY2VvZiBJTWFzay5NYXNrZWQpIHJldHVybiBvcHRzO1xyXG5cdFx0b3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdHMpO1xyXG5cdFx0dmFyIG1hc2sgPSBvcHRzLm1hc2s7IC8vICRGbG93Rml4TWVcclxuXHJcblx0XHRpZiAoSU1hc2suTWFza2VkICYmIG1hc2sgaW5zdGFuY2VvZiBJTWFzay5NYXNrZWQpIHJldHVybiBtYXNrO1xyXG5cdFx0dmFyIE1hc2tlZENsYXNzID0gbWFza2VkQ2xhc3MobWFzayk7XHJcblx0XHRpZiAoIU1hc2tlZENsYXNzKSB0aHJvdyBuZXcgRXJyb3IoJ01hc2tlZCBjbGFzcyBpcyBub3QgZm91bmQgZm9yIHByb3ZpZGVkIG1hc2ssIGFwcHJvcHJpYXRlIG1vZHVsZSBuZWVkcyB0byBiZSBpbXBvcnQgbWFudWFsbHkgYmVmb3JlIGNyZWF0aW5nIG1hc2suJyk7XHJcblx0XHRyZXR1cm4gbmV3IE1hc2tlZENsYXNzKG9wdHMpO1xyXG5cdH1cclxuXHRJTWFzay5jcmVhdGVNYXNrID0gY3JlYXRlTWFzaztcclxuXHJcblx0dmFyIERFRkFVTFRfSU5QVVRfREVGSU5JVElPTlMgPSB7XHJcblx0XHQnMCc6IC9cXGQvLFxyXG5cdFx0J2EnOiAvW1xcdTAwNDEtXFx1MDA1QVxcdTAwNjEtXFx1MDA3QVxcdTAwQUFcXHUwMEI1XFx1MDBCQVxcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDJDMVxcdTAyQzYtXFx1MDJEMVxcdTAyRTAtXFx1MDJFNFxcdTAyRUNcXHUwMkVFXFx1MDM3MC1cXHUwMzc0XFx1MDM3NlxcdTAzNzdcXHUwMzdBLVxcdTAzN0RcXHUwMzg2XFx1MDM4OC1cXHUwMzhBXFx1MDM4Q1xcdTAzOEUtXFx1MDNBMVxcdTAzQTMtXFx1MDNGNVxcdTAzRjctXFx1MDQ4MVxcdTA0OEEtXFx1MDUyN1xcdTA1MzEtXFx1MDU1NlxcdTA1NTlcXHUwNTYxLVxcdTA1ODdcXHUwNUQwLVxcdTA1RUFcXHUwNUYwLVxcdTA1RjJcXHUwNjIwLVxcdTA2NEFcXHUwNjZFXFx1MDY2RlxcdTA2NzEtXFx1MDZEM1xcdTA2RDVcXHUwNkU1XFx1MDZFNlxcdTA2RUVcXHUwNkVGXFx1MDZGQS1cXHUwNkZDXFx1MDZGRlxcdTA3MTBcXHUwNzEyLVxcdTA3MkZcXHUwNzRELVxcdTA3QTVcXHUwN0IxXFx1MDdDQS1cXHUwN0VBXFx1MDdGNFxcdTA3RjVcXHUwN0ZBXFx1MDgwMC1cXHUwODE1XFx1MDgxQVxcdTA4MjRcXHUwODI4XFx1MDg0MC1cXHUwODU4XFx1MDhBMFxcdTA4QTItXFx1MDhBQ1xcdTA5MDQtXFx1MDkzOVxcdTA5M0RcXHUwOTUwXFx1MDk1OC1cXHUwOTYxXFx1MDk3MS1cXHUwOTc3XFx1MDk3OS1cXHUwOTdGXFx1MDk4NS1cXHUwOThDXFx1MDk4RlxcdTA5OTBcXHUwOTkzLVxcdTA5QThcXHUwOUFBLVxcdTA5QjBcXHUwOUIyXFx1MDlCNi1cXHUwOUI5XFx1MDlCRFxcdTA5Q0VcXHUwOURDXFx1MDlERFxcdTA5REYtXFx1MDlFMVxcdTA5RjBcXHUwOUYxXFx1MEEwNS1cXHUwQTBBXFx1MEEwRlxcdTBBMTBcXHUwQTEzLVxcdTBBMjhcXHUwQTJBLVxcdTBBMzBcXHUwQTMyXFx1MEEzM1xcdTBBMzVcXHUwQTM2XFx1MEEzOFxcdTBBMzlcXHUwQTU5LVxcdTBBNUNcXHUwQTVFXFx1MEE3Mi1cXHUwQTc0XFx1MEE4NS1cXHUwQThEXFx1MEE4Ri1cXHUwQTkxXFx1MEE5My1cXHUwQUE4XFx1MEFBQS1cXHUwQUIwXFx1MEFCMlxcdTBBQjNcXHUwQUI1LVxcdTBBQjlcXHUwQUJEXFx1MEFEMFxcdTBBRTBcXHUwQUUxXFx1MEIwNS1cXHUwQjBDXFx1MEIwRlxcdTBCMTBcXHUwQjEzLVxcdTBCMjhcXHUwQjJBLVxcdTBCMzBcXHUwQjMyXFx1MEIzM1xcdTBCMzUtXFx1MEIzOVxcdTBCM0RcXHUwQjVDXFx1MEI1RFxcdTBCNUYtXFx1MEI2MVxcdTBCNzFcXHUwQjgzXFx1MEI4NS1cXHUwQjhBXFx1MEI4RS1cXHUwQjkwXFx1MEI5Mi1cXHUwQjk1XFx1MEI5OVxcdTBCOUFcXHUwQjlDXFx1MEI5RVxcdTBCOUZcXHUwQkEzXFx1MEJBNFxcdTBCQTgtXFx1MEJBQVxcdTBCQUUtXFx1MEJCOVxcdTBCRDBcXHUwQzA1LVxcdTBDMENcXHUwQzBFLVxcdTBDMTBcXHUwQzEyLVxcdTBDMjhcXHUwQzJBLVxcdTBDMzNcXHUwQzM1LVxcdTBDMzlcXHUwQzNEXFx1MEM1OFxcdTBDNTlcXHUwQzYwXFx1MEM2MVxcdTBDODUtXFx1MEM4Q1xcdTBDOEUtXFx1MEM5MFxcdTBDOTItXFx1MENBOFxcdTBDQUEtXFx1MENCM1xcdTBDQjUtXFx1MENCOVxcdTBDQkRcXHUwQ0RFXFx1MENFMFxcdTBDRTFcXHUwQ0YxXFx1MENGMlxcdTBEMDUtXFx1MEQwQ1xcdTBEMEUtXFx1MEQxMFxcdTBEMTItXFx1MEQzQVxcdTBEM0RcXHUwRDRFXFx1MEQ2MFxcdTBENjFcXHUwRDdBLVxcdTBEN0ZcXHUwRDg1LVxcdTBEOTZcXHUwRDlBLVxcdTBEQjFcXHUwREIzLVxcdTBEQkJcXHUwREJEXFx1MERDMC1cXHUwREM2XFx1MEUwMS1cXHUwRTMwXFx1MEUzMlxcdTBFMzNcXHUwRTQwLVxcdTBFNDZcXHUwRTgxXFx1MEU4MlxcdTBFODRcXHUwRTg3XFx1MEU4OFxcdTBFOEFcXHUwRThEXFx1MEU5NC1cXHUwRTk3XFx1MEU5OS1cXHUwRTlGXFx1MEVBMS1cXHUwRUEzXFx1MEVBNVxcdTBFQTdcXHUwRUFBXFx1MEVBQlxcdTBFQUQtXFx1MEVCMFxcdTBFQjJcXHUwRUIzXFx1MEVCRFxcdTBFQzAtXFx1MEVDNFxcdTBFQzZcXHUwRURDLVxcdTBFREZcXHUwRjAwXFx1MEY0MC1cXHUwRjQ3XFx1MEY0OS1cXHUwRjZDXFx1MEY4OC1cXHUwRjhDXFx1MTAwMC1cXHUxMDJBXFx1MTAzRlxcdTEwNTAtXFx1MTA1NVxcdTEwNUEtXFx1MTA1RFxcdTEwNjFcXHUxMDY1XFx1MTA2NlxcdTEwNkUtXFx1MTA3MFxcdTEwNzUtXFx1MTA4MVxcdTEwOEVcXHUxMEEwLVxcdTEwQzVcXHUxMEM3XFx1MTBDRFxcdTEwRDAtXFx1MTBGQVxcdTEwRkMtXFx1MTI0OFxcdTEyNEEtXFx1MTI0RFxcdTEyNTAtXFx1MTI1NlxcdTEyNThcXHUxMjVBLVxcdTEyNURcXHUxMjYwLVxcdTEyODhcXHUxMjhBLVxcdTEyOERcXHUxMjkwLVxcdTEyQjBcXHUxMkIyLVxcdTEyQjVcXHUxMkI4LVxcdTEyQkVcXHUxMkMwXFx1MTJDMi1cXHUxMkM1XFx1MTJDOC1cXHUxMkQ2XFx1MTJEOC1cXHUxMzEwXFx1MTMxMi1cXHUxMzE1XFx1MTMxOC1cXHUxMzVBXFx1MTM4MC1cXHUxMzhGXFx1MTNBMC1cXHUxM0Y0XFx1MTQwMS1cXHUxNjZDXFx1MTY2Ri1cXHUxNjdGXFx1MTY4MS1cXHUxNjlBXFx1MTZBMC1cXHUxNkVBXFx1MTcwMC1cXHUxNzBDXFx1MTcwRS1cXHUxNzExXFx1MTcyMC1cXHUxNzMxXFx1MTc0MC1cXHUxNzUxXFx1MTc2MC1cXHUxNzZDXFx1MTc2RS1cXHUxNzcwXFx1MTc4MC1cXHUxN0IzXFx1MTdEN1xcdTE3RENcXHUxODIwLVxcdTE4NzdcXHUxODgwLVxcdTE4QThcXHUxOEFBXFx1MThCMC1cXHUxOEY1XFx1MTkwMC1cXHUxOTFDXFx1MTk1MC1cXHUxOTZEXFx1MTk3MC1cXHUxOTc0XFx1MTk4MC1cXHUxOUFCXFx1MTlDMS1cXHUxOUM3XFx1MUEwMC1cXHUxQTE2XFx1MUEyMC1cXHUxQTU0XFx1MUFBN1xcdTFCMDUtXFx1MUIzM1xcdTFCNDUtXFx1MUI0QlxcdTFCODMtXFx1MUJBMFxcdTFCQUVcXHUxQkFGXFx1MUJCQS1cXHUxQkU1XFx1MUMwMC1cXHUxQzIzXFx1MUM0RC1cXHUxQzRGXFx1MUM1QS1cXHUxQzdEXFx1MUNFOS1cXHUxQ0VDXFx1MUNFRS1cXHUxQ0YxXFx1MUNGNVxcdTFDRjZcXHUxRDAwLVxcdTFEQkZcXHUxRTAwLVxcdTFGMTVcXHUxRjE4LVxcdTFGMURcXHUxRjIwLVxcdTFGNDVcXHUxRjQ4LVxcdTFGNERcXHUxRjUwLVxcdTFGNTdcXHUxRjU5XFx1MUY1QlxcdTFGNURcXHUxRjVGLVxcdTFGN0RcXHUxRjgwLVxcdTFGQjRcXHUxRkI2LVxcdTFGQkNcXHUxRkJFXFx1MUZDMi1cXHUxRkM0XFx1MUZDNi1cXHUxRkNDXFx1MUZEMC1cXHUxRkQzXFx1MUZENi1cXHUxRkRCXFx1MUZFMC1cXHUxRkVDXFx1MUZGMi1cXHUxRkY0XFx1MUZGNi1cXHUxRkZDXFx1MjA3MVxcdTIwN0ZcXHUyMDkwLVxcdTIwOUNcXHUyMTAyXFx1MjEwN1xcdTIxMEEtXFx1MjExM1xcdTIxMTVcXHUyMTE5LVxcdTIxMURcXHUyMTI0XFx1MjEyNlxcdTIxMjhcXHUyMTJBLVxcdTIxMkRcXHUyMTJGLVxcdTIxMzlcXHUyMTNDLVxcdTIxM0ZcXHUyMTQ1LVxcdTIxNDlcXHUyMTRFXFx1MjE4M1xcdTIxODRcXHUyQzAwLVxcdTJDMkVcXHUyQzMwLVxcdTJDNUVcXHUyQzYwLVxcdTJDRTRcXHUyQ0VCLVxcdTJDRUVcXHUyQ0YyXFx1MkNGM1xcdTJEMDAtXFx1MkQyNVxcdTJEMjdcXHUyRDJEXFx1MkQzMC1cXHUyRDY3XFx1MkQ2RlxcdTJEODAtXFx1MkQ5NlxcdTJEQTAtXFx1MkRBNlxcdTJEQTgtXFx1MkRBRVxcdTJEQjAtXFx1MkRCNlxcdTJEQjgtXFx1MkRCRVxcdTJEQzAtXFx1MkRDNlxcdTJEQzgtXFx1MkRDRVxcdTJERDAtXFx1MkRENlxcdTJERDgtXFx1MkRERVxcdTJFMkZcXHUzMDA1XFx1MzAwNlxcdTMwMzEtXFx1MzAzNVxcdTMwM0JcXHUzMDNDXFx1MzA0MS1cXHUzMDk2XFx1MzA5RC1cXHUzMDlGXFx1MzBBMS1cXHUzMEZBXFx1MzBGQy1cXHUzMEZGXFx1MzEwNS1cXHUzMTJEXFx1MzEzMS1cXHUzMThFXFx1MzFBMC1cXHUzMUJBXFx1MzFGMC1cXHUzMUZGXFx1MzQwMC1cXHU0REI1XFx1NEUwMC1cXHU5RkNDXFx1QTAwMC1cXHVBNDhDXFx1QTREMC1cXHVBNEZEXFx1QTUwMC1cXHVBNjBDXFx1QTYxMC1cXHVBNjFGXFx1QTYyQVxcdUE2MkJcXHVBNjQwLVxcdUE2NkVcXHVBNjdGLVxcdUE2OTdcXHVBNkEwLVxcdUE2RTVcXHVBNzE3LVxcdUE3MUZcXHVBNzIyLVxcdUE3ODhcXHVBNzhCLVxcdUE3OEVcXHVBNzkwLVxcdUE3OTNcXHVBN0EwLVxcdUE3QUFcXHVBN0Y4LVxcdUE4MDFcXHVBODAzLVxcdUE4MDVcXHVBODA3LVxcdUE4MEFcXHVBODBDLVxcdUE4MjJcXHVBODQwLVxcdUE4NzNcXHVBODgyLVxcdUE4QjNcXHVBOEYyLVxcdUE4RjdcXHVBOEZCXFx1QTkwQS1cXHVBOTI1XFx1QTkzMC1cXHVBOTQ2XFx1QTk2MC1cXHVBOTdDXFx1QTk4NC1cXHVBOUIyXFx1QTlDRlxcdUFBMDAtXFx1QUEyOFxcdUFBNDAtXFx1QUE0MlxcdUFBNDQtXFx1QUE0QlxcdUFBNjAtXFx1QUE3NlxcdUFBN0FcXHVBQTgwLVxcdUFBQUZcXHVBQUIxXFx1QUFCNVxcdUFBQjZcXHVBQUI5LVxcdUFBQkRcXHVBQUMwXFx1QUFDMlxcdUFBREItXFx1QUFERFxcdUFBRTAtXFx1QUFFQVxcdUFBRjItXFx1QUFGNFxcdUFCMDEtXFx1QUIwNlxcdUFCMDktXFx1QUIwRVxcdUFCMTEtXFx1QUIxNlxcdUFCMjAtXFx1QUIyNlxcdUFCMjgtXFx1QUIyRVxcdUFCQzAtXFx1QUJFMlxcdUFDMDAtXFx1RDdBM1xcdUQ3QjAtXFx1RDdDNlxcdUQ3Q0ItXFx1RDdGQlxcdUY5MDAtXFx1RkE2RFxcdUZBNzAtXFx1RkFEOVxcdUZCMDAtXFx1RkIwNlxcdUZCMTMtXFx1RkIxN1xcdUZCMURcXHVGQjFGLVxcdUZCMjhcXHVGQjJBLVxcdUZCMzZcXHVGQjM4LVxcdUZCM0NcXHVGQjNFXFx1RkI0MFxcdUZCNDFcXHVGQjQzXFx1RkI0NFxcdUZCNDYtXFx1RkJCMVxcdUZCRDMtXFx1RkQzRFxcdUZENTAtXFx1RkQ4RlxcdUZEOTItXFx1RkRDN1xcdUZERjAtXFx1RkRGQlxcdUZFNzAtXFx1RkU3NFxcdUZFNzYtXFx1RkVGQ1xcdUZGMjEtXFx1RkYzQVxcdUZGNDEtXFx1RkY1QVxcdUZGNjYtXFx1RkZCRVxcdUZGQzItXFx1RkZDN1xcdUZGQ0EtXFx1RkZDRlxcdUZGRDItXFx1RkZEN1xcdUZGREEtXFx1RkZEQ10vLFxyXG5cdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjIwNzUwNzBcclxuXHRcdCcqJzogLy4vXHJcblx0fTtcclxuXHQvKiogKi9cclxuXHJcblx0dmFyIFBhdHRlcm5JbnB1dERlZmluaXRpb24gPVxyXG5cdFx0LyojX19QVVJFX18qL1xyXG5cdFx0ZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0LyoqICovXHJcblx0XHRcdGZ1bmN0aW9uIFBhdHRlcm5JbnB1dERlZmluaXRpb24ob3B0cykge1xyXG5cdFx0XHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXR0ZXJuSW5wdXREZWZpbml0aW9uKTtcclxuXHJcblx0XHRcdFx0dmFyIG1hc2sgPSBvcHRzLm1hc2ssXHJcblx0XHRcdFx0XHRibG9ja09wdHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMob3B0cywgW1wibWFza1wiXSk7XHJcblxyXG5cdFx0XHRcdHRoaXMubWFza2VkID0gY3JlYXRlTWFzayh7XHJcblx0XHRcdFx0XHRtYXNrOiBtYXNrXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBibG9ja09wdHMpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRfY3JlYXRlQ2xhc3MoUGF0dGVybklucHV0RGVmaW5pdGlvbiwgW3tcclxuXHRcdFx0XHRrZXk6IFwicmVzZXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XHJcblx0XHRcdFx0XHR0aGlzLl9pc0ZpbGxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0dGhpcy5tYXNrZWQucmVzZXQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwicmVtb3ZlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcclxuXHRcdFx0XHRcdHZhciBmcm9tUG9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAwO1xyXG5cdFx0XHRcdFx0dmFyIHRvUG9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB0aGlzLnZhbHVlLmxlbmd0aDtcclxuXHJcblx0XHRcdFx0XHRpZiAoZnJvbVBvcyA9PT0gMCAmJiB0b1BvcyA+PSAxKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX2lzRmlsbGVkID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLm1hc2tlZC5yZW1vdmUoZnJvbVBvcywgdG9Qb3MpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHJldHVybiBuZXcgQ2hhbmdlRGV0YWlscygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfYXBwZW5kQ2hhclwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kQ2hhcihzdHIpIHtcclxuXHRcdFx0XHRcdHZhciBmbGFncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XHJcblx0XHRcdFx0XHRpZiAodGhpcy5faXNGaWxsZWQpIHJldHVybiBuZXcgQ2hhbmdlRGV0YWlscygpO1xyXG5cdFx0XHRcdFx0dmFyIHN0YXRlID0gdGhpcy5tYXNrZWQuc3RhdGU7IC8vIHNpbXVsYXRlIGlucHV0XHJcblxyXG5cdFx0XHRcdFx0dmFyIGRldGFpbHMgPSB0aGlzLm1hc2tlZC5fYXBwZW5kQ2hhcihzdHIsIGZsYWdzKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoZGV0YWlscy5pbnNlcnRlZCAmJiB0aGlzLmRvVmFsaWRhdGUoZmxhZ3MpID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdFx0XHRkZXRhaWxzLmluc2VydGVkID0gZGV0YWlscy5yYXdJbnNlcnRlZCA9ICcnO1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1hc2tlZC5zdGF0ZSA9IHN0YXRlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmICghZGV0YWlscy5pbnNlcnRlZCAmJiAhdGhpcy5pc09wdGlvbmFsICYmICF0aGlzLmxhenkgJiYgIWZsYWdzLmlucHV0KSB7XHJcblx0XHRcdFx0XHRcdGRldGFpbHMuaW5zZXJ0ZWQgPSB0aGlzLnBsYWNlaG9sZGVyQ2hhcjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRkZXRhaWxzLnNraXAgPSAhZGV0YWlscy5pbnNlcnRlZCAmJiAhdGhpcy5pc09wdGlvbmFsO1xyXG5cdFx0XHRcdFx0dGhpcy5faXNGaWxsZWQgPSBCb29sZWFuKGRldGFpbHMuaW5zZXJ0ZWQpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImFwcGVuZFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBhcHBlbmQoKSB7XHJcblx0XHRcdFx0XHR2YXIgX3RoaXMkbWFza2VkO1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiAoX3RoaXMkbWFza2VkID0gdGhpcy5tYXNrZWQpLmFwcGVuZC5hcHBseShfdGhpcyRtYXNrZWQsIGFyZ3VtZW50cyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRQbGFjZWhvbGRlclwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kUGxhY2Vob2xkZXIoKSB7XHJcblx0XHRcdFx0XHR2YXIgZGV0YWlscyA9IG5ldyBDaGFuZ2VEZXRhaWxzKCk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5faXNGaWxsZWQgfHwgdGhpcy5pc09wdGlvbmFsKSByZXR1cm4gZGV0YWlscztcclxuXHRcdFx0XHRcdHRoaXMuX2lzRmlsbGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdGRldGFpbHMuaW5zZXJ0ZWQgPSB0aGlzLnBsYWNlaG9sZGVyQ2hhcjtcclxuXHRcdFx0XHRcdHJldHVybiBkZXRhaWxzO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJleHRyYWN0VGFpbFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBleHRyYWN0VGFpbCgpIHtcclxuXHRcdFx0XHRcdHZhciBfdGhpcyRtYXNrZWQyO1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiAoX3RoaXMkbWFza2VkMiA9IHRoaXMubWFza2VkKS5leHRyYWN0VGFpbC5hcHBseShfdGhpcyRtYXNrZWQyLCBhcmd1bWVudHMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJhcHBlbmRUYWlsXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGFwcGVuZFRhaWwoKSB7XHJcblx0XHRcdFx0XHR2YXIgX3RoaXMkbWFza2VkMztcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gKF90aGlzJG1hc2tlZDMgPSB0aGlzLm1hc2tlZCkuYXBwZW5kVGFpbC5hcHBseShfdGhpcyRtYXNrZWQzLCBhcmd1bWVudHMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJleHRyYWN0SW5wdXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZXh0cmFjdElucHV0KCkge1xyXG5cdFx0XHRcdFx0dmFyIGZyb21Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XHJcblx0XHRcdFx0XHR2YXIgdG9Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdFx0dmFyIGZsYWdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXNrZWQuZXh0cmFjdElucHV0KGZyb21Qb3MsIHRvUG9zLCBmbGFncyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIm5lYXJlc3RJbnB1dFBvc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBuZWFyZXN0SW5wdXRQb3MoY3Vyc29yUG9zKSB7XHJcblx0XHRcdFx0XHR2YXIgZGlyZWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBESVJFQ1RJT04uTk9ORTtcclxuXHRcdFx0XHRcdHZhciBtaW5Qb3MgPSAwO1xyXG5cdFx0XHRcdFx0dmFyIG1heFBvcyA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdFx0dmFyIGJvdW5kUG9zID0gTWF0aC5taW4oTWF0aC5tYXgoY3Vyc29yUG9zLCBtaW5Qb3MpLCBtYXhQb3MpO1xyXG5cclxuXHRcdFx0XHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLkxFRlQ6XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLkZPUkNFX0xFRlQ6XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuaXNDb21wbGV0ZSA/IGJvdW5kUG9zIDogbWluUG9zO1xyXG5cclxuXHRcdFx0XHRcdFx0Y2FzZSBESVJFQ1RJT04uUklHSFQ6XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLkZPUkNFX1JJR0hUOlxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmlzQ29tcGxldGUgPyBib3VuZFBvcyA6IG1heFBvcztcclxuXHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLk5PTkU6XHJcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGJvdW5kUG9zO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJkb1ZhbGlkYXRlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGRvVmFsaWRhdGUoKSB7XHJcblx0XHRcdFx0XHR2YXIgX3RoaXMkbWFza2VkNCwgX3RoaXMkcGFyZW50O1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiAoX3RoaXMkbWFza2VkNCA9IHRoaXMubWFza2VkKS5kb1ZhbGlkYXRlLmFwcGx5KF90aGlzJG1hc2tlZDQsIGFyZ3VtZW50cykgJiYgKCF0aGlzLnBhcmVudCB8fCAoX3RoaXMkcGFyZW50ID0gdGhpcy5wYXJlbnQpLmRvVmFsaWRhdGUuYXBwbHkoX3RoaXMkcGFyZW50LCBhcmd1bWVudHMpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9Db21taXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9Db21taXQoKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hc2tlZC5kb0NvbW1pdCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ2YWx1ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMubWFza2VkLnZhbHVlIHx8ICh0aGlzLl9pc0ZpbGxlZCAmJiAhdGhpcy5pc09wdGlvbmFsID8gdGhpcy5wbGFjZWhvbGRlckNoYXIgOiAnJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInVubWFza2VkVmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLm1hc2tlZC51bm1hc2tlZFZhbHVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJpc0NvbXBsZXRlXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gQm9vbGVhbih0aGlzLm1hc2tlZC52YWx1ZSkgfHwgdGhpcy5pc09wdGlvbmFsO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJzdGF0ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0bWFza2VkOiB0aGlzLm1hc2tlZC5zdGF0ZSxcclxuXHRcdFx0XHRcdFx0X2lzRmlsbGVkOiB0aGlzLl9pc0ZpbGxlZFxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHN0YXRlKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hc2tlZC5zdGF0ZSA9IHN0YXRlLm1hc2tlZDtcclxuXHRcdFx0XHRcdHRoaXMuX2lzRmlsbGVkID0gc3RhdGUuX2lzRmlsbGVkO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fV0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIFBhdHRlcm5JbnB1dERlZmluaXRpb247XHJcblx0XHR9KCk7XHJcblxyXG5cdHZhciBQYXR0ZXJuRml4ZWREZWZpbml0aW9uID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0LyoqICovXHJcblx0XHRcdGZ1bmN0aW9uIFBhdHRlcm5GaXhlZERlZmluaXRpb24ob3B0cykge1xyXG5cdFx0XHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXR0ZXJuRml4ZWREZWZpbml0aW9uKTtcclxuXHJcblx0XHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRzKTtcclxuXHRcdFx0XHR0aGlzLl92YWx1ZSA9ICcnO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRfY3JlYXRlQ2xhc3MoUGF0dGVybkZpeGVkRGVmaW5pdGlvbiwgW3tcclxuXHRcdFx0XHRrZXk6IFwicmVzZXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XHJcblx0XHRcdFx0XHR0aGlzLl9pc1Jhd0lucHV0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHR0aGlzLl92YWx1ZSA9ICcnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJyZW1vdmVcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xyXG5cdFx0XHRcdFx0dmFyIGZyb21Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XHJcblx0XHRcdFx0XHR2YXIgdG9Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRoaXMuX3ZhbHVlLmxlbmd0aDtcclxuXHRcdFx0XHRcdHRoaXMuX3ZhbHVlID0gdGhpcy5fdmFsdWUuc2xpY2UoMCwgZnJvbVBvcykgKyB0aGlzLl92YWx1ZS5zbGljZSh0b1Bvcyk7XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMuX3ZhbHVlKSB0aGlzLl9pc1Jhd0lucHV0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENoYW5nZURldGFpbHMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwibmVhcmVzdElucHV0UG9zXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG5lYXJlc3RJbnB1dFBvcyhjdXJzb3JQb3MpIHtcclxuXHRcdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IERJUkVDVElPTi5OT05FO1xyXG5cdFx0XHRcdFx0dmFyIG1pblBvcyA9IDA7XHJcblx0XHRcdFx0XHR2YXIgbWF4UG9zID0gdGhpcy5fdmFsdWUubGVuZ3RoO1xyXG5cclxuXHRcdFx0XHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLkxFRlQ6XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLkZPUkNFX0xFRlQ6XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG1pblBvcztcclxuXHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLk5PTkU6XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLlJJR0hUOlxyXG5cdFx0XHRcdFx0XHRjYXNlIERJUkVDVElPTi5GT1JDRV9SSUdIVDpcclxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbWF4UG9zO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJleHRyYWN0SW5wdXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZXh0cmFjdElucHV0KCkge1xyXG5cdFx0XHRcdFx0dmFyIGZyb21Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XHJcblx0XHRcdFx0XHR2YXIgdG9Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRoaXMuX3ZhbHVlLmxlbmd0aDtcclxuXHRcdFx0XHRcdHZhciBmbGFncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XHJcblx0XHRcdFx0XHRyZXR1cm4gZmxhZ3MucmF3ICYmIHRoaXMuX2lzUmF3SW5wdXQgJiYgdGhpcy5fdmFsdWUuc2xpY2UoZnJvbVBvcywgdG9Qb3MpIHx8ICcnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfYXBwZW5kQ2hhclwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kQ2hhcihzdHIpIHtcclxuXHRcdFx0XHRcdHZhciBmbGFncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XHJcblx0XHRcdFx0XHR2YXIgZGV0YWlscyA9IG5ldyBDaGFuZ2VEZXRhaWxzKCk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fdmFsdWUpIHJldHVybiBkZXRhaWxzO1xyXG5cdFx0XHRcdFx0dmFyIGFwcGVuZGVkID0gdGhpcy5jaGFyID09PSBzdHJbMF07XHJcblx0XHRcdFx0XHR2YXIgaXNSZXNvbHZlZCA9IGFwcGVuZGVkICYmICh0aGlzLmlzVW5tYXNraW5nIHx8IGZsYWdzLmlucHV0IHx8IGZsYWdzLnJhdykgJiYgIWZsYWdzLnRhaWw7XHJcblx0XHRcdFx0XHRpZiAoaXNSZXNvbHZlZCkgZGV0YWlscy5yYXdJbnNlcnRlZCA9IHRoaXMuY2hhcjtcclxuXHRcdFx0XHRcdHRoaXMuX3ZhbHVlID0gZGV0YWlscy5pbnNlcnRlZCA9IHRoaXMuY2hhcjtcclxuXHRcdFx0XHRcdHRoaXMuX2lzUmF3SW5wdXQgPSBpc1Jlc29sdmVkICYmIChmbGFncy5yYXcgfHwgZmxhZ3MuaW5wdXQpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRQbGFjZWhvbGRlclwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kUGxhY2Vob2xkZXIoKSB7XHJcblx0XHRcdFx0XHR2YXIgZGV0YWlscyA9IG5ldyBDaGFuZ2VEZXRhaWxzKCk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fdmFsdWUpIHJldHVybiBkZXRhaWxzO1xyXG5cdFx0XHRcdFx0dGhpcy5fdmFsdWUgPSBkZXRhaWxzLmluc2VydGVkID0gdGhpcy5jaGFyO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImV4dHJhY3RUYWlsXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGV4dHJhY3RUYWlsKCkge1xyXG5cdFx0XHRcdFx0dmFyIHRvUG9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB0aGlzLnZhbHVlLmxlbmd0aDtcclxuXHRcdFx0XHRcdHJldHVybiBuZXcgQ29udGludW91c1RhaWxEZXRhaWxzKCcnKTtcclxuXHRcdFx0XHR9IC8vICRGbG93Rml4TWUgbm8gaWRlYXNcclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiYXBwZW5kVGFpbFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBhcHBlbmRUYWlsKHRhaWwpIHtcclxuXHRcdFx0XHRcdGlmIChpc1N0cmluZyh0YWlsKSkgdGFpbCA9IG5ldyBDb250aW51b3VzVGFpbERldGFpbHMoU3RyaW5nKHRhaWwpKTtcclxuXHRcdFx0XHRcdHJldHVybiB0YWlsLmFwcGVuZFRvKHRoaXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJhcHBlbmRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gYXBwZW5kKHN0ciwgZmxhZ3MsIHRhaWwpIHtcclxuXHRcdFx0XHRcdHZhciBkZXRhaWxzID0gdGhpcy5fYXBwZW5kQ2hhcihzdHIsIGZsYWdzKTtcclxuXHJcblx0XHRcdFx0XHRpZiAodGFpbCAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdGRldGFpbHMudGFpbFNoaWZ0ICs9IHRoaXMuYXBwZW5kVGFpbCh0YWlsKS50YWlsU2hpZnQ7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImRvQ29tbWl0XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGRvQ29tbWl0KCkgeyB9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl92YWx1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidW5tYXNrZWRWYWx1ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuaXNVbm1hc2tpbmcgPyB0aGlzLnZhbHVlIDogJyc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImlzQ29tcGxldGVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJzdGF0ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0X3ZhbHVlOiB0aGlzLl92YWx1ZSxcclxuXHRcdFx0XHRcdFx0X2lzUmF3SW5wdXQ6IHRoaXMuX2lzUmF3SW5wdXRcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uIHNldChzdGF0ZSkge1xyXG5cdFx0XHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBzdGF0ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gUGF0dGVybkZpeGVkRGVmaW5pdGlvbjtcclxuXHRcdH0oKTtcclxuXHJcblx0dmFyIENodW5rc1RhaWxEZXRhaWxzID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0LyoqICovXHJcblx0XHRcdGZ1bmN0aW9uIENodW5rc1RhaWxEZXRhaWxzKCkge1xyXG5cdFx0XHRcdHZhciBjaHVua3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFtdO1xyXG5cdFx0XHRcdHZhciBmcm9tID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xyXG5cclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2h1bmtzVGFpbERldGFpbHMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmNodW5rcyA9IGNodW5rcztcclxuXHRcdFx0XHR0aGlzLmZyb20gPSBmcm9tO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRfY3JlYXRlQ2xhc3MoQ2h1bmtzVGFpbERldGFpbHMsIFt7XHJcblx0XHRcdFx0a2V5OiBcInRvU3RyaW5nXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY2h1bmtzLm1hcChTdHJpbmcpLmpvaW4oJycpO1xyXG5cdFx0XHRcdH0gLy8gJEZsb3dGaXhNZSBubyBpZGVhc1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJleHRlbmRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZXh0ZW5kKHRhaWxDaHVuaykge1xyXG5cdFx0XHRcdFx0aWYgKCFTdHJpbmcodGFpbENodW5rKSkgcmV0dXJuO1xyXG5cdFx0XHRcdFx0aWYgKGlzU3RyaW5nKHRhaWxDaHVuaykpIHRhaWxDaHVuayA9IG5ldyBDb250aW51b3VzVGFpbERldGFpbHMoU3RyaW5nKHRhaWxDaHVuaykpO1xyXG5cdFx0XHRcdFx0dmFyIGxhc3RDaHVuayA9IHRoaXMuY2h1bmtzW3RoaXMuY2h1bmtzLmxlbmd0aCAtIDFdO1xyXG5cdFx0XHRcdFx0dmFyIGV4dGVuZExhc3QgPSBsYXN0Q2h1bmsgJiYgKCAvLyBpZiBzdG9wcyBhcmUgc2FtZSBvciB0YWlsIGhhcyBubyBzdG9wXHJcblx0XHRcdFx0XHRcdGxhc3RDaHVuay5zdG9wID09PSB0YWlsQ2h1bmsuc3RvcCB8fCB0YWlsQ2h1bmsuc3RvcCA9PSBudWxsKSAmJiAvLyBpZiB0YWlsIGNodW5rIGdvZXMganVzdCBhZnRlciBsYXN0IGNodW5rXHJcblx0XHRcdFx0XHRcdHRhaWxDaHVuay5mcm9tID09PSBsYXN0Q2h1bmsuZnJvbSArIGxhc3RDaHVuay50b1N0cmluZygpLmxlbmd0aDtcclxuXHJcblx0XHRcdFx0XHRpZiAodGFpbENodW5rIGluc3RhbmNlb2YgQ29udGludW91c1RhaWxEZXRhaWxzKSB7XHJcblx0XHRcdFx0XHRcdC8vIGNoZWNrIHRoZSBhYmlsaXR5IHRvIGV4dGVuZCBwcmV2aW91cyBjaHVua1xyXG5cdFx0XHRcdFx0XHRpZiAoZXh0ZW5kTGFzdCkge1xyXG5cdFx0XHRcdFx0XHRcdC8vIGV4dGVuZCBwcmV2aW91cyBjaHVua1xyXG5cdFx0XHRcdFx0XHRcdGxhc3RDaHVuay5leHRlbmQodGFpbENodW5rLnRvU3RyaW5nKCkpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIGFwcGVuZCBuZXcgY2h1bmtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmNodW5rcy5wdXNoKHRhaWxDaHVuayk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodGFpbENodW5rIGluc3RhbmNlb2YgQ2h1bmtzVGFpbERldGFpbHMpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHRhaWxDaHVuay5zdG9wID09IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyB1bndyYXAgZmxvYXRpbmcgY2h1bmtzIHRvIHBhcmVudCwga2VlcGluZyBgZnJvbWAgcG9zXHJcblx0XHRcdFx0XHRcdFx0dmFyIGZpcnN0VGFpbENodW5rO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR3aGlsZSAodGFpbENodW5rLmNodW5rcy5sZW5ndGggJiYgdGFpbENodW5rLmNodW5rc1swXS5zdG9wID09IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGZpcnN0VGFpbENodW5rID0gdGFpbENodW5rLmNodW5rcy5zaGlmdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Zmlyc3RUYWlsQ2h1bmsuZnJvbSArPSB0YWlsQ2h1bmsuZnJvbTtcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZXh0ZW5kKGZpcnN0VGFpbENodW5rKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gLy8gaWYgdGFpbCBjaHVuayBzdGlsbCBoYXMgdmFsdWVcclxuXHJcblxyXG5cdFx0XHRcdFx0XHRpZiAodGFpbENodW5rLnRvU3RyaW5nKCkpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBpZiBjaHVua3MgY29udGFpbnMgc3RvcHMsIHRoZW4gcG9wdXAgc3RvcCB0byBjb250YWluZXJcclxuXHRcdFx0XHRcdFx0XHR0YWlsQ2h1bmsuc3RvcCA9IHRhaWxDaHVuay5ibG9ja0luZGV4O1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuY2h1bmtzLnB1c2godGFpbENodW5rKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJhcHBlbmRUb1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBhcHBlbmRUbyhtYXNrZWQpIHtcclxuXHRcdFx0XHRcdC8vICRGbG93Rml4TWVcclxuXHRcdFx0XHRcdGlmICghKG1hc2tlZCBpbnN0YW5jZW9mIElNYXNrLk1hc2tlZFBhdHRlcm4pKSB7XHJcblx0XHRcdFx0XHRcdHZhciB0YWlsID0gbmV3IENvbnRpbnVvdXNUYWlsRGV0YWlscyh0aGlzLnRvU3RyaW5nKCkpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gdGFpbC5hcHBlbmRUbyhtYXNrZWQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHZhciBkZXRhaWxzID0gbmV3IENoYW5nZURldGFpbHMoKTtcclxuXHJcblx0XHRcdFx0XHRmb3IgKHZhciBjaSA9IDA7IGNpIDwgdGhpcy5jaHVua3MubGVuZ3RoICYmICFkZXRhaWxzLnNraXA7ICsrY2kpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGNodW5rID0gdGhpcy5jaHVua3NbY2ldO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIGxhc3RCbG9ja0l0ZXIgPSBtYXNrZWQuX21hcFBvc1RvQmxvY2sobWFza2VkLnZhbHVlLmxlbmd0aCk7XHJcblxyXG5cdFx0XHRcdFx0XHR2YXIgc3RvcCA9IGNodW5rLnN0b3A7XHJcblx0XHRcdFx0XHRcdHZhciBjaHVua0Jsb2NrID0gdm9pZCAwO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHN0b3AgJiYgKCAvLyBpZiBibG9jayBub3QgZm91bmQgb3Igc3RvcCBpcyBiZWhpbmQgbGFzdEJsb2NrXHJcblx0XHRcdFx0XHRcdFx0IWxhc3RCbG9ja0l0ZXIgfHwgbGFzdEJsb2NrSXRlci5pbmRleCA8PSBzdG9wKSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChjaHVuayBpbnN0YW5jZW9mIENodW5rc1RhaWxEZXRhaWxzIHx8IC8vIGZvciBjb250aW51b3VzIGJsb2NrIGFsc28gY2hlY2sgaWYgc3RvcCBpcyBleGlzdFxyXG5cdFx0XHRcdFx0XHRcdFx0bWFza2VkLl9zdG9wcy5pbmRleE9mKHN0b3ApID49IDApIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRldGFpbHMuYWdncmVnYXRlKG1hc2tlZC5fYXBwZW5kUGxhY2Vob2xkZXIoc3RvcCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Y2h1bmtCbG9jayA9IGNodW5rIGluc3RhbmNlb2YgQ2h1bmtzVGFpbERldGFpbHMgJiYgbWFza2VkLl9ibG9ja3Nbc3RvcF07XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChjaHVua0Jsb2NrKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHRhaWxEZXRhaWxzID0gY2h1bmtCbG9jay5hcHBlbmRUYWlsKGNodW5rKTtcclxuXHRcdFx0XHRcdFx0XHR0YWlsRGV0YWlscy5za2lwID0gZmFsc2U7IC8vIGFsd2F5cyBpZ25vcmUgc2tpcCwgaXQgd2lsbCBiZSBzZXQgb24gbGFzdFxyXG5cclxuXHRcdFx0XHRcdFx0XHRkZXRhaWxzLmFnZ3JlZ2F0ZSh0YWlsRGV0YWlscyk7XHJcblx0XHRcdFx0XHRcdFx0bWFza2VkLl92YWx1ZSArPSB0YWlsRGV0YWlscy5pbnNlcnRlZDsgLy8gZ2V0IG5vdCBpbnNlcnRlZCBjaGFyc1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgcmVtYWluQ2hhcnMgPSBjaHVuay50b1N0cmluZygpLnNsaWNlKHRhaWxEZXRhaWxzLnJhd0luc2VydGVkLmxlbmd0aCk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHJlbWFpbkNoYXJzKSBkZXRhaWxzLmFnZ3JlZ2F0ZShtYXNrZWQuYXBwZW5kKHJlbWFpbkNoYXJzLCB7XHJcblx0XHRcdFx0XHRcdFx0XHR0YWlsOiB0cnVlXHJcblx0XHRcdFx0XHRcdFx0fSkpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGRldGFpbHMuYWdncmVnYXRlKG1hc2tlZC5hcHBlbmQoY2h1bmsudG9TdHJpbmcoKSwge1xyXG5cdFx0XHRcdFx0XHRcdFx0dGFpbDogdHJ1ZVxyXG5cdFx0XHRcdFx0XHRcdH0pKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInNoaWZ0QmVmb3JlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHNoaWZ0QmVmb3JlKHBvcykge1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuZnJvbSA+PSBwb3MgfHwgIXRoaXMuY2h1bmtzLmxlbmd0aCkgcmV0dXJuICcnO1xyXG5cdFx0XHRcdFx0dmFyIGNodW5rU2hpZnRQb3MgPSBwb3MgLSB0aGlzLmZyb207XHJcblx0XHRcdFx0XHR2YXIgY2kgPSAwO1xyXG5cclxuXHRcdFx0XHRcdHdoaWxlIChjaSA8IHRoaXMuY2h1bmtzLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHR2YXIgY2h1bmsgPSB0aGlzLmNodW5rc1tjaV07XHJcblx0XHRcdFx0XHRcdHZhciBzaGlmdENoYXIgPSBjaHVuay5zaGlmdEJlZm9yZShjaHVua1NoaWZ0UG9zKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChjaHVuay50b1N0cmluZygpKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gY2h1bmsgc3RpbGwgY29udGFpbnMgdmFsdWVcclxuXHRcdFx0XHRcdFx0XHQvLyBidXQgbm90IHNoaWZ0ZWQgLSBtZWFucyBubyBtb3JlIGF2YWlsYWJsZSBjaGFycyB0byBzaGlmdFxyXG5cdFx0XHRcdFx0XHRcdGlmICghc2hpZnRDaGFyKSBicmVhaztcclxuXHRcdFx0XHRcdFx0XHQrK2NpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIGNsZWFuIGlmIGNodW5rIGhhcyBubyB2YWx1ZVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuY2h1bmtzLnNwbGljZShjaSwgMSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChzaGlmdENoYXIpIHJldHVybiBzaGlmdENoYXI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuICcnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJzdGF0ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0Y2h1bmtzOiB0aGlzLmNodW5rcy5tYXAoZnVuY3Rpb24gKGMpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYy5zdGF0ZTtcclxuXHRcdFx0XHRcdFx0fSksXHJcblx0XHRcdFx0XHRcdGZyb206IHRoaXMuZnJvbSxcclxuXHRcdFx0XHRcdFx0c3RvcDogdGhpcy5zdG9wLFxyXG5cdFx0XHRcdFx0XHRibG9ja0luZGV4OiB0aGlzLmJsb2NrSW5kZXhcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uIHNldChzdGF0ZSkge1xyXG5cdFx0XHRcdFx0dmFyIGNodW5rcyA9IHN0YXRlLmNodW5rcyxcclxuXHRcdFx0XHRcdFx0cHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoc3RhdGUsIFtcImNodW5rc1wiXSk7XHJcblxyXG5cdFx0XHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XHJcblx0XHRcdFx0XHR0aGlzLmNodW5rcyA9IGNodW5rcy5tYXAoZnVuY3Rpb24gKGNzdGF0ZSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgY2h1bmsgPSBcImNodW5rc1wiIGluIGNzdGF0ZSA/IG5ldyBDaHVua3NUYWlsRGV0YWlscygpIDogbmV3IENvbnRpbnVvdXNUYWlsRGV0YWlscygpOyAvLyAkRmxvd0ZpeE1lIGFscmVhZHkgY2hlY2tlZCBhYm92ZVxyXG5cclxuXHRcdFx0XHRcdFx0Y2h1bmsuc3RhdGUgPSBjc3RhdGU7XHJcblx0XHRcdFx0XHRcdHJldHVybiBjaHVuaztcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fV0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIENodW5rc1RhaWxEZXRhaWxzO1xyXG5cdFx0fSgpO1xyXG5cclxuXHQvKipcclxuXHQgIFBhdHRlcm4gbWFza1xyXG5cdCAgQHBhcmFtIHtPYmplY3R9IG9wdHNcclxuXHQgIEBwYXJhbSB7T2JqZWN0fSBvcHRzLmJsb2Nrc1xyXG5cdCAgQHBhcmFtIHtPYmplY3R9IG9wdHMuZGVmaW5pdGlvbnNcclxuXHQgIEBwYXJhbSB7c3RyaW5nfSBvcHRzLnBsYWNlaG9sZGVyQ2hhclxyXG5cdCAgQHBhcmFtIHtib29sZWFufSBvcHRzLmxhenlcclxuXHQqL1xyXG5cdHZhciBNYXNrZWRQYXR0ZXJuID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uIChfTWFza2VkKSB7XHJcblx0XHRcdF9pbmhlcml0cyhNYXNrZWRQYXR0ZXJuLCBfTWFza2VkKTtcclxuXHJcblx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHQvKiogU2luZ2xlIGNoYXIgZm9yIGVtcHR5IGlucHV0ICovXHJcblxyXG5cdFx0XHQvKiogU2hvdyBwbGFjZWhvbGRlciBvbmx5IHdoZW4gbmVlZGVkICovXHJcblx0XHRcdGZ1bmN0aW9uIE1hc2tlZFBhdHRlcm4oKSB7XHJcblx0XHRcdFx0dmFyIG9wdHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xyXG5cclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWFza2VkUGF0dGVybik7XHJcblxyXG5cdFx0XHRcdC8vIFRPRE8gdHlwZSAkU2hhcGU8TWFza2VkUGF0dGVybk9wdGlvbnM+PXt9IGRvZXMgbm90IHdvcmtcclxuXHRcdFx0XHRvcHRzLmRlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9JTlBVVF9ERUZJTklUSU9OUywgb3B0cy5kZWZpbml0aW9ucyk7XHJcblx0XHRcdFx0cmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9nZXRQcm90b3R5cGVPZihNYXNrZWRQYXR0ZXJuKS5jYWxsKHRoaXMsIE9iamVjdC5hc3NpZ24oe30sIE1hc2tlZFBhdHRlcm4uREVGQVVMVFMsIHt9LCBvcHRzKSkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHQgIEBwYXJhbSB7T2JqZWN0fSBvcHRzXHJcblx0XHRcdCovXHJcblxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKE1hc2tlZFBhdHRlcm4sIFt7XHJcblx0XHRcdFx0a2V5OiBcIl91cGRhdGVcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZSgpIHtcclxuXHRcdFx0XHRcdHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcclxuXHRcdFx0XHRcdG9wdHMuZGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmluaXRpb25zLCBvcHRzLmRlZmluaXRpb25zKTtcclxuXHJcblx0XHRcdFx0XHRfZ2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWRQYXR0ZXJuLnByb3RvdHlwZSksIFwiX3VwZGF0ZVwiLCB0aGlzKS5jYWxsKHRoaXMsIG9wdHMpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX3JlYnVpbGRNYXNrKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfcmVidWlsZE1hc2tcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3JlYnVpbGRNYXNrKCkge1xyXG5cdFx0XHRcdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHJcblx0XHRcdFx0XHR2YXIgZGVmcyA9IHRoaXMuZGVmaW5pdGlvbnM7XHJcblx0XHRcdFx0XHR0aGlzLl9ibG9ja3MgPSBbXTtcclxuXHRcdFx0XHRcdHRoaXMuX3N0b3BzID0gW107XHJcblx0XHRcdFx0XHR0aGlzLl9tYXNrZWRCbG9ja3MgPSB7fTtcclxuXHRcdFx0XHRcdHZhciBwYXR0ZXJuID0gdGhpcy5tYXNrO1xyXG5cdFx0XHRcdFx0aWYgKCFwYXR0ZXJuIHx8ICFkZWZzKSByZXR1cm47XHJcblx0XHRcdFx0XHR2YXIgdW5tYXNraW5nQmxvY2sgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHZhciBvcHRpb25hbEJsb2NrID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLmJsb2Nrcykge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBfcmV0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHAgPSBwYXR0ZXJuLnNsaWNlKGkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGJOYW1lcyA9IE9iamVjdC5rZXlzKF90aGlzLmJsb2NrcykuZmlsdGVyKGZ1bmN0aW9uIChiTmFtZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcC5pbmRleE9mKGJOYW1lKSA9PT0gMDtcclxuXHRcdFx0XHRcdFx0XHRcdH0pOyAvLyBvcmRlciBieSBrZXkgbGVuZ3RoXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Yk5hbWVzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGIubGVuZ3RoIC0gYS5sZW5ndGg7XHJcblx0XHRcdFx0XHRcdFx0XHR9KTsgLy8gdXNlIGJsb2NrIG5hbWUgd2l0aCBtYXggbGVuZ3RoXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGJOYW1lID0gYk5hbWVzWzBdO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGlmIChiTmFtZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgbWFza2VkQmxvY2sgPSBjcmVhdGVNYXNrKE9iamVjdC5hc3NpZ24oe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudDogX3RoaXMsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGF6eTogX3RoaXMubGF6eSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRwbGFjZWhvbGRlckNoYXI6IF90aGlzLnBsYWNlaG9sZGVyQ2hhcixcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvdmVyd3JpdGU6IF90aGlzLm92ZXJ3cml0ZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBfdGhpcy5ibG9ja3NbYk5hbWVdKSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAobWFza2VkQmxvY2spIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRfdGhpcy5fYmxvY2tzLnB1c2gobWFza2VkQmxvY2spOyAvLyBzdG9yZSBibG9jayBpbmRleFxyXG5cclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFfdGhpcy5fbWFza2VkQmxvY2tzW2JOYW1lXSkgX3RoaXMuX21hc2tlZEJsb2Nrc1tiTmFtZV0gPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0X3RoaXMuX21hc2tlZEJsb2Nrc1tiTmFtZV0ucHVzaChfdGhpcy5fYmxvY2tzLmxlbmd0aCAtIDEpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpICs9IGJOYW1lLmxlbmd0aCAtIDE7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBcImNvbnRpbnVlXCI7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSgpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoX3JldCA9PT0gXCJjb250aW51ZVwiKSBjb250aW51ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0dmFyIGNoYXIgPSBwYXR0ZXJuW2ldO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIF9pc0lucHV0ID0gY2hhciBpbiBkZWZzO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKGNoYXIgPT09IE1hc2tlZFBhdHRlcm4uU1RPUF9DSEFSKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5fc3RvcHMucHVzaCh0aGlzLl9ibG9ja3MubGVuZ3RoKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChjaGFyID09PSAneycgfHwgY2hhciA9PT0gJ30nKSB7XHJcblx0XHRcdFx0XHRcdFx0dW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChjaGFyID09PSAnWycgfHwgY2hhciA9PT0gJ10nKSB7XHJcblx0XHRcdFx0XHRcdFx0b3B0aW9uYWxCbG9jayA9ICFvcHRpb25hbEJsb2NrO1xyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoY2hhciA9PT0gTWFza2VkUGF0dGVybi5FU0NBUEVfQ0hBUikge1xyXG5cdFx0XHRcdFx0XHRcdCsraTtcclxuXHRcdFx0XHRcdFx0XHRjaGFyID0gcGF0dGVybltpXTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWNoYXIpIGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdF9pc0lucHV0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdHZhciBkZWYgPSBfaXNJbnB1dCA/IG5ldyBQYXR0ZXJuSW5wdXREZWZpbml0aW9uKHtcclxuXHRcdFx0XHRcdFx0XHRwYXJlbnQ6IHRoaXMsXHJcblx0XHRcdFx0XHRcdFx0bGF6eTogdGhpcy5sYXp5LFxyXG5cdFx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyQ2hhcjogdGhpcy5wbGFjZWhvbGRlckNoYXIsXHJcblx0XHRcdFx0XHRcdFx0bWFzazogZGVmc1tjaGFyXSxcclxuXHRcdFx0XHRcdFx0XHRpc09wdGlvbmFsOiBvcHRpb25hbEJsb2NrXHJcblx0XHRcdFx0XHRcdH0pIDogbmV3IFBhdHRlcm5GaXhlZERlZmluaXRpb24oe1xyXG5cdFx0XHRcdFx0XHRcdGNoYXI6IGNoYXIsXHJcblx0XHRcdFx0XHRcdFx0aXNVbm1hc2tpbmc6IHVubWFza2luZ0Jsb2NrXHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy5fYmxvY2tzLnB1c2goZGVmKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJyZXNldFwiLFxyXG5cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xyXG5cdFx0XHRcdFx0X2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkUGF0dGVybi5wcm90b3R5cGUpLCBcInJlc2V0XCIsIHRoaXMpLmNhbGwodGhpcyk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5fYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGIucmVzZXQoKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImRvQ29tbWl0XCIsXHJcblxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9Db21taXQoKSB7XHJcblx0XHRcdFx0XHR0aGlzLl9ibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAoYikge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gYi5kb0NvbW1pdCgpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0X2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkUGF0dGVybi5wcm90b3R5cGUpLCBcImRvQ29tbWl0XCIsIHRoaXMpLmNhbGwodGhpcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiYXBwZW5kVGFpbFwiLFxyXG5cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGFwcGVuZFRhaWwodGFpbCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZFBhdHRlcm4ucHJvdG90eXBlKSwgXCJhcHBlbmRUYWlsXCIsIHRoaXMpLmNhbGwodGhpcywgdGFpbCkuYWdncmVnYXRlKHRoaXMuX2FwcGVuZFBsYWNlaG9sZGVyKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRDaGFyUmF3XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9hcHBlbmRDaGFyUmF3KGNoKSB7XHJcblx0XHRcdFx0XHR2YXIgZmxhZ3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xyXG5cdFx0XHRcdFx0Y2ggPSB0aGlzLmRvUHJlcGFyZShjaCwgZmxhZ3MpO1xyXG5cclxuXHRcdFx0XHRcdHZhciBibG9ja0l0ZXIgPSB0aGlzLl9tYXBQb3NUb0Jsb2NrKHRoaXMudmFsdWUubGVuZ3RoKTtcclxuXHJcblx0XHRcdFx0XHR2YXIgZGV0YWlscyA9IG5ldyBDaGFuZ2VEZXRhaWxzKCk7XHJcblx0XHRcdFx0XHRpZiAoIWJsb2NrSXRlcikgcmV0dXJuIGRldGFpbHM7XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgYmkgPSBibG9ja0l0ZXIuaW5kZXg7IDsgKytiaSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgX2Jsb2NrID0gdGhpcy5fYmxvY2tzW2JpXTtcclxuXHRcdFx0XHRcdFx0aWYgKCFfYmxvY2spIGJyZWFrO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIGJsb2NrRGV0YWlscyA9IF9ibG9jay5fYXBwZW5kQ2hhcihjaCwgZmxhZ3MpO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIHNraXAgPSBibG9ja0RldGFpbHMuc2tpcDtcclxuXHRcdFx0XHRcdFx0ZGV0YWlscy5hZ2dyZWdhdGUoYmxvY2tEZXRhaWxzKTtcclxuXHRcdFx0XHRcdFx0aWYgKHNraXAgfHwgYmxvY2tEZXRhaWxzLnJhd0luc2VydGVkKSBicmVhazsgLy8gZ28gbmV4dCBjaGFyXHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZXh0cmFjdFRhaWxcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZXh0cmFjdFRhaWwoKSB7XHJcblx0XHRcdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcclxuXHJcblx0XHRcdFx0XHR2YXIgZnJvbVBvcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcclxuXHRcdFx0XHRcdHZhciB0b1BvcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdGhpcy52YWx1ZS5sZW5ndGg7XHJcblx0XHRcdFx0XHR2YXIgY2h1bmtUYWlsID0gbmV3IENodW5rc1RhaWxEZXRhaWxzKCk7XHJcblx0XHRcdFx0XHRpZiAoZnJvbVBvcyA9PT0gdG9Qb3MpIHJldHVybiBjaHVua1RhaWw7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5fZm9yRWFjaEJsb2Nrc0luUmFuZ2UoZnJvbVBvcywgdG9Qb3MsIGZ1bmN0aW9uIChiLCBiaSwgYkZyb21Qb3MsIGJUb1Bvcykge1xyXG5cdFx0XHRcdFx0XHR2YXIgYmxvY2tDaHVuayA9IGIuZXh0cmFjdFRhaWwoYkZyb21Qb3MsIGJUb1Bvcyk7XHJcblx0XHRcdFx0XHRcdGJsb2NrQ2h1bmsuc3RvcCA9IF90aGlzMi5fZmluZFN0b3BCZWZvcmUoYmkpO1xyXG5cdFx0XHRcdFx0XHRibG9ja0NodW5rLmZyb20gPSBfdGhpczIuX2Jsb2NrU3RhcnRQb3MoYmkpO1xyXG5cdFx0XHRcdFx0XHRpZiAoYmxvY2tDaHVuayBpbnN0YW5jZW9mIENodW5rc1RhaWxEZXRhaWxzKSBibG9ja0NodW5rLmJsb2NrSW5kZXggPSBiaTtcclxuXHRcdFx0XHRcdFx0Y2h1bmtUYWlsLmV4dGVuZChibG9ja0NodW5rKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiBjaHVua1RhaWw7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZXh0cmFjdElucHV0XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGV4dHJhY3RJbnB1dCgpIHtcclxuXHRcdFx0XHRcdHZhciBmcm9tUG9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAwO1xyXG5cdFx0XHRcdFx0dmFyIHRvUG9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB0aGlzLnZhbHVlLmxlbmd0aDtcclxuXHRcdFx0XHRcdHZhciBmbGFncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XHJcblx0XHRcdFx0XHRpZiAoZnJvbVBvcyA9PT0gdG9Qb3MpIHJldHVybiAnJztcclxuXHRcdFx0XHRcdHZhciBpbnB1dCA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX2ZvckVhY2hCbG9ja3NJblJhbmdlKGZyb21Qb3MsIHRvUG9zLCBmdW5jdGlvbiAoYiwgXywgZnJvbVBvcywgdG9Qb3MpIHtcclxuXHRcdFx0XHRcdFx0aW5wdXQgKz0gYi5leHRyYWN0SW5wdXQoZnJvbVBvcywgdG9Qb3MsIGZsYWdzKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiBpbnB1dDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX2ZpbmRTdG9wQmVmb3JlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9maW5kU3RvcEJlZm9yZShibG9ja0luZGV4KSB7XHJcblx0XHRcdFx0XHR2YXIgc3RvcEJlZm9yZTtcclxuXHJcblx0XHRcdFx0XHRmb3IgKHZhciBzaSA9IDA7IHNpIDwgdGhpcy5fc3RvcHMubGVuZ3RoOyArK3NpKSB7XHJcblx0XHRcdFx0XHRcdHZhciBzdG9wID0gdGhpcy5fc3RvcHNbc2ldO1xyXG5cdFx0XHRcdFx0XHRpZiAoc3RvcCA8PSBibG9ja0luZGV4KSBzdG9wQmVmb3JlID0gc3RvcDsgZWxzZSBicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gc3RvcEJlZm9yZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEFwcGVuZHMgcGxhY2Vob2xkZXIgZGVwZW5kaW5nIG9uIGxhemluZXNzICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRQbGFjZWhvbGRlclwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kUGxhY2Vob2xkZXIodG9CbG9ja0luZGV4KSB7XHJcblx0XHRcdFx0XHR2YXIgX3RoaXMzID0gdGhpcztcclxuXHJcblx0XHRcdFx0XHR2YXIgZGV0YWlscyA9IG5ldyBDaGFuZ2VEZXRhaWxzKCk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5sYXp5ICYmIHRvQmxvY2tJbmRleCA9PSBudWxsKSByZXR1cm4gZGV0YWlscztcclxuXHJcblx0XHRcdFx0XHR2YXIgc3RhcnRCbG9ja0l0ZXIgPSB0aGlzLl9tYXBQb3NUb0Jsb2NrKHRoaXMudmFsdWUubGVuZ3RoKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoIXN0YXJ0QmxvY2tJdGVyKSByZXR1cm4gZGV0YWlscztcclxuXHRcdFx0XHRcdHZhciBzdGFydEJsb2NrSW5kZXggPSBzdGFydEJsb2NrSXRlci5pbmRleDtcclxuXHRcdFx0XHRcdHZhciBlbmRCbG9ja0luZGV4ID0gdG9CbG9ja0luZGV4ICE9IG51bGwgPyB0b0Jsb2NrSW5kZXggOiB0aGlzLl9ibG9ja3MubGVuZ3RoO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX2Jsb2Nrcy5zbGljZShzdGFydEJsb2NrSW5kZXgsIGVuZEJsb2NrSW5kZXgpLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCFiLmxhenkgfHwgdG9CbG9ja0luZGV4ICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyAkRmxvd0ZpeE1lIGBfYmxvY2tzYCBtYXkgbm90IGJlIHByZXNlbnRcclxuXHRcdFx0XHRcdFx0XHR2YXIgYXJncyA9IGIuX2Jsb2NrcyAhPSBudWxsID8gW2IuX2Jsb2Nrcy5sZW5ndGhdIDogW107XHJcblxyXG5cdFx0XHRcdFx0XHRcdHZhciBiRGV0YWlscyA9IGIuX2FwcGVuZFBsYWNlaG9sZGVyLmFwcGx5KGIsIGFyZ3MpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRfdGhpczMuX3ZhbHVlICs9IGJEZXRhaWxzLmluc2VydGVkO1xyXG5cdFx0XHRcdFx0XHRcdGRldGFpbHMuYWdncmVnYXRlKGJEZXRhaWxzKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBGaW5kcyBibG9jayBpbiBwb3MgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX21hcFBvc1RvQmxvY2tcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX21hcFBvc1RvQmxvY2socG9zKSB7XHJcblx0XHRcdFx0XHR2YXIgYWNjVmFsID0gJyc7XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgYmkgPSAwOyBiaSA8IHRoaXMuX2Jsb2Nrcy5sZW5ndGg7ICsrYmkpIHtcclxuXHRcdFx0XHRcdFx0dmFyIF9ibG9jazIgPSB0aGlzLl9ibG9ja3NbYmldO1xyXG5cdFx0XHRcdFx0XHR2YXIgYmxvY2tTdGFydFBvcyA9IGFjY1ZhbC5sZW5ndGg7XHJcblx0XHRcdFx0XHRcdGFjY1ZhbCArPSBfYmxvY2syLnZhbHVlO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHBvcyA8PSBhY2NWYWwubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0XHRcdGluZGV4OiBiaSxcclxuXHRcdFx0XHRcdFx0XHRcdG9mZnNldDogcG9zIC0gYmxvY2tTdGFydFBvc1xyXG5cdFx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9ibG9ja1N0YXJ0UG9zXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9ibG9ja1N0YXJ0UG9zKGJsb2NrSW5kZXgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9ibG9ja3Muc2xpY2UoMCwgYmxvY2tJbmRleCkucmVkdWNlKGZ1bmN0aW9uIChwb3MsIGIpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHBvcyArPSBiLnZhbHVlLmxlbmd0aDtcclxuXHRcdFx0XHRcdH0sIDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX2ZvckVhY2hCbG9ja3NJblJhbmdlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9mb3JFYWNoQmxvY2tzSW5SYW5nZShmcm9tUG9zKSB7XHJcblx0XHRcdFx0XHR2YXIgdG9Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdFx0dmFyIGZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGZyb21CbG9ja0l0ZXIgPSB0aGlzLl9tYXBQb3NUb0Jsb2NrKGZyb21Qb3MpO1xyXG5cclxuXHRcdFx0XHRcdGlmIChmcm9tQmxvY2tJdGVyKSB7XHJcblx0XHRcdFx0XHRcdHZhciB0b0Jsb2NrSXRlciA9IHRoaXMuX21hcFBvc1RvQmxvY2sodG9Qb3MpOyAvLyBwcm9jZXNzIGZpcnN0IGJsb2NrXHJcblxyXG5cclxuXHRcdFx0XHRcdFx0dmFyIGlzU2FtZUJsb2NrID0gdG9CbG9ja0l0ZXIgJiYgZnJvbUJsb2NrSXRlci5pbmRleCA9PT0gdG9CbG9ja0l0ZXIuaW5kZXg7XHJcblx0XHRcdFx0XHRcdHZhciBmcm9tQmxvY2tTdGFydFBvcyA9IGZyb21CbG9ja0l0ZXIub2Zmc2V0O1xyXG5cdFx0XHRcdFx0XHR2YXIgZnJvbUJsb2NrRW5kUG9zID0gdG9CbG9ja0l0ZXIgJiYgaXNTYW1lQmxvY2sgPyB0b0Jsb2NrSXRlci5vZmZzZXQgOiB0aGlzLl9ibG9ja3NbZnJvbUJsb2NrSXRlci5pbmRleF0udmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdFx0XHRmbih0aGlzLl9ibG9ja3NbZnJvbUJsb2NrSXRlci5pbmRleF0sIGZyb21CbG9ja0l0ZXIuaW5kZXgsIGZyb21CbG9ja1N0YXJ0UG9zLCBmcm9tQmxvY2tFbmRQb3MpO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHRvQmxvY2tJdGVyICYmICFpc1NhbWVCbG9jaykge1xyXG5cdFx0XHRcdFx0XHRcdC8vIHByb2Nlc3MgaW50ZXJtZWRpYXRlIGJsb2Nrc1xyXG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGJpID0gZnJvbUJsb2NrSXRlci5pbmRleCArIDE7IGJpIDwgdG9CbG9ja0l0ZXIuaW5kZXg7ICsrYmkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGZuKHRoaXMuX2Jsb2Nrc1tiaV0sIGJpLCAwLCB0aGlzLl9ibG9ja3NbYmldLnZhbHVlLmxlbmd0aCk7XHJcblx0XHRcdFx0XHRcdFx0fSAvLyBwcm9jZXNzIGxhc3QgYmxvY2tcclxuXHJcblxyXG5cdFx0XHRcdFx0XHRcdGZuKHRoaXMuX2Jsb2Nrc1t0b0Jsb2NrSXRlci5pbmRleF0sIHRvQmxvY2tJdGVyLmluZGV4LCAwLCB0b0Jsb2NrSXRlci5vZmZzZXQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwicmVtb3ZlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcclxuXHRcdFx0XHRcdHZhciBmcm9tUG9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAwO1xyXG5cdFx0XHRcdFx0dmFyIHRvUG9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB0aGlzLnZhbHVlLmxlbmd0aDtcclxuXHJcblx0XHRcdFx0XHR2YXIgcmVtb3ZlRGV0YWlscyA9IF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZFBhdHRlcm4ucHJvdG90eXBlKSwgXCJyZW1vdmVcIiwgdGhpcykuY2FsbCh0aGlzLCBmcm9tUG9zLCB0b1Bvcyk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5fZm9yRWFjaEJsb2Nrc0luUmFuZ2UoZnJvbVBvcywgdG9Qb3MsIGZ1bmN0aW9uIChiLCBfLCBiRnJvbVBvcywgYlRvUG9zKSB7XHJcblx0XHRcdFx0XHRcdHJlbW92ZURldGFpbHMuYWdncmVnYXRlKGIucmVtb3ZlKGJGcm9tUG9zLCBiVG9Qb3MpKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiByZW1vdmVEZXRhaWxzO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIm5lYXJlc3RJbnB1dFBvc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBuZWFyZXN0SW5wdXRQb3MoY3Vyc29yUG9zKSB7XHJcblx0XHRcdFx0XHR2YXIgZGlyZWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBESVJFQ1RJT04uTk9ORTtcclxuXHRcdFx0XHRcdC8vIFRPRE8gcmVmYWN0b3IgLSBleHRyYWN0IGFsaWduYmxvY2tcclxuXHRcdFx0XHRcdHZhciBiZWdpbkJsb2NrRGF0YSA9IHRoaXMuX21hcFBvc1RvQmxvY2soY3Vyc29yUG9zKSB8fCB7XHJcblx0XHRcdFx0XHRcdGluZGV4OiAwLFxyXG5cdFx0XHRcdFx0XHRvZmZzZXQ6IDBcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHR2YXIgYmVnaW5CbG9ja09mZnNldCA9IGJlZ2luQmxvY2tEYXRhLm9mZnNldCxcclxuXHRcdFx0XHRcdFx0YmVnaW5CbG9ja0luZGV4ID0gYmVnaW5CbG9ja0RhdGEuaW5kZXg7XHJcblx0XHRcdFx0XHR2YXIgYmVnaW5CbG9jayA9IHRoaXMuX2Jsb2Nrc1tiZWdpbkJsb2NrSW5kZXhdO1xyXG5cdFx0XHRcdFx0aWYgKCFiZWdpbkJsb2NrKSByZXR1cm4gY3Vyc29yUG9zO1xyXG5cdFx0XHRcdFx0dmFyIGJlZ2luQmxvY2tDdXJzb3JQb3MgPSBiZWdpbkJsb2NrT2Zmc2V0OyAvLyBpZiBwb3NpdGlvbiBpbnNpZGUgYmxvY2sgLSB0cnkgdG8gYWRqdXN0IGl0XHJcblxyXG5cdFx0XHRcdFx0aWYgKGJlZ2luQmxvY2tDdXJzb3JQb3MgIT09IDAgJiYgYmVnaW5CbG9ja0N1cnNvclBvcyA8IGJlZ2luQmxvY2sudmFsdWUubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdGJlZ2luQmxvY2tDdXJzb3JQb3MgPSBiZWdpbkJsb2NrLm5lYXJlc3RJbnB1dFBvcyhiZWdpbkJsb2NrT2Zmc2V0LCBmb3JjZURpcmVjdGlvbihkaXJlY3Rpb24pKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR2YXIgY3Vyc29yQXRSaWdodCA9IGJlZ2luQmxvY2tDdXJzb3JQb3MgPT09IGJlZ2luQmxvY2sudmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdFx0dmFyIGN1cnNvckF0TGVmdCA9IGJlZ2luQmxvY2tDdXJzb3JQb3MgPT09IDA7IC8vICBjdXJzb3IgaXMgSU5TSURFIGZpcnN0IGJsb2NrIChub3QgYXQgYm91bmRzKVxyXG5cclxuXHRcdFx0XHRcdGlmICghY3Vyc29yQXRMZWZ0ICYmICFjdXJzb3JBdFJpZ2h0KSByZXR1cm4gdGhpcy5fYmxvY2tTdGFydFBvcyhiZWdpbkJsb2NrSW5kZXgpICsgYmVnaW5CbG9ja0N1cnNvclBvcztcclxuXHRcdFx0XHRcdHZhciBzZWFyY2hCbG9ja0luZGV4ID0gY3Vyc29yQXRSaWdodCA/IGJlZ2luQmxvY2tJbmRleCArIDEgOiBiZWdpbkJsb2NrSW5kZXg7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gRElSRUNUSU9OLk5PTkUpIHtcclxuXHRcdFx0XHRcdFx0Ly8gTk9ORSBkaXJlY3Rpb24gdXNlZCB0byBjYWxjdWxhdGUgc3RhcnQgaW5wdXQgcG9zaXRpb24gaWYgbm8gY2hhcnMgd2VyZSByZW1vdmVkXHJcblx0XHRcdFx0XHRcdC8vIEZPUiBOT05FOlxyXG5cdFx0XHRcdFx0XHQvLyAtXHJcblx0XHRcdFx0XHRcdC8vIGlucHV0fGFueVxyXG5cdFx0XHRcdFx0XHQvLyAtPlxyXG5cdFx0XHRcdFx0XHQvLyAgYW55fGlucHV0XHJcblx0XHRcdFx0XHRcdC8vIDwtXHJcblx0XHRcdFx0XHRcdC8vICBmaWxsZWQtaW5wdXR8YW55XHJcblx0XHRcdFx0XHRcdC8vIGNoZWNrIGlmIGZpcnN0IGJsb2NrIGF0IGxlZnQgaXMgaW5wdXRcclxuXHRcdFx0XHRcdFx0aWYgKHNlYXJjaEJsb2NrSW5kZXggPiAwKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGJsb2NrSW5kZXhBdExlZnQgPSBzZWFyY2hCbG9ja0luZGV4IC0gMTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgYmxvY2tBdExlZnQgPSB0aGlzLl9ibG9ja3NbYmxvY2tJbmRleEF0TGVmdF07XHJcblx0XHRcdFx0XHRcdFx0dmFyIGJsb2NrSW5wdXRQb3MgPSBibG9ja0F0TGVmdC5uZWFyZXN0SW5wdXRQb3MoMCwgRElSRUNUSU9OLk5PTkUpOyAvLyBpcyBpbnB1dFxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWJsb2NrQXRMZWZ0LnZhbHVlLmxlbmd0aCB8fCBibG9ja0lucHV0UG9zICE9PSBibG9ja0F0TGVmdC52YWx1ZS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0aGlzLl9ibG9ja1N0YXJ0UG9zKHNlYXJjaEJsb2NrSW5kZXgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSAvLyAtPlxyXG5cclxuXHJcblx0XHRcdFx0XHRcdHZhciBmaXJzdElucHV0QXRSaWdodCA9IHNlYXJjaEJsb2NrSW5kZXg7XHJcblxyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBiaSA9IGZpcnN0SW5wdXRBdFJpZ2h0OyBiaSA8IHRoaXMuX2Jsb2Nrcy5sZW5ndGg7ICsrYmkpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgYmxvY2tBdFJpZ2h0ID0gdGhpcy5fYmxvY2tzW2JpXTtcclxuXHJcblx0XHRcdFx0XHRcdFx0dmFyIF9ibG9ja0lucHV0UG9zID0gYmxvY2tBdFJpZ2h0Lm5lYXJlc3RJbnB1dFBvcygwLCBESVJFQ1RJT04uTk9ORSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICghYmxvY2tBdFJpZ2h0LnZhbHVlLmxlbmd0aCB8fCBfYmxvY2tJbnB1dFBvcyAhPT0gYmxvY2tBdFJpZ2h0LnZhbHVlLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2Jsb2NrU3RhcnRQb3MoYmkpICsgX2Jsb2NrSW5wdXRQb3M7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9IC8vIDwtXHJcblx0XHRcdFx0XHRcdC8vIGZpbmQgZmlyc3Qgbm9uLWZpeGVkIHN5bWJvbFxyXG5cclxuXHJcblx0XHRcdFx0XHRcdGZvciAodmFyIF9iaSA9IHNlYXJjaEJsb2NrSW5kZXggLSAxOyBfYmkgPj0gMDsgLS1fYmkpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgX2Jsb2NrMyA9IHRoaXMuX2Jsb2Nrc1tfYmldO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgX2Jsb2NrSW5wdXRQb3MyID0gX2Jsb2NrMy5uZWFyZXN0SW5wdXRQb3MoMCwgRElSRUNUSU9OLk5PTkUpOyAvLyBpcyBpbnB1dFxyXG5cclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCFfYmxvY2szLnZhbHVlLmxlbmd0aCB8fCBfYmxvY2tJbnB1dFBvczIgIT09IF9ibG9jazMudmFsdWUubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fYmxvY2tTdGFydFBvcyhfYmkpICsgX2Jsb2NrMy52YWx1ZS5sZW5ndGg7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gY3Vyc29yUG9zO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmIChkaXJlY3Rpb24gPT09IERJUkVDVElPTi5MRUZUIHx8IGRpcmVjdGlvbiA9PT0gRElSRUNUSU9OLkZPUkNFX0xFRlQpIHtcclxuXHRcdFx0XHRcdFx0Ly8gLVxyXG5cdFx0XHRcdFx0XHQvLyAgYW55fGZpbGxlZC1pbnB1dFxyXG5cdFx0XHRcdFx0XHQvLyA8LVxyXG5cdFx0XHRcdFx0XHQvLyAgYW55fGZpcnN0IG5vdCBlbXB0eSBpcyBub3QtbGVuLWFsaWduZWRcclxuXHRcdFx0XHRcdFx0Ly8gIG5vdC0wLWFsaWduZWR8YW55XHJcblx0XHRcdFx0XHRcdC8vIC0+XHJcblx0XHRcdFx0XHRcdC8vICBhbnl8bm90LWxlbi1hbGlnbmVkIG9yIGVuZFxyXG5cdFx0XHRcdFx0XHQvLyBjaGVjayBpZiBmaXJzdCBibG9jayBhdCByaWdodCBpcyBmaWxsZWQgaW5wdXRcclxuXHRcdFx0XHRcdFx0dmFyIGZpcnN0RmlsbGVkQmxvY2tJbmRleEF0UmlnaHQ7XHJcblxyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBfYmkyID0gc2VhcmNoQmxvY2tJbmRleDsgX2JpMiA8IHRoaXMuX2Jsb2Nrcy5sZW5ndGg7ICsrX2JpMikge1xyXG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLl9ibG9ja3NbX2JpMl0udmFsdWUpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGZpcnN0RmlsbGVkQmxvY2tJbmRleEF0UmlnaHQgPSBfYmkyO1xyXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoZmlyc3RGaWxsZWRCbG9ja0luZGV4QXRSaWdodCAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGZpbGxlZEJsb2NrID0gdGhpcy5fYmxvY2tzW2ZpcnN0RmlsbGVkQmxvY2tJbmRleEF0UmlnaHRdO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgX2Jsb2NrSW5wdXRQb3MzID0gZmlsbGVkQmxvY2submVhcmVzdElucHV0UG9zKDAsIERJUkVDVElPTi5SSUdIVCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChfYmxvY2tJbnB1dFBvczMgPT09IDAgJiYgZmlsbGVkQmxvY2sudW5tYXNrZWRWYWx1ZS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGZpbGxlZCBibG9jayBpcyBpbnB1dFxyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2Jsb2NrU3RhcnRQb3MoZmlyc3RGaWxsZWRCbG9ja0luZGV4QXRSaWdodCkgKyBfYmxvY2tJbnB1dFBvczM7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9IC8vIDwtXHJcblx0XHRcdFx0XHRcdC8vIGZpbmQgdGhpcyB2YXJzXHJcblxyXG5cclxuXHRcdFx0XHRcdFx0dmFyIGZpcnN0RmlsbGVkSW5wdXRCbG9ja0luZGV4ID0gLTE7XHJcblx0XHRcdFx0XHRcdHZhciBmaXJzdEVtcHR5SW5wdXRCbG9ja0luZGV4OyAvLyBUT0RPIGNvbnNpZGVyIG5lc3RlZCBlbXB0eSBpbnB1dHNcclxuXHJcblx0XHRcdFx0XHRcdGZvciAodmFyIF9iaTMgPSBzZWFyY2hCbG9ja0luZGV4IC0gMTsgX2JpMyA+PSAwOyAtLV9iaTMpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgX2Jsb2NrNCA9IHRoaXMuX2Jsb2Nrc1tfYmkzXTtcclxuXHJcblx0XHRcdFx0XHRcdFx0dmFyIF9ibG9ja0lucHV0UG9zNCA9IF9ibG9jazQubmVhcmVzdElucHV0UG9zKF9ibG9jazQudmFsdWUubGVuZ3RoLCBESVJFQ1RJT04uRk9SQ0VfTEVGVCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICghX2Jsb2NrNC52YWx1ZSB8fCBfYmxvY2tJbnB1dFBvczQgIT09IDApIGZpcnN0RW1wdHlJbnB1dEJsb2NrSW5kZXggPSBfYmkzO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoX2Jsb2NrSW5wdXRQb3M0ICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoX2Jsb2NrSW5wdXRQb3M0ICE9PSBfYmxvY2s0LnZhbHVlLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBhbGlnbmVkIGluc2lkZSBibG9jayAtIHJldHVybiBpbW1lZGlhdGVseVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fYmxvY2tTdGFydFBvcyhfYmkzKSArIF9ibG9ja0lucHV0UG9zNDtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGZvdW5kIGZpbGxlZFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRmaXJzdEZpbGxlZElucHV0QmxvY2tJbmRleCA9IF9iaTM7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gRElSRUNUSU9OLkxFRlQpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyB0cnkgZmluZCBmaXJzdCBlbXB0eSBpbnB1dCBiZWZvcmUgc3RhcnQgc2VhcmNoaW5nIHBvc2l0aW9uIG9ubHkgd2hlbiBub3QgZm9yY2VkXHJcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgX2JpNCA9IGZpcnN0RmlsbGVkSW5wdXRCbG9ja0luZGV4ICsgMTsgX2JpNCA8PSBNYXRoLm1pbihzZWFyY2hCbG9ja0luZGV4LCB0aGlzLl9ibG9ja3MubGVuZ3RoIC0gMSk7ICsrX2JpNCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIF9ibG9jazUgPSB0aGlzLl9ibG9ja3NbX2JpNF07XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIF9ibG9ja0lucHV0UG9zNSA9IF9ibG9jazUubmVhcmVzdElucHV0UG9zKDAsIERJUkVDVElPTi5OT05FKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgYmxvY2tBbGlnbmVkUG9zID0gdGhpcy5fYmxvY2tTdGFydFBvcyhfYmk0KSArIF9ibG9ja0lucHV0UG9zNTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoYmxvY2tBbGlnbmVkUG9zID4gY3Vyc29yUG9zKSBicmVhazsgLy8gaWYgYmxvY2sgaXMgbm90IGxhenkgaW5wdXRcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoX2Jsb2NrSW5wdXRQb3M1ICE9PSBfYmxvY2s1LnZhbHVlLmxlbmd0aCkgcmV0dXJuIGJsb2NrQWxpZ25lZFBvcztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gLy8gcHJvY2VzcyBvdmVyZmxvd1xyXG5cclxuXHJcblx0XHRcdFx0XHRcdGlmIChmaXJzdEZpbGxlZElucHV0QmxvY2tJbmRleCA+PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2Jsb2NrU3RhcnRQb3MoZmlyc3RGaWxsZWRJbnB1dEJsb2NrSW5kZXgpICsgdGhpcy5fYmxvY2tzW2ZpcnN0RmlsbGVkSW5wdXRCbG9ja0luZGV4XS52YWx1ZS5sZW5ndGg7XHJcblx0XHRcdFx0XHRcdH0gLy8gZm9yIGxhenkgaWYgaGFzIGFsaWduZWQgbGVmdCBpbnNpZGUgZml4ZWQgYW5kIGhhcyBjYW1lIHRvIHRoZSBzdGFydCAtIHVzZSBzdGFydCBwb3NpdGlvblxyXG5cclxuXHJcblx0XHRcdFx0XHRcdGlmIChkaXJlY3Rpb24gPT09IERJUkVDVElPTi5GT1JDRV9MRUZUIHx8IHRoaXMubGF6eSAmJiAhdGhpcy5leHRyYWN0SW5wdXQoKSAmJiAhaXNJbnB1dCh0aGlzLl9ibG9ja3Nbc2VhcmNoQmxvY2tJbmRleF0pKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChmaXJzdEVtcHR5SW5wdXRCbG9ja0luZGV4ICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fYmxvY2tTdGFydFBvcyhmaXJzdEVtcHR5SW5wdXRCbG9ja0luZGV4KTtcclxuXHRcdFx0XHRcdFx0fSAvLyBmaW5kIGZpcnN0IGlucHV0XHJcblxyXG5cclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgX2JpNSA9IHNlYXJjaEJsb2NrSW5kZXg7IF9iaTUgPCB0aGlzLl9ibG9ja3MubGVuZ3RoOyArK19iaTUpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgX2Jsb2NrNiA9IHRoaXMuX2Jsb2Nrc1tfYmk1XTtcclxuXHJcblx0XHRcdFx0XHRcdFx0dmFyIF9ibG9ja0lucHV0UG9zNiA9IF9ibG9jazYubmVhcmVzdElucHV0UG9zKDAsIERJUkVDVElPTi5OT05FKTsgLy8gaXMgaW5wdXRcclxuXHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICghX2Jsb2NrNi52YWx1ZS5sZW5ndGggfHwgX2Jsb2NrSW5wdXRQb3M2ICE9PSBfYmxvY2s2LnZhbHVlLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2Jsb2NrU3RhcnRQb3MoX2JpNSkgKyBfYmxvY2tJbnB1dFBvczY7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZiAoZGlyZWN0aW9uID09PSBESVJFQ1RJT04uUklHSFQgfHwgZGlyZWN0aW9uID09PSBESVJFQ1RJT04uRk9SQ0VfUklHSFQpIHtcclxuXHRcdFx0XHRcdFx0Ly8gLT5cclxuXHRcdFx0XHRcdFx0Ly8gIGFueXxub3QtbGVuLWFsaWduZWQgYW5kIGZpbGxlZFxyXG5cdFx0XHRcdFx0XHQvLyAgYW55fG5vdC1sZW4tYWxpZ25lZFxyXG5cdFx0XHRcdFx0XHQvLyA8LVxyXG5cdFx0XHRcdFx0XHQvLyAgbm90LTAtYWxpZ25lZCBvciBzdGFydHxhbnlcclxuXHRcdFx0XHRcdFx0dmFyIGZpcnN0SW5wdXRCbG9ja0FsaWduZWRJbmRleDtcclxuXHRcdFx0XHRcdFx0dmFyIGZpcnN0SW5wdXRCbG9ja0FsaWduZWRQb3M7XHJcblxyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBfYmk2ID0gc2VhcmNoQmxvY2tJbmRleDsgX2JpNiA8IHRoaXMuX2Jsb2Nrcy5sZW5ndGg7ICsrX2JpNikge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBfYmxvY2s3ID0gdGhpcy5fYmxvY2tzW19iaTZdO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgX2Jsb2NrSW5wdXRQb3M3ID0gX2Jsb2NrNy5uZWFyZXN0SW5wdXRQb3MoMCwgRElSRUNUSU9OLk5PTkUpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoX2Jsb2NrSW5wdXRQb3M3ICE9PSBfYmxvY2s3LnZhbHVlLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Zmlyc3RJbnB1dEJsb2NrQWxpZ25lZFBvcyA9IHRoaXMuX2Jsb2NrU3RhcnRQb3MoX2JpNikgKyBfYmxvY2tJbnB1dFBvczc7XHJcblx0XHRcdFx0XHRcdFx0XHRmaXJzdElucHV0QmxvY2tBbGlnbmVkSW5kZXggPSBfYmk2O1xyXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoZmlyc3RJbnB1dEJsb2NrQWxpZ25lZEluZGV4ICE9IG51bGwgJiYgZmlyc3RJbnB1dEJsb2NrQWxpZ25lZFBvcyAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgX2JpNyA9IGZpcnN0SW5wdXRCbG9ja0FsaWduZWRJbmRleDsgX2JpNyA8IHRoaXMuX2Jsb2Nrcy5sZW5ndGg7ICsrX2JpNykge1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIF9ibG9jazggPSB0aGlzLl9ibG9ja3NbX2JpN107XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIF9ibG9ja0lucHV0UG9zOCA9IF9ibG9jazgubmVhcmVzdElucHV0UG9zKDAsIERJUkVDVElPTi5GT1JDRV9SSUdIVCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKF9ibG9ja0lucHV0UG9zOCAhPT0gX2Jsb2NrOC52YWx1ZS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2Jsb2NrU3RhcnRQb3MoX2JpNykgKyBfYmxvY2tJbnB1dFBvczg7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZGlyZWN0aW9uID09PSBESVJFQ1RJT04uRk9SQ0VfUklHSFQgPyB0aGlzLnZhbHVlLmxlbmd0aCA6IGZpcnN0SW5wdXRCbG9ja0FsaWduZWRQb3M7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGZvciAodmFyIF9iaTggPSBNYXRoLm1pbihzZWFyY2hCbG9ja0luZGV4LCB0aGlzLl9ibG9ja3MubGVuZ3RoIC0gMSk7IF9iaTggPj0gMDsgLS1fYmk4KSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIF9ibG9jazkgPSB0aGlzLl9ibG9ja3NbX2JpOF07XHJcblxyXG5cdFx0XHRcdFx0XHRcdHZhciBfYmxvY2tJbnB1dFBvczkgPSBfYmxvY2s5Lm5lYXJlc3RJbnB1dFBvcyhfYmxvY2s5LnZhbHVlLmxlbmd0aCwgRElSRUNUSU9OLkxFRlQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoX2Jsb2NrSW5wdXRQb3M5ICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgYWxpZ25lZFBvcyA9IHRoaXMuX2Jsb2NrU3RhcnRQb3MoX2JpOCkgKyBfYmxvY2tJbnB1dFBvczk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFsaWduZWRQb3MgPj0gY3Vyc29yUG9zKSByZXR1cm4gYWxpZ25lZFBvcztcclxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHJldHVybiBjdXJzb3JQb3M7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBHZXQgYmxvY2sgYnkgbmFtZSAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJtYXNrZWRCbG9ja1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBtYXNrZWRCbG9jayhuYW1lKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXNrZWRCbG9ja3MobmFtZSlbMF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBHZXQgYWxsIGJsb2NrcyBieSBuYW1lICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIm1hc2tlZEJsb2Nrc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBtYXNrZWRCbG9ja3MobmFtZSkge1xyXG5cdFx0XHRcdFx0dmFyIF90aGlzNCA9IHRoaXM7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGluZGljZXMgPSB0aGlzLl9tYXNrZWRCbG9ja3NbbmFtZV07XHJcblx0XHRcdFx0XHRpZiAoIWluZGljZXMpIHJldHVybiBbXTtcclxuXHRcdFx0XHRcdHJldHVybiBpbmRpY2VzLm1hcChmdW5jdGlvbiAoZ2kpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIF90aGlzNC5fYmxvY2tzW2dpXTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJzdGF0ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZFBhdHRlcm4ucHJvdG90eXBlKSwgXCJzdGF0ZVwiLCB0aGlzKSwge1xyXG5cdFx0XHRcdFx0XHRfYmxvY2tzOiB0aGlzLl9ibG9ja3MubWFwKGZ1bmN0aW9uIChiKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGIuc3RhdGU7XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHN0YXRlKSB7XHJcblx0XHRcdFx0XHR2YXIgX2Jsb2NrcyA9IHN0YXRlLl9ibG9ja3MsXHJcblx0XHRcdFx0XHRcdG1hc2tlZFN0YXRlID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHN0YXRlLCBbXCJfYmxvY2tzXCJdKTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLl9ibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAoYiwgYmkpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGIuc3RhdGUgPSBfYmxvY2tzW2JpXTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdF9zZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZFBhdHRlcm4ucHJvdG90eXBlKSwgXCJzdGF0ZVwiLCBtYXNrZWRTdGF0ZSwgdGhpcywgdHJ1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImlzQ29tcGxldGVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9ibG9ja3MuZXZlcnkoZnVuY3Rpb24gKGIpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGIuaXNDb21wbGV0ZTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ1bm1hc2tlZFZhbHVlXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fYmxvY2tzLnJlZHVjZShmdW5jdGlvbiAoc3RyLCBiKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBzdHIgKz0gYi51bm1hc2tlZFZhbHVlO1xyXG5cdFx0XHRcdFx0fSwgJycpO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodW5tYXNrZWRWYWx1ZSkge1xyXG5cdFx0XHRcdFx0X3NldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkUGF0dGVybi5wcm90b3R5cGUpLCBcInVubWFza2VkVmFsdWVcIiwgdW5tYXNrZWRWYWx1ZSwgdGhpcywgdHJ1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdC8vIFRPRE8gcmV0dXJuIF92YWx1ZSB3aGVuIG5vdCBpbiBjaGFuZ2U/XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fYmxvY2tzLnJlZHVjZShmdW5jdGlvbiAoc3RyLCBiKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBzdHIgKz0gYi52YWx1ZTtcclxuXHRcdFx0XHRcdH0sICcnKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XHJcblx0XHRcdFx0XHRfc2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWRQYXR0ZXJuLnByb3RvdHlwZSksIFwidmFsdWVcIiwgdmFsdWUsIHRoaXMsIHRydWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fV0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIE1hc2tlZFBhdHRlcm47XHJcblx0XHR9KE1hc2tlZCk7XHJcblx0TWFza2VkUGF0dGVybi5ERUZBVUxUUyA9IHtcclxuXHRcdGxhenk6IHRydWUsXHJcblx0XHRwbGFjZWhvbGRlckNoYXI6ICdfJ1xyXG5cdH07XHJcblx0TWFza2VkUGF0dGVybi5TVE9QX0NIQVIgPSAnYCc7XHJcblx0TWFza2VkUGF0dGVybi5FU0NBUEVfQ0hBUiA9ICdcXFxcJztcclxuXHRNYXNrZWRQYXR0ZXJuLklucHV0RGVmaW5pdGlvbiA9IFBhdHRlcm5JbnB1dERlZmluaXRpb247XHJcblx0TWFza2VkUGF0dGVybi5GaXhlZERlZmluaXRpb24gPSBQYXR0ZXJuRml4ZWREZWZpbml0aW9uO1xyXG5cclxuXHRmdW5jdGlvbiBpc0lucHV0KGJsb2NrKSB7XHJcblx0XHRpZiAoIWJsb2NrKSByZXR1cm4gZmFsc2U7XHJcblx0XHR2YXIgdmFsdWUgPSBibG9jay52YWx1ZTtcclxuXHRcdHJldHVybiAhdmFsdWUgfHwgYmxvY2submVhcmVzdElucHV0UG9zKDAsIERJUkVDVElPTi5OT05FKSAhPT0gdmFsdWUubGVuZ3RoO1xyXG5cdH1cclxuXHJcblx0SU1hc2suTWFza2VkUGF0dGVybiA9IE1hc2tlZFBhdHRlcm47XHJcblxyXG5cdC8qKiBQYXR0ZXJuIHdoaWNoIGFjY2VwdHMgcmFuZ2VzICovXHJcblxyXG5cdHZhciBNYXNrZWRSYW5nZSA9XHJcblx0XHQvKiNfX1BVUkVfXyovXHJcblx0XHRmdW5jdGlvbiAoX01hc2tlZFBhdHRlcm4pIHtcclxuXHRcdFx0X2luaGVyaXRzKE1hc2tlZFJhbmdlLCBfTWFza2VkUGF0dGVybik7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBNYXNrZWRSYW5nZSgpIHtcclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWFza2VkUmFuZ2UpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX2dldFByb3RvdHlwZU9mKE1hc2tlZFJhbmdlKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKE1hc2tlZFJhbmdlLCBbe1xyXG5cdFx0XHRcdGtleTogXCJfdXBkYXRlXCIsXHJcblxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZShvcHRzKSB7XHJcblx0XHRcdFx0XHQvLyBUT0RPIHR5cGVcclxuXHRcdFx0XHRcdG9wdHMgPSBPYmplY3QuYXNzaWduKHtcclxuXHRcdFx0XHRcdFx0dG86IHRoaXMudG8gfHwgMCxcclxuXHRcdFx0XHRcdFx0ZnJvbTogdGhpcy5mcm9tIHx8IDBcclxuXHRcdFx0XHRcdH0sIG9wdHMpO1xyXG5cdFx0XHRcdFx0dmFyIG1heExlbmd0aCA9IFN0cmluZyhvcHRzLnRvKS5sZW5ndGg7XHJcblx0XHRcdFx0XHRpZiAob3B0cy5tYXhMZW5ndGggIT0gbnVsbCkgbWF4TGVuZ3RoID0gTWF0aC5tYXgobWF4TGVuZ3RoLCBvcHRzLm1heExlbmd0aCk7XHJcblx0XHRcdFx0XHRvcHRzLm1heExlbmd0aCA9IG1heExlbmd0aDtcclxuXHRcdFx0XHRcdHZhciBmcm9tU3RyID0gU3RyaW5nKG9wdHMuZnJvbSkucGFkU3RhcnQobWF4TGVuZ3RoLCAnMCcpO1xyXG5cdFx0XHRcdFx0dmFyIHRvU3RyID0gU3RyaW5nKG9wdHMudG8pLnBhZFN0YXJ0KG1heExlbmd0aCwgJzAnKTtcclxuXHRcdFx0XHRcdHZhciBzYW1lQ2hhcnNDb3VudCA9IDA7XHJcblxyXG5cdFx0XHRcdFx0d2hpbGUgKHNhbWVDaGFyc0NvdW50IDwgdG9TdHIubGVuZ3RoICYmIHRvU3RyW3NhbWVDaGFyc0NvdW50XSA9PT0gZnJvbVN0cltzYW1lQ2hhcnNDb3VudF0pIHtcclxuXHRcdFx0XHRcdFx0KytzYW1lQ2hhcnNDb3VudDtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRvcHRzLm1hc2sgPSB0b1N0ci5zbGljZSgwLCBzYW1lQ2hhcnNDb3VudCkucmVwbGFjZSgvMC9nLCAnXFxcXDAnKSArICcwJy5yZXBlYXQobWF4TGVuZ3RoIC0gc2FtZUNoYXJzQ291bnQpO1xyXG5cclxuXHRcdFx0XHRcdF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZFJhbmdlLnByb3RvdHlwZSksIFwiX3VwZGF0ZVwiLCB0aGlzKS5jYWxsKHRoaXMsIG9wdHMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImJvdW5kYXJpZXNcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gYm91bmRhcmllcyhzdHIpIHtcclxuXHRcdFx0XHRcdHZhciBtaW5zdHIgPSAnJztcclxuXHRcdFx0XHRcdHZhciBtYXhzdHIgPSAnJztcclxuXHJcblx0XHRcdFx0XHR2YXIgX3JlZiA9IHN0ci5tYXRjaCgvXihcXEQqKShcXGQqKShcXEQqKS8pIHx8IFtdLFxyXG5cdFx0XHRcdFx0XHRfcmVmMiA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDMpLFxyXG5cdFx0XHRcdFx0XHRwbGFjZWhvbGRlciA9IF9yZWYyWzFdLFxyXG5cdFx0XHRcdFx0XHRudW0gPSBfcmVmMlsyXTtcclxuXHJcblx0XHRcdFx0XHRpZiAobnVtKSB7XHJcblx0XHRcdFx0XHRcdG1pbnN0ciA9ICcwJy5yZXBlYXQocGxhY2Vob2xkZXIubGVuZ3RoKSArIG51bTtcclxuXHRcdFx0XHRcdFx0bWF4c3RyID0gJzknLnJlcGVhdChwbGFjZWhvbGRlci5sZW5ndGgpICsgbnVtO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdG1pbnN0ciA9IG1pbnN0ci5wYWRFbmQodGhpcy5tYXhMZW5ndGgsICcwJyk7XHJcblx0XHRcdFx0XHRtYXhzdHIgPSBtYXhzdHIucGFkRW5kKHRoaXMubWF4TGVuZ3RoLCAnOScpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIFttaW5zdHIsIG1heHN0cl07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9QcmVwYXJlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGRvUHJlcGFyZShzdHIpIHtcclxuXHRcdFx0XHRcdHZhciBmbGFncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XHJcblx0XHRcdFx0XHRzdHIgPSBfZ2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWRSYW5nZS5wcm90b3R5cGUpLCBcImRvUHJlcGFyZVwiLCB0aGlzKS5jYWxsKHRoaXMsIHN0ciwgZmxhZ3MpLnJlcGxhY2UoL1xcRC9nLCAnJyk7XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMuYXV0b2ZpeCkgcmV0dXJuIHN0cjtcclxuXHRcdFx0XHRcdHZhciBmcm9tU3RyID0gU3RyaW5nKHRoaXMuZnJvbSkucGFkU3RhcnQodGhpcy5tYXhMZW5ndGgsICcwJyk7XHJcblx0XHRcdFx0XHR2YXIgdG9TdHIgPSBTdHJpbmcodGhpcy50bykucGFkU3RhcnQodGhpcy5tYXhMZW5ndGgsICcwJyk7XHJcblx0XHRcdFx0XHR2YXIgdmFsID0gdGhpcy52YWx1ZTtcclxuXHRcdFx0XHRcdHZhciBwcmVwU3RyID0gJyc7XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgY2kgPSAwOyBjaSA8IHN0ci5sZW5ndGg7ICsrY2kpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG5leHRWYWwgPSB2YWwgKyBwcmVwU3RyICsgc3RyW2NpXTtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBfdGhpcyRib3VuZGFyaWVzID0gdGhpcy5ib3VuZGFyaWVzKG5leHRWYWwpLFxyXG5cdFx0XHRcdFx0XHRcdF90aGlzJGJvdW5kYXJpZXMyID0gX3NsaWNlZFRvQXJyYXkoX3RoaXMkYm91bmRhcmllcywgMiksXHJcblx0XHRcdFx0XHRcdFx0bWluc3RyID0gX3RoaXMkYm91bmRhcmllczJbMF0sXHJcblx0XHRcdFx0XHRcdFx0bWF4c3RyID0gX3RoaXMkYm91bmRhcmllczJbMV07XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoTnVtYmVyKG1heHN0cikgPCB0aGlzLmZyb20pIHByZXBTdHIgKz0gZnJvbVN0cltuZXh0VmFsLmxlbmd0aCAtIDFdOyBlbHNlIGlmIChOdW1iZXIobWluc3RyKSA+IHRoaXMudG8pIHByZXBTdHIgKz0gdG9TdHJbbmV4dFZhbC5sZW5ndGggLSAxXTsgZWxzZSBwcmVwU3RyICs9IHN0cltjaV07XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIHByZXBTdHI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9WYWxpZGF0ZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBkb1ZhbGlkYXRlKCkge1xyXG5cdFx0XHRcdFx0dmFyIF9nZXQyO1xyXG5cclxuXHRcdFx0XHRcdHZhciBzdHIgPSB0aGlzLnZhbHVlO1xyXG5cdFx0XHRcdFx0dmFyIGZpcnN0Tm9uWmVybyA9IHN0ci5zZWFyY2goL1teMF0vKTtcclxuXHRcdFx0XHRcdGlmIChmaXJzdE5vblplcm8gPT09IC0xICYmIHN0ci5sZW5ndGggPD0gdGhpcy5fbWF0Y2hGcm9tKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0XHRcdFx0XHR2YXIgX3RoaXMkYm91bmRhcmllczMgPSB0aGlzLmJvdW5kYXJpZXMoc3RyKSxcclxuXHRcdFx0XHRcdFx0X3RoaXMkYm91bmRhcmllczQgPSBfc2xpY2VkVG9BcnJheShfdGhpcyRib3VuZGFyaWVzMywgMiksXHJcblx0XHRcdFx0XHRcdG1pbnN0ciA9IF90aGlzJGJvdW5kYXJpZXM0WzBdLFxyXG5cdFx0XHRcdFx0XHRtYXhzdHIgPSBfdGhpcyRib3VuZGFyaWVzNFsxXTtcclxuXHJcblx0XHRcdFx0XHRmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcclxuXHRcdFx0XHRcdFx0YXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5mcm9tIDw9IE51bWJlcihtYXhzdHIpICYmIE51bWJlcihtaW5zdHIpIDw9IHRoaXMudG8gJiYgKF9nZXQyID0gX2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkUmFuZ2UucHJvdG90eXBlKSwgXCJkb1ZhbGlkYXRlXCIsIHRoaXMpKS5jYWxsLmFwcGx5KF9nZXQyLCBbdGhpc10uY29uY2F0KGFyZ3MpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX21hdGNoRnJvbVwiLFxyXG5cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIE9wdGlvbmFsbHkgc2V0cyBtYXggbGVuZ3RoIG9mIHBhdHRlcm4uXHJcblx0XHRcdFx0ICBVc2VkIHdoZW4gcGF0dGVybiBsZW5ndGggaXMgbG9uZ2VyIHRoZW4gYHRvYCBwYXJhbSBsZW5ndGguIFBhZHMgemVyb3MgYXQgc3RhcnQgaW4gdGhpcyBjYXNlLlxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHRcdC8qKiBNaW4gYm91bmQgKi9cclxuXHJcblx0XHRcdFx0LyoqIE1heCBib3VuZCAqL1xyXG5cclxuXHRcdFx0XHQvKiogKi9cclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLm1heExlbmd0aCAtIFN0cmluZyh0aGlzLmZyb20pLmxlbmd0aDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiaXNDb21wbGV0ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZFJhbmdlLnByb3RvdHlwZSksIFwiaXNDb21wbGV0ZVwiLCB0aGlzKSAmJiBCb29sZWFuKHRoaXMudmFsdWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fV0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIE1hc2tlZFJhbmdlO1xyXG5cdFx0fShNYXNrZWRQYXR0ZXJuKTtcclxuXHRJTWFzay5NYXNrZWRSYW5nZSA9IE1hc2tlZFJhbmdlO1xyXG5cclxuXHQvKiogRGF0ZSBtYXNrICovXHJcblxyXG5cdHZhciBNYXNrZWREYXRlID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uIChfTWFza2VkUGF0dGVybikge1xyXG5cdFx0XHRfaW5oZXJpdHMoTWFza2VkRGF0ZSwgX01hc2tlZFBhdHRlcm4pO1xyXG5cclxuXHRcdFx0LyoqIFBhdHRlcm4gbWFzayBmb3IgZGF0ZSBhY2NvcmRpbmcgdG8ge0BsaW5rIE1hc2tlZERhdGUjZm9ybWF0fSAqL1xyXG5cclxuXHRcdFx0LyoqIFN0YXJ0IGRhdGUgKi9cclxuXHJcblx0XHRcdC8qKiBFbmQgZGF0ZSAqL1xyXG5cclxuXHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICBAcGFyYW0ge09iamVjdH0gb3B0c1xyXG5cdFx0XHQqL1xyXG5cdFx0XHRmdW5jdGlvbiBNYXNrZWREYXRlKG9wdHMpIHtcclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWFza2VkRGF0ZSk7XHJcblxyXG5cdFx0XHRcdHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfZ2V0UHJvdG90eXBlT2YoTWFza2VkRGF0ZSkuY2FsbCh0aGlzLCBPYmplY3QuYXNzaWduKHt9LCBNYXNrZWREYXRlLkRFRkFVTFRTLCB7fSwgb3B0cykpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0Ki9cclxuXHJcblxyXG5cdFx0XHRfY3JlYXRlQ2xhc3MoTWFza2VkRGF0ZSwgW3tcclxuXHRcdFx0XHRrZXk6IFwiX3VwZGF0ZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlKG9wdHMpIHtcclxuXHRcdFx0XHRcdGlmIChvcHRzLm1hc2sgPT09IERhdGUpIGRlbGV0ZSBvcHRzLm1hc2s7XHJcblx0XHRcdFx0XHRpZiAob3B0cy5wYXR0ZXJuKSBvcHRzLm1hc2sgPSBvcHRzLnBhdHRlcm47XHJcblx0XHRcdFx0XHR2YXIgYmxvY2tzID0gb3B0cy5ibG9ja3M7XHJcblx0XHRcdFx0XHRvcHRzLmJsb2NrcyA9IE9iamVjdC5hc3NpZ24oe30sIE1hc2tlZERhdGUuR0VUX0RFRkFVTFRfQkxPQ0tTKCkpOyAvLyBhZGp1c3QgeWVhciBibG9ja1xyXG5cclxuXHRcdFx0XHRcdGlmIChvcHRzLm1pbikgb3B0cy5ibG9ja3MuWS5mcm9tID0gb3B0cy5taW4uZ2V0RnVsbFllYXIoKTtcclxuXHRcdFx0XHRcdGlmIChvcHRzLm1heCkgb3B0cy5ibG9ja3MuWS50byA9IG9wdHMubWF4LmdldEZ1bGxZZWFyKCk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKG9wdHMubWluICYmIG9wdHMubWF4ICYmIG9wdHMuYmxvY2tzLlkuZnJvbSA9PT0gb3B0cy5ibG9ja3MuWS50bykge1xyXG5cdFx0XHRcdFx0XHRvcHRzLmJsb2Nrcy5tLmZyb20gPSBvcHRzLm1pbi5nZXRNb250aCgpICsgMTtcclxuXHRcdFx0XHRcdFx0b3B0cy5ibG9ja3MubS50byA9IG9wdHMubWF4LmdldE1vbnRoKCkgKyAxO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKG9wdHMuYmxvY2tzLm0uZnJvbSA9PT0gb3B0cy5ibG9ja3MubS50bykge1xyXG5cdFx0XHRcdFx0XHRcdG9wdHMuYmxvY2tzLmQuZnJvbSA9IG9wdHMubWluLmdldERhdGUoKTtcclxuXHRcdFx0XHRcdFx0XHRvcHRzLmJsb2Nrcy5kLnRvID0gb3B0cy5tYXguZ2V0RGF0ZSgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0T2JqZWN0LmFzc2lnbihvcHRzLmJsb2NrcywgYmxvY2tzKTsgLy8gYWRkIGF1dG9maXhcclxuXHJcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhvcHRzLmJsb2NrcykuZm9yRWFjaChmdW5jdGlvbiAoYmspIHtcclxuXHRcdFx0XHRcdFx0dmFyIGIgPSBvcHRzLmJsb2Nrc1tia107XHJcblx0XHRcdFx0XHRcdGlmICghKCdhdXRvZml4JyBpbiBiKSkgYi5hdXRvZml4ID0gb3B0cy5hdXRvZml4O1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0X2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkRGF0ZS5wcm90b3R5cGUpLCBcIl91cGRhdGVcIiwgdGhpcykuY2FsbCh0aGlzLCBvcHRzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJkb1ZhbGlkYXRlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGRvVmFsaWRhdGUoKSB7XHJcblx0XHRcdFx0XHR2YXIgX2dldDI7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGRhdGUgPSB0aGlzLmRhdGU7XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XHJcblx0XHRcdFx0XHRcdGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIChfZ2V0MiA9IF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZERhdGUucHJvdG90eXBlKSwgXCJkb1ZhbGlkYXRlXCIsIHRoaXMpKS5jYWxsLmFwcGx5KF9nZXQyLCBbdGhpc10uY29uY2F0KGFyZ3MpKSAmJiAoIXRoaXMuaXNDb21wbGV0ZSB8fCB0aGlzLmlzRGF0ZUV4aXN0KHRoaXMudmFsdWUpICYmIGRhdGUgIT0gbnVsbCAmJiAodGhpcy5taW4gPT0gbnVsbCB8fCB0aGlzLm1pbiA8PSBkYXRlKSAmJiAodGhpcy5tYXggPT0gbnVsbCB8fCBkYXRlIDw9IHRoaXMubWF4KSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBDaGVja3MgaWYgZGF0ZSBpcyBleGlzdHMgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiaXNEYXRlRXhpc3RcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gaXNEYXRlRXhpc3Qoc3RyKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5mb3JtYXQodGhpcy5wYXJzZShzdHIsIHRoaXMpLCB0aGlzKS5pbmRleE9mKHN0cikgPj0gMDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIFBhcnNlZCBEYXRlICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImRhdGVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnR5cGVkVmFsdWU7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uIHNldChkYXRlKSB7XHJcblx0XHRcdFx0XHR0aGlzLnR5cGVkVmFsdWUgPSBkYXRlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInR5cGVkVmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmlzQ29tcGxldGUgPyBfZ2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWREYXRlLnByb3RvdHlwZSksIFwidHlwZWRWYWx1ZVwiLCB0aGlzKSA6IG51bGw7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0X3NldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkRGF0ZS5wcm90b3R5cGUpLCBcInR5cGVkVmFsdWVcIiwgdmFsdWUsIHRoaXMsIHRydWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fV0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIE1hc2tlZERhdGU7XHJcblx0XHR9KE1hc2tlZFBhdHRlcm4pO1xyXG5cdE1hc2tlZERhdGUuREVGQVVMVFMgPSB7XHJcblx0XHRwYXR0ZXJuOiAnZHsufWBtey59YFknLFxyXG5cdFx0Zm9ybWF0OiBmdW5jdGlvbiBmb3JtYXQoZGF0ZSkge1xyXG5cdFx0XHR2YXIgZGF5ID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpO1xyXG5cdFx0XHR2YXIgbW9udGggPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgJzAnKTtcclxuXHRcdFx0dmFyIHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XHJcblx0XHRcdHJldHVybiBbZGF5LCBtb250aCwgeWVhcl0uam9pbignLicpO1xyXG5cdFx0fSxcclxuXHRcdHBhcnNlOiBmdW5jdGlvbiBwYXJzZShzdHIpIHtcclxuXHRcdFx0dmFyIF9zdHIkc3BsaXQgPSBzdHIuc3BsaXQoJy4nKSxcclxuXHRcdFx0XHRfc3RyJHNwbGl0MiA9IF9zbGljZWRUb0FycmF5KF9zdHIkc3BsaXQsIDMpLFxyXG5cdFx0XHRcdGRheSA9IF9zdHIkc3BsaXQyWzBdLFxyXG5cdFx0XHRcdG1vbnRoID0gX3N0ciRzcGxpdDJbMV0sXHJcblx0XHRcdFx0eWVhciA9IF9zdHIkc3BsaXQyWzJdO1xyXG5cclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgZGF5KTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRNYXNrZWREYXRlLkdFVF9ERUZBVUxUX0JMT0NLUyA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGQ6IHtcclxuXHRcdFx0XHRtYXNrOiBNYXNrZWRSYW5nZSxcclxuXHRcdFx0XHRmcm9tOiAxLFxyXG5cdFx0XHRcdHRvOiAzMSxcclxuXHRcdFx0XHRtYXhMZW5ndGg6IDJcclxuXHRcdFx0fSxcclxuXHRcdFx0bToge1xyXG5cdFx0XHRcdG1hc2s6IE1hc2tlZFJhbmdlLFxyXG5cdFx0XHRcdGZyb206IDEsXHJcblx0XHRcdFx0dG86IDEyLFxyXG5cdFx0XHRcdG1heExlbmd0aDogMlxyXG5cdFx0XHR9LFxyXG5cdFx0XHRZOiB7XHJcblx0XHRcdFx0bWFzazogTWFza2VkUmFuZ2UsXHJcblx0XHRcdFx0ZnJvbTogMTkwMCxcclxuXHRcdFx0XHR0bzogOTk5OVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdElNYXNrLk1hc2tlZERhdGUgPSBNYXNrZWREYXRlO1xyXG5cclxuXHQvKipcclxuXHQgIEdlbmVyaWMgZWxlbWVudCBBUEkgdG8gdXNlIHdpdGggbWFza1xyXG5cdCAgQGludGVyZmFjZVxyXG5cdCovXHJcblx0dmFyIE1hc2tFbGVtZW50ID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0ZnVuY3Rpb24gTWFza0VsZW1lbnQoKSB7XHJcblx0XHRcdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1hc2tFbGVtZW50KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKE1hc2tFbGVtZW50LCBbe1xyXG5cdFx0XHRcdGtleTogXCJzZWxlY3RcIixcclxuXHJcblx0XHRcdFx0LyoqIFNhZmVseSBzZXRzIGVsZW1lbnQgc2VsZWN0aW9uICovXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHNlbGVjdChzdGFydCwgZW5kKSB7XHJcblx0XHRcdFx0XHRpZiAoc3RhcnQgPT0gbnVsbCB8fCBlbmQgPT0gbnVsbCB8fCBzdGFydCA9PT0gdGhpcy5zZWxlY3Rpb25TdGFydCAmJiBlbmQgPT09IHRoaXMuc2VsZWN0aW9uRW5kKSByZXR1cm47XHJcblxyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fdW5zYWZlU2VsZWN0KHN0YXJ0LCBlbmQpO1xyXG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkgeyB9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBTaG91bGQgYmUgb3ZlcnJpZGVuIGluIHN1YmNsYXNzZXMgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX3Vuc2FmZVNlbGVjdFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfdW5zYWZlU2VsZWN0KHN0YXJ0LCBlbmQpIHsgfVxyXG5cdFx0XHRcdC8qKiBTaG91bGQgYmUgb3ZlcnJpZGVuIGluIHN1YmNsYXNzZXMgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiYmluZEV2ZW50c1wiLFxyXG5cclxuXHRcdFx0XHQvKiogU2hvdWxkIGJlIG92ZXJyaWRlbiBpbiBzdWJjbGFzc2VzICovXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGJpbmRFdmVudHMoaGFuZGxlcnMpIHsgfVxyXG5cdFx0XHRcdC8qKiBTaG91bGQgYmUgb3ZlcnJpZGVuIGluIHN1YmNsYXNzZXMgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidW5iaW5kRXZlbnRzXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHVuYmluZEV2ZW50cygpIHsgfVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInNlbGVjdGlvblN0YXJ0XCIsXHJcblxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHRcdC8qKiBTYWZlbHkgcmV0dXJucyBzZWxlY3Rpb24gc3RhcnQgKi9cclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHZhciBzdGFydDtcclxuXHJcblx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRzdGFydCA9IHRoaXMuX3Vuc2FmZVNlbGVjdGlvblN0YXJ0O1xyXG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkgeyB9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIHN0YXJ0ICE9IG51bGwgPyBzdGFydCA6IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogU2FmZWx5IHJldHVybnMgc2VsZWN0aW9uIGVuZCAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJzZWxlY3Rpb25FbmRcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHZhciBlbmQ7XHJcblxyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0ZW5kID0gdGhpcy5fdW5zYWZlU2VsZWN0aW9uRW5kO1xyXG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkgeyB9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGVuZCAhPSBudWxsID8gZW5kIDogdGhpcy52YWx1ZS5sZW5ndGg7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImlzQWN0aXZlXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gTWFza0VsZW1lbnQ7XHJcblx0XHR9KCk7XHJcblx0SU1hc2suTWFza0VsZW1lbnQgPSBNYXNrRWxlbWVudDtcclxuXHJcblx0LyoqIEJyaWRnZSBiZXR3ZWVuIEhUTUxFbGVtZW50IGFuZCB7QGxpbmsgTWFza2VkfSAqL1xyXG5cclxuXHR2YXIgSFRNTE1hc2tFbGVtZW50ID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uIChfTWFza0VsZW1lbnQpIHtcclxuXHRcdFx0X2luaGVyaXRzKEhUTUxNYXNrRWxlbWVudCwgX01hc2tFbGVtZW50KTtcclxuXHJcblx0XHRcdC8qKiBNYXBwaW5nIGJldHdlZW4gSFRNTEVsZW1lbnQgZXZlbnRzIGFuZCBtYXNrIGludGVybmFsIGV2ZW50cyAqL1xyXG5cclxuXHRcdFx0LyoqIEhUTUxFbGVtZW50IHRvIHVzZSBtYXNrIG9uICovXHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICBAcGFyYW0ge0hUTUxJbnB1dEVsZW1lbnR8SFRNTFRleHRBcmVhRWxlbWVudH0gaW5wdXRcclxuXHRcdFx0Ki9cclxuXHRcdFx0ZnVuY3Rpb24gSFRNTE1hc2tFbGVtZW50KGlucHV0KSB7XHJcblx0XHRcdFx0dmFyIF90aGlzO1xyXG5cclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgSFRNTE1hc2tFbGVtZW50KTtcclxuXHJcblx0XHRcdFx0X3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfZ2V0UHJvdG90eXBlT2YoSFRNTE1hc2tFbGVtZW50KS5jYWxsKHRoaXMpKTtcclxuXHRcdFx0XHRfdGhpcy5pbnB1dCA9IGlucHV0O1xyXG5cdFx0XHRcdF90aGlzLl9oYW5kbGVycyA9IHt9O1xyXG5cdFx0XHRcdHJldHVybiBfdGhpcztcclxuXHRcdFx0fVxyXG5cdFx0XHQvKiogKi9cclxuXHRcdFx0Ly8gJEZsb3dGaXhNZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMjgzOVxyXG5cclxuXHJcblx0XHRcdF9jcmVhdGVDbGFzcyhIVE1MTWFza0VsZW1lbnQsIFt7XHJcblx0XHRcdFx0a2V5OiBcIl91bnNhZmVTZWxlY3RcIixcclxuXHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBTZXRzIEhUTUxFbGVtZW50IHNlbGVjdGlvblxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3Vuc2FmZVNlbGVjdChzdGFydCwgZW5kKSB7XHJcblx0XHRcdFx0XHR0aGlzLmlucHV0LnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBlbmQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEhUTUxFbGVtZW50IHZhbHVlXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJiaW5kRXZlbnRzXCIsXHJcblxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQmluZHMgSFRNTEVsZW1lbnQgZXZlbnRzIHRvIG1hc2sgaW50ZXJuYWwgZXZlbnRzXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBiaW5kRXZlbnRzKGhhbmRsZXJzKSB7XHJcblx0XHRcdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcclxuXHJcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhoYW5kbGVycykuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIF90aGlzMi5fdG9nZ2xlRXZlbnRIYW5kbGVyKEhUTUxNYXNrRWxlbWVudC5FVkVOVFNfTUFQW2V2ZW50XSwgaGFuZGxlcnNbZXZlbnRdKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIFVuYmluZHMgSFRNTEVsZW1lbnQgZXZlbnRzIHRvIG1hc2sgaW50ZXJuYWwgZXZlbnRzXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ1bmJpbmRFdmVudHNcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gdW5iaW5kRXZlbnRzKCkge1xyXG5cdFx0XHRcdFx0dmFyIF90aGlzMyA9IHRoaXM7XHJcblxyXG5cdFx0XHRcdFx0T2JqZWN0LmtleXModGhpcy5faGFuZGxlcnMpLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBfdGhpczMuX3RvZ2dsZUV2ZW50SGFuZGxlcihldmVudCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl90b2dnbGVFdmVudEhhbmRsZXJcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3RvZ2dsZUV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlcikge1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX2hhbmRsZXJzW2V2ZW50XSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuX2hhbmRsZXJzW2V2ZW50XSk7XHJcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLl9oYW5kbGVyc1tldmVudF07XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKGhhbmRsZXIpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5faGFuZGxlcnNbZXZlbnRdID0gaGFuZGxlcjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwicm9vdEVsZW1lbnRcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmlucHV0LmdldFJvb3ROb2RlID8gdGhpcy5pbnB1dC5nZXRSb290Tm9kZSgpIDogZG9jdW1lbnQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgSXMgZWxlbWVudCBpbiBmb2N1c1xyXG5cdFx0XHRcdCAgQHJlYWRvbmx5XHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiaXNBY3RpdmVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdC8vJEZsb3dGaXhNZVxyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuaW5wdXQgPT09IHRoaXMucm9vdEVsZW1lbnQuYWN0aXZlRWxlbWVudDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBSZXR1cm5zIEhUTUxFbGVtZW50IHNlbGVjdGlvbiBzdGFydFxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX3Vuc2FmZVNlbGVjdGlvblN0YXJ0XCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5pbnB1dC5zZWxlY3Rpb25TdGFydDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBSZXR1cm5zIEhUTUxFbGVtZW50IHNlbGVjdGlvbiBlbmRcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl91bnNhZmVTZWxlY3Rpb25FbmRcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmlucHV0LnNlbGVjdGlvbkVuZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmlucHV0LnZhbHVlO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcclxuXHRcdFx0XHRcdHRoaXMuaW5wdXQudmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1dKTtcclxuXHJcblx0XHRcdHJldHVybiBIVE1MTWFza0VsZW1lbnQ7XHJcblx0XHR9KE1hc2tFbGVtZW50KTtcclxuXHRIVE1MTWFza0VsZW1lbnQuRVZFTlRTX01BUCA9IHtcclxuXHRcdHNlbGVjdGlvbkNoYW5nZTogJ2tleWRvd24nLFxyXG5cdFx0aW5wdXQ6ICdpbnB1dCcsXHJcblx0XHRkcm9wOiAnZHJvcCcsXHJcblx0XHRjbGljazogJ2NsaWNrJyxcclxuXHRcdGZvY3VzOiAnZm9jdXMnLFxyXG5cdFx0Y29tbWl0OiAnYmx1cidcclxuXHR9O1xyXG5cdElNYXNrLkhUTUxNYXNrRWxlbWVudCA9IEhUTUxNYXNrRWxlbWVudDtcclxuXHJcblx0dmFyIEhUTUxDb250ZW50ZWRpdGFibGVNYXNrRWxlbWVudCA9XHJcblx0XHQvKiNfX1BVUkVfXyovXHJcblx0XHRmdW5jdGlvbiAoX0hUTUxNYXNrRWxlbWVudCkge1xyXG5cdFx0XHRfaW5oZXJpdHMoSFRNTENvbnRlbnRlZGl0YWJsZU1hc2tFbGVtZW50LCBfSFRNTE1hc2tFbGVtZW50KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIEhUTUxDb250ZW50ZWRpdGFibGVNYXNrRWxlbWVudCgpIHtcclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgSFRNTENvbnRlbnRlZGl0YWJsZU1hc2tFbGVtZW50KTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9nZXRQcm90b3R5cGVPZihIVE1MQ29udGVudGVkaXRhYmxlTWFza0VsZW1lbnQpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRfY3JlYXRlQ2xhc3MoSFRNTENvbnRlbnRlZGl0YWJsZU1hc2tFbGVtZW50LCBbe1xyXG5cdFx0XHRcdGtleTogXCJfdW5zYWZlU2VsZWN0XCIsXHJcblxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgU2V0cyBIVE1MRWxlbWVudCBzZWxlY3Rpb25cclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF91bnNhZmVTZWxlY3Qoc3RhcnQsIGVuZCkge1xyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLnJvb3RFbGVtZW50LmNyZWF0ZVJhbmdlKSByZXR1cm47XHJcblx0XHRcdFx0XHR2YXIgcmFuZ2UgPSB0aGlzLnJvb3RFbGVtZW50LmNyZWF0ZVJhbmdlKCk7XHJcblx0XHRcdFx0XHRyYW5nZS5zZXRTdGFydCh0aGlzLmlucHV0LmZpcnN0Q2hpbGQgfHwgdGhpcy5pbnB1dCwgc3RhcnQpO1xyXG5cdFx0XHRcdFx0cmFuZ2Uuc2V0RW5kKHRoaXMuaW5wdXQubGFzdENoaWxkIHx8IHRoaXMuaW5wdXQsIGVuZCk7XHJcblx0XHRcdFx0XHR2YXIgcm9vdCA9IHRoaXMucm9vdEVsZW1lbnQ7XHJcblx0XHRcdFx0XHR2YXIgc2VsZWN0aW9uID0gcm9vdC5nZXRTZWxlY3Rpb24gJiYgcm9vdC5nZXRTZWxlY3Rpb24oKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoc2VsZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBIVE1MRWxlbWVudCB2YWx1ZVxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX3Vuc2FmZVNlbGVjdGlvblN0YXJ0XCIsXHJcblxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgUmV0dXJucyBIVE1MRWxlbWVudCBzZWxlY3Rpb24gc3RhcnRcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHR2YXIgcm9vdCA9IHRoaXMucm9vdEVsZW1lbnQ7XHJcblx0XHRcdFx0XHR2YXIgc2VsZWN0aW9uID0gcm9vdC5nZXRTZWxlY3Rpb24gJiYgcm9vdC5nZXRTZWxlY3Rpb24oKTtcclxuXHRcdFx0XHRcdHJldHVybiBzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLmFuY2hvck9mZnNldDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBSZXR1cm5zIEhUTUxFbGVtZW50IHNlbGVjdGlvbiBlbmRcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl91bnNhZmVTZWxlY3Rpb25FbmRcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHZhciByb290ID0gdGhpcy5yb290RWxlbWVudDtcclxuXHRcdFx0XHRcdHZhciBzZWxlY3Rpb24gPSByb290LmdldFNlbGVjdGlvbiAmJiByb290LmdldFNlbGVjdGlvbigpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHNlbGVjdGlvbiAmJiB0aGlzLl91bnNhZmVTZWxlY3Rpb25TdGFydCArIFN0cmluZyhzZWxlY3Rpb24pLmxlbmd0aDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdC8vICRGbG93Rml4TWVcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmlucHV0LnRleHRDb250ZW50O1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcclxuXHRcdFx0XHRcdHRoaXMuaW5wdXQudGV4dENvbnRlbnQgPSB2YWx1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1dKTtcclxuXHJcblx0XHRcdHJldHVybiBIVE1MQ29udGVudGVkaXRhYmxlTWFza0VsZW1lbnQ7XHJcblx0XHR9KEhUTUxNYXNrRWxlbWVudCk7XHJcblx0SU1hc2suSFRNTENvbnRlbnRlZGl0YWJsZU1hc2tFbGVtZW50ID0gSFRNTENvbnRlbnRlZGl0YWJsZU1hc2tFbGVtZW50O1xyXG5cclxuXHQvKiogTGlzdGVucyB0byBlbGVtZW50IGV2ZW50cyBhbmQgY29udHJvbHMgY2hhbmdlcyBiZXR3ZWVuIGVsZW1lbnQgYW5kIHtAbGluayBNYXNrZWR9ICovXHJcblxyXG5cdHZhciBJbnB1dE1hc2sgPVxyXG5cdFx0LyojX19QVVJFX18qL1xyXG5cdFx0ZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQvKipcclxuXHRcdFx0ICBWaWV3IGVsZW1lbnRcclxuXHRcdFx0ICBAcmVhZG9ubHlcclxuXHRcdFx0Ki9cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgIEludGVybmFsIHtAbGluayBNYXNrZWR9IG1vZGVsXHJcblx0XHRcdCAgQHJlYWRvbmx5XHJcblx0XHRcdCovXHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICBAcGFyYW0ge01hc2tFbGVtZW50fEhUTUxJbnB1dEVsZW1lbnR8SFRNTFRleHRBcmVhRWxlbWVudH0gZWxcclxuXHRcdFx0ICBAcGFyYW0ge09iamVjdH0gb3B0c1xyXG5cdFx0XHQqL1xyXG5cdFx0XHRmdW5jdGlvbiBJbnB1dE1hc2soZWwsIG9wdHMpIHtcclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5wdXRNYXNrKTtcclxuXHJcblx0XHRcdFx0dGhpcy5lbCA9IGVsIGluc3RhbmNlb2YgTWFza0VsZW1lbnQgPyBlbCA6IGVsLmlzQ29udGVudEVkaXRhYmxlICYmIGVsLnRhZ05hbWUgIT09ICdJTlBVVCcgJiYgZWwudGFnTmFtZSAhPT0gJ1RFWFRBUkVBJyA/IG5ldyBIVE1MQ29udGVudGVkaXRhYmxlTWFza0VsZW1lbnQoZWwpIDogbmV3IEhUTUxNYXNrRWxlbWVudChlbCk7XHJcblx0XHRcdFx0dGhpcy5tYXNrZWQgPSBjcmVhdGVNYXNrKG9wdHMpO1xyXG5cdFx0XHRcdHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG5cdFx0XHRcdHRoaXMuX3ZhbHVlID0gJyc7XHJcblx0XHRcdFx0dGhpcy5fdW5tYXNrZWRWYWx1ZSA9ICcnO1xyXG5cdFx0XHRcdHRoaXMuX3NhdmVTZWxlY3Rpb24gPSB0aGlzLl9zYXZlU2VsZWN0aW9uLmJpbmQodGhpcyk7XHJcblx0XHRcdFx0dGhpcy5fb25JbnB1dCA9IHRoaXMuX29uSW5wdXQuYmluZCh0aGlzKTtcclxuXHRcdFx0XHR0aGlzLl9vbkNoYW5nZSA9IHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcyk7XHJcblx0XHRcdFx0dGhpcy5fb25Ecm9wID0gdGhpcy5fb25Ecm9wLmJpbmQodGhpcyk7XHJcblx0XHRcdFx0dGhpcy5fb25Gb2N1cyA9IHRoaXMuX29uRm9jdXMuYmluZCh0aGlzKTtcclxuXHRcdFx0XHR0aGlzLl9vbkNsaWNrID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xyXG5cdFx0XHRcdHRoaXMuYWxpZ25DdXJzb3IgPSB0aGlzLmFsaWduQ3Vyc29yLmJpbmQodGhpcyk7XHJcblx0XHRcdFx0dGhpcy5hbGlnbkN1cnNvckZyaWVuZGx5ID0gdGhpcy5hbGlnbkN1cnNvckZyaWVuZGx5LmJpbmQodGhpcyk7XHJcblxyXG5cdFx0XHRcdHRoaXMuX2JpbmRFdmVudHMoKTsgLy8gcmVmcmVzaFxyXG5cclxuXHJcblx0XHRcdFx0dGhpcy51cGRhdGVWYWx1ZSgpO1xyXG5cclxuXHRcdFx0XHR0aGlzLl9vbkNoYW5nZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qKiBSZWFkIG9yIHVwZGF0ZSBtYXNrICovXHJcblxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKElucHV0TWFzaywgW3tcclxuXHRcdFx0XHRrZXk6IFwibWFza0VxdWFsc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBtYXNrRXF1YWxzKG1hc2spIHtcclxuXHRcdFx0XHRcdHJldHVybiBtYXNrID09IG51bGwgfHwgbWFzayA9PT0gdGhpcy5tYXNrZWQubWFzayB8fCBtYXNrID09PSBEYXRlICYmIHRoaXMubWFza2VkIGluc3RhbmNlb2YgTWFza2VkRGF0ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX2JpbmRFdmVudHNcIixcclxuXHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBTdGFydHMgbGlzdGVuaW5nIHRvIGVsZW1lbnQgZXZlbnRzXHJcblx0XHRcdFx0ICBAcHJvdGVjdGVkXHJcblx0XHRcdFx0Ki9cclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX2JpbmRFdmVudHMoKSB7XHJcblx0XHRcdFx0XHR0aGlzLmVsLmJpbmRFdmVudHMoe1xyXG5cdFx0XHRcdFx0XHRzZWxlY3Rpb25DaGFuZ2U6IHRoaXMuX3NhdmVTZWxlY3Rpb24sXHJcblx0XHRcdFx0XHRcdGlucHV0OiB0aGlzLl9vbklucHV0LFxyXG5cdFx0XHRcdFx0XHRkcm9wOiB0aGlzLl9vbkRyb3AsXHJcblx0XHRcdFx0XHRcdGNsaWNrOiB0aGlzLl9vbkNsaWNrLFxyXG5cdFx0XHRcdFx0XHRmb2N1czogdGhpcy5fb25Gb2N1cyxcclxuXHRcdFx0XHRcdFx0Y29tbWl0OiB0aGlzLl9vbkNoYW5nZVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgU3RvcHMgbGlzdGVuaW5nIHRvIGVsZW1lbnQgZXZlbnRzXHJcblx0XHRcdFx0ICBAcHJvdGVjdGVkXHJcblx0XHRcdFx0ICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl91bmJpbmRFdmVudHNcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3VuYmluZEV2ZW50cygpIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLmVsKSB0aGlzLmVsLnVuYmluZEV2ZW50cygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEZpcmVzIGN1c3RvbSBldmVudFxyXG5cdFx0XHRcdCAgQHByb3RlY3RlZFxyXG5cdFx0XHRcdCAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfZmlyZUV2ZW50XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9maXJlRXZlbnQoZXYpIHtcclxuXHRcdFx0XHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZdO1xyXG5cdFx0XHRcdFx0aWYgKCFsaXN0ZW5lcnMpIHJldHVybjtcclxuXHRcdFx0XHRcdGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBsKCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBDdXJyZW50IHNlbGVjdGlvbiBzdGFydFxyXG5cdFx0XHRcdCAgQHJlYWRvbmx5XHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX3NhdmVTZWxlY3Rpb25cIixcclxuXHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBTdG9yZXMgY3VycmVudCBzZWxlY3Rpb25cclxuXHRcdFx0XHQgIEBwcm90ZWN0ZWRcclxuXHRcdFx0XHQqL1xyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfc2F2ZVNlbGVjdGlvbigpXHJcblx0ICAgIC8qIGV2ICovIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLnZhbHVlICE9PSB0aGlzLmVsLnZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUud2FybignRWxlbWVudCB2YWx1ZSB3YXMgY2hhbmdlZCBvdXRzaWRlIG9mIG1hc2suIFN5bmNyb25pemUgbWFzayB1c2luZyBgbWFzay51cGRhdGVWYWx1ZSgpYCB0byB3b3JrIHByb3Blcmx5LicpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aGlzLl9zZWxlY3Rpb24gPSB7XHJcblx0XHRcdFx0XHRcdHN0YXJ0OiB0aGlzLnNlbGVjdGlvblN0YXJ0LFxyXG5cdFx0XHRcdFx0XHRlbmQ6IHRoaXMuY3Vyc29yUG9zXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogU3luY3Jvbml6ZXMgbW9kZWwgdmFsdWUgZnJvbSB2aWV3ICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInVwZGF0ZVZhbHVlXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVZhbHVlKCkge1xyXG5cdFx0XHRcdFx0dGhpcy5tYXNrZWQudmFsdWUgPSB0aGlzLmVsLnZhbHVlO1xyXG5cdFx0XHRcdFx0dGhpcy5fdmFsdWUgPSB0aGlzLm1hc2tlZC52YWx1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIFN5bmNyb25pemVzIHZpZXcgZnJvbSBtb2RlbCB2YWx1ZSwgZmlyZXMgY2hhbmdlIGV2ZW50cyAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ1cGRhdGVDb250cm9sXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUNvbnRyb2woKSB7XHJcblx0XHRcdFx0XHR2YXIgbmV3VW5tYXNrZWRWYWx1ZSA9IHRoaXMubWFza2VkLnVubWFza2VkVmFsdWU7XHJcblx0XHRcdFx0XHR2YXIgbmV3VmFsdWUgPSB0aGlzLm1hc2tlZC52YWx1ZTtcclxuXHRcdFx0XHRcdHZhciBpc0NoYW5nZWQgPSB0aGlzLnVubWFza2VkVmFsdWUgIT09IG5ld1VubWFza2VkVmFsdWUgfHwgdGhpcy52YWx1ZSAhPT0gbmV3VmFsdWU7XHJcblx0XHRcdFx0XHR0aGlzLl91bm1hc2tlZFZhbHVlID0gbmV3VW5tYXNrZWRWYWx1ZTtcclxuXHRcdFx0XHRcdHRoaXMuX3ZhbHVlID0gbmV3VmFsdWU7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5lbC52YWx1ZSAhPT0gbmV3VmFsdWUpIHRoaXMuZWwudmFsdWUgPSBuZXdWYWx1ZTtcclxuXHRcdFx0XHRcdGlmIChpc0NoYW5nZWQpIHRoaXMuX2ZpcmVDaGFuZ2VFdmVudHMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIFVwZGF0ZXMgb3B0aW9ucyB3aXRoIGRlZXAgZXF1YWwgY2hlY2ssIHJlY3JlYXRlcyBAe2xpbmsgTWFza2VkfSBtb2RlbCBpZiBtYXNrIHR5cGUgY2hhbmdlcyAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ1cGRhdGVPcHRpb25zXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZU9wdGlvbnMob3B0cykge1xyXG5cdFx0XHRcdFx0dmFyIG1hc2sgPSBvcHRzLm1hc2ssXHJcblx0XHRcdFx0XHRcdHJlc3RPcHRzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKG9wdHMsIFtcIm1hc2tcIl0pO1xyXG5cclxuXHRcdFx0XHRcdHZhciB1cGRhdGVNYXNrID0gIXRoaXMubWFza0VxdWFscyhtYXNrKTtcclxuXHRcdFx0XHRcdHZhciB1cGRhdGVPcHRzID0gIW9iamVjdEluY2x1ZGVzKHRoaXMubWFza2VkLCByZXN0T3B0cyk7XHJcblx0XHRcdFx0XHRpZiAodXBkYXRlTWFzaykgdGhpcy5tYXNrID0gbWFzaztcclxuXHRcdFx0XHRcdGlmICh1cGRhdGVPcHRzKSB0aGlzLm1hc2tlZC51cGRhdGVPcHRpb25zKHJlc3RPcHRzKTtcclxuXHRcdFx0XHRcdGlmICh1cGRhdGVNYXNrIHx8IHVwZGF0ZU9wdHMpIHRoaXMudXBkYXRlQ29udHJvbCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogVXBkYXRlcyBjdXJzb3IgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidXBkYXRlQ3Vyc29yXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUN1cnNvcihjdXJzb3JQb3MpIHtcclxuXHRcdFx0XHRcdGlmIChjdXJzb3JQb3MgPT0gbnVsbCkgcmV0dXJuO1xyXG5cdFx0XHRcdFx0dGhpcy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7IC8vIGFsc28gcXVldWUgY2hhbmdlIGN1cnNvciBmb3IgbW9iaWxlIGJyb3dzZXJzXHJcblxyXG5cdFx0XHRcdFx0dGhpcy5fZGVsYXlVcGRhdGVDdXJzb3IoY3Vyc29yUG9zKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBEZWxheXMgY3Vyc29yIHVwZGF0ZSB0byBzdXBwb3J0IG1vYmlsZSBicm93c2Vyc1xyXG5cdFx0XHRcdCAgQHByaXZhdGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfZGVsYXlVcGRhdGVDdXJzb3JcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX2RlbGF5VXBkYXRlQ3Vyc29yKGN1cnNvclBvcykge1xyXG5cdFx0XHRcdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHJcblx0XHRcdFx0XHR0aGlzLl9hYm9ydFVwZGF0ZUN1cnNvcigpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX2NoYW5naW5nQ3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG5cdFx0XHRcdFx0dGhpcy5fY3Vyc29yQ2hhbmdpbmcgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCFfdGhpcy5lbCkgcmV0dXJuOyAvLyBpZiB3YXMgZGVzdHJveWVkXHJcblxyXG5cdFx0XHRcdFx0XHRfdGhpcy5jdXJzb3JQb3MgPSBfdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3M7XHJcblxyXG5cdFx0XHRcdFx0XHRfdGhpcy5fYWJvcnRVcGRhdGVDdXJzb3IoKTtcclxuXHRcdFx0XHRcdH0sIDEwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBGaXJlcyBjdXN0b20gZXZlbnRzXHJcblx0XHRcdFx0ICBAcHJvdGVjdGVkXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX2ZpcmVDaGFuZ2VFdmVudHNcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX2ZpcmVDaGFuZ2VFdmVudHMoKSB7XHJcblx0XHRcdFx0XHR0aGlzLl9maXJlRXZlbnQoJ2FjY2VwdCcpO1xyXG5cclxuXHRcdFx0XHRcdGlmICh0aGlzLm1hc2tlZC5pc0NvbXBsZXRlKSB0aGlzLl9maXJlRXZlbnQoJ2NvbXBsZXRlJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQWJvcnRzIGRlbGF5ZWQgY3Vyc29yIHVwZGF0ZVxyXG5cdFx0XHRcdCAgQHByaXZhdGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfYWJvcnRVcGRhdGVDdXJzb3JcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX2Fib3J0VXBkYXRlQ3Vyc29yKCkge1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX2N1cnNvckNoYW5naW5nKSB7XHJcblx0XHRcdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9jdXJzb3JDaGFuZ2luZyk7XHJcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLl9jdXJzb3JDaGFuZ2luZztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEFsaWducyBjdXJzb3IgdG8gbmVhcmVzdCBhdmFpbGFibGUgcG9zaXRpb24gKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiYWxpZ25DdXJzb3JcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gYWxpZ25DdXJzb3IoKSB7XHJcblx0XHRcdFx0XHR0aGlzLmN1cnNvclBvcyA9IHRoaXMubWFza2VkLm5lYXJlc3RJbnB1dFBvcyh0aGlzLmN1cnNvclBvcywgRElSRUNUSU9OLkxFRlQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogQWxpZ25zIGN1cnNvciBvbmx5IGlmIHNlbGVjdGlvbiBpcyBlbXB0eSAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJhbGlnbkN1cnNvckZyaWVuZGx5XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGFsaWduQ3Vyc29yRnJpZW5kbHkoKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5zZWxlY3Rpb25TdGFydCAhPT0gdGhpcy5jdXJzb3JQb3MpIHJldHVybjsgLy8gc2tpcCBpZiByYW5nZSBpcyBzZWxlY3RlZFxyXG5cclxuXHRcdFx0XHRcdHRoaXMuYWxpZ25DdXJzb3IoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEFkZHMgbGlzdGVuZXIgb24gY3VzdG9tIGV2ZW50ICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIm9uXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG9uKGV2LCBoYW5kbGVyKSB7XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLl9saXN0ZW5lcnNbZXZdLnB1c2goaGFuZGxlcik7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBSZW1vdmVzIGN1c3RvbSBldmVudCBsaXN0ZW5lciAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJvZmZcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gb2ZmKGV2LCBoYW5kbGVyKSB7XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHJldHVybiB0aGlzO1xyXG5cclxuXHRcdFx0XHRcdGlmICghaGFuZGxlcikge1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2XTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dmFyIGhJbmRleCA9IHRoaXMuX2xpc3RlbmVyc1tldl0uaW5kZXhPZihoYW5kbGVyKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoaEluZGV4ID49IDApIHRoaXMuX2xpc3RlbmVyc1tldl0uc3BsaWNlKGhJbmRleCwgMSk7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEhhbmRsZXMgdmlldyBpbnB1dCBldmVudCAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfb25JbnB1dFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfb25JbnB1dCgpIHtcclxuXHRcdFx0XHRcdHRoaXMuX2Fib3J0VXBkYXRlQ3Vyc29yKCk7IC8vIGZpeCBzdHJhbmdlIElFIGJlaGF2aW9yXHJcblxyXG5cclxuXHRcdFx0XHRcdGlmICghdGhpcy5fc2VsZWN0aW9uKSByZXR1cm4gdGhpcy51cGRhdGVWYWx1ZSgpO1xyXG5cdFx0XHRcdFx0dmFyIGRldGFpbHMgPSBuZXcgQWN0aW9uRGV0YWlscyggLy8gbmV3IHN0YXRlXHJcblx0XHRcdFx0XHRcdHRoaXMuZWwudmFsdWUsIHRoaXMuY3Vyc29yUG9zLCAvLyBvbGQgc3RhdGVcclxuXHRcdFx0XHRcdFx0dGhpcy52YWx1ZSwgdGhpcy5fc2VsZWN0aW9uKTtcclxuXHRcdFx0XHRcdHZhciBvbGRSYXdWYWx1ZSA9IHRoaXMubWFza2VkLnJhd0lucHV0VmFsdWU7XHJcblx0XHRcdFx0XHR2YXIgb2Zmc2V0ID0gdGhpcy5tYXNrZWQuc3BsaWNlKGRldGFpbHMuc3RhcnRDaGFuZ2VQb3MsIGRldGFpbHMucmVtb3ZlZC5sZW5ndGgsIGRldGFpbHMuaW5zZXJ0ZWQsIGRldGFpbHMucmVtb3ZlRGlyZWN0aW9uKS5vZmZzZXQ7IC8vIGZvcmNlIGFsaWduIGluIHJlbW92ZSBkaXJlY3Rpb24gb25seSBpZiBubyBpbnB1dCBjaGFycyB3ZXJlIHJlbW92ZWRcclxuXHRcdFx0XHRcdC8vIG90aGVyd2lzZSB3ZSBzdGlsbCBuZWVkIHRvIGFsaWduIHdpdGggTk9ORSAodG8gZ2V0IG91dCBmcm9tIGZpeGVkIHN5bWJvbHMgZm9yIGluc3RhbmNlKVxyXG5cclxuXHRcdFx0XHRcdHZhciByZW1vdmVEaXJlY3Rpb24gPSBvbGRSYXdWYWx1ZSA9PT0gdGhpcy5tYXNrZWQucmF3SW5wdXRWYWx1ZSA/IGRldGFpbHMucmVtb3ZlRGlyZWN0aW9uIDogRElSRUNUSU9OLk5PTkU7XHJcblx0XHRcdFx0XHR2YXIgY3Vyc29yUG9zID0gdGhpcy5tYXNrZWQubmVhcmVzdElucHV0UG9zKGRldGFpbHMuc3RhcnRDaGFuZ2VQb3MgKyBvZmZzZXQsIHJlbW92ZURpcmVjdGlvbik7XHJcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZUNvbnRyb2woKTtcclxuXHRcdFx0XHRcdHRoaXMudXBkYXRlQ3Vyc29yKGN1cnNvclBvcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBIYW5kbGVzIHZpZXcgY2hhbmdlIGV2ZW50IGFuZCBjb21taXRzIG1vZGVsIHZhbHVlICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9vbkNoYW5nZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfb25DaGFuZ2UoKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy52YWx1ZSAhPT0gdGhpcy5lbC52YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZVZhbHVlKCk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5tYXNrZWQuZG9Db21taXQoKTtcclxuXHRcdFx0XHRcdHRoaXMudXBkYXRlQ29udHJvbCgpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX3NhdmVTZWxlY3Rpb24oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIEhhbmRsZXMgdmlldyBkcm9wIGV2ZW50LCBwcmV2ZW50cyBieSBkZWZhdWx0ICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9vbkRyb3BcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX29uRHJvcChldikge1xyXG5cdFx0XHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogUmVzdG9yZSBsYXN0IHNlbGVjdGlvbiBvbiBmb2N1cyAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfb25Gb2N1c1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfb25Gb2N1cyhldikge1xyXG5cdFx0XHRcdFx0dGhpcy5hbGlnbkN1cnNvckZyaWVuZGx5KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBSZXN0b3JlIGxhc3Qgc2VsZWN0aW9uIG9uIGZvY3VzICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9vbkNsaWNrXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9vbkNsaWNrKGV2KSB7XHJcblx0XHRcdFx0XHR0aGlzLmFsaWduQ3Vyc29yRnJpZW5kbHkoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIFVuYmluZCB2aWV3IGV2ZW50cyBhbmQgcmVtb3ZlcyBlbGVtZW50IHJlZmVyZW5jZSAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJkZXN0cm95XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcblx0XHRcdFx0XHR0aGlzLl91bmJpbmRFdmVudHMoKTsgLy8gJEZsb3dGaXhNZSB3aHkgbm90IGRvIHNvP1xyXG5cclxuXHJcblx0XHRcdFx0XHR0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDsgLy8gJEZsb3dGaXhNZVxyXG5cclxuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzLmVsO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJtYXNrXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXNrZWQubWFzaztcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KG1hc2spIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLm1hc2tFcXVhbHMobWFzaykpIHJldHVybjtcclxuXHJcblx0XHRcdFx0XHRpZiAodGhpcy5tYXNrZWQuY29uc3RydWN0b3IgPT09IG1hc2tlZENsYXNzKG1hc2spKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMubWFza2VkLnVwZGF0ZU9wdGlvbnMoe1xyXG5cdFx0XHRcdFx0XHRcdG1hc2s6IG1hc2tcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR2YXIgbWFza2VkID0gY3JlYXRlTWFzayh7XHJcblx0XHRcdFx0XHRcdG1hc2s6IG1hc2tcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0bWFza2VkLnVubWFza2VkVmFsdWUgPSB0aGlzLm1hc2tlZC51bm1hc2tlZFZhbHVlO1xyXG5cdFx0XHRcdFx0dGhpcy5tYXNrZWQgPSBtYXNrZWQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBSYXcgdmFsdWUgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl92YWx1ZTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHN0cikge1xyXG5cdFx0XHRcdFx0dGhpcy5tYXNrZWQudmFsdWUgPSBzdHI7XHJcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZUNvbnRyb2woKTtcclxuXHRcdFx0XHRcdHRoaXMuYWxpZ25DdXJzb3IoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIFVubWFza2VkIHZhbHVlICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInVubWFza2VkVmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl91bm1hc2tlZFZhbHVlO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQoc3RyKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hc2tlZC51bm1hc2tlZFZhbHVlID0gc3RyO1xyXG5cdFx0XHRcdFx0dGhpcy51cGRhdGVDb250cm9sKCk7XHJcblx0XHRcdFx0XHR0aGlzLmFsaWduQ3Vyc29yKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiBUeXBlZCB1bm1hc2tlZCB2YWx1ZSAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ0eXBlZFZhbHVlXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXNrZWQudHlwZWRWYWx1ZTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbCkge1xyXG5cdFx0XHRcdFx0dGhpcy5tYXNrZWQudHlwZWRWYWx1ZSA9IHZhbDtcclxuXHRcdFx0XHRcdHRoaXMudXBkYXRlQ29udHJvbCgpO1xyXG5cdFx0XHRcdFx0dGhpcy5hbGlnbkN1cnNvcigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJzZWxlY3Rpb25TdGFydFwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID8gdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOiB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogQ3VycmVudCBjdXJzb3IgcG9zaXRpb24gKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiY3Vyc29yUG9zXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fY3Vyc29yQ2hhbmdpbmcgPyB0aGlzLl9jaGFuZ2luZ0N1cnNvclBvcyA6IHRoaXMuZWwuc2VsZWN0aW9uRW5kO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQocG9zKSB7XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMuZWwuaXNBY3RpdmUpIHJldHVybjtcclxuXHRcdFx0XHRcdHRoaXMuZWwuc2VsZWN0KHBvcywgcG9zKTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLl9zYXZlU2VsZWN0aW9uKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gSW5wdXRNYXNrO1xyXG5cdFx0fSgpO1xyXG5cdElNYXNrLklucHV0TWFzayA9IElucHV0TWFzaztcclxuXHJcblx0LyoqIFBhdHRlcm4gd2hpY2ggdmFsaWRhdGVzIGVudW0gdmFsdWVzICovXHJcblxyXG5cdHZhciBNYXNrZWRFbnVtID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uIChfTWFza2VkUGF0dGVybikge1xyXG5cdFx0XHRfaW5oZXJpdHMoTWFza2VkRW51bSwgX01hc2tlZFBhdHRlcm4pO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gTWFza2VkRW51bSgpIHtcclxuXHRcdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWFza2VkRW51bSk7XHJcblxyXG5cdFx0XHRcdHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfZ2V0UHJvdG90eXBlT2YoTWFza2VkRW51bSkuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF9jcmVhdGVDbGFzcyhNYXNrZWRFbnVtLCBbe1xyXG5cdFx0XHRcdGtleTogXCJfdXBkYXRlXCIsXHJcblxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0ICBAcGFyYW0ge09iamVjdH0gb3B0c1xyXG5cdFx0XHRcdCovXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF91cGRhdGUob3B0cykge1xyXG5cdFx0XHRcdFx0Ly8gVE9ETyB0eXBlXHJcblx0XHRcdFx0XHRpZiAob3B0cy5lbnVtKSBvcHRzLm1hc2sgPSAnKicucmVwZWF0KG9wdHMuZW51bVswXS5sZW5ndGgpO1xyXG5cclxuXHRcdFx0XHRcdF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZEVudW0ucHJvdG90eXBlKSwgXCJfdXBkYXRlXCIsIHRoaXMpLmNhbGwodGhpcywgb3B0cyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9WYWxpZGF0ZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBkb1ZhbGlkYXRlKCkge1xyXG5cdFx0XHRcdFx0dmFyIF90aGlzID0gdGhpcyxcclxuXHRcdFx0XHRcdFx0X2dldDI7XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XHJcblx0XHRcdFx0XHRcdGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZW51bS5zb21lKGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBlLmluZGV4T2YoX3RoaXMudW5tYXNrZWRWYWx1ZSkgPj0gMDtcclxuXHRcdFx0XHRcdH0pICYmIChfZ2V0MiA9IF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZEVudW0ucHJvdG90eXBlKSwgXCJkb1ZhbGlkYXRlXCIsIHRoaXMpKS5jYWxsLmFwcGx5KF9nZXQyLCBbdGhpc10uY29uY2F0KGFyZ3MpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1dKTtcclxuXHJcblx0XHRcdHJldHVybiBNYXNrZWRFbnVtO1xyXG5cdFx0fShNYXNrZWRQYXR0ZXJuKTtcclxuXHRJTWFzay5NYXNrZWRFbnVtID0gTWFza2VkRW51bTtcclxuXHJcblx0LyoqXHJcblx0ICBOdW1iZXIgbWFza1xyXG5cdCAgQHBhcmFtIHtPYmplY3R9IG9wdHNcclxuXHQgIEBwYXJhbSB7c3RyaW5nfSBvcHRzLnJhZGl4IC0gU2luZ2xlIGNoYXJcclxuXHQgIEBwYXJhbSB7c3RyaW5nfSBvcHRzLnRob3VzYW5kc1NlcGFyYXRvciAtIFNpbmdsZSBjaGFyXHJcblx0ICBAcGFyYW0ge0FycmF5PHN0cmluZz59IG9wdHMubWFwVG9SYWRpeCAtIEFycmF5IG9mIHNpbmdsZSBjaGFyc1xyXG5cdCAgQHBhcmFtIHtudW1iZXJ9IG9wdHMubWluXHJcblx0ICBAcGFyYW0ge251bWJlcn0gb3B0cy5tYXhcclxuXHQgIEBwYXJhbSB7bnVtYmVyfSBvcHRzLnNjYWxlIC0gRGlnaXRzIGFmdGVyIHBvaW50XHJcblx0ICBAcGFyYW0ge2Jvb2xlYW59IG9wdHMuc2lnbmVkIC0gQWxsb3cgbmVnYXRpdmVcclxuXHQgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0cy5ub3JtYWxpemVaZXJvcyAtIEZsYWcgdG8gcmVtb3ZlIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHplcm9zIGluIHRoZSBlbmQgb2YgZWRpdGluZ1xyXG5cdCAgQHBhcmFtIHtib29sZWFufSBvcHRzLnBhZEZyYWN0aW9uYWxaZXJvcyAtIEZsYWcgdG8gcGFkIHRyYWlsaW5nIHplcm9zIGFmdGVyIHBvaW50IGluIHRoZSBlbmQgb2YgZWRpdGluZ1xyXG5cdCovXHJcblx0dmFyIE1hc2tlZE51bWJlciA9XHJcblx0XHQvKiNfX1BVUkVfXyovXHJcblx0XHRmdW5jdGlvbiAoX01hc2tlZCkge1xyXG5cdFx0XHRfaW5oZXJpdHMoTWFza2VkTnVtYmVyLCBfTWFza2VkKTtcclxuXHJcblx0XHRcdC8qKiBTaW5nbGUgY2hhciAqL1xyXG5cclxuXHRcdFx0LyoqIFNpbmdsZSBjaGFyICovXHJcblxyXG5cdFx0XHQvKiogQXJyYXkgb2Ygc2luZ2xlIGNoYXJzICovXHJcblxyXG5cdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0LyoqIERpZ2l0cyBhZnRlciBwb2ludCAqL1xyXG5cclxuXHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHQvKiogRmxhZyB0byByZW1vdmUgbGVhZGluZyBhbmQgdHJhaWxpbmcgemVyb3MgaW4gdGhlIGVuZCBvZiBlZGl0aW5nICovXHJcblxyXG5cdFx0XHQvKiogRmxhZyB0byBwYWQgdHJhaWxpbmcgemVyb3MgYWZ0ZXIgcG9pbnQgaW4gdGhlIGVuZCBvZiBlZGl0aW5nICovXHJcblx0XHRcdGZ1bmN0aW9uIE1hc2tlZE51bWJlcihvcHRzKSB7XHJcblx0XHRcdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1hc2tlZE51bWJlcik7XHJcblxyXG5cdFx0XHRcdHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfZ2V0UHJvdG90eXBlT2YoTWFza2VkTnVtYmVyKS5jYWxsKHRoaXMsIE9iamVjdC5hc3NpZ24oe30sIE1hc2tlZE51bWJlci5ERUZBVUxUUywge30sIG9wdHMpKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdCovXHJcblxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKE1hc2tlZE51bWJlciwgW3tcclxuXHRcdFx0XHRrZXk6IFwiX3VwZGF0ZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlKG9wdHMpIHtcclxuXHRcdFx0XHRcdF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZE51bWJlci5wcm90b3R5cGUpLCBcIl91cGRhdGVcIiwgdGhpcykuY2FsbCh0aGlzLCBvcHRzKTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVSZWdFeHBzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfdXBkYXRlUmVnRXhwc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlUmVnRXhwcygpIHtcclxuXHRcdFx0XHRcdC8vIHVzZSBkaWZmZXJlbnQgcmVnZXhwIHRvIHByb2Nlc3MgdXNlciBpbnB1dCAobW9yZSBzdHJpY3QsIGlucHV0IHN1ZmZpeCkgYW5kIHRhaWwgc2hpZnRpbmdcclxuXHRcdFx0XHRcdHZhciBzdGFydCA9ICdeJyArICh0aGlzLmFsbG93TmVnYXRpdmUgPyAnWyt8XFxcXC1dPycgOiAnJyk7XHJcblx0XHRcdFx0XHR2YXIgbWlkSW5wdXQgPSAnKDB8KFsxLTldK1xcXFxkKikpPyc7XHJcblx0XHRcdFx0XHR2YXIgbWlkID0gJ1xcXFxkKic7XHJcblx0XHRcdFx0XHR2YXIgZW5kID0gKHRoaXMuc2NhbGUgPyAnKCcgKyBlc2NhcGVSZWdFeHAodGhpcy5yYWRpeCkgKyAnXFxcXGR7MCwnICsgdGhpcy5zY2FsZSArICd9KT8nIDogJycpICsgJyQnO1xyXG5cdFx0XHRcdFx0dGhpcy5fbnVtYmVyUmVnRXhwSW5wdXQgPSBuZXcgUmVnRXhwKHN0YXJ0ICsgbWlkSW5wdXQgKyBlbmQpO1xyXG5cdFx0XHRcdFx0dGhpcy5fbnVtYmVyUmVnRXhwID0gbmV3IFJlZ0V4cChzdGFydCArIG1pZCArIGVuZCk7XHJcblx0XHRcdFx0XHR0aGlzLl9tYXBUb1JhZGl4UmVnRXhwID0gbmV3IFJlZ0V4cCgnWycgKyB0aGlzLm1hcFRvUmFkaXgubWFwKGVzY2FwZVJlZ0V4cCkuam9pbignJykgKyAnXScsICdnJyk7XHJcblx0XHRcdFx0XHR0aGlzLl90aG91c2FuZHNTZXBhcmF0b3JSZWdFeHAgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4cCh0aGlzLnRob3VzYW5kc1NlcGFyYXRvciksICdnJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfcmVtb3ZlVGhvdXNhbmRzU2VwYXJhdG9yc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlVGhvdXNhbmRzU2VwYXJhdG9ycyh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5fdGhvdXNhbmRzU2VwYXJhdG9yUmVnRXhwLCAnJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfaW5zZXJ0VGhvdXNhbmRzU2VwYXJhdG9yc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfaW5zZXJ0VGhvdXNhbmRzU2VwYXJhdG9ycyh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0Ly8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjkwMTEwMi9ob3ctdG8tcHJpbnQtYS1udW1iZXItd2l0aC1jb21tYXMtYXMtdGhvdXNhbmRzLXNlcGFyYXRvcnMtaW4tamF2YXNjcmlwdFxyXG5cdFx0XHRcdFx0dmFyIHBhcnRzID0gdmFsdWUuc3BsaXQodGhpcy5yYWRpeCk7XHJcblx0XHRcdFx0XHRwYXJ0c1swXSA9IHBhcnRzWzBdLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIHRoaXMudGhvdXNhbmRzU2VwYXJhdG9yKTtcclxuXHRcdFx0XHRcdHJldHVybiBwYXJ0cy5qb2luKHRoaXMucmFkaXgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImRvUHJlcGFyZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBkb1ByZXBhcmUoc3RyKSB7XHJcblx0XHRcdFx0XHR2YXIgX2dldDI7XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xyXG5cdFx0XHRcdFx0XHRhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gKF9nZXQyID0gX2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkTnVtYmVyLnByb3RvdHlwZSksIFwiZG9QcmVwYXJlXCIsIHRoaXMpKS5jYWxsLmFwcGx5KF9nZXQyLCBbdGhpcywgdGhpcy5fcmVtb3ZlVGhvdXNhbmRzU2VwYXJhdG9ycyhzdHIucmVwbGFjZSh0aGlzLl9tYXBUb1JhZGl4UmVnRXhwLCB0aGlzLnJhZGl4KSldLmNvbmNhdChhcmdzKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfc2VwYXJhdG9yc0NvdW50XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9zZXBhcmF0b3JzQ291bnQodG8pIHtcclxuXHRcdFx0XHRcdHZhciBleHRlbmRPblNlcGFyYXRvcnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xyXG5cdFx0XHRcdFx0dmFyIGNvdW50ID0gMDtcclxuXHJcblx0XHRcdFx0XHRmb3IgKHZhciBwb3MgPSAwOyBwb3MgPCB0bzsgKytwb3MpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX3ZhbHVlLmluZGV4T2YodGhpcy50aG91c2FuZHNTZXBhcmF0b3IsIHBvcykgPT09IHBvcykge1xyXG5cdFx0XHRcdFx0XHRcdCsrY291bnQ7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGV4dGVuZE9uU2VwYXJhdG9ycykgdG8gKz0gdGhpcy50aG91c2FuZHNTZXBhcmF0b3IubGVuZ3RoO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGNvdW50O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX3NlcGFyYXRvcnNDb3VudEZyb21TbGljZVwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfc2VwYXJhdG9yc0NvdW50RnJvbVNsaWNlKCkge1xyXG5cdFx0XHRcdFx0dmFyIHNsaWNlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB0aGlzLl92YWx1ZTtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9zZXBhcmF0b3JzQ291bnQodGhpcy5fcmVtb3ZlVGhvdXNhbmRzU2VwYXJhdG9ycyhzbGljZSkubGVuZ3RoLCB0cnVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJleHRyYWN0SW5wdXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZXh0cmFjdElucHV0KCkge1xyXG5cdFx0XHRcdFx0dmFyIGZyb21Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XHJcblx0XHRcdFx0XHR2YXIgdG9Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cdFx0XHRcdFx0dmFyIGZsYWdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XHJcblxyXG5cdFx0XHRcdFx0dmFyIF90aGlzJF9hZGp1c3RSYW5nZVdpdCA9IHRoaXMuX2FkanVzdFJhbmdlV2l0aFNlcGFyYXRvcnMoZnJvbVBvcywgdG9Qb3MpO1xyXG5cclxuXHRcdFx0XHRcdHZhciBfdGhpcyRfYWRqdXN0UmFuZ2VXaXQyID0gX3NsaWNlZFRvQXJyYXkoX3RoaXMkX2FkanVzdFJhbmdlV2l0LCAyKTtcclxuXHJcblx0XHRcdFx0XHRmcm9tUG9zID0gX3RoaXMkX2FkanVzdFJhbmdlV2l0MlswXTtcclxuXHRcdFx0XHRcdHRvUG9zID0gX3RoaXMkX2FkanVzdFJhbmdlV2l0MlsxXTtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9yZW1vdmVUaG91c2FuZHNTZXBhcmF0b3JzKF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZE51bWJlci5wcm90b3R5cGUpLCBcImV4dHJhY3RJbnB1dFwiLCB0aGlzKS5jYWxsKHRoaXMsIGZyb21Qb3MsIHRvUG9zLCBmbGFncykpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRDaGFyUmF3XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9hcHBlbmRDaGFyUmF3KGNoKSB7XHJcblx0XHRcdFx0XHR2YXIgZmxhZ3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLnRob3VzYW5kc1NlcGFyYXRvcikgcmV0dXJuIF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZE51bWJlci5wcm90b3R5cGUpLCBcIl9hcHBlbmRDaGFyUmF3XCIsIHRoaXMpLmNhbGwodGhpcywgY2gsIGZsYWdzKTtcclxuXHRcdFx0XHRcdHZhciBwcmV2QmVmb3JlVGFpbFZhbHVlID0gZmxhZ3MudGFpbCAmJiBmbGFncy5fYmVmb3JlVGFpbFN0YXRlID8gZmxhZ3MuX2JlZm9yZVRhaWxTdGF0ZS5fdmFsdWUgOiB0aGlzLl92YWx1ZTtcclxuXHJcblx0XHRcdFx0XHR2YXIgcHJldkJlZm9yZVRhaWxTZXBhcmF0b3JzQ291bnQgPSB0aGlzLl9zZXBhcmF0b3JzQ291bnRGcm9tU2xpY2UocHJldkJlZm9yZVRhaWxWYWx1ZSk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5fdmFsdWUgPSB0aGlzLl9yZW1vdmVUaG91c2FuZHNTZXBhcmF0b3JzKHRoaXMudmFsdWUpO1xyXG5cclxuXHRcdFx0XHRcdHZhciBhcHBlbmREZXRhaWxzID0gX2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkTnVtYmVyLnByb3RvdHlwZSksIFwiX2FwcGVuZENoYXJSYXdcIiwgdGhpcykuY2FsbCh0aGlzLCBjaCwgZmxhZ3MpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX3ZhbHVlID0gdGhpcy5faW5zZXJ0VGhvdXNhbmRzU2VwYXJhdG9ycyh0aGlzLl92YWx1ZSk7XHJcblx0XHRcdFx0XHR2YXIgYmVmb3JlVGFpbFZhbHVlID0gZmxhZ3MudGFpbCAmJiBmbGFncy5fYmVmb3JlVGFpbFN0YXRlID8gZmxhZ3MuX2JlZm9yZVRhaWxTdGF0ZS5fdmFsdWUgOiB0aGlzLl92YWx1ZTtcclxuXHJcblx0XHRcdFx0XHR2YXIgYmVmb3JlVGFpbFNlcGFyYXRvcnNDb3VudCA9IHRoaXMuX3NlcGFyYXRvcnNDb3VudEZyb21TbGljZShiZWZvcmVUYWlsVmFsdWUpO1xyXG5cclxuXHRcdFx0XHRcdGFwcGVuZERldGFpbHMudGFpbFNoaWZ0ICs9IChiZWZvcmVUYWlsU2VwYXJhdG9yc0NvdW50IC0gcHJldkJlZm9yZVRhaWxTZXBhcmF0b3JzQ291bnQpICogdGhpcy50aG91c2FuZHNTZXBhcmF0b3IubGVuZ3RoO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGFwcGVuZERldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKiAqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfZmluZFNlcGFyYXRvckFyb3VuZFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfZmluZFNlcGFyYXRvckFyb3VuZChwb3MpIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLnRob3VzYW5kc1NlcGFyYXRvcikge1xyXG5cdFx0XHRcdFx0XHR2YXIgc2VhcmNoRnJvbSA9IHBvcyAtIHRoaXMudGhvdXNhbmRzU2VwYXJhdG9yLmxlbmd0aCArIDE7XHJcblx0XHRcdFx0XHRcdHZhciBzZXBhcmF0b3JQb3MgPSB0aGlzLnZhbHVlLmluZGV4T2YodGhpcy50aG91c2FuZHNTZXBhcmF0b3IsIHNlYXJjaEZyb20pO1xyXG5cdFx0XHRcdFx0XHRpZiAoc2VwYXJhdG9yUG9zIDw9IHBvcykgcmV0dXJuIHNlcGFyYXRvclBvcztcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gLTE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hZGp1c3RSYW5nZVdpdGhTZXBhcmF0b3JzXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9hZGp1c3RSYW5nZVdpdGhTZXBhcmF0b3JzKGZyb20sIHRvKSB7XHJcblx0XHRcdFx0XHR2YXIgc2VwYXJhdG9yQXJvdW5kRnJvbVBvcyA9IHRoaXMuX2ZpbmRTZXBhcmF0b3JBcm91bmQoZnJvbSk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHNlcGFyYXRvckFyb3VuZEZyb21Qb3MgPj0gMCkgZnJvbSA9IHNlcGFyYXRvckFyb3VuZEZyb21Qb3M7XHJcblxyXG5cdFx0XHRcdFx0dmFyIHNlcGFyYXRvckFyb3VuZFRvUG9zID0gdGhpcy5fZmluZFNlcGFyYXRvckFyb3VuZCh0byk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHNlcGFyYXRvckFyb3VuZFRvUG9zID49IDApIHRvID0gc2VwYXJhdG9yQXJvdW5kVG9Qb3MgKyB0aGlzLnRob3VzYW5kc1NlcGFyYXRvci5sZW5ndGg7XHJcblx0XHRcdFx0XHRyZXR1cm4gW2Zyb20sIHRvXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJyZW1vdmVcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xyXG5cdFx0XHRcdFx0dmFyIGZyb21Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XHJcblx0XHRcdFx0XHR2YXIgdG9Qb3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cclxuXHRcdFx0XHRcdHZhciBfdGhpcyRfYWRqdXN0UmFuZ2VXaXQzID0gdGhpcy5fYWRqdXN0UmFuZ2VXaXRoU2VwYXJhdG9ycyhmcm9tUG9zLCB0b1Bvcyk7XHJcblxyXG5cdFx0XHRcdFx0dmFyIF90aGlzJF9hZGp1c3RSYW5nZVdpdDQgPSBfc2xpY2VkVG9BcnJheShfdGhpcyRfYWRqdXN0UmFuZ2VXaXQzLCAyKTtcclxuXHJcblx0XHRcdFx0XHRmcm9tUG9zID0gX3RoaXMkX2FkanVzdFJhbmdlV2l0NFswXTtcclxuXHRcdFx0XHRcdHRvUG9zID0gX3RoaXMkX2FkanVzdFJhbmdlV2l0NFsxXTtcclxuXHRcdFx0XHRcdHZhciB2YWx1ZUJlZm9yZVBvcyA9IHRoaXMudmFsdWUuc2xpY2UoMCwgZnJvbVBvcyk7XHJcblx0XHRcdFx0XHR2YXIgdmFsdWVBZnRlclBvcyA9IHRoaXMudmFsdWUuc2xpY2UodG9Qb3MpO1xyXG5cclxuXHRcdFx0XHRcdHZhciBwcmV2QmVmb3JlVGFpbFNlcGFyYXRvcnNDb3VudCA9IHRoaXMuX3NlcGFyYXRvcnNDb3VudCh2YWx1ZUJlZm9yZVBvcy5sZW5ndGgpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX3ZhbHVlID0gdGhpcy5faW5zZXJ0VGhvdXNhbmRzU2VwYXJhdG9ycyh0aGlzLl9yZW1vdmVUaG91c2FuZHNTZXBhcmF0b3JzKHZhbHVlQmVmb3JlUG9zICsgdmFsdWVBZnRlclBvcykpO1xyXG5cclxuXHRcdFx0XHRcdHZhciBiZWZvcmVUYWlsU2VwYXJhdG9yc0NvdW50ID0gdGhpcy5fc2VwYXJhdG9yc0NvdW50RnJvbVNsaWNlKHZhbHVlQmVmb3JlUG9zKTtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENoYW5nZURldGFpbHMoe1xyXG5cdFx0XHRcdFx0XHR0YWlsU2hpZnQ6IChiZWZvcmVUYWlsU2VwYXJhdG9yc0NvdW50IC0gcHJldkJlZm9yZVRhaWxTZXBhcmF0b3JzQ291bnQpICogdGhpcy50aG91c2FuZHNTZXBhcmF0b3IubGVuZ3RoXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJuZWFyZXN0SW5wdXRQb3NcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gbmVhcmVzdElucHV0UG9zKGN1cnNvclBvcywgZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMudGhvdXNhbmRzU2VwYXJhdG9yKSByZXR1cm4gY3Vyc29yUG9zO1xyXG5cclxuXHRcdFx0XHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLk5PTkU6XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLkxFRlQ6XHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLkZPUkNFX0xFRlQ6XHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHNlcGFyYXRvckF0TGVmdFBvcyA9IHRoaXMuX2ZpbmRTZXBhcmF0b3JBcm91bmQoY3Vyc29yUG9zIC0gMSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNlcGFyYXRvckF0TGVmdFBvcyA+PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBzZXBhcmF0b3JBdExlZnRFbmRQb3MgPSBzZXBhcmF0b3JBdExlZnRQb3MgKyB0aGlzLnRob3VzYW5kc1NlcGFyYXRvci5sZW5ndGg7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY3Vyc29yUG9zIDwgc2VwYXJhdG9yQXRMZWZ0RW5kUG9zIHx8IHRoaXMudmFsdWUubGVuZ3RoIDw9IHNlcGFyYXRvckF0TGVmdEVuZFBvcyB8fCBkaXJlY3Rpb24gPT09IERJUkVDVElPTi5GT1JDRV9MRUZUKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlcGFyYXRvckF0TGVmdFBvcztcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGNhc2UgRElSRUNUSU9OLlJJR0hUOlxyXG5cdFx0XHRcdFx0XHRjYXNlIERJUkVDVElPTi5GT1JDRV9SSUdIVDpcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgc2VwYXJhdG9yQXRSaWdodFBvcyA9IHRoaXMuX2ZpbmRTZXBhcmF0b3JBcm91bmQoY3Vyc29yUG9zKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoc2VwYXJhdG9yQXRSaWdodFBvcyA+PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZXBhcmF0b3JBdFJpZ2h0UG9zICsgdGhpcy50aG91c2FuZHNTZXBhcmF0b3IubGVuZ3RoO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gY3Vyc29yUG9zO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImRvVmFsaWRhdGVcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9WYWxpZGF0ZShmbGFncykge1xyXG5cdFx0XHRcdFx0dmFyIHJlZ2V4cCA9IGZsYWdzLmlucHV0ID8gdGhpcy5fbnVtYmVyUmVnRXhwSW5wdXQgOiB0aGlzLl9udW1iZXJSZWdFeHA7IC8vIHZhbGlkYXRlIGFzIHN0cmluZ1xyXG5cclxuXHRcdFx0XHRcdHZhciB2YWxpZCA9IHJlZ2V4cC50ZXN0KHRoaXMuX3JlbW92ZVRob3VzYW5kc1NlcGFyYXRvcnModGhpcy52YWx1ZSkpO1xyXG5cclxuXHRcdFx0XHRcdGlmICh2YWxpZCkge1xyXG5cdFx0XHRcdFx0XHQvLyB2YWxpZGF0ZSBhcyBudW1iZXJcclxuXHRcdFx0XHRcdFx0dmFyIG51bWJlciA9IHRoaXMubnVtYmVyO1xyXG5cdFx0XHRcdFx0XHR2YWxpZCA9IHZhbGlkICYmICFpc05hTihudW1iZXIpICYmICggLy8gY2hlY2sgbWluIGJvdW5kIGZvciBuZWdhdGl2ZSB2YWx1ZXNcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1pbiA9PSBudWxsIHx8IHRoaXMubWluID49IDAgfHwgdGhpcy5taW4gPD0gdGhpcy5udW1iZXIpICYmICggLy8gY2hlY2sgbWF4IGJvdW5kIGZvciBwb3NpdGl2ZSB2YWx1ZXNcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMubWF4ID09IG51bGwgfHwgdGhpcy5tYXggPD0gMCB8fCB0aGlzLm51bWJlciA8PSB0aGlzLm1heCk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIHZhbGlkICYmIF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZE51bWJlci5wcm90b3R5cGUpLCBcImRvVmFsaWRhdGVcIiwgdGhpcykuY2FsbCh0aGlzLCBmbGFncyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9Db21taXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9Db21taXQoKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy52YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgbnVtYmVyID0gdGhpcy5udW1iZXI7XHJcblx0XHRcdFx0XHRcdHZhciB2YWxpZG51bSA9IG51bWJlcjsgLy8gY2hlY2sgYm91bmRzXHJcblxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5taW4gIT0gbnVsbCkgdmFsaWRudW0gPSBNYXRoLm1heCh2YWxpZG51bSwgdGhpcy5taW4pO1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5tYXggIT0gbnVsbCkgdmFsaWRudW0gPSBNYXRoLm1pbih2YWxpZG51bSwgdGhpcy5tYXgpO1xyXG5cdFx0XHRcdFx0XHRpZiAodmFsaWRudW0gIT09IG51bWJlcikgdGhpcy51bm1hc2tlZFZhbHVlID0gU3RyaW5nKHZhbGlkbnVtKTtcclxuXHRcdFx0XHRcdFx0dmFyIGZvcm1hdHRlZCA9IHRoaXMudmFsdWU7XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLm5vcm1hbGl6ZVplcm9zKSBmb3JtYXR0ZWQgPSB0aGlzLl9ub3JtYWxpemVaZXJvcyhmb3JtYXR0ZWQpO1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5wYWRGcmFjdGlvbmFsWmVyb3MpIGZvcm1hdHRlZCA9IHRoaXMuX3BhZEZyYWN0aW9uYWxaZXJvcyhmb3JtYXR0ZWQpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLl92YWx1ZSA9IGZvcm1hdHRlZDtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRfZ2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWROdW1iZXIucHJvdG90eXBlKSwgXCJkb0NvbW1pdFwiLCB0aGlzKS5jYWxsKHRoaXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiogKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiX25vcm1hbGl6ZVplcm9zXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9ub3JtYWxpemVaZXJvcyh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0dmFyIHBhcnRzID0gdGhpcy5fcmVtb3ZlVGhvdXNhbmRzU2VwYXJhdG9ycyh2YWx1ZSkuc3BsaXQodGhpcy5yYWRpeCk7IC8vIHJlbW92ZSBsZWFkaW5nIHplcm9zXHJcblxyXG5cclxuXHRcdFx0XHRcdHBhcnRzWzBdID0gcGFydHNbMF0ucmVwbGFjZSgvXihcXEQqKSgwKikoXFxkKikvLCBmdW5jdGlvbiAobWF0Y2gsIHNpZ24sIHplcm9zLCBudW0pIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHNpZ24gKyBudW07XHJcblx0XHRcdFx0XHR9KTsgLy8gYWRkIGxlYWRpbmcgemVyb1xyXG5cclxuXHRcdFx0XHRcdGlmICh2YWx1ZS5sZW5ndGggJiYgIS9cXGQkLy50ZXN0KHBhcnRzWzBdKSkgcGFydHNbMF0gPSBwYXJ0c1swXSArICcwJztcclxuXHJcblx0XHRcdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xyXG5cdFx0XHRcdFx0XHRwYXJ0c1sxXSA9IHBhcnRzWzFdLnJlcGxhY2UoLzAqJC8sICcnKTsgLy8gcmVtb3ZlIHRyYWlsaW5nIHplcm9zXHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIXBhcnRzWzFdLmxlbmd0aCkgcGFydHMubGVuZ3RoID0gMTsgLy8gcmVtb3ZlIGZyYWN0aW9uYWxcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5faW5zZXJ0VGhvdXNhbmRzU2VwYXJhdG9ycyhwYXJ0cy5qb2luKHRoaXMucmFkaXgpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqICovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9wYWRGcmFjdGlvbmFsWmVyb3NcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3BhZEZyYWN0aW9uYWxaZXJvcyh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0aWYgKCF2YWx1ZSkgcmV0dXJuIHZhbHVlO1xyXG5cdFx0XHRcdFx0dmFyIHBhcnRzID0gdmFsdWUuc3BsaXQodGhpcy5yYWRpeCk7XHJcblx0XHRcdFx0XHRpZiAocGFydHMubGVuZ3RoIDwgMikgcGFydHMucHVzaCgnJyk7XHJcblx0XHRcdFx0XHRwYXJ0c1sxXSA9IHBhcnRzWzFdLnBhZEVuZCh0aGlzLnNjYWxlLCAnMCcpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnRzLmpvaW4odGhpcy5yYWRpeCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwidW5tYXNrZWRWYWx1ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX3JlbW92ZVRob3VzYW5kc1NlcGFyYXRvcnModGhpcy5fbm9ybWFsaXplWmVyb3ModGhpcy52YWx1ZSkpLnJlcGxhY2UodGhpcy5yYWRpeCwgJy4nKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHVubWFza2VkVmFsdWUpIHtcclxuXHRcdFx0XHRcdF9zZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZE51bWJlci5wcm90b3R5cGUpLCBcInVubWFza2VkVmFsdWVcIiwgdW5tYXNrZWRWYWx1ZS5yZXBsYWNlKCcuJywgdGhpcy5yYWRpeCksIHRoaXMsIHRydWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInR5cGVkVmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiBOdW1iZXIodGhpcy51bm1hc2tlZFZhbHVlKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KG4pIHtcclxuXHRcdFx0XHRcdF9zZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZE51bWJlci5wcm90b3R5cGUpLCBcInVubWFza2VkVmFsdWVcIiwgU3RyaW5nKG4pLCB0aGlzLCB0cnVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqIFBhcnNlZCBOdW1iZXIgKi9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwibnVtYmVyXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy50eXBlZFZhbHVlO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQobnVtYmVyKSB7XHJcblx0XHRcdFx0XHR0aGlzLnR5cGVkVmFsdWUgPSBudW1iZXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgSXMgbmVnYXRpdmUgYWxsb3dlZFxyXG5cdFx0XHRcdCAgQHJlYWRvbmx5XHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiYWxsb3dOZWdhdGl2ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2lnbmVkIHx8IHRoaXMubWluICE9IG51bGwgJiYgdGhpcy5taW4gPCAwIHx8IHRoaXMubWF4ICE9IG51bGwgJiYgdGhpcy5tYXggPCAwO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fV0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIE1hc2tlZE51bWJlcjtcclxuXHRcdH0oTWFza2VkKTtcclxuXHRNYXNrZWROdW1iZXIuREVGQVVMVFMgPSB7XHJcblx0XHRyYWRpeDogJywnLFxyXG5cdFx0dGhvdXNhbmRzU2VwYXJhdG9yOiAnJyxcclxuXHRcdG1hcFRvUmFkaXg6IFsnLiddLFxyXG5cdFx0c2NhbGU6IDIsXHJcblx0XHRzaWduZWQ6IGZhbHNlLFxyXG5cdFx0bm9ybWFsaXplWmVyb3M6IHRydWUsXHJcblx0XHRwYWRGcmFjdGlvbmFsWmVyb3M6IGZhbHNlXHJcblx0fTtcclxuXHRJTWFzay5NYXNrZWROdW1iZXIgPSBNYXNrZWROdW1iZXI7XHJcblxyXG5cdC8qKiBNYXNraW5nIGJ5IFJlZ0V4cCAqL1xyXG5cclxuXHR2YXIgTWFza2VkUmVnRXhwID1cclxuXHRcdC8qI19fUFVSRV9fKi9cclxuXHRcdGZ1bmN0aW9uIChfTWFza2VkKSB7XHJcblx0XHRcdF9pbmhlcml0cyhNYXNrZWRSZWdFeHAsIF9NYXNrZWQpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gTWFza2VkUmVnRXhwKCkge1xyXG5cdFx0XHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNYXNrZWRSZWdFeHApO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX2dldFByb3RvdHlwZU9mKE1hc2tlZFJlZ0V4cCkuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF9jcmVhdGVDbGFzcyhNYXNrZWRSZWdFeHAsIFt7XHJcblx0XHRcdFx0a2V5OiBcIl91cGRhdGVcIixcclxuXHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQgIEBwYXJhbSB7T2JqZWN0fSBvcHRzXHJcblx0XHRcdFx0Ki9cclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZShvcHRzKSB7XHJcblx0XHRcdFx0XHRpZiAob3B0cy5tYXNrKSBvcHRzLnZhbGlkYXRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZS5zZWFyY2gob3B0cy5tYXNrKSA+PSAwO1xyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0XHRfZ2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWRSZWdFeHAucHJvdG90eXBlKSwgXCJfdXBkYXRlXCIsIHRoaXMpLmNhbGwodGhpcywgb3B0cyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gTWFza2VkUmVnRXhwO1xyXG5cdFx0fShNYXNrZWQpO1xyXG5cdElNYXNrLk1hc2tlZFJlZ0V4cCA9IE1hc2tlZFJlZ0V4cDtcclxuXHJcblx0LyoqIE1hc2tpbmcgYnkgY3VzdG9tIEZ1bmN0aW9uICovXHJcblxyXG5cdHZhciBNYXNrZWRGdW5jdGlvbiA9XHJcblx0XHQvKiNfX1BVUkVfXyovXHJcblx0XHRmdW5jdGlvbiAoX01hc2tlZCkge1xyXG5cdFx0XHRfaW5oZXJpdHMoTWFza2VkRnVuY3Rpb24sIF9NYXNrZWQpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gTWFza2VkRnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1hc2tlZEZ1bmN0aW9uKTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9nZXRQcm90b3R5cGVPZihNYXNrZWRGdW5jdGlvbikuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF9jcmVhdGVDbGFzcyhNYXNrZWRGdW5jdGlvbiwgW3tcclxuXHRcdFx0XHRrZXk6IFwiX3VwZGF0ZVwiLFxyXG5cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCAgQHBhcmFtIHtPYmplY3R9IG9wdHNcclxuXHRcdFx0XHQqL1xyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlKG9wdHMpIHtcclxuXHRcdFx0XHRcdGlmIChvcHRzLm1hc2spIG9wdHMudmFsaWRhdGUgPSBvcHRzLm1hc2s7XHJcblxyXG5cdFx0XHRcdFx0X2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkRnVuY3Rpb24ucHJvdG90eXBlKSwgXCJfdXBkYXRlXCIsIHRoaXMpLmNhbGwodGhpcywgb3B0cyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gTWFza2VkRnVuY3Rpb247XHJcblx0XHR9KE1hc2tlZCk7XHJcblx0SU1hc2suTWFza2VkRnVuY3Rpb24gPSBNYXNrZWRGdW5jdGlvbjtcclxuXHJcblx0LyoqIER5bmFtaWMgbWFzayBmb3IgY2hvb3NpbmcgYXByb3ByaWF0ZSBtYXNrIGluIHJ1bi10aW1lICovXHJcblx0dmFyIE1hc2tlZER5bmFtaWMgPVxyXG5cdFx0LyojX19QVVJFX18qL1xyXG5cdFx0ZnVuY3Rpb24gKF9NYXNrZWQpIHtcclxuXHRcdFx0X2luaGVyaXRzKE1hc2tlZER5bmFtaWMsIF9NYXNrZWQpO1xyXG5cclxuXHRcdFx0LyoqIEN1cnJlbnRseSBjaG9zZW4gbWFzayAqL1xyXG5cclxuXHRcdFx0LyoqIENvbXBsaWxlZCB7QGxpbmsgTWFza2VkfSBvcHRpb25zICovXHJcblxyXG5cdFx0XHQvKiogQ2hvb3NlcyB7QGxpbmsgTWFza2VkfSBkZXBlbmRpbmcgb24gaW5wdXQgdmFsdWUgKi9cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgIEBwYXJhbSB7T2JqZWN0fSBvcHRzXHJcblx0XHRcdCovXHJcblx0XHRcdGZ1bmN0aW9uIE1hc2tlZER5bmFtaWMob3B0cykge1xyXG5cdFx0XHRcdHZhciBfdGhpcztcclxuXHJcblx0XHRcdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1hc2tlZER5bmFtaWMpO1xyXG5cclxuXHRcdFx0XHRfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9nZXRQcm90b3R5cGVPZihNYXNrZWREeW5hbWljKS5jYWxsKHRoaXMsIE9iamVjdC5hc3NpZ24oe30sIE1hc2tlZER5bmFtaWMuREVGQVVMVFMsIHt9LCBvcHRzKSkpO1xyXG5cdFx0XHRcdF90aGlzLmN1cnJlbnRNYXNrID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm4gX3RoaXM7XHJcblx0XHRcdH1cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdCovXHJcblxyXG5cclxuXHRcdFx0X2NyZWF0ZUNsYXNzKE1hc2tlZER5bmFtaWMsIFt7XHJcblx0XHRcdFx0a2V5OiBcIl91cGRhdGVcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZShvcHRzKSB7XHJcblx0XHRcdFx0XHRfZ2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWREeW5hbWljLnByb3RvdHlwZSksIFwiX3VwZGF0ZVwiLCB0aGlzKS5jYWxsKHRoaXMsIG9wdHMpO1xyXG5cclxuXHRcdFx0XHRcdGlmICgnbWFzaycgaW4gb3B0cykge1xyXG5cdFx0XHRcdFx0XHQvLyBtYXNrIGNvdWxkIGJlIHRvdGFsbHkgZHluYW1pYyB3aXRoIG9ubHkgYGRpc3BhdGNoYCBvcHRpb25cclxuXHRcdFx0XHRcdFx0dGhpcy5jb21waWxlZE1hc2tzID0gQXJyYXkuaXNBcnJheShvcHRzLm1hc2spID8gb3B0cy5tYXNrLm1hcChmdW5jdGlvbiAobSkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBjcmVhdGVNYXNrKG0pO1xyXG5cdFx0XHRcdFx0XHR9KSA6IFtdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRDaGFyUmF3XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9hcHBlbmRDaGFyUmF3KCkge1xyXG5cdFx0XHRcdFx0dmFyIGRldGFpbHMgPSB0aGlzLl9hcHBseURpc3BhdGNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHRoaXMuY3VycmVudE1hc2spIHtcclxuXHRcdFx0XHRcdFx0dmFyIF90aGlzJGN1cnJlbnRNYXNrO1xyXG5cclxuXHRcdFx0XHRcdFx0ZGV0YWlscy5hZ2dyZWdhdGUoKF90aGlzJGN1cnJlbnRNYXNrID0gdGhpcy5jdXJyZW50TWFzaykuX2FwcGVuZENoYXIuYXBwbHkoX3RoaXMkY3VycmVudE1hc2ssIGFyZ3VtZW50cykpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHJldHVybiBkZXRhaWxzO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJfYXBwbHlEaXNwYXRjaFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwbHlEaXNwYXRjaCgpIHtcclxuXHRcdFx0XHRcdHZhciBhcHBlbmRlZCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XHJcblx0XHRcdFx0XHR2YXIgZmxhZ3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xyXG5cdFx0XHRcdFx0dmFyIHByZXZWYWx1ZUJlZm9yZVRhaWwgPSBmbGFncy50YWlsICYmIGZsYWdzLl9iZWZvcmVUYWlsU3RhdGUgIT0gbnVsbCA/IGZsYWdzLl9iZWZvcmVUYWlsU3RhdGUuX3ZhbHVlIDogdGhpcy52YWx1ZTtcclxuXHRcdFx0XHRcdHZhciBpbnB1dFZhbHVlID0gdGhpcy5yYXdJbnB1dFZhbHVlO1xyXG5cdFx0XHRcdFx0dmFyIGluc2VydFZhbHVlID0gZmxhZ3MudGFpbCAmJiBmbGFncy5fYmVmb3JlVGFpbFN0YXRlICE9IG51bGwgPyAvLyAkRmxvd0ZpeE1lIC0gdGlyZWQgdG8gZmlnaHQgd2l0aCB0eXBlIHN5c3RlbVxyXG5cdFx0XHRcdFx0XHRmbGFncy5fYmVmb3JlVGFpbFN0YXRlLl9yYXdJbnB1dFZhbHVlIDogaW5wdXRWYWx1ZTtcclxuXHRcdFx0XHRcdHZhciB0YWlsVmFsdWUgPSBpbnB1dFZhbHVlLnNsaWNlKGluc2VydFZhbHVlLmxlbmd0aCk7XHJcblx0XHRcdFx0XHR2YXIgcHJldk1hc2sgPSB0aGlzLmN1cnJlbnRNYXNrO1xyXG5cdFx0XHRcdFx0dmFyIGRldGFpbHMgPSBuZXcgQ2hhbmdlRGV0YWlscygpO1xyXG5cdFx0XHRcdFx0dmFyIHByZXZNYXNrU3RhdGUgPSBwcmV2TWFzayAmJiBwcmV2TWFzay5zdGF0ZTsgLy8gY2xvbmUgZmxhZ3MgdG8gcHJldmVudCBvdmVyd3JpdGluZyBgX2JlZm9yZVRhaWxTdGF0ZWBcclxuXHJcblx0XHRcdFx0XHR0aGlzLmN1cnJlbnRNYXNrID0gdGhpcy5kb0Rpc3BhdGNoKGFwcGVuZGVkLCBPYmplY3QuYXNzaWduKHt9LCBmbGFncykpOyAvLyByZXN0b3JlIHN0YXRlIGFmdGVyIGRpc3BhdGNoXHJcblxyXG5cdFx0XHRcdFx0aWYgKHRoaXMuY3VycmVudE1hc2spIHtcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuY3VycmVudE1hc2sgIT09IHByZXZNYXNrKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gaWYgbWFzayBjaGFuZ2VkIHJlYXBwbHkgaW5wdXRcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmN1cnJlbnRNYXNrLnJlc2V0KCk7IC8vICRGbG93Rml4TWUgLSBpdCdzIG9rLCB3ZSBkb24ndCBjaGFuZ2UgY3VycmVudCBtYXNrIGFib3ZlXHJcblxyXG5cdFx0XHRcdFx0XHRcdHZhciBkID0gdGhpcy5jdXJyZW50TWFzay5hcHBlbmQoaW5zZXJ0VmFsdWUsIHtcclxuXHRcdFx0XHRcdFx0XHRcdHJhdzogdHJ1ZVxyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdGRldGFpbHMudGFpbFNoaWZ0ID0gZC5pbnNlcnRlZC5sZW5ndGggLSBwcmV2VmFsdWVCZWZvcmVUYWlsLmxlbmd0aDtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKHRhaWxWYWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gJEZsb3dGaXhNZSAtIGl0J3Mgb2ssIHdlIGRvbid0IGNoYW5nZSBjdXJyZW50IG1hc2sgYWJvdmVcclxuXHRcdFx0XHRcdFx0XHRcdGRldGFpbHMudGFpbFNoaWZ0ICs9IHRoaXMuY3VycmVudE1hc2suYXBwZW5kKHRhaWxWYWx1ZSwge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyYXc6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHRhaWw6IHRydWVcclxuXHRcdFx0XHRcdFx0XHRcdH0pLnRhaWxTaGlmdDtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gRGlzcGF0Y2ggY2FuIGRvIHNvbWV0aGluZyBiYWQgd2l0aCBzdGF0ZSwgc29cclxuXHRcdFx0XHRcdFx0XHQvLyByZXN0b3JlIHByZXYgbWFzayBzdGF0ZVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuY3VycmVudE1hc2suc3RhdGUgPSBwcmV2TWFza1N0YXRlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGRldGFpbHM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIl9hcHBlbmRQbGFjZWhvbGRlclwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kUGxhY2Vob2xkZXIoKSB7XHJcblx0XHRcdFx0XHR2YXIgZGV0YWlscyA9IHRoaXMuX2FwcGx5RGlzcGF0Y2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcblx0XHRcdFx0XHRpZiAodGhpcy5jdXJyZW50TWFzaykge1xyXG5cdFx0XHRcdFx0XHRkZXRhaWxzLmFnZ3JlZ2F0ZSh0aGlzLmN1cnJlbnRNYXNrLl9hcHBlbmRQbGFjZWhvbGRlcigpKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gZGV0YWlscztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJkb0Rpc3BhdGNoXCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGRvRGlzcGF0Y2goYXBwZW5kZWQpIHtcclxuXHRcdFx0XHRcdHZhciBmbGFncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kaXNwYXRjaChhcHBlbmRlZCwgdGhpcywgZmxhZ3MpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcImRvVmFsaWRhdGVcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9WYWxpZGF0ZSgpIHtcclxuXHRcdFx0XHRcdHZhciBfZ2V0MiwgX3RoaXMkY3VycmVudE1hc2syO1xyXG5cclxuXHRcdFx0XHRcdGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xyXG5cdFx0XHRcdFx0XHRhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHJldHVybiAoX2dldDIgPSBfZ2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWREeW5hbWljLnByb3RvdHlwZSksIFwiZG9WYWxpZGF0ZVwiLCB0aGlzKSkuY2FsbC5hcHBseShfZ2V0MiwgW3RoaXNdLmNvbmNhdChhcmdzKSkgJiYgKCF0aGlzLmN1cnJlbnRNYXNrIHx8IChfdGhpcyRjdXJyZW50TWFzazIgPSB0aGlzLmN1cnJlbnRNYXNrKS5kb1ZhbGlkYXRlLmFwcGx5KF90aGlzJGN1cnJlbnRNYXNrMiwgYXJncykpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInJlc2V0XCIsXHJcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuY3VycmVudE1hc2spIHRoaXMuY3VycmVudE1hc2sucmVzZXQoKTtcclxuXHRcdFx0XHRcdHRoaXMuY29tcGlsZWRNYXNrcy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBtLnJlc2V0KCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJyZW1vdmVcIixcclxuXHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XHJcblx0XHRcdFx0XHR2YXIgZGV0YWlscyA9IG5ldyBDaGFuZ2VEZXRhaWxzKCk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHRoaXMuY3VycmVudE1hc2spIHtcclxuXHRcdFx0XHRcdFx0dmFyIF90aGlzJGN1cnJlbnRNYXNrMztcclxuXHJcblx0XHRcdFx0XHRcdGRldGFpbHMuYWdncmVnYXRlKChfdGhpcyRjdXJyZW50TWFzazMgPSB0aGlzLmN1cnJlbnRNYXNrKS5yZW1vdmUuYXBwbHkoX3RoaXMkY3VycmVudE1hc2szLCBhcmd1bWVudHMpKSAvLyB1cGRhdGUgd2l0aCBkaXNwYXRjaFxyXG5cdFx0XHRcdFx0XHRcdC5hZ2dyZWdhdGUodGhpcy5fYXBwbHlEaXNwYXRjaCgpKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gZGV0YWlscztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJleHRyYWN0SW5wdXRcIixcclxuXHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBleHRyYWN0SW5wdXQoKSB7XHJcblx0XHRcdFx0XHR2YXIgX3RoaXMkY3VycmVudE1hc2s0O1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRNYXNrID8gKF90aGlzJGN1cnJlbnRNYXNrNCA9IHRoaXMuY3VycmVudE1hc2spLmV4dHJhY3RJbnB1dC5hcHBseShfdGhpcyRjdXJyZW50TWFzazQsIGFyZ3VtZW50cykgOiAnJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJleHRyYWN0VGFpbFwiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBleHRyYWN0VGFpbCgpIHtcclxuXHRcdFx0XHRcdHZhciBfdGhpcyRjdXJyZW50TWFzazUsIF9nZXQzO1xyXG5cclxuXHRcdFx0XHRcdGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xyXG5cdFx0XHRcdFx0XHRhcmdzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY3VycmVudE1hc2sgPyAoX3RoaXMkY3VycmVudE1hc2s1ID0gdGhpcy5jdXJyZW50TWFzaykuZXh0cmFjdFRhaWwuYXBwbHkoX3RoaXMkY3VycmVudE1hc2s1LCBhcmdzKSA6IChfZ2V0MyA9IF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZER5bmFtaWMucHJvdG90eXBlKSwgXCJleHRyYWN0VGFpbFwiLCB0aGlzKSkuY2FsbC5hcHBseShfZ2V0MywgW3RoaXNdLmNvbmNhdChhcmdzKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiZG9Db21taXRcIixcclxuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gZG9Db21taXQoKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5jdXJyZW50TWFzaykgdGhpcy5jdXJyZW50TWFzay5kb0NvbW1pdCgpO1xyXG5cclxuXHRcdFx0XHRcdF9nZXQoX2dldFByb3RvdHlwZU9mKE1hc2tlZER5bmFtaWMucHJvdG90eXBlKSwgXCJkb0NvbW1pdFwiLCB0aGlzKS5jYWxsKHRoaXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcIm5lYXJlc3RJbnB1dFBvc1wiLFxyXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiBuZWFyZXN0SW5wdXRQb3MoKSB7XHJcblx0XHRcdFx0XHR2YXIgX3RoaXMkY3VycmVudE1hc2s2LCBfZ2V0NDtcclxuXHJcblx0XHRcdFx0XHRmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjMpLCBfa2V5MyA9IDA7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcclxuXHRcdFx0XHRcdFx0YXJnc1tfa2V5M10gPSBhcmd1bWVudHNbX2tleTNdO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRNYXNrID8gKF90aGlzJGN1cnJlbnRNYXNrNiA9IHRoaXMuY3VycmVudE1hc2spLm5lYXJlc3RJbnB1dFBvcy5hcHBseShfdGhpcyRjdXJyZW50TWFzazYsIGFyZ3MpIDogKF9nZXQ0ID0gX2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkRHluYW1pYy5wcm90b3R5cGUpLCBcIm5lYXJlc3RJbnB1dFBvc1wiLCB0aGlzKSkuY2FsbC5hcHBseShfZ2V0NCwgW3RoaXNdLmNvbmNhdChhcmdzKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInZhbHVlXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5jdXJyZW50TWFzayA/IHRoaXMuY3VycmVudE1hc2sudmFsdWUgOiAnJztcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XHJcblx0XHRcdFx0XHRfc2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWREeW5hbWljLnByb3RvdHlwZSksIFwidmFsdWVcIiwgdmFsdWUsIHRoaXMsIHRydWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgIEBvdmVycmlkZVxyXG5cdFx0XHRcdCovXHJcblxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInVubWFza2VkVmFsdWVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRNYXNrID8gdGhpcy5jdXJyZW50TWFzay51bm1hc2tlZFZhbHVlIDogJyc7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uIHNldCh1bm1hc2tlZFZhbHVlKSB7XHJcblx0XHRcdFx0XHRfc2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWREeW5hbWljLnByb3RvdHlwZSksIFwidW5tYXNrZWRWYWx1ZVwiLCB1bm1hc2tlZFZhbHVlLCB0aGlzLCB0cnVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyoqXHJcblx0XHRcdFx0ICBAb3ZlcnJpZGVcclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJ0eXBlZFZhbHVlXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5jdXJyZW50TWFzayA/IHRoaXMuY3VycmVudE1hc2sudHlwZWRWYWx1ZSA6ICcnO1xyXG5cdFx0XHRcdH0gLy8gcHJvYmFibHkgdHlwZWRWYWx1ZSBzaG91bGQgbm90IGJlIHVzZWQgd2l0aCBkeW5hbWljXHJcblx0XHRcdFx0LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XHJcblx0XHRcdFx0XHR2YXIgdW5tYXNrZWRWYWx1ZSA9IFN0cmluZyh2YWx1ZSk7IC8vIGRvdWJsZSBjaGVjayBpdFxyXG5cclxuXHRcdFx0XHRcdGlmICh0aGlzLmN1cnJlbnRNYXNrKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuY3VycmVudE1hc2sudHlwZWRWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHR1bm1hc2tlZFZhbHVlID0gdGhpcy5jdXJyZW50TWFzay51bm1hc2tlZFZhbHVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHRoaXMudW5tYXNrZWRWYWx1ZSA9IHVubWFza2VkVmFsdWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qKlxyXG5cdFx0XHRcdCAgQG92ZXJyaWRlXHJcblx0XHRcdFx0Ki9cclxuXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRrZXk6IFwiaXNDb21wbGV0ZVwiLFxyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuICEhdGhpcy5jdXJyZW50TWFzayAmJiB0aGlzLmN1cnJlbnRNYXNrLmlzQ29tcGxldGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0a2V5OiBcInN0YXRlXCIsXHJcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgX2dldChfZ2V0UHJvdG90eXBlT2YoTWFza2VkRHluYW1pYy5wcm90b3R5cGUpLCBcInN0YXRlXCIsIHRoaXMpLCB7XHJcblx0XHRcdFx0XHRcdF9yYXdJbnB1dFZhbHVlOiB0aGlzLnJhd0lucHV0VmFsdWUsXHJcblx0XHRcdFx0XHRcdGNvbXBpbGVkTWFza3M6IHRoaXMuY29tcGlsZWRNYXNrcy5tYXAoZnVuY3Rpb24gKG0pIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbS5zdGF0ZTtcclxuXHRcdFx0XHRcdFx0fSksXHJcblx0XHRcdFx0XHRcdGN1cnJlbnRNYXNrUmVmOiB0aGlzLmN1cnJlbnRNYXNrLFxyXG5cdFx0XHRcdFx0XHRjdXJyZW50TWFzazogdGhpcy5jdXJyZW50TWFzayAmJiB0aGlzLmN1cnJlbnRNYXNrLnN0YXRlXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHN0YXRlKSB7XHJcblx0XHRcdFx0XHR2YXIgY29tcGlsZWRNYXNrcyA9IHN0YXRlLmNvbXBpbGVkTWFza3MsXHJcblx0XHRcdFx0XHRcdGN1cnJlbnRNYXNrUmVmID0gc3RhdGUuY3VycmVudE1hc2tSZWYsXHJcblx0XHRcdFx0XHRcdGN1cnJlbnRNYXNrID0gc3RhdGUuY3VycmVudE1hc2ssXHJcblx0XHRcdFx0XHRcdG1hc2tlZFN0YXRlID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHN0YXRlLCBbXCJjb21waWxlZE1hc2tzXCIsIFwiY3VycmVudE1hc2tSZWZcIiwgXCJjdXJyZW50TWFza1wiXSk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5jb21waWxlZE1hc2tzLmZvckVhY2goZnVuY3Rpb24gKG0sIG1pKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBtLnN0YXRlID0gY29tcGlsZWRNYXNrc1ttaV07XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRpZiAoY3VycmVudE1hc2tSZWYgIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmN1cnJlbnRNYXNrID0gY3VycmVudE1hc2tSZWY7XHJcblx0XHRcdFx0XHRcdHRoaXMuY3VycmVudE1hc2suc3RhdGUgPSBjdXJyZW50TWFzaztcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRfc2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWREeW5hbWljLnByb3RvdHlwZSksIFwic3RhdGVcIiwgbWFza2VkU3RhdGUsIHRoaXMsIHRydWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdGtleTogXCJvdmVyd3JpdGVcIixcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRNYXNrID8gdGhpcy5jdXJyZW50TWFzay5vdmVyd3JpdGUgOiBfZ2V0KF9nZXRQcm90b3R5cGVPZihNYXNrZWREeW5hbWljLnByb3RvdHlwZSksIFwib3ZlcndyaXRlXCIsIHRoaXMpO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQob3ZlcndyaXRlKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ1wib3ZlcndyaXRlXCIgb3B0aW9uIGlzIG5vdCBhdmFpbGFibGUgaW4gZHluYW1pYyBtYXNrLCB1c2UgdGhpcyBvcHRpb24gaW4gc2libGluZ3MnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1dKTtcclxuXHJcblx0XHRcdHJldHVybiBNYXNrZWREeW5hbWljO1xyXG5cdFx0fShNYXNrZWQpO1xyXG5cdE1hc2tlZER5bmFtaWMuREVGQVVMVFMgPSB7XHJcblx0XHRkaXNwYXRjaDogZnVuY3Rpb24gZGlzcGF0Y2goYXBwZW5kZWQsIG1hc2tlZCwgZmxhZ3MpIHtcclxuXHRcdFx0aWYgKCFtYXNrZWQuY29tcGlsZWRNYXNrcy5sZW5ndGgpIHJldHVybjtcclxuXHRcdFx0dmFyIGlucHV0VmFsdWUgPSBtYXNrZWQucmF3SW5wdXRWYWx1ZTsgLy8gc2ltdWxhdGUgaW5wdXRcclxuXHJcblx0XHRcdHZhciBpbnB1dHMgPSBtYXNrZWQuY29tcGlsZWRNYXNrcy5tYXAoZnVuY3Rpb24gKG0sIGluZGV4KSB7XHJcblx0XHRcdFx0bS5yZXNldCgpO1xyXG5cdFx0XHRcdG0uYXBwZW5kKGlucHV0VmFsdWUsIHtcclxuXHRcdFx0XHRcdHJhdzogdHJ1ZVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdG0uYXBwZW5kKGFwcGVuZGVkLCBmbGFncyk7XHJcblx0XHRcdFx0dmFyIHdlaWdodCA9IG0ucmF3SW5wdXRWYWx1ZS5sZW5ndGg7XHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdHdlaWdodDogd2VpZ2h0LFxyXG5cdFx0XHRcdFx0aW5kZXg6IGluZGV4XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSk7IC8vIHBvcCBtYXNrcyB3aXRoIGxvbmdlciB2YWx1ZXMgZmlyc3RcclxuXHJcblx0XHRcdGlucHV0cy5zb3J0KGZ1bmN0aW9uIChpMSwgaTIpIHtcclxuXHRcdFx0XHRyZXR1cm4gaTIud2VpZ2h0IC0gaTEud2VpZ2h0O1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIG1hc2tlZC5jb21waWxlZE1hc2tzW2lucHV0c1swXS5pbmRleF07XHJcblx0XHR9XHJcblx0fTtcclxuXHRJTWFzay5NYXNrZWREeW5hbWljID0gTWFza2VkRHluYW1pYztcclxuXHJcblx0LyoqIE1hc2sgcGlwZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIHR5cGVzICovXHJcblxyXG5cdHZhciBQSVBFX1RZUEUgPSB7XHJcblx0XHRNQVNLRUQ6ICd2YWx1ZScsXHJcblx0XHRVTk1BU0tFRDogJ3VubWFza2VkVmFsdWUnLFxyXG5cdFx0VFlQRUQ6ICd0eXBlZFZhbHVlJ1xyXG5cdH07XHJcblx0LyoqIENyZWF0ZXMgbmV3IHBpcGUgZnVuY3Rpb24gZGVwZW5kaW5nIG9uIG1hc2sgdHlwZSwgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBvcHRpb25zICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZVBpcGUobWFzaykge1xyXG5cdFx0dmFyIGZyb20gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IFBJUEVfVFlQRS5NQVNLRUQ7XHJcblx0XHR2YXIgdG8gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IFBJUEVfVFlQRS5NQVNLRUQ7XHJcblx0XHR2YXIgbWFza2VkID0gY3JlYXRlTWFzayhtYXNrKTtcclxuXHRcdHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIG1hc2tlZC5ydW5Jc29sYXRlZChmdW5jdGlvbiAobSkge1xyXG5cdFx0XHRcdG1bZnJvbV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRyZXR1cm4gbVt0b107XHJcblx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHR9XHJcblx0LyoqIFBpcGVzIHZhbHVlIHRocm91Z2ggbWFzayBkZXBlbmRpbmcgb24gbWFzayB0eXBlLCBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIG9wdGlvbnMgKi9cclxuXHJcblx0ZnVuY3Rpb24gcGlwZSh2YWx1ZSkge1xyXG5cdFx0Zm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHBpcGVBcmdzID0gbmV3IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcclxuXHRcdFx0cGlwZUFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjcmVhdGVQaXBlLmFwcGx5KHZvaWQgMCwgcGlwZUFyZ3MpKHZhbHVlKTtcclxuXHR9XHJcblx0SU1hc2suUElQRV9UWVBFID0gUElQRV9UWVBFO1xyXG5cdElNYXNrLmNyZWF0ZVBpcGUgPSBjcmVhdGVQaXBlO1xyXG5cdElNYXNrLnBpcGUgPSBwaXBlO1xyXG5cclxuXHRnbG9iYWxUaGlzLklNYXNrID0gSU1hc2s7XHJcblxyXG5cdGV4cG9ydHMuSFRNTENvbnRlbnRlZGl0YWJsZU1hc2tFbGVtZW50ID0gSFRNTENvbnRlbnRlZGl0YWJsZU1hc2tFbGVtZW50O1xyXG5cdGV4cG9ydHMuSFRNTE1hc2tFbGVtZW50ID0gSFRNTE1hc2tFbGVtZW50O1xyXG5cdGV4cG9ydHMuSW5wdXRNYXNrID0gSW5wdXRNYXNrO1xyXG5cdGV4cG9ydHMuTWFza0VsZW1lbnQgPSBNYXNrRWxlbWVudDtcclxuXHRleHBvcnRzLk1hc2tlZCA9IE1hc2tlZDtcclxuXHRleHBvcnRzLk1hc2tlZERhdGUgPSBNYXNrZWREYXRlO1xyXG5cdGV4cG9ydHMuTWFza2VkRHluYW1pYyA9IE1hc2tlZER5bmFtaWM7XHJcblx0ZXhwb3J0cy5NYXNrZWRFbnVtID0gTWFza2VkRW51bTtcclxuXHRleHBvcnRzLk1hc2tlZEZ1bmN0aW9uID0gTWFza2VkRnVuY3Rpb247XHJcblx0ZXhwb3J0cy5NYXNrZWROdW1iZXIgPSBNYXNrZWROdW1iZXI7XHJcblx0ZXhwb3J0cy5NYXNrZWRQYXR0ZXJuID0gTWFza2VkUGF0dGVybjtcclxuXHRleHBvcnRzLk1hc2tlZFJhbmdlID0gTWFza2VkUmFuZ2U7XHJcblx0ZXhwb3J0cy5NYXNrZWRSZWdFeHAgPSBNYXNrZWRSZWdFeHA7XHJcblx0ZXhwb3J0cy5QSVBFX1RZUEUgPSBQSVBFX1RZUEU7XHJcblx0ZXhwb3J0cy5jcmVhdGVNYXNrID0gY3JlYXRlTWFzaztcclxuXHRleHBvcnRzLmNyZWF0ZVBpcGUgPSBjcmVhdGVQaXBlO1xyXG5cdGV4cG9ydHMuZGVmYXVsdCA9IElNYXNrO1xyXG5cdGV4cG9ydHMucGlwZSA9IHBpcGU7XHJcblxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XHJcblxyXG59KSkpOyJdLCJmaWxlIjoicGx1Z2lucy9pbWFzay5qcyJ9