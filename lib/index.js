"use strict";
exports.__esModule = true;
var RESERVED_PROP = {
    GEN_CONFIG: '$config',
    DELETE: '$delete'
};
var NOOP = void 0;
var isObject = function (obj) { return Boolean(obj && typeof obj === 'object'); };
function Composer(options) {
    if (options === void 0) { options = {}; }
    var propChain = [];
    var emptyPropChain = function () {
        propChain = [];
    };
    var propSetter = function (value) {
        var currentProp = options;
        var propName = propChain.shift();
        while (propName
            && propChain.length
            && Reflect.get(currentProp, propName) !== NOOP) {
            currentProp = Reflect.get(currentProp, propName);
            propName = propChain.shift();
        }
        while (propName) {
            var propValue = propChain.length
                ? Object.create({})
                : value;
            Reflect.set(currentProp, propName, propValue);
            currentProp = Reflect.get(currentProp, propName);
            propName = propChain.shift();
        }
        emptyPropChain();
        return new Proxy(propSetter, handler);
    };
    var propsDeleter = function () {
        var currentProp = options;
        var propName = propChain.shift();
        while (propName
            && currentProp
            && propChain.length
            && Reflect.has(currentProp, propName)) {
            currentProp = Reflect.get(currentProp, propName);
            propName = propChain.shift();
        }
        if (!propChain.length && isObject(currentProp) && propName) {
            Reflect.deleteProperty(currentProp, propName);
        }
        emptyPropChain();
        return new Proxy(propSetter, handler);
    };
    var handler = {
        get: function (target, key) {
            if (Object.values(RESERVED_PROP).indexOf(key) === -1) {
                propChain.push(key);
            }
            switch (key) {
                case RESERVED_PROP.GEN_CONFIG: {
                    return function () { return options; };
                }
                case RESERVED_PROP.DELETE: {
                    return new Proxy(propsDeleter, handler);
                }
                default: {
                    return new Proxy(propSetter, handler);
                }
            }
        }
    };
    return new Proxy(propSetter, handler);
}
exports["default"] = Composer;
