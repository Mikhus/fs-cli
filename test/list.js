var assert = require('assert');
var fs = require('../index');

describe('fs.list()', function () {
    before(function () {
        fs.error(null);
        fs.mkdir('./tmp');
        fs.mkdir('./tmp/a');
        fs.touch('./tmp/01.txt');
        fs.touch('./tmp/02.txt');
        assert.equal(fs.error(), null);
    });
    it('should return object', function () {
        assert.equal(
            Object.prototype.toString(fs.list('.')) === '[object Object]',
            true
        );
        assert.equal(fs.error(), null);
    });
    // all other possibilities are tested by aliases ls/lsa/lsal/...

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
