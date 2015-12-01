var assert = require('assert');
var fs = require('../index');

describe('fs.cp()', function () {
    before(function () {
        fs.error(null);
        fs.mkdir('./tmp/a');
        fs.mkdir('./tmp/b');
        fs.touch('./tmp/a/a.txt');
        fs.touch('./tmp/a/b.txt');
        fs.touch('./tmp/a/c.txt');
        assert.equal(fs.error(), null);
    });

    it('should copy single file', function () {
        fs.cp('./tmp/a/a.txt', './tmp');
        assert.equal(!!fs.exists('./tmp/a.txt'), true);
    });
    it('should copy single directory', function () {
        fs.cp('./tmp/b', './tmp/c');
        assert.equal(!!fs.exists('./tmp/c'), true);
    });
    it('should copy recursive', function () {
        fs.cp('./tmp/a', './tmp/c');
        assert.equal(!!fs.exists('./tmp/c/a/c.txt'), true);
    });
    it('should copy files by glob', function () {
        fs.cp('./tmp/a/*', './tmp/b');
    });

    after(function() {
        fs.rm('./tmp');
    });
});
