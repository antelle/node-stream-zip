const fs = require('fs');
const http = require('http')
const send = require('send')
const path = require('path');
const StreamZip = require('../node_stream_zip.js');

let testPathTmp;
let testNum = 0;
const basePathTmp = 'test/.tmp/';
const contentPath = 'test/content/';
const alphabets = ['Latin', 'Ελληνικά', 'Русский', 'עִבְרִית', '日本語', '汉语'];

function testFileOk(file, test) {
    let expEntriesCount = 10,
        expEntriesCountInDocDir = 4;
    if (file === 'osx.zip') {
        expEntriesCount = 25;
        expEntriesCountInDocDir = 5;
    } else if (file === 'windows.zip') {
        expEntriesCount = 8;
    }
    test.expect(23);
    const zip = new StreamZip({ file: 'test/ok/' + file });
    zip.on('ready', () => {
        test.equal(zip.entriesCount, expEntriesCount);
        const entries = zip.entries();

        const containsAll = [
            'BSDmakefile',
            'README.md',
            'doc/api_assets/logo.svg',
            'doc/api_assets/sh.css',
            'doc/changelog-foot.html',
            'doc/sh_javascript.min.js',
        ].every((expFile) => {
            return entries[expFile];
        });
        test.ok(containsAll);

        test.ok(!zip.entry('not-existing-file'));

        const entry = zip.entry('BSDmakefile');
        test.ok(entry);
        test.ok(!entry.isDirectory);
        test.ok(entry.isFile);

        const dirEntry = zip.entry('doc/');
        const dirShouldExist = file !== 'windows.zip'; // windows archives can contain not all directories
        test.ok(!dirShouldExist || dirEntry);
        test.ok(!dirShouldExist || dirEntry.isDirectory);
        test.ok(!dirShouldExist || !dirEntry.isFile);

        const filePromise = new Promise((resolve) => {
            zip.extract('README.md', testPathTmp + 'README.md', (err, res) => {
                test.equal(err, null);
                test.ok(1, res);
                assertFilesEqual(test, contentPath + 'README.md', testPathTmp + 'README.md');
                resolve();
            });
        });
        const fileToFolderPromise = new Promise((resolve) => {
            zip.extract('README.md', testPathTmp, (err, res) => {
                test.equal(err, null);
                test.ok(1, res);
                assertFilesEqual(test, contentPath + 'README.md', testPathTmp + 'README.md');
                resolve();
            });
        });
        const folderPromise = new Promise((resolve) => {
            zip.extract('doc/', testPathTmp, (err, res) => {
                test.equal(err, null);
                test.equal(res, expEntriesCountInDocDir);
                assertFilesEqual(
                    test,
                    contentPath + 'doc/api_assets/sh.css',
                    testPathTmp + 'api_assets/sh.css'
                );
                resolve();
            });
        });
        const extractAllPromise = new Promise((resolve) => {
            zip.extract(null, testPathTmp, (err, res) => {
                test.equal(err, null);
                test.ok(7, res);
                assertFilesEqual(
                    test,
                    contentPath + 'doc/api_assets/sh.css',
                    testPathTmp + 'doc/api_assets/sh.css'
                );
                assertFilesEqual(test, contentPath + 'BSDmakefile', testPathTmp + 'BSDmakefile');
                resolve();
            });
        });
        const actualEentryData = zip.entryDataSync('README.md');
        const expectedEntryData = fs.readFileSync(contentPath + 'README.md');
        assertBuffersEqual(test, actualEentryData, expectedEntryData, 'sync entry');

        Promise.all([filePromise, fileToFolderPromise, folderPromise, extractAllPromise]).then(
            () => {
                test.done();
            }
        );
    });
}

function assertFilesEqual(test, actual, expected) {
    assertBuffersEqual(
        test,
        fs.readFileSync(actual),
        fs.readFileSync(expected),
        actual + ' <> ' + expected
    );
}

