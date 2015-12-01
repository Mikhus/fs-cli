var assert = require('assert');
var fs = require('../index');

describe('fs.readfile()', function () {
    beforeEach(function () {
        fs.error(null);
        fs.writefile('./tmp/file.txt', 'hello');
        fs.touch('./tmp/empty.txt');
        assert.equal(fs.error(), null);
    });
    it('should read given file', function () {
        assert.equal(fs.readfile('./tmp/file.txt'), 'hello');
        assert.equal(fs.error(), null);
    });
    it('should return null on non-existing file read attempt', function () {
        assert.strictEqual(fs.readfile('./tmp/nonexist.txt'), null);
        assert.equal(fs.error() instanceof Error, true);
    });
    it('should return empty string if file is empty', function () {
        assert.strictEqual(fs.readfile('./tmp/empty.txt'), '');
        assert.equal(fs.error(), null);
    });

    afterEach(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
