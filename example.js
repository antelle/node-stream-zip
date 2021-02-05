/* eslint-disable no-console */
console.log('Loading zip...');
const StreamZip = require('./node_stream_zip.js');
const zip = new StreamZip({
    file: './test/ok/normal.zip',
});
zip.on('error', (err) => {
    console.error('ERROR: ' + err);
});
zip.on('ready', () => {
    //console.dir(zip.entry('README.md'));
    console.log('Done in ' + process.uptime() + '. Entries read: ' + zip.entriesCount);
    //console.log(zip.entryDataSync('README.md').toString());
    zip.stream('README.md', (err, stm) => {
        if (err) {
            return console.error(err);
        }
        console.log('Entry data:\n');
        stm.pipe(process.stdout);
    });
    //zip.extract('README.md', './tmp', function(err) {
    //    console.log(err ? err : 'Entry extracted');
    //    zip.close();
    //});
    // zip.extract(null, './tmp', function (err, count) {
    //     console.log(err ? err : 'Extracted ' + count + ' entries');
    //     zip.close();
    // });
});
zip.on('extract', (entry, file) => {
    console.log('extract', entry.name, file);
});
