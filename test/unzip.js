var assert = require('assert');
var fs = require('../index');

describe('fs.unzip()', function () {
    before(function () {
        fs.error(null);
        fs.zip('./test', './tmp/test.zip');
        assert.equal(fs.error(), null);
    });

    it('should unzip given archive', function () {
        assert.equal(fs.unzip('./tmp/test.zip', './tmp'), true);
        assert.equal(fs.error(), null);
    });
    it('destination should have correct list of files', function () {
        assert.deepEqual(fs.ls('./test').sort(), fs.ls('./tmp/test').sort());
        assert.equal(fs.error(), null);
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
