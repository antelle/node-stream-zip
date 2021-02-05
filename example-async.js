/* eslint-disable no-console,no-unused-vars */
const StreamZip = require('./');

(async () => {
    console.log('Loading zip...');

    const zip = new StreamZip.async({ file: './test/ok/normal.zip' });
    const entriesCount = await zip.entriesCount;

    console.log(`Done in ${process.uptime()}s. Entries read: ${entriesCount}`);

    const entry = await zip.entry('README.md');
    console.log('Entry for README.md:', entry);

    const data = await zip.entryData('README.md');
    const firstLine = data.toString().split('\n')[0].trim();
    console.log(`First line of README.md: "${firstLine}"`);

    async function streamDataToStdOut() {
        const stm = await zip.stream('README.md');
        console.log('README.md contents streamed:\n');
        stm.pipe(process.stdout);
    }

    async function extractEntry() {
        await zip.extract('README.md', './tmp');
    }

    async function extractAll() {
        const extracted = await zip.extract(null, './tmp');
        console.log(`Extracted ${extracted} entries`);
    }

    await zip.close();
})().catch(console.error);
