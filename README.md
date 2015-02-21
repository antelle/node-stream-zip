# node-stream-zip

node.js library for reading and extraction of ZIP archives.  
Features:

- it never loads entire archive into memory, everything is read by chunks  
- large archives support  
- all operations are non-blocking  
- fast initialization  
- no dependencies or binary addons  
- decompression with built-in zlib streams

# Warning: alpha version

The project is in active development for now, approx stable release with tests and bugfixes in March'15. 

# Installation

`$ npm install node-stream-zip`
	
# Usage

```javascript
var StreamZip = require('./node-stream-zip.js');  
var zip = new StreamZip({  
    file: 'archive.zip',  
    storeEntries: true    
});
zip.on('error', function(err) { console.error('ERROR: ' + err); });
zip.on('ready', function() {
    // console.log('Loaded. Entries read: ' + zip.entriesCount);
    // stream to stdout
    zip.stream('node/benchmark/net/tcp-raw-c2s.js', function(err, stm) {
        stm.pipe(process.stdout);
    });
    // stream to file
    zip.extract('node/benchmark/net/tcp-raw-c2s.js', 'd:/temp/', function(err) {
        console.log('Entry extracted');
    });
    // stream folder
    zip.extract('node/benchmark/', 'd:/temp/ext', function(err, count) {
        console.log('Extracted ' + count + ' entries');
    });
});
zip.on('extract', function(entry, file) {
    console.log('extract', entry.name, file);
});
```

# Contributors

ZIP parsing code has been forked from [adm-zip](https://github.com/cthackers/adm-zip)