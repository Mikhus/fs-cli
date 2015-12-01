var assert = require('assert');
var fs = require('../index');

describe('fs.touch()', function () {
    before(function () {
        fs.error(null);
        fs.writefile('./tmp/nonempty.txt', 'hello');
        assert.equal(fs.error(), null);
    });
    it('should create an empty file at a given path', function () {
        assert.equal(fs.touch('./tmp/empty.txt'), true);
        assert.equal(fs.error(), null);
        assert.equal(!!fs.exists('./tmp/empty.txt'), true);
        assert.equal(fs.readfile('./tmp/empty.txt'), '');
    });
    it('should create path recursively', function () {
        assert.equal(fs.touch('./tmp/a/b/c/deep.txt'), true);
        assert.equal(fs.error(), null);
        assert.equal(!!fs.exists('./tmp/a/b/c/deep.txt'), true);
    });
    it('should not modify existing file', function () {
        assert.equal(fs.touch('./tmp/nonempty.txt'), true);
        assert.equal(fs.error(), null);
        assert.equal(!!fs.exists('./tmp/nonempty.txt'), true);
        assert.equal(fs.readfile('./tmp/nonempty.txt'), 'hello');
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
