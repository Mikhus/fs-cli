var assert = require('assert');
var fs = require('../index');
var s = fs.DIRSEP;

function isAbsolute (path) {
    return !!path.match(/^(\/|[a-z]\:)/i);
}

function nodots (path) {
    return !path.match(/(\/|\\)\.\.?(\/|\\)?/);
}

describe('fs.realpath()', function () {
    before(function() {
        fs.error(null);
        assert.equal(fs.error(), null);
    });

    it('should return a path string', function () {
        assert.equal(
            typeof fs.realpath('./test/some/path/depth') === 'string',
            true
        );
    });
    it('should not contain dots', function () {
        assert.equal(nodots(fs.realpath('.')), true);
        assert.equal(nodots(fs.realpath('..')), true);
    });
    it('should be absolute', function () {
        assert.equal(isAbsolute(fs.realpath('.')), true);
    });
});
