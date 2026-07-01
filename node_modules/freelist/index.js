var FreeList = (function() {
	function FreeList(name, max, constructor) {
		this.name = name;
		this.max = max;
		this.constructor = constructor != null ? constructor : function() {};
		this.list = [];
	}

	FreeList.prototype.alloc = function() {
		if (this.list.length) {
			return this.list.shift();
		} else {
			return this.constructor.apply(this, arguments);
		}
	};

	FreeList.prototype.free = function(obj) {
		if (this.list.length < this.max) {
			this.list.push(obj);
			return true;
		} else {
			return false;
		}
	};

	return FreeList;
})();

// remain backward compatible
FreeList.FreeList = FreeList;

module.exports = FreeList;