function assertBuffersEqual(test, actual, expected, str) {
    const actualData = actual.toString('utf8').replace(/\r\n/g, '\n'),
        expectedData = expected.toString('utf8').replace(/\r\n/g, '\n');
    test.equal(actualData, expectedData, str);
}

function rmdirSync(dir) {
    const list = fs.readdirSync(dir);
    for (let i = 0; i < list.length; i++) {
        const filename = path.join(dir, list[i]);
        const stat = fs.statSync(filename);

        if (filename === '.' || filename === '..') {
            // skip
        } else if (stat.isDirectory()) {
            rmdirSync(filename);
        } else {
            try {
                fs.unlinkSync(filename);
            } catch (e) {
                // don't care
            }
        }
    }
    try {
        fs.rmdirSync(dir);
    } catch (e) {
        // booo
    }
}

module.exports.ok = {};
const filesOk = fs.readdirSync('test/ok');
filesOk.forEach((file) => {
    if (path.extname(file).length === 4) {
        module.exports.ok[file] = (test) => testFileOk(file, test);
    }
});

module.exports.ok['tiny.zip'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/special/tiny.zip' });
    zip.on('ready', () => {
        const actualEentryData = zip.entryDataSync('BSDmakefile').toString('utf8');
        test.equal(actualEentryData.substr(0, 4), 'all:');
        test.done();
    });
};

module.exports.ok['zip64.zip'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/special/zip64.zip' });
    zip.on('ready', () => {
        const internalZip = zip.entryDataSync('files.zip');
        const filesZipTmp = basePathTmp + 'files.zip';
        fs.writeFileSync(filesZipTmp, internalZip);
        const filesZip = new StreamZip({ file: filesZipTmp, storeEntries: true });
        filesZip.on('ready', () => {
            test.equal(66667, filesZip.entriesCount);
            test.done();
        });
    });
};

module.exports.ok['openEntry'] = function (test) {
    test.expect(3);
    const zip = new StreamZip({ file: 'test/ok/normal.zip' });
    zip.on('ready', () => {
        const entries = zip.entries();
        const entry = entries['doc/changelog-foot.html'];
        test.ok(entry);
        const entryBeforeOpen = Object.assign({}, entry);
        zip.openEntry(
            entry,
            (err, entryAfterOpen) => {
                test.equal(err, undefined);
                test.notDeepEqual(entryBeforeOpen, entryAfterOpen);
                test.done();
            },
            false
        );
    });
};

module.exports.ok['fd'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ fd: fs.openSync('test/special/tiny.zip', 'r') });
    zip.on('ready', () => {
        const actualEentryData = zip.entryDataSync('BSDmakefile').toString('utf8');
        test.equal(actualEentryData.substr(0, 4), 'all:');
        test.done();
    });
};

module.exports.ok['url'] = function (test) {
    const server = http.createServer((req, res) => {
        send(req, 'test/ok/normal.zip').pipe(res)
    })

    server.listen(8000)
    const zip = new StreamZip({ url: 'http://127.0.0.1:8000/normal.zip' });
    zip.on('ready', () => {
        const entries = zip.entries();
        const entry = entries['doc/changelog-foot.html'];
        test.ok(entry);
        const entryBeforeOpen = Object.assign({}, entry);
        zip.openEntry(
            entry,
            (err, entryAfterOpen) => {
                test.equal(err, undefined);
                test.notDeepEqual(entryBeforeOpen, entryAfterOpen);
                test.done();
                server.close()
            },
            false
        );
    });
};

module.exports.ok['encoding-utf8'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/special/utf8.zip' });
    zip.on('ready', () => {
        const names = Object.values(zip.entries())
            .filter((e) => e.isFile)
            .map((e) => e.name)
            .sort();
        const expectedNames = alphabets.map((a) => `${a}/${a}.txt`);
        test.deepEqual(names, expectedNames);
        test.done();
    });
};

