console.log('Loading zip...');
var StreamZip = require('./node-stream-zip.js');
var zip = new StreamZip({
    file: './test/ok/normal.zip',
    storeEntries: true
});
//zip.on('error', function(err) { console.error('ERROR: ' + err); });
zip.on('ready', function() {
    //console.dir(zip.entry('README.md'));
    console.log('Done in ' + process.uptime() + '. Entries read: ' + zip.entriesCount);
    //zip.stream('README.md', function(err, stm) {
    //    if (err)
    //        return console.error(err);
    //    console.log('Entry data:\n');
    //    stm.pipe(process.stdout);
    //});
    //zip.extract('README.md', 'd:/temp/ext/', function(err) {
    //    console.log('Entry extracted');
    //});
    zip.extract(null, 'd:/temp/ext', function(err, count) {
        console.log('Extracted ' + count + ' entries');
    });
});
zip.on('extract', function(entry, file) {
    console.log('extract', entry.name, file);
});
