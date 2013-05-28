# fs-sync

> fs with more fun

## Getting Started
This module is created for the favor of use of `fs.xxxSync`.

Once `fs-sync` is installed, you can use:

	var fs = require('fs-sync').sync;
	
	if(fs.exists('package.json')){
		var pkg = fs.readJSON('package.json');
	}
	
	// You can also use methods of the built-in `fs`
	
	fs.readFileSync(...);
	
	
## Methods

### fs.copy()

Copy a file or a whole directory to the destination. During this, necessary directories will be created.

#### Syntax
	
	fs.copy(file, destpath, options);
	fs.copy(dir, destpath, options);
	
#### file
Type: `String`

Path of file to be copied

#### options.force
Type: `Boolean`

Default value: `false`

By default, `fs.copy` will not override existed files, set `options.force` as `true` to override.


### fs.expand(patterns, options)

Like `grunt.file.expand`, but the sequence of the arguments is different
	

### fs.write(file, content, options)

### fs.read(file, options)

#### options.encoding
Type: `String`

Default value: `'utf-8'`

### fs.readJSON(file, options)

### fs.delete()

#### Syntax
	
	fs.delete(file)
	fs.delete(dir)


### fs.exists()

`arguments` will be called with `path.join`

### fs.isDir()

### fs.isFile()

### fs.isLink()



	
