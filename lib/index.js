"use strict";
exports.__esModule = true;
var KEY_GEN_CONFIG = 'genConfig';
var KEY_DELETE = 'delete';
var RESERVED_PROP_NAME = [
    KEY_GEN_CONFIG
];
function Composer(options) {
    if (options === void 0) { options = {}; }
    var propChain = [];
    var propSetter = function (value) {
        var currentProp = options;
        var propName = propChain.shift();
        while (propName
            && Reflect.has(currentProp, propName)
            && propChain.length) {
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
        propChain = [];
        return new Proxy(propSetter, handler);
    };
    var handler = {
        get: function (target, key) {
            if (RESERVED_PROP_NAME.indexOf(key) === -1) {
                propChain.push(key);
            }
            switch (key) {
                case KEY_GEN_CONFIG: {
                    return function () { return options; };
                }
                case KEY_DELETE: {
                    // TODO
                    return function () { return options; };
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
