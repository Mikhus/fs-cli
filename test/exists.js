var assert = require('assert');
var fs = require('../index');
var nfs = require('fs');

describe('fs.exists()', function () {
    beforeEach(function () {
        assert.equal(fs.error(null), null);
    });

    it('should return stats if given path exists', function () {
        assert.equal(fs.exists('./test/exists.js') instanceof nfs.Stats, true);
    });
    it('should return null if given path does not exist', function () {
        assert.equal(fs.exists('./test/the/nothing'), null);
    });

    after(function() {
        assert.equal(fs.error(null), null);
    });
});
