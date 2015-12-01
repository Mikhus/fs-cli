var assert = require('assert');
var fs = require('../index');
var nfs = require('fs');

describe('fs.lsals()', function () {
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
            Object.prototype.toString(fs.lsals('.')) === '[object Object]',
            true
        );
        assert.equal(fs.error(), null);
    });
    it('should return correct list of files', function () {
        assert.deepEqual(
            Object.keys(fs.lsals('./tmp')).sort(),
            ['.', '..', 'a', '01.txt', '02.txt'].sort()
        );
        assert.equal(fs.error(), null);
    });
    it('should return stat objects for each entry', function () {
        var stat = fs.lsals('./tmp')['a'];
        assert.equal(stat instanceof nfs.Stats, true);
        assert.equal(fs.error(), null);
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
