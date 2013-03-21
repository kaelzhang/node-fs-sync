"use strict";

var

fs = require('fs'),
path = require('path'),
minimatch = require('minimatch'),
// iconv = require('iconv'),

REGEX_REPLACE_FILENAME = /[^\/]+$/,
REGEX_MATCH_FILENAME_EXT = /([^\/]+?)(\.[^\/]+)?$/,

REGEX_REPLACE_LEADING_TILDE = /^~/,
REGEX_IS_NODE_REQUIRE_PATH = /^(?:\.\/|\.\.\/|~\/|\/|[a-zA-Z]:\\)/,

HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];


/**
 * @param {string} path
 * @param {string|buffer} content
 */
function writeFileSync(pathname, content, options){
    options || (options = {});

    if(!REGEX_REPLACE_FILENAME.test(path)){
        return false;
    }
    
    var dir = pathname.replace(REGEX_REPLACE_FILENAME, '');
    
    mkdirSync(dir);

    fs.writeFileSync(pathname, content.toString(), options.encoding || 'utf8');
};


function emptyDirSync(root){
    traverseDir(
        root, 
        function(info){
            info.isFile ? fs.unlinkSync(info.fullPath) : fs.rmdirSync(info.fullPath);
        }, {
            upwards: true
        });
};


/**
 * unlike fs.mkdirSync, fs-more.mkdirSync will act as `mkdir -p`
 */
function mkdirSync(dir){
    if(!isDirectory(dir)){
        var SPLITTER = path.sep,
            splits = dir.split(SPLITTER),
            directory_stack = [],
            last,
            pop;
        
        do{
            // last must not be a directory, so pop first
            pop = splits.pop();
            
            pop && directory_stack.push(pop);
            
        }while(splits.length && !isDirectory(last = splits.join(SPLITTER)));
        
        while(directory_stack.length){
            last = path.join(last, directory_stack.pop());
            fs.mkdirSync(last);
        }
    }
};


/**
 * @param {string} root
 * @param {function(file_data)} callback
    file_data {Object}{
        fullPath: {string} full dir path
        relPath: {string} path relative to the root
        path: {string}
        isFile: {boolean=} true if the current item is a normal file
        isDirectory: {boolean=} true if the current item is a directory
    }

 * @param {Object} options {
    upwards: {boolean=} default to downwards
        lib/
            a/
                a.js    
        downwards: a/ -> a.js
        upwards: a.js -> a/
         
    rel: {string=} default to ''
  }
 */
function traverseDir(root, callback, options){
    if(!isDirectory(root)){
        return;
    }

    options || (options = {});

    var dir_content = fs.readdirSync(root),
        rel = options.rel || '',
        upwards = options.upwards;
    
    dir_content.forEach(function(current){
        var full_path = path.join(root, current),
            stat = fs.statSync(full_path);
            
        if(stat.isFile()){
            callback({
                path: current,
                fullPath: full_path,
                relPath: path.join(rel, current),
                isFile: true
            });
            
        }else if(stat.isDirectory()){
            var
            
            param = {
                path: current,
                fullPath: full_path,
                relPath: path.join(rel, current),
                isDirectory: true
            };
        
            !upwards && callback(param);
            traverseDir(full_path, callback, {
                rel: path.join(rel, current),
                upwards: upwards
            });
            
            upwards && callback(param);
        }
    });
};


function ignoreFile(file,ignores){
    return ignores.some(function(ignore){
        return minimatch(file, ignore, { matchBase: true });
    });
}


/**
 * @param {Object} options {
    crop: {boolean=false}
    file_mode: {string}
        'replace': default, replace file
        'both': keep both file if destination already exists, alien file will be saved as <filename> (count).<ext>
        
    dir_mode: {string=merge}
        'merge': default, will merge the directory to the destination folder
        'replace': will replace old folder
 }
 */
function copyDirSync(resource, destination, options){
    options || (options = {});

    if(options.dir_mode === 'replace'){
        emptyDirSync(destination);
    }

    traverseDir(resource, function(info){
        if(info.isFile){
            var
            
            rel_path = info.relPath;

            if(ignoreFile(rel_path,options.ignores)){
                return;
            }

            copyFileSync(path.join(resource, rel_path), path.join(destination, rel_path), {
                mode: options.file_mode,
                encoding: options.encoding
            });
            
        }
    });
};

/**
 * @param {Object} options {
    mode: {string}
        'replace': default
        'both':
 }
 */
function copyFileSync(resource, destination, options){
    var is_success = false,
        fd,
        content;
    
    options || (options = {});
        
    if(isFile(resource)){
        if(options.mode === 'both'){
            destination = getUnconflictFilePathName(destination);
        }
        
        content = fs.readFileSync(resource,options.encoding || "utf8");
        
        writeFileSync(destination, content, {
            encoding: options.encoding
        });
        
        is_success = true;
    }
    
    return is_success;
};


/**
 * /path/to/abc.txt -> exists!
 * /path/to/abc (1).txt -> exists!
 * -> /path/to/abc (2).txt
 */
function getUnconflictFilePathName(pathname){
    function full_path(){
        return pathname_noext + (count ? ' (' + count + ')' : '') + ext;
    };
    
    var 
    
    match = pathname.match(REGEX_MATCH_FILENAME_EXT),
    pathname_noext = match[1],
    count = 0,
    ext = match[2] || '';
    
    while(isFile(full_path())){
        count ++;
    }
    
    return full_path();
};


function isFile(file){
    return fs.existsSync(file) && fs.statSync(file).isFile();
};


function isDirectory(file){
    return fs.existsSync(file) && fs.statSync(file).isDirectory();
};


/**
 * It is weird that nodejs could not `require` user-based paths such as `~/abc`
 * stdPath will convert such paths to absolute paths
 */
function stdPath(pathname){
    // '~/xxx' -> '/User/<myprofile>/'
    pathname = pathname.replace(REGEX_REPLACE_LEADING_TILDE, HOME);
    
    // 'xxx' -> './xxx'
    if(!REGEX_IS_NODE_REQUIRE_PATH.test(pathname)){
        pathname = '.' + path.sep + pathname;
    }
    
    return pathname;
};


function listSync(pos, ret, base){
    base = base || pos;
    var stats,info;
    
    if(!fs.existsSync(pos)){
        return ret;
    }
    
    stats = fs.lstatSync(pos),
    info = {
        path: pos.split(base)[1],
        name: path.basename(pos),
        basename: path.basename(pos,path.extname(pos))
    };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = [];
        fs.readdirSync(pos).forEach(function(child) {
            info.children.push( listSync(pos + '/' + child,null,base) );
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }


    return info;
}


module.exports = {
    copyFileSync    : copyFileSync,
    copyDirSync     : copyDirSync,
    listSync        : listSync,
    writeFileSync   : writeFileSync,
    traverseDir     : traverseDir,
    emptyDirSync    : emptyDirSync,
    mkdirSync       : mkdirSync,
    isFile          : isFile,
    isDirectory     : isDirectory,
    stdPath         : stdPath,
};

