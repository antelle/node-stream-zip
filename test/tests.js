var
    fs = require('fs'),
    path = require('path'),
    StreamZip = require('../node-stream-zip.js');

var
    testPathTmp,
    testNum = 0,
    baseBathTmp = 'test/.tmp/',
    contentPath = 'test/content/';

function testFileOk(file, test) {
    var expEntriesCount = 10,
        expEntriesCountInDocDir = 4;
    if (file === 'osx.zip') {
        expEntriesCount = 25;
        expEntriesCountInDocDir = 5;
    } else if (file === 'windows.zip') {
        expEntriesCount = 8;
    }
    test.expect(22);
    var zip = new StreamZip({ file: 'test/ok/' + file });
    zip.on('ready', function() {
        test.equal(zip.entriesCount, expEntriesCount);
        var entries = zip.entries();

        var containsAll = ['BSDmakefile', 'README.md', 'doc/api_assets/logo.svg',
            'doc/api_assets/sh.css', 'doc/changelog-foot.html', 'doc/sh_javascript.min.js'
        ].every(function(expFile) { return entries[expFile]; });
        test.ok(containsAll);

        test.ok(!zip.entry('not-existing-file'));

        var entry = zip.entry('BSDmakefile');
        test.ok(entry);
        test.ok(!entry.isDirectory);
        test.ok(entry.isFile);

        var dirEntry = zip.entry('doc/');
        var dirShouldExist = file !== 'windows.zip'; // windows archives can contain not all directories
        test.ok(!dirShouldExist || dirEntry);
        test.ok(!dirShouldExist || dirEntry.isDirectory);
        test.ok(!dirShouldExist || !dirEntry.isFile);

        var filePromise = new Promise(function(resolve) {
            zip.extract('README.md', testPathTmp + 'README.md', function(err, res) {
                test.equal(err, null);
                test.ok(1, res);
                assertFilesEqual(test, contentPath + 'README.md', testPathTmp + 'README.md');
                resolve();
            });
        });
        var fileToFolderPromise = new Promise(function(resolve) {
            zip.extract('README.md', testPathTmp, function(err, res) {
                test.equal(err, null);
                test.ok(1, res);
                assertFilesEqual(test, contentPath + 'README.md', testPathTmp + 'README.md');
                resolve();
            });
        });
        var folderPromise = new Promise(function(resolve) {
            zip.extract('doc/', testPathTmp, function(err, res) {
                test.equal(err, null);
                test.equal(res, expEntriesCountInDocDir);
                assertFilesEqual(test, contentPath + 'doc/api_assets/sh.css', testPathTmp + 'api_assets/sh.css');
                resolve();
            });
        });
        var extractAllPromise = new Promise(function(resolve) {
            zip.extract(null, testPathTmp, function(err, res) {
                test.equal(err, null);
                test.ok(7, res);
                assertFilesEqual(test, contentPath + 'doc/api_assets/sh.css', testPathTmp + 'doc/api_assets/sh.css');
                assertFilesEqual(test, contentPath + 'BSDmakefile', testPathTmp + 'BSDmakefile');
                resolve();
            });
        });

        Promise.all([filePromise, fileToFolderPromise, folderPromise, extractAllPromise]).then(function() {
            test.done();
        });
    });
}

function assertFilesEqual(test, actual, expected) {
    var actualData = fs.readFileSync(actual).toString('utf8').replace(/\r\n/g, '\n'),
        expectedData = fs.readFileSync(expected).toString('utf8').replace(/\r\n/g, '\n');
    test.equal(actualData, expectedData, actual + ' <> ' + expected);
}

function rmdirSync(dir) {
    var list = fs.readdirSync(dir);
    for (var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if (filename == "." || filename == "..") {
        } else if(stat.isDirectory()) {
            rmdirSync(filename);
        } else {
            try { fs.unlinkSync(filename); } catch (e) {}
        }
    }
    try { fs.rmdirSync(dir); } catch (e) {}
}

