/*jshint esnext: true */
/**
 * @module fs-cli
 */
/*!
 * Simple filesystem manipulation as in command line for nodejs
 * All functions are synchronous.
 * This was created specially for the needs of writing CLI tools.
 * Author was totally abused of all that async stuff you have writing CLI
 * apps using nodejs, so no async versions would be ever exists here!
 *
 * @author Mykhailo Stadnyk <mikhus@gmail.com>
 */

var p = require('path');
var fs = require('fs');
var tgz = require('tar.gz');
var Zip = require('adm-zip');
var glob = require('glob');
var deasync = require('deasync');

const SEP = p.sep;
const SEP_RX = /\/|\\/;

/**
 * Error keeping handler
 *
 * @type {Error|null}
 * @access private
 */
var lastError = null;

/**
 * Returns path relative to given base. If base is not specifies will return
 * path relative to current directory
 *
 * @param {string} path - path which should be made relative
 * @param {string} [base] - base path, default is .
 * @returns {string}
 * @access public
 * @static
 */
function relpath (path, base) {
    'use strict';

    base = realpath(base || '.');
    path = realpath(path);

    return p.relative(base, path);
}

/**
 * Pipes given read stream to given write stream
 *
 * Returns processing flags
 * @param {Stream} read
 * @param {Stream} write
 * @returns {{ err: {Error}, done: {boolean} }}
 * @access private
 * @static
 */
function pipeSync (read, write) {
    'use strict';

    var err = null;
    var done = false;

    read.on('error', function (e) {
        err = e;
        done = true;
        write.end();
    });

    write.on('error', function (e) {
        err = e;
        done = true;

        if (read.destroy) {
            read.destroy();
        }

        else if (read.close) {
            read.close();
        }
    });

    write.on('close', function (e) {
        err = e;
        done = true;
    });

    read.pipe(write);

    deasync.loopWhile(function () {
        return !done;
    });

    if (err) {
        lastError = err;
    }

    return !err;
}

/**
 * Sets file permissions, same as native fs.chmod does
 *
 * <caption>Glob Patterns:</caption>
 * It is possible to apply permissions to files on a file system
 * by a glob pattern,for example, you may want to apply specific permissions
 * to all shell scripts in a current directory, it's as easy as:
 *
 * @example
 * var fs = require('fs-cli');
 * fs.chmod('./*.sh', 755);
 *
 * @param {string} path - path or glob pattern to file/directory
 * @param {number} mode - permissions to apply
 * @returns {boolean}
 * @access public
 * @static
 */
