var assert = require('assert');
var fs = require('../index');

describe('fs.mkdir()', function () {
    before(function () {
        fs.error(null);
        assert.equal(fs.error(), null);
    });

    it('should create given path recursively', function () {
        assert.equal(fs.mkdir('./test/some/path/depth'), true);
    });
    it('path should be really created', function () {
        assert.equal(!!fs.exists('./test/some/path/depth'), true);
    });
    it('should return false on fail', function () {
        assert.equal(fs.mkdir('./test/*/**/***'), false);
    });
    it('should report error properly', function () {
       assert.equal(fs.error() instanceof Error, true);
    });

    after(function() {
        assert.equal(fs.rm('./test/some'), true);
    });
});
