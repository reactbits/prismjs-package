
return Prism;
};

if (typeof define === 'function' && define.amd) {
	define(function() { return prism({}, typeof window !== 'undefined' ? window : global); });
} else if (typeof module === 'object' && module.exports) {
	module.exports = prism({}, typeof window !== 'undefined' ? window : global);
} else {
	var w = typeof window !== 'undefined' ? window : global;
	prism(this || w, w);
}
