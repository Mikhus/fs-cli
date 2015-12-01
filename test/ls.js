var assert = require('assert');
var fs = require('../index');

describe('fs.ls()', function () {
    before(function () {
        fs.error(null);
        fs.mkdir('./tmp');
        fs.mkdir('./tmp/a');
        fs.touch('./tmp/01.txt');
        fs.touch('./tmp/02.txt');
        assert.equal(fs.error(), null);
    });
    it('should return array', function () {
        assert.equal(fs.ls('.') instanceof Array, true);
        assert.equal(fs.error(), null);
    });
    it('should return correct list of files', function () {
        assert.deepEqual(
            fs.ls('./tmp').sort(),
            ['a', '01.txt', '02.txt'].sort()
        );
        assert.equal(fs.error(), null);
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