module.exports.ok['encoding-cp1252'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/special/utf8.zip', nameEncoding: 'cp1252' });
    zip.on('ready', () => {
        const names = Object.values(zip.entries())
            .filter((e) => e.isFile)
            .map((e) => e.name)
            .sort();
        const textEncoder = new TextEncoder('utf8');
        const textDecoder = new TextDecoder('cp1252');
        const expectedNames = alphabets
            .map((a) => textDecoder.decode(textEncoder.encode(a)))
            .map((a) => `${a}/${a}.txt`)
            .sort();
        test.deepEqual(names, expectedNames);
        test.done();
    });
};

module.exports.error = {};
module.exports.error['enc_aes.zip'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/err/enc_aes.zip' });
    zip.on('ready', () => {
        zip.stream('README.md', (err) => {
            test.equal(err.message, 'Entry encrypted');
            test.done();
        });
    });
};
module.exports.error['enc_zipcrypto.zip'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/err/enc_zipcrypto.zip' });
    zip.on('ready', () => {
        zip.stream('README.md', (err) => {
            test.equal(err.message, 'Entry encrypted');
            test.done();
        });
    });
};
module.exports.error['lzma.zip'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/err/lzma.zip' });
    zip.on('ready', () => {
        zip.stream('README.md', (err) => {
            test.equal(err.message, 'Unknown compression method: 14');
            test.done();
        });
    });
};
module.exports.error['rar.rar'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/err/rar.rar' });
    zip.on('ready', () => {
        test.ok(false, 'Should throw an error');
    });
    zip.on('error', (err) => {
        test.equal(err.message, 'Bad archive');
        test.done();
    });
};
module.exports.error['corrupt_entry.zip'] = function (test) {
    test.expect(2);
    const zip = new StreamZip({ file: 'test/err/corrupt_entry.zip' });
    zip.on('ready', () => {
        const oneEntry = new Promise((resolve) => {
            zip.extract('doc/api_assets/logo.svg', testPathTmp, (err) => {
                test.ok(err);
                resolve();
            });
        });
        const allEntries = new Promise((resolve) => {
            zip.extract('', testPathTmp, (err) => {
                test.ok(err);
                resolve();
            });
        });
        Promise.all([oneEntry, allEntries]).then(() => {
            test.done();
        });
    });
};
module.exports.error['bad_crc.zip'] = function (test) {
    test.expect(2);
    const zip = new StreamZip({ file: 'test/err/bad_crc.zip' });
    zip.on('ready', () => {
        const oneEntry = new Promise((resolve) => {
            zip.extract('doc/api_assets/logo.svg', testPathTmp, (err) => {
                test.equal(err.message, 'Invalid CRC');
                resolve();
            });
        });
        const allEntries = new Promise((resolve) => {
            zip.extract('', testPathTmp, (err) => {
                test.ok(err);
                resolve();
            });
        });
        Promise.all([oneEntry, allEntries]).then(() => {
            test.done();
        });
    });
};
module.exports.error['evil.zip'] = function (test) {
    test.expect(2);
    const zip = new StreamZip({ file: 'test/err/evil.zip' });
    zip.on('ready', () => {
        test.ok(false, 'Should throw an error');
    });
    zip.on('error', (err) => {
        const entryName = '..\\..\\..\\..\\..\\..\\..\\..\\file.txt';
        test.equal(err.message, 'Malicious entry: ' + entryName);
        const zip = new StreamZip({ file: 'test/err/evil.zip', skipEntryNameValidation: true });
        zip.on('ready', () => {
            test.ok(zip.entry(entryName), 'Entry exists');
            test.done();
        });
    });
};

module.exports.error['zip does not exist'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/err/doesnotexist.zip' });
    zip.on('ready', () => {
        test.ok(false, 'Should throw an error');
    });
    zip.on('error', (err) => {
        test.equal(
            err.message,
            "ENOENT: no such file or directory, open 'test/err/doesnotexist.zip'"
        );

        try {
            zip.close();
        } catch (e) {
            test.ok(false, 'zip.close() should not throw: ' + e);
        }

        test.done();
    });
};
module.exports.error['deflate64.zip'] = function (test) {
    test.expect(1);
    const zip = new StreamZip({ file: 'test/err/deflate64.zip' });
    zip.on('ready', () => {
        zip.stream('README.md', (err) => {
            test.equal(err.message, 'Unknown compression method: 9');
            test.done();
        });
    });
};

