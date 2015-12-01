var assert = require('assert');
var fs = require('../index');
var Zip = require('adm-zip');
var p = require('path');

describe('fs.zip()', function () {
    var src = './test';
    var dst = './tmp/test.zip';

    before(function () {
        fs.error(null);
        assert.equal();
    });

    it('should create zip archive', function () {
        assert.equal(fs.zip(src, dst), true);
        assert.equal(!!fs.exists(dst), true);
    });
    it('should not raise errors', function () {
        assert.equal(fs.error(), null);
    });
    it('should not be empty', function () {
        var stat = fs.exists(dst);
        var zip = new Zip(dst);
        assert.equal(stat.size > 0, true);
        assert.equal(zip.getEntries() && zip.getEntries().length > 0, true);
    });
    it('should contain certain file', function () {
        var zip = new Zip(dst);
        var entries = zip.getEntries();
        var i = 0;
        var s = entries.length;
        var found = false;
        var thisFile = p.basename(__filename);
        for (; i < s; i++) {
            if (entries[i].name == thisFile) {
                found = true;
                break;
            }
        }
        assert.equal(found, true);
    });

    after(function() {
        assert.equal(fs.rm('./tmp'), true);
    });
});
