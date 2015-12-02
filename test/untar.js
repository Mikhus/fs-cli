var assert = require('assert');
var fs = require('../index');

describe('fs.untar()', function () {
    before(function () {
        fs.error(null);
        fs.tar('./test', './tmp/test.tgz');
        assert.equal(fs.error(), null);
    });

    it('should untar given tarball', function () {
        assert.equal(fs.untar('./tmp/test.tgz', './tmp'), true);
        assert.equal(fs.error(), null);
    });
    it('destination should have correct list of files', function () {
        assert.deepEqual(fs.ls('./test').sort(), fs.ls('./tmp/test').sort());
        assert.equal(fs.error(), null);
    });

    after(function() {
        fs.rm('./tmp');
    });
});
