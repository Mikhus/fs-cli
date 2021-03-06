# Easy FS Scripting With NodeJS

[![Build Status](https://travis-ci.org/Mikhus/fs-cli.svg?branch=master)](https://travis-ci.org/Mikhus/fs-cli) [![Dependency Status](https://david-dm.org/Mikhus/fs-cli.svg)](https://david-dm.org/Mikhus/fs-cli) [![devDependency Status](https://david-dm.org/Mikhus/fs-cli/dev-status.svg)](https://david-dm.org/Mikhus/fs-cli#info=devDependencies) 

It is specially created to get rid of routines when writing CLI tools using
NodeJS. File system. Recursive. Synchronous...

## Why?

 - Looking for a way to **remove directory recursively** in nodejs?
 - Looking how to **copy files recursively** in nodejs?
 - Want to **move** some your files with nodejs **using globs**?
 - Or maybe **tar/zip** some dir **synchronously**?
 - **Tired writing shell-jobs with nodejs?**
 - Welcome!

Because it should be as simple as possible. Let's see by example. Assume it
is required to make a script which look-ups for all available ```.doc``` files 
in some given directory recursively, move them to a given destination, creates 
tarball from it and does a clean-up.

```javascript
var fs = require('fs-cli');
var temp = './doc';
fs.mv('/home/user/docs/**/*.doc', temp);
fs.tar(temp, './all-docs.tgz');
fs.rm(temp);
```

Oh, really? - Yeah!

Of course, it's not very error-prone to write like that. You may want to add 
some checks:

```javascript
var fs = require('fs-cli');
var temp = './doc';
function die() {
    console.log(fs.error().stack);
    process.exit();
}
fs.mv('/home/user/docs/**/*.doc', temp) || die();
fs.tar(temp, './all-docs.tgz') || die();
fs.rm(temp) || die();
```

Want to remove all ```.svn``` folders with its contents from a certain folder?
Here it is:

```javascript
var fs = require('fs-cli');
fs.rm('./my-project/**/.svn');
```

-- Simple? Short? Cross-platform? Synchronous? Recursive? FS? JavaScript?<br>
-- Yeah! That's why!<br>
-- But... NodeJS has Sync versions of fs functions...<br>
-- We know, we use them inside. But not always...

Do you like that, want to help? Welcome!

## Install

    npm install fs-cli

## Use

    var fs = require('fs-cli');

## What Does It Can

 - **ls/lsa/lsl/lsal/lsls/lsals/list**: directory listing
 - **rm**: remove given path with all its contents, globs are allowed
 - **mv**: move source to destination, create missing paths recursive, +globs
 - **cp**: copy recursive, globs are allowed
 - **mkdir**: create path recursively
 - **chmod/rchmod**: change permissions/do it recursive, globs allowed
 - **chown/rchown**: change owner/do it recursive, globs are welcome
 - **touch**: touch, just touch... ah, will create missing path also
 - **tar/untar**: yup. tar. untar. paths as usual, would be created
 - **zip/unzip**: see above, the same, but zip
 - **readfile/writefile**: whenever you need, read, write, all sync, autopaths
 - **open/read/write/close**: big files? well...
 - **exists**: checks if exists, return file system object stats if exists
 - **relpath/realpath**: paths transform, cross-platform, exists-free
 - **basename/dirname**: aliases for native path.basename/path.dirname
 - **glob**: alias for glob.sync

## Want More?

Coming soon...

## Achtung!

All thease stuff is highly experimental and non bugs-free. It is under an active
development, so use it at your own risk! One day we may change everything here. 
You warned.

## License - ISC

Copyright (c) 2015, Mykhailo Stadnyk

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice 
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH 
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND 
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, 
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER 
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF 
THIS SOFTWARE.
