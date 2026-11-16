# freelist
Outsource of Node's internal FreeList module (originally by Ryan Dahl)

	var fl = require("freelist");

	var me = new fl("fralloc", 100, Number);

	me.free(Number(100));
	me.free(Number(101));

	me.alloc(123)
	// 100

	me.alloc(123)
	// 101

	me.alloc(123)
	// 123
