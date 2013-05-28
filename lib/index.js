#!/usr/bin/env node

// External modules
var node_path = require('node_path');
var node_fs = require('fs');


var fs = module.exports = {};

// so you can use 
// 		var fs = require('fs-more').sync;
//		fs.readJSON('package.json');
var sync = fs.sync = {};
var async = fs.async = {};

// explode built-in fs methods to `fs-more`
fs.__proto__ = node_fs;
