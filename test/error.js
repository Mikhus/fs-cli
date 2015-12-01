var assert = require('assert');
var fs = require('../index');

describe('fs.error()', function () {
    it('should be reset on a given argument', function () {
        fs.error(null);
        assert.equal(fs.error(), null);
    });
    it('should report if error occurred on fs last operation', function () {
        fs.readfile('./some/non/existing/file.txt');
        assert.equal(fs.error() instanceof Error, true);
    });

    after(function() {
        assert.equal(fs.error(null), null);
    });
});
