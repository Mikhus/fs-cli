var assert = require('assert');
var fs = require('../index');
var s = fs.DIRSEP;

function isRelative (path) {
    return !path.match(/^(\/|[a-z]\:)/i);
}

describe('fs.relpath()', function () {
    before(function() {
        fs.error(null);
        assert.equal(fs.error(), null);
    });

    it('shoud return a path string', function () {
        assert.equal(
            typeof fs.relpath('./test/some/path/depth') === 'string',
            true
        );
        assert.equal(fs.error(), null);
    });
    it('should be relative', function () {
        assert.equal(isRelative(fs.relpath('./test/some/path/depth')), true);
        assert.equal(fs.error(), null);
    });
    it('should be relative to given base', function () {
        var path = './test/some/path/depth';
        var base = './test';
        var rel = fs.relpath(path, base);
        assert.equal(
            path.split(fs.DIRSEP_REGEX)[2] == rel.split(fs.DIRSEP_REGEX)[0],
            true
        );
        assert.equal(fs.error(), null);
    });
    it('should be os specific', function () {
        var isWin = /win/.test(process.platform);
        assert.equal(
            !!~fs.relpath('./test/some/path').indexOf(isWin ? '\\' : '/'),
            true
        );
        assert.equal(fs.error(), null);
    });
});
