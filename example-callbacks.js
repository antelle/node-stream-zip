/* eslint-disable no-console,no-unused-vars */
const StreamZip = require('./');

const zip = new StreamZip({ file: './test/ok/normal.zip' });
zip.on('error', (err) => {
    console.error('ERROR: ' + err);
});
zip.on('ready', () => {
    const entriesCount = zip.entriesCount;
    console.log(`Done in ${process.uptime()}s. Entries read: ${entriesCount}`);

    const entry = zip.entry('README.md');
    console.log('Entry for README.md:', entry);

    const data = zip.entryDataSync('README.md');
    const firstLine = data.toString().split('\n')[0].trim();
    console.log(`First line of README.md: "${firstLine}"`);

    zip.close();

    function streamDataToStdOut() {
        zip.stream('README.md', (err, stm) => {
            if (err) {
                return console.error(err);
            }
            console.log('README.md contents streamed:\n');
            stm.pipe(process.stdout);
        });
    }

    function extractEntry() {
        zip.extract('README.md', './tmp', (err) => {
            console.log(err ? err : 'Entry extracted');
            zip.close();
        });
    }

    function extractAll() {
        zip.extract(null, './tmp', (err, count) => {
            console.log(err ? err : `Extracted ${count} entries`);
            zip.close();
        });
    }
});
zip.on('extract', (entry, file) => {
    console.log('extract', entry.name, file);
});
