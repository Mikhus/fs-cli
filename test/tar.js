var assert = require('assert');
var fs = require('../index');
var tar = require('tar-stream');
var gunzip = require('gunzip-maybe');
var nfs = require('fs');
var p = require('path');

describe('fs.tar()', function () {
    var src = './test';
    var dst = './tmp/test.tgz';

    before(function () {
        fs.error(null);
        assert.equal(fs.error(), null);
    });

    it('should create gzipped tarball', function () {
        assert.equal(fs.tar(src, dst), true);
        assert.equal(!!fs.exists(dst), true);
    });
    it('should not raise errors', function () {
        assert.equal(fs.error(), null);
    });
    it('should not be empty', function () {
        var stat = fs.exists(dst);
        assert.equal(stat.size > 0, true);
    });
    it('should contain certain file', function (done) {
        var extract = tar.extract();
        var found = false;

        extract.on('entry', function (header, stream, next) {
            if (header.name == 'test/tar.js') {
                found = true;
                stream.end();
                extract.end();
                done();
            }

            stream.on('end', next);
            stream.resume();
        });

        extract.on('finish', function () {
            assert.equal(found, true);
            done();
        });

        nfs.createReadStream('./tmp/test.tgz')
            .pipe(gunzip())
            .pipe(extract);
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