function chmod (path, mode) {
    'use strict';

    try {
        fs.chmodSync(path, mode);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * Recursively change permissions if a given path is directory
 *
 * @param {string} path - path or glob pattern to file/directory
 * @param {number} mode - permissions to apply
 * @returns {boolean}
 * @access public
 * @static
 */
function rchmod (path, mode) {
    'use strict';

    var entries, entry, res;
    var stat = exists(path);

    if (!stat) {
        lastError = new Error('Chmod error: source path "' + path + '" ' +
            'does not exist!');
        return false;
    }

    res = chmod(path, mode);

    if (!res || !stat.isDirectory()) {
        return res;
    }

    if (!(entries = list(path))) {
        return false;
    }

    for (entry in entries) {
        if (!rchmod(path + SEP + entry, mode)) {
            return false;
        }
    }

    return res;
}

/**
 * Similar to native fs.chown
 *
 * @param {string} path - path glob pattern
 * @param {string|number} uid - user identifier
 * @param {string|number} gid - group identifier
 * @returns {boolean}
 * @access public
 * @static
 */
function chown (path, uid, gid) {
    'use strict';

    try {
        fs.chownSync(path, uid, gid);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * Recursively change the owher for the path and all its descendants
 *
 * @param {string} path - path or glob pattern
 * @param {string|number} uid
 * @param {string|number} gid
 * @returns {boolean}
 * @access pubic
 * @static
 */
function rchown (path, uid, gid) {
    'use strict';

    var entries, entry, res;
    var stat = exists(path);

    if (!stat) {
        lastError = new Error('Chown error: source path "' + path + '" ' +
            'does not exist!');
        return false;
    }

    res = chown(path, uid, gid);

    if (!res || !stat.isDirectory()) {
        return res;
    }

    if (!(entries = list(path))) {
        return false;
    }

    for (entry in entries) {
        if (!rchown(path + SEP + entry, uid, gid)) {
            return false;
        }
    }

    return res;
}

// jscs:disable maximumLineLength
/**
 * Opens a file and returns it's descriptor or false if open() fails
 * All parameters are similar to native fs.open
 *
 * @see {@link https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback}
 * @param {string} path
 * @param {string} [flags]
 * @param {number} [mode]
 * @returns {number|false}
 * @access public
 * @static
 */
// jscs:enable maximumLineLength
function open (path, flags, mode) {
    'use strict';

    try {
        return fs.openSync(path, flags, mode);
    }

    catch (err) {
        lastError = err;
        return false;
    }
}

/**
 * Closes the given file descriptor
 *
 * @param {number} - file descriptor
 * @returns {boolean}
 * @access public
 * @static
 */
function close (fd) {
    'use strict';

    try {
        fs.closeSync(fd);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * Checks if a given path exists on a file system.
 * If exists, returns fs.Stat object, otherwise will return null
 *
 * @param {string} path
 * @returns {fs.Stat|null}
 */
function exists (path) {
    'use strict';

    try {
        return fs.statSync(path);
    }

    catch (err) {
        return null;
    }
}

/**
 *
 * @param {string} path - path to the file to read from
 * @param {Object} [options] - the same as for native fs.readFile
 * @returns {string|null}
 * @access public
 * @static
 */
function readfile (path, options) {
    'use strict';

    path = realpath(path);

    try {
        return fs.readFileSync(path, options);
    }

    catch (err) {
        lastError = err;
        return null;
    }
}

/**
 * Writes a given data to a given file
 * If path to file does not exists, tries to create it recursively
 *
 * @example
 * var fs = require('fs');
 * fs.writefile('./dummy/file.txt', 'Hello, world!');
 *
 * @param {string} path - path to file
 * @param {string} data - content to put into file
 * @param {Object} [options] - the same as for native fs.writeFile
 * @returns {boolean}
 * @access public
 * @static
 */
function writefile (path, data, options) {
    'use strict';

    data = data || '';
    path = realpath(path);

    var dir = p.dirname(path);

    if (!exists(dir) && !mkdir(dir)) {
        return false;
    }

    try {
        fs.writeFileSync(path, data, options);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * Copies a file from src to dst synchronously
 *
 * @param {string} src
 * @param {string} dst
 * @returns {boolean}
 * @access private
 * @static
 */
function copySync (src, dst) {
    'use strict';

    var dir, stat, res;

    src = realpath(src);
    dst = realpath(dst);

    if (!exists(src)) {
        lastError = new Error('Copy error: source file "' + src +
            '" does not exists!');
        return false;
    }

    stat = exists(dst);

    if (stat && stat.isDirectory()) {
        dst += SEP + p.basename(src);
        stat = exists(dst);
    }

    dir = p.dirname(dst);

    if (!stat && !exists(dir) && !mkdir(dir)) {
        return false;
    }

    return pipeSync(
        fs.createReadStream(src, 'binary'),
        fs.createWriteStream(dst, 'binary')
    );
}

/**
 * Copy everything from given src path to dst path
 * If a given src is directory it will copy everything recursively.
 * If dst dir dos not exist it will attempt to create it.
 * The overwrite argument specifies if there is a need to overwrite the existing
 * files. By default is true.
 *
 * @example
 * var fs = require('fs-cli');
 * // this will copy folder recursively
 * fs.cp('./source/folder', './destination/folder');
 *
 * @param {string} src - source file or folder to copy
 * @param {string} dst - destination path
 * @param {boolean} [overwrite] - [optional], default is true
 * @access public
 * @static
 */
function cp (src, dst, overwrite) {
    'use strict';

    dst = realpath(dst);
    src = realpath(src);

    if (overwrite === undefined) {
        overwrite = true;
    }

    var name = p.basename(src);
    var entries, entry;
    var dstExists = exists(dst);
    var stat = exists(src);

    if (!stat) {
        lastError = new Error('Copy error: source path "' + src + '" ' +
            'does not exist!');
        return false;
    }

    if (!stat.isDirectory()) {
        // file-like object - simple copy
        if (dstExists && !overwrite) {
            return true;
        }

        return copySync(src, dst);
    }

    // directory - copy recursively
    if (!dstExists && !mkdir(dst)) {
        return false;
    }

    if (!(entries = list(src))) {
        return false;
    }

    // recursive copy
    for (entry in entries) {
        if (!cp(src + SEP + entry, dst + SEP + entry, overwrite)) {
            return false;
        }
    }

    return true;
}

/**
 * Moves file or folder from src to dst
 * If dirs in dst path are not exist, it will attemp recursively to create
 * missing.
 *
 * @example
 * var fs = require('fs-cli);
 * fs.mv('./doc', './the/doc');
 *
 * @param {string} src - source file or folder
 * @param {string} dst - destination path
 * @returns {boolean}
 * @access public
 * @static
 */
function mv (src, dst) {
    'use strict';

    src = realpath(src);
    dst = realpath(dst);

    var stat = exists(src);
    var dname = p.basename(dst);

    dst = p.dirname(dst);

    if (!stat) {
        lastError = new Error('Move error: source path "' + src + '" ' +
            'does not exist!');
        return false;
    }

    if (stat.isDirectory() && !exists(dst) && !mkdir(dst)) {
        return false;
    }

    dst += SEP + dname;

    try {
        fs.renameSync(src, dst);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * Removes everything under path recursively. It works the same as rm -rf
 * command on Unix-like systems
 *
 * @example
 * var dir = './some';
 * var path = dir + '/dummy/path';
 * fs.mkdir(path);
 * fs.touch(path + '/file.txt');
 * console.log('dir exists:', fs.exists(dir));
 * console.log('path exists:', fs.exists(path));
 * console.log('file exists:', fs.exists(dir + '/file.txt'));
 * fs.rm(dir);
 * console.log('file exists:', fs.exists(dir + '/file.txt'));
 * console.log('path exists:', fs.exists(path));
 * console.log('dir exists:', fs.exists(dir));
 * console.log(fs.error());
 *
 * @param {string} path - path to be removed
 * @returns {boolean}
 * @access public
 * @static
 */
function rm (path) {
    'use strict';

    path = realpath(path);

    var entries, entry;
    var stat = exists(path);

    if (!stat) {
        // someone did our job already? well done!
        return true;
    }

    if (!stat.isDirectory()) {
        try {
            fs.unlinkSync(path);
        }

        catch (err) {
            lastError = err;
            return false;
        }

        return true;
    }

    entries = list(path);

    if (!entries) {
        return false;
    }

    for (entry in entries) {
        try {
            if (!rm(path + SEP + entry)) {
                return false;
            }
        }

        catch (err) {
            lastError = err;
            return false;
        }
    }

    try {
        fs.rmdirSync(path);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * It's almost the same as native fs.readdirSync, but it also can
 * return fs.Stats on each entry in the dir. It's slower, if you need to get
 * just names, but in most cases it is much useful. Stats are obtained with
 * the given method.
 * "stat" method will follow symlinks to stat their targets, "lstat" method will
 * stat symlinks themselves, "none" (by default) - won't stat anything.
 *
 * <pre>
 * <caption>Possible methods:</caption>
 * {string} = "stat"|"lstat"|"none", default: "none"
 * </pre>
 *
 * <pre>
 * <caption>Return value:</caption>
 * { filename: {fs.Stat}, ... }
 * </pre>
 *
 * @example
 * var fs = require('fs-cli');
 * var entries = fs.list('.', 'lstat');
 * if (!entries) {
 *  console.log(fs.error());
 *  process.exit();
 * }
 * for (var entry in entries) {
 *  var stats = entries[entry];
 *  var type = stats.isDirectory() ? 'directory' :
 *      stats.isSymbolicLink() ? 'symlink' :
 *      stats.isFile() ? 'file' : 'other';
 *  console.log('entry:', entry, ', type:', type);
 * };
 *
 * @param {string} path - path to directory to be listed
 * @param {string} [method] - stat method ('stat'|'lstat'|'none',default:'none')
 * @param {boolean} [all] - if true, will not omit listing of '.' and '..' dirs
 * @returns {Object|null}
 */
function list (path, method, all) {
    'use strict';

    path = realpath(path);

    if (!~['stat', 'lstat', 'none'].indexOf(method)) {
        method = 'none';
    }

    var mstat = function (itemPath) {
        return method != 'none' && fs[method + 'Sync'] ?
            fs[method + 'Sync'](itemPath) :
            {};
    };

    try {
        var items = {};

        fs.readdirSync(path).forEach(function (item) {
            items[item] = mstat(path + SEP + item);
        });

        if (all) {
            items['.'] = mstat(path + SEP + '.');
            items['..'] = mstat(path + SEP + '..');
        }

        return items;
    }

    catch (err) {
        lastError = err;
        return null;
    }
}

/**
 * Alias for list, but will return items as array
 *
 * @param {string} path
 * @returns {Array}
 * @access public
 * @static
 */
function ls (path) {
    return Object.keys(list(path));
}

/**
 * Alias for #list(). Treat it as `ls -l` on Unix-like platforms.
 * Stat will be provided as lstat, equal to list(path, 'lstat'). For
 * stat version use #lsls()
 *
 * @param path
 * @returns {Object|null}
 */
function lsl (path) {
    return list(path, 'lstat');
}

/**
 * Alias for #list(). Treat it as `ls -al` on Unix-like platforms.
 * Stat vill be provided as lstat, equal to list(path, 'lstat', true). For
 * stat version use #lsals()
 *
 * @param path
 * @returns {Object|null}
 */
function lsal (path) {
    return list(path, 'lstat', true);
}

/**
 * Same as #lsl(), but uses stat, instead of lstat.
 *
 * @param path
 * @returns {Object|null}
 */
function lsls (path) {
    return list(path, 'stat');
}

/**
 * Same as lsal, but uses stat instead of lstat.
 *
 * @param path
 * @returns {Object|null}
 */
function lsals (path) {
    return list(path, 'stat', true);
}

/**
 * Creates a tarball from a given src directory and save it to given dst path.
 * Automatically creates missing paths for a given dst.
 *
 * @param {string} src - source files/folders to add to a tarball
 * @param {string} [dst] - tarball path, default [src_base_name].tgz
 * @returns {boolean}
 * @access public
 * @static
 */
function tar (src, dst) {
    'use strict';

    src = realpath(src);
    dst = realpath(dst || p.basename(src) + '.tgz');

    var dir = p.dirname(dst);
    var stat = exists(src);

    if (!stat) {
        lastError = new Error('Tar error: source path "' + src +
            '" does not exists!');
        return false;
    }

    if (!exists(dir) && !mkdir(dir)) {
        return false;
    }

    return pipeSync(
        tgz().createReadStream(src),
        fs.createWriteStream(dst)
    );
}

/**
 * Extract given src tarball to a destination path dst.
 * Automatically creates missing paths for a given dst.
 *
 * @param {string} src - path to source tarball
 * @param {string} [dst] - destination folder, default .
 * @returns {boolean}
 * @access public
 * @static
 */
function untar (src, dst) {
    'use strict';

    src = realpath(src);
    dst = realpath(dst || '.');

    var dir = p.dirname(dst);
    var stat = exists(src);

    if (!stat) {
        lastError = new Error('Untar error: source path "' + src +
            '" does not exists!');
        return false;
    }

    if (!exists(dir) && !mkdir(dir)) {
        return false;
    }

    return pipeSync(
        fs.createReadStream(src),
        tgz().createWriteStream(dst)
    );
}

/**
 * Adds a given src path to zip archive, saves archive to a given dst path.
 * Automatically creates missing paths for a given dst.
 *
 * @param {string} src - source file/folder to archive
 * @param {string} [dst] - destination zip file, default [src_base_name].zip
 * @returns {boolean}
 * @access public
 * @static
 */
function zip (src, dst) {
    'use strict';

    src = realpath(src);
    dst = realpath(dst || p.basename(src) + '.zip');

    var dir = p.dirname(dst);
    var stat = exists(src);
    var zipWorker;

    if (!stat) {
        lastError = new Error('Zip error: source path "' + src +
            '" does not exists!');
        return false;
    }

    if (!exists(dir) && !mkdir(dir)) {
        return false;
    }

    try {
        zipWorker = new Zip();

        if (stat.isDirectory()) {
            zipWorker.addLocalFolder(relpath(src), p.basename(src));
        }

        else {
            zipWorker.addLocalFile(src);
        }

        // jscs:disable maximumLineLength
        // adm-zip has a bug on windows with wrong attributes set to an entries
        // @see https://github.com/cthackers/adm-zip/issues/130
        // @see https://github.com/cthackers/adm-zip/commit/eb9291015540bc11157494d384e020cd16cfcaf4
        // jscs:enable maximumLineLength
        zipWorker.getEntries().forEach(function (entry) {
            var attr;

            if (entry.isDirectory) {
                attr = (parseInt('40755', 8) << 16) | 0x10;
            }

            else {
                attr = parseInt('644', 8) << 16;
            }

            entry.attr = attr;
        });

        zipWorker.writeZip(dst);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * Extracts everything from a given src zip archive and saves all to given dst
 * path.
 * Automatically creates missing paths for a given dst.
 *
 * @param {string} src - source zip archive
 * @param {string} [dst] - destination path to extract files, default .
 * @access public
 * @static
 */
function unzip (src, dst) {
    'use strict';

    src = realpath(src);
    dst = realpath(dst || '.');

    var zipWorker;

    if (!exists(src)) {
        lastError = new Error('Unzip error: source path "' + src +
            '" does not exists!');
        return false;
    }

    if (!exists(dst) && !mkdir(dst)) {
        return false;
    }

    try {
        zipWorker = new Zip(src);
        zipWorker.extractAllTo(dst);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * It will returns real path on fs for the given path as an argument
 * This method wil return a realpath even it does not exists on a file system
 * in comparison to native fs.realpsthSync which will fail with Error
 * if path does not exists.
 * It could be really useful to construct absolute paths without failing the
 * program execution.
 *
 * @example
 * var fs = require('fs-cli');
 * console.log(fs.realpath('./'));
 * console.log(fs.error());
 * console.log(fs.realpath('./something/not/potentially/existing'));
 * console.log(fs.error());
 *
 * @param {string} path
 * @returns {string}
 * @access public
 * @static
 */
function realpath (path) {
    'use strict';

    var fsPath, fsParts, parts, i, s, joint;
    var pathArg = path;

    path = p.normalize(path);

    try {
        fsPath = fs.realpathSync(path);
    }

    catch (err) {
        fsPath = err.path;
    }

    fsParts = fsPath.split(SEP);
    parts = path.split(SEP_RX).filter(function (part) {
        return part && part !== '.' && part !== '..';
    });

    joint = fsParts[fsParts.length - 1];

    for (i = 0, s = parts.length; i < s; i++) {
        if (parts[i] == joint) {
            parts = parts.slice(i + 1);
            break;
        }
    }

    return fsParts.concat(parts).join(SEP);
}

/**
 * Creates an empty file at by a given path.
 * It will automatically create all the folders missing in
 * the path on a file system.
 * If target path already exists, will do nothing, true will be returned.
 *
 * @example
 * var fs = require('fs-cli);
 * fs.touch('./path/to/file.txt');
 * console.log(fs.exists('./path/to/file.txt'));
 *
 * @param {string} path - path to the file to be created
 * @param {Object} [options] - similar to native fs.writeFile options
 * @returns {boolean}
 * @access public
 * @static
 */
function touch (path, options) {
    'use strict';

    path = realpath(path);

    if (exists(path)) {
        return true;
    }

    var args = [path, ''];

    if (options) {
        args.push(options);
    }

    return writefile.apply(null, args);
}

/**
 * Recursively creates a given path
 * Returns true on success, false otherwise. When its falsy you can check
 * the error with fs.error()
 *
 * @example
 * var fs = require('fs-cli');
 * if (!fs.mkdir('./some/path/to/create')) {
 *  console.log('Can not create path, reason:\n%s', fs.error().stack);
 * }
 *
 * @param {string} path - path to be created
 * @returns {boolean}
 * @access public
 * @static
 */
function mkdir (path) {
    'use strict';

    var dirs = realpath(path).split(SEP);
    var i = 1;
    var s = dirs.length;

    path = dirs[0] ? dirs[0] + SEP : '';

    for (; i < s; i++) {
        path += SEP + dirs[i];

        if (!exists(path)) {
            try {
                fs.mkdirSync(path);
            }

            catch (err) {
                lastError = err;
                return false;
            }
        }
    }

    return true;
}

// jscs:disable maximumLineLength
/**
 * The same as native fs.readSync, but will return false on error.
 * It returns number of bytes read or false if error happens.
 * Error can be retrieved via error() call.
 *
 * @see {@link https://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback}
 *
 * @param {number} fd
 * @param {Buffer|string} buffer
 * @param {number} offset
 * @param {number} length
 * @param {number} position
 * @returns {number|false}
 */
// jscs:enable maximumLineLength
function read (fd, buffer, offset, length, position) {
    'use strict';

    try {
        return fs.readSync.apply(null, arguments);
    }

    catch (err) {
        lastError = err;
        return false;
    }
}

// jscs:disable maximumLineLength
/**
 * The same as native fs.writeSync, but will return false on error.
 * Error can be retrieved via error() call.
 *
 * @see {@link https://nodejs.org/api/fs.html#fs_fs_write_fd_data_position_encoding_callback}
 *
 * @param {number} fd
 * @param {Buffer|string} buffer
 * @param {number} offset
 * @param {number} length
 * @param {number} [position]
 * @returns {boolean}
 * @access public
 * @static
 */
// jscs:enable maximumLineLength
function write (fd, buffer, offset, length, position) {
    'use strict';

    try {
        fs.writeSync.apply(null, arguments);
    }

    catch (err) {
        lastError = err;
        return false;
    }

    return true;
}

/**
 * Returns the last occurred error on fs operations
 * As far as the most methods returns something valuable or boolen
 * you may need to get a clue about an actual error occurred during last
 * fs operation. So use this method to get an actual error.
 * Sometimes it may be need to reset old meaningless error, it can be
 * easily done with bypassing anything as an arument to this function.
 * The value, bypassing does not matter, it just should not be undefined. As a
 * result lastError will be reset to null.
 *
 * @example
 * var fs = require('fs-cli');
 * if (!fs.mkdir('./**')) { // <- this will never be created for sure
 *  console.log('Can not create path, reason:\n%s', fs.error().stack);
 * }
 *
 * @params {mixed} [clear] - if anything bypassed will reset lastError to null
 * @returns {Error|null}
 * @access public
 * @static
 */
function error (clear) {
    'use strict';

    if (clear !== undefined) {
        lastError = null;
    }

    return lastError;
}

/**
 * This is just a helper making possible to take path
 * arguments as glob objects
 *
 * @param {Function} fn - function to globalize
 * @param {number} [argindex] - fn arg to globalize
 * @returns {Function} - globalized function
 * @access private
 * @static
 */
function globalize (fn, argIndex) {
    'use strict';

    if (argIndex === undefined) {
        argIndex = 0;
    }

    return function () {
        var args = arguments;
        var arg = args[argIndex];
        var globs, i, s;

        if (typeof arg !== 'string') {
            return fn.apply(null, args);
        }

        globs = glob.sync(arg);

        for (i = 0, s = globs.length; i < s; i++) {
            args[argIndex] = globs[i];

            if (!fn.apply(null, args)) {
                return false;
            }
        }

        return true;
    };
}

// @TODO: globalized functions have to support glob path parts

// export all that to whom it may need, we are not hoggish
module.exports = {
    cp: cp,
    mv: mv,
    rm: rm,
    list: list,
    ls: ls,
    lsl: lsl,
    lsal: lsal,
    lsls: lsls,
    lsals: lsals,
    tar: tar,
    untar: untar,
    zip: zip,
    unzip: unzip,
    touch: touch,
    realpath: realpath,
    mkdir: mkdir,
    open: open,
    close: close,
    chown: chown,
    rchown: rchown,
    chmod: chmod,
    rchmod: rchmod,
    read: read,
    write: write,
    readfile: readfile,
    writefile: writefile,
    exists: exists,
    error: error,
    relpath: relpath,
    glob: glob.sync,
    DIRSEP: SEP,
    DIRSEP_REGEX: SEP_RX
};

['cp', 'mv', 'rm', 'chown', 'rchown', 'chmod', 'rchmod'].
forEach(function (name) {
    module.exports[name] = globalize(module.exports[name]);
});
