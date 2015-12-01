var fs = require('./index');

var root = './test';
var uncovered = [];
var covered = [];
var file, files;
var exclude = ['glob'];

Object.keys(fs).forEach(function (method) {
    if (typeof fs[method] === 'function' && !fs.exists(root + '/' + method)) {
        if (!~exclude.indexOf(method)) {
            fs.touch(root + '/' + method + '.js');
        }
    }
});

files = fs.lsl(root);

for (file in files) {
    if (!files[file].isDirectory() && fs.readfile(root + '/' + file) == '') {
        uncovered.push(file.replace('.js', ''));
    }

    else if (!files[file].isDirectory()) {
        covered.push(file.replace('.js', ''));
    }
}

console.log('Covered (%d):', covered.length);
covered.forEach(function (test) {
    console.log('  %s', test);
});

console.log('Uncovered (%d):', uncovered.length);
uncovered.forEach(function (test) {
    console.log('  %s', test);
});

console.log('Coverage: %d%',
    (covered.length / (covered.length + uncovered.length) * 100).toFixed(2)
);
