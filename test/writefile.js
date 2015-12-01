var assert = require('assert');
var fs = require('../index');

describe('fs.writefile()', function () {
    before(function () {
        fs.error(null);
        fs.mkdir('./tmp');
        assert.equal(fs.error(), null);
    });
    it('should create a file with a given content', function () {
        assert.equal(fs.writefile('./tmp/file.txt', 'hello'), true);
        assert.equal(fs.error(), null);
        assert.equal(!!fs.exists('./tmp/file.txt'), true);
        assert.equal(fs.readfile('./tmp/file.txt'), 'hello');
    });
    it('should create path recursively', function () {
        assert.equal(fs.writefile('./tmp/a/b/c/deep.txt', ''), true);
        assert.equal(fs.error(), null);
        assert.equal(!!fs.exists('./tmp/a/b/c/deep.txt'), true);
    });
    it('should modify existing file', function () {
        assert.equal(fs.writefile('./tmp/file.txt', 'goodbye'), true);
        assert.equal(fs.error(), null);
        assert.equal(!!fs.exists('./tmp/file.txt'), true);
        assert.equal(fs.readfile('./tmp/file.txt'), 'goodbye');
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