module.exports.ok = {};
var filesOk = fs.readdirSync('test/ok');
filesOk.forEach(function(file) {
    module.exports.ok[file] = testFileOk.bind(null, file);
});

module.exports.error = {};
module.exports.error['enc_aes.zip'] = function(test) {
    test.expect(1);
    var zip = new StreamZip({ file: 'test/err/enc_aes.zip' });
    zip.on('ready', function() {
        zip.stream('README.md', function(err) {
            test.equal(err, 'Entry encrypted');
            test.done();
        });
    });
};
module.exports.error['enc_zipcrypto.zip'] = function(test) {
    test.expect(1);
    var zip = new StreamZip({ file: 'test/err/enc_zipcrypto.zip' });
    zip.on('ready', function() {
        zip.stream('README.md', function(err) {
            test.equal(err, 'Entry encrypted');
            test.done();
        });
    });
};
module.exports.error['lzma.zip'] = function(test) {
    test.expect(1);
    var zip = new StreamZip({ file: 'test/err/lzma.zip' });
    zip.on('ready', function() {
        zip.stream('README.md', function(err) {
            test.equal(err, 'Unknown compression method: 14');
            test.done();
        });
    });
};
module.exports.error['rar.rar'] = function(test) {
    test.expect(1);
    var zip = new StreamZip({ file: 'test/err/rar.rar' });
    zip.on('ready', function() {
        test.ok(false, 'Should throw an error');
    });
    zip.on('error', function(err) {
        test.equal(err, 'Bad archive');
        test.done();
    });
};
module.exports.error['corrupt_entry.zip'] = function(test) {
    test.expect(2);
    var zip = new StreamZip({ file: 'test/err/corrupt_entry.zip' });
    zip.on('ready', function() {
        var oneEntry = new Promise(function(resolve) {
            zip.extract('doc/api_assets/logo.svg', testPathTmp, function (err) {
                test.ok(err);
                resolve();
            });
        });
        var allEntries = new Promise(function(resolve) {
            zip.extract('', testPathTmp, function (err) {
                test.ok(err);
                resolve();
            });
        });
        Promise.all([oneEntry, allEntries]).then(function() { test.done(); });
    });
};
module.exports.error['bad_crc.zip'] = function(test) {
    test.expect(2);
    var zip = new StreamZip({ file: 'test/err/bad_crc.zip' });
    zip.on('ready', function() {
        var oneEntry = new Promise(function(resolve) {
            zip.extract('doc/api_assets/logo.svg', testPathTmp, function (err) {
                test.equal(err, 'Invalid CRC');
                resolve();
            });
        });
        var allEntries = new Promise(function(resolve) {
            zip.extract('', testPathTmp, function (err) {
                test.ok(err);
                resolve();
            });
        });
        Promise.all([oneEntry, allEntries]).then(function() { test.done(); });
    });
};

module.exports.parallel = {};
module.exports.parallel['streaming 100 files'] = function(test) {
    var num = 100;
    test.expect(num);
    var zip = new StreamZip({ file: 'test/ok/normal.zip' });
    zip.on('ready', function() {
        var extracted = 0;
        var files = ['doc/changelog-foot.html', 'doc/sh_javascript.min.js', 'BSDmakefile', 'README.md'];
        for (var i = 0; i < num; i++) {
            var file = files[Math.floor(Math.random() * files.length)];
            zip.extract(file, testPathTmp + i, function (err) {
                test.equal(err, null);
                if (++extracted === num)
                    test.done();
            });
        }
    });
};

module.exports.setUp = function(done) {
    testPathTmp = baseBathTmp + testNum++ + '/';
    if (!fs.existsSync(baseBathTmp))
        fs.mkdirSync(baseBathTmp);
    if (fs.existsSync(testPathTmp))
        rmdirSync(testPathTmp);
    fs.mkdirSync(testPathTmp);
    done();
};
module.exports.tearDown = function(done) {
    //rmdirSync(testPathTmp);
    done();
};

process.on('exit', function() {
    rmdirSync(baseBathTmp);
});