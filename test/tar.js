var assert = require('assert');
var fs = require('../index');
var tgz = require('tar.gz');
var p = require('path');

describe('fs.tar()', function () {
    var src = './test';
    var dst = './tmp/test.tgz';

    before(function () {
        fs.error(null);
        assert.equal(fs.error(), null);
    });

    it('should create zip archive', function () {
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
        var found = false;
        var read = require('fs').createReadStream(dst);
        var parse = tgz().createParseStream();
        var thisFile = p.basename(__filename);

        parse.on('entry', function(entry){
            var entryFile = p.basename(entry.path);

            if (entryFile == thisFile) {
                found = true;
            }
        });

        parse.on('close', function () {
            assert.equal(found, true);
            done();
        });

        read.pipe(parse);
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
