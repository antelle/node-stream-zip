console.log('Loading zip...');
var StreamZip = require('./node-stream-zip.js');
var zip = new StreamZip({
    file: 'd:/temp/node.zip',
    storeEntries: true
});
//zip.on('error', function(err) { console.error('ERROR: ' + err); });
zip.on('ready', function() {
    console.log('Done in ' + process.uptime() + '. Entries read: ' + zip.entriesCount);
    //zip.stream('node/benchmark/net/tcp-raw-c2s.js', function(err, stm) {
    //    console.log('Entry data:\n');
    //    stm.pipe(process.stdout);
    //});
    //zip.extract('node/benchmark/net/tcp-raw-c2s.js', 'd:/temp/', function(err) {
    //    console.log('Entry extracted');
    //});
    //zip.extract('node/benchmark/', 'd:/temp/ext', function(err, count) {
    //    console.log('Extracted ' + count + ' entries');
    //});
});
zip.on('extract', function(entry, file) {
    console.log('extract', entry.name, file);
});
