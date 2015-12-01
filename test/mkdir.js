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

    after(function() {
        assert.equal(fs.rm('./test/some'), true);
    });
});
