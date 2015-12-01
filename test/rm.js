var assert = require('assert');
var fs = require('../index');

describe('fs.rm()', function () {
    before(function () {
        fs.error(null);
        fs.mkdir('./tmp/01/a/b/c');
        fs.mkdir('./tmp/02/a/b/c');
        fs.mkdir('./tmp/03/a/b/c');
        fs.mkdir('./tmp/04/a/b/c');
        fs.glob('./tmp/**/c').forEach(function (dir) {
            fs.touch(dir + '/file.txt');
        });
        assert.equal(fs.error(), null);
    });
    it('should remove a given path', function () {
        assert.equal(fs.rm('./tmp/01/a/b/c/file.txt'), true);
        assert.equal(fs.error(), null);
        assert.equal(!fs.exists('./tmp/01/a/b/c/file.txt'), true);
    });
    it('should remove a given path recursively', function () {
        assert.equal(fs.rm('./tmp/01'), true);
        assert.equal(!fs.exists('./tmp/01/a/b/c'), true);
        assert.equal(!fs.exists('./tmp/01/a/b'), true);
        assert.equal(!fs.exists('./tmp/01/a'), true);
        assert.equal(!fs.exists('./tmp/01'), true);
        assert.equal(!fs.exists('./tmp'), false);
    });
    it('should remove glob', function () {
        assert.equal(fs.rm('./tmp/**'), true);
        assert.equal(!fs.glob('./tmp/**').length, true);
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