module.exports.parallel = {};
module.exports.parallel['streaming 100 files'] = function (test) {
    const num = 100;
    test.expect(num);
    const zip = new StreamZip({ file: 'test/ok/normal.zip' });
    zip.on('ready', () => {
        let extracted = 0;
        const files = [
            'doc/changelog-foot.html',
            'doc/sh_javascript.min.js',
            'BSDmakefile',
            'README.md',
        ];
        for (let i = 0; i < num; i++) {
            const file = files[Math.floor(Math.random() * files.length)];
            zip.extract(file, testPathTmp + i, (err) => {
                test.equal(err, null);
                if (++extracted === num) {
                    test.done();
                }
            });
        }
    });
};

module.exports.parallel['streaming 100 files from url'] = async function (test) {
    const num = 100;
    const server = http.createServer((req, res) => {
        send(req, 'test/ok/normal.zip').pipe(res)
    })

    server.listen(8000)
    const zip = new StreamZip.async({ url: 'http://127.0.0.1:8000/normal.zip' });
    let extracted = 0;
    const files = [
        'doc/changelog-foot.html',
        'doc/sh_javascript.min.js',
        'BSDmakefile',
        'README.md',
    ];
    for (let i = 0; i < num; i++) {
        const file = files[Math.floor(Math.random() * files.length)];
        await zip.extract(file, testPathTmp + i)
        if (++extracted === num) {
            test.done();
            server.close()
        }
    }
};

module.exports['callback exception'] = function (test) {
    test.expect(3);
    const zip = new StreamZip({ file: 'test/special/tiny.zip' });
    let streamError = false;
    let streamFinished = false;
    let callbackCallCount = 0;
    zip.once('entry', (entry) => {
        zip.stream(entry, (err, stream) => {
            callbackCallCount++;
            process.once('uncaughtException', (ex) => {
                test.equal(ex.message, 'descriptive message!');
                test.equal(callbackCallCount, 1);
                test.ok(!streamError && !streamFinished);
                test.done();
            });
            stream.on('data', () => {
                throw new Error('descriptive message!');
            });
            stream.on('error', () => {
                streamError = true;
            });
            stream.on('finish', () => {
                streamFinished = true;
            });
            const downstream = new require('stream').PassThrough();
            stream.pipe(downstream);
        });
    });
};

module.exports['async.entriesCount'] = async (test) => {
    const zip = new StreamZip.async({ file: 'test/ok/normal.zip' });
    let entryEventCount = 0;
    zip.on('entry', () => entryEventCount++);
    test.equal(await zip.entriesCount, 10);
    test.equal(await zip.comment, null);
    test.equal(entryEventCount, 10);
    test.done();
};

module.exports['async.entry'] = async (test) => {
    const zip = new StreamZip.async({ file: 'test/ok/normal.zip' });
    const entry = await zip.entry('README.md');
    test.ok(entry);
    test.equal(entry.name, 'README.md');
    test.done();
};

module.exports['async.entryData'] = async (test) => {
    const zip = new StreamZip.async({ file: 'test/ok/normal.zip' });
    const data = await zip.entryData('README.md');
    test.ok(data);
    test.ok(data.toString().includes('Evented I/O for V8 javascript'));
    test.done();
};

module.exports.setUp = function (done) {
    testPathTmp = basePathTmp + testNum++ + '/';
    if (!fs.existsSync(basePathTmp)) {
        fs.mkdirSync(basePathTmp);
    }
    if (fs.existsSync(testPathTmp)) {
        rmdirSync(testPathTmp);
    }
    fs.mkdirSync(testPathTmp);
    done();
};
module.exports.tearDown = function (done) {
    done();
};

process.on('exit', () => {
    rmdirSync(basePathTmp);
});
