# node-stream-zip [![Build status](https://travis-ci.org/antelle/node-stream-zip.svg?branch=master)](https://travis-ci.org/antelle/node-stream-zip)

node.js library for reading and extraction of ZIP archives.
Features:

- it never loads entire archive into memory, everything is read by chunks
- large archives support
- all operations are non-blocking, no sync i/o
- fast initialization
- no dependencies, no binary addons
- decompression with built-in zlib module
- deflate, deflate64, sfx, macosx/windows built-in archives
- ZIP64 support

# Installation

`$ npm install node-stream-zip`

# Usage

```javascript
var StreamZip = require('node-stream-zip');
var zip = new StreamZip({
    file: 'archive.zip',
    storeEntries: true
});

// a helper function to secure against maliciously crafted zip files
function safeResolve(basepath, zippath) {
    var pathname = path.resolve(basepath, zippath);
    var isSafe = /\.\./.test(path.relative(basepath, pathname));
    if (!isSafe) {
        throw new Error('maliciously crafted zip file contains illegal directory:', entry.name);
    }
    return pathname;
}

zip.on('error', function(err) { console.error(err.stack); });
zip.on('ready', function() {
    console.log('Entries read: ' + zip.entriesCount);

    var outpath = './temp';
    var entries = zip.entries();

    function nextEntry() {
        var entry = entries.pop();

        if (!entry) {
            zip.close();
            // Call your final callback here
            console.log('Unzip complete');
            return;
        }

        var isDir = /\/$/.test(entry.name);

        //
        // Example: Handle individual files
        //
        if (isDir) {
            console.log('[DIR]', entry.name);
            nextEntry();
            return;
        }

        // Example: stream to stdout
        zip.stream(entry.name, function (err, stm) {
            stm.pipe(process.stdout);
            stm.on('end', nextEntry);
        });

        // Example: Extract safely and with full path
        zip.extract(entry.name, safeResolve('./temp/', entry.name), function(err) {
            console.log('Entry extracted');
            nextEntry();
        });

        // Example: Extract unsafely and file without full path
        zip.extract(entry.name, './temp/', function(err) {
            console.log('Entry extracted');
            nextEntry();
        });

        // Example: read file as buffer in sync way
        var data = zip.entryDataSync('README.md');
        // do something with data
        nextEntry();

        //
        // Example: Handle only directories
        //
        if (!isDir) {
            nextEntry();
            return;
        }

        // Extract: extract the entire directory tree
        // (Note: not good for iterating since directories
        // may contain subdirectories and you would double-extract
        zip.extract(entry.name, safeResolve('./temp/', entry.name), function (err, count) {
            console.log('Extracted ' + count + ' entries');
            nextEntry();
        });
    }

    // Example: handle the first entry (and recursively handle the next in serial)
    nextEntry();


    // Example: Extract all entries at once
    zip.extract(null, './temp/', function(err, count) {
        console.log('Extracted ' + count + ' entries');
    });
});
zip.on('extract', function(entry, file) {
    console.log('Extracted ' + entry.name + ' to ' + file);
});
zip.on('entry', function(entry) {
    // called on load, when entry description has been read
    // you can already stream this entry, without waiting until all entry descriptions are read (suitable for very large archives)
    console.log('Read entry ', entry.name);
});
```

If you pass `storeEntries: true` to constructor, you will be able to access entries inside zip archive with:

- `zip.entries()` - get all entries description
- `zip.entry(name)` - get entry description by name
- `zip.stream(entry, function(err, stm) { })` - get entry data reader stream
- `zip.entryDataSync(entry)` - get entry data in sync way
- `zip.close()` - cleanup after all entries have been read, stream, extracted, or otherwised handled

# Building

The project doesn't require building. To run unit tests with [nodeunit](https://github.com/caolan/nodeunit):
`$ npm test`

# Known issues

- [utf8](https://github.com/rubyzip/rubyzip/wiki/Files-with-non-ascii-filenames) file names
- AES encrypted files

# Contributors

ZIP parsing code has been partially forked from [cthackers/adm-zip](https://github.com/cthackers/adm-zip) (MIT license).
