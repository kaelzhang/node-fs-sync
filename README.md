# fs-more

> fs with more fun

## Getting Started
This module is created for the favor of use of `fs.xxxSync`.

Once `fs-more` is installed, you can use:

	var fs = require('fs-more').sync;
	
	if(fs.exists('package.json')){
		var pkg = fs.readJSON('package.json');
	}
	

## Notice
For version 1.0.x, methods of `require('fs-more').async` have not implemented yet.
	



	
