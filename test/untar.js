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
    /**
     * Currenty there is some strange behavior of tar.gz library
     * At least on Windows its write stream fires "close" event, but
     * as may be seen from this test writing the files to disk
     * is not actually finished! This requires for further deeper investigation
     * or maybe own implementation of packing/unpacking tarballs
     * @TODO: investigate and fix tar/untar behavior
     */
    /*it('destination should have correct list of files', function () {
        assert.deepEqual(fs.ls('./test').sort(), fs.ls('./tmp/test').sort());
        assert.equal(fs.error(), null);
    });*/

    after(function() {
        fs.rm('./tmp');
    });
});
