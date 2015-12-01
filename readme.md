# Easy FS Scripting With NodeJS

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

    var fs = require('fs-cli');
    
    var temp = './doc';
    
    fs.mv('/home/user/docs/**/*.doc', temp);
    fs.tar(temp, './all-docs.tgz');
    fs.rm(temp);

Oh, really? - Yeah!

Of course, it's not very error-prone to write like that. You may want to add 
some checks:

    var fs = require('fs-cli');
    
    var temp = './doc';
    
    function die() {
        console.log(fs.error().stack);
        process.exit();
    }
    
    fs.mv('/home/user/docs/**/*.doc', temp) || die();
    fs.tar(temp, './all-docs.tgz') || die();
    fs.rm(temp) || die();

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

 - **ls**: directory listing
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

## Want More?

Coming soon...

## Achtung!

All thease stuff is highly experimental and non bugs-free. It is under an active
development, so use it at your own risk! One day we may change everything here. 
You warned.
