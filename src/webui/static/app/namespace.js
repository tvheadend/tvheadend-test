// Create modern namespaces for tvheadend application
Ext.namespace('tvheadend', 'tvheadend.util', 'tvheadend.grid', 'tvheadend.form', 'tvheadend.data');

// Add modern browser compatibility for ExtJS 3.4.1
if (typeof Ext.define === 'undefined') {
    // Provide basic define method for backward compatibility
    Ext.define = function(className, data, createdFn) {
        var parent = data.extend || 'Ext.util.Observable';
        delete data.extend;
        
        // Handle statics
        if (data.statics) {
            var statics = data.statics;
            delete data.statics;
        }
        
        // Create the class using legacy Ext.extend
        if (parent === 'Ext.util.Observable') {
            eval(className + ' = function(config) { Ext.apply(this, config || {}); ' + className + '.superclass.constructor.call(this); };');
            eval('Ext.extend(' + className + ', ' + parent + ', data);');
        } else {
            eval(className + ' = Ext.extend(' + parent + ', data);');
        }
        
        // Apply statics
        if (statics) {
            Ext.apply(eval(className), statics);
        }
        
        if (typeof createdFn === 'function') {
            createdFn.call(eval(className));
        }
        
        return eval(className);
    };
}

// Modern Array method polyfills for older browsers
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg || this, this[i], i, this);
        }
    };
}

if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result.push(callback.call(thisArg || this, this[i], i, this));
        }
        return result;
    };
}

// Modern console polyfill
if (typeof console === 'undefined') {
    window.console = {
        log: function() {},
        warn: function() {},
        error: function() {},
        info: function() {}
    };
}
