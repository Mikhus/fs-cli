var assert = require('assert');
var fs = require('../index');

describe('fs.mv()', function () {
    before(function () {
        fs.error(null);
        fs.mkdir('./tmp/a');
        fs.mkdir('./tmp/b');
        fs.touch('./tmp/a/a.txt');
        fs.touch('./tmp/a/b.txt');
        fs.touch('./tmp/a/c.txt');
        assert.equal(fs.error(), null);
    });

    it('should move single file', function () {
        fs.mv('./tmp/a/c.txt', './tmp');
        assert.equal(!!fs.exists('./tmp/c.txt'), true);
        assert.equal(!fs.exists('./tmp/a/c.txt'), true);
    });
    it('should move single directory', function () {
        fs.mv('./tmp/b', './tmp/c');
        assert.equal(!!fs.exists('./tmp/c'), true);
        assert.equal(!fs.exists('./tmp/b'), true);
    });
    it('should move directory with its content', function () {
        fs.mv('./tmp/a', './tmp/c');
        assert.equal(!!fs.exists('./tmp/c/a/a.txt'), true);
        assert.equal(!fs.exists('./tmp/a'), true);
    });
    it('should move files by glob', function () {
        fs.mv('./tmp/c/a/*', './tmp');
    });

    after(function() {
        //fs.rm('./tmp');
    });
});
