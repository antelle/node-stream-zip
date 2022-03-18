/// <reference types="node" />

declare namespace StreamZip {
    interface StreamZipOptions {
        /**
         * File to read
         * @default undefined
         */
        file?: string;

        /**
         * Alternatively, you can pass fd here
         * @default undefined
         */
        fd?: number;

        /**
         * http(s) url to stream from
         * The server should support HEAD request returning content-length and Range header
         * @default undefined
         */
         url?: string;

        /**
         * You will be able to work with entries inside zip archive,
         * otherwise the only way to access them is entry event
         * @default true
         */
        storeEntries?: boolean;

        /**
         * By default, entry name is checked for malicious characters, like ../ or c:\123,
         * pass this flag to disable validation error
         * @default false
         */
        skipEntryNameValidation?: boolean;

        /**
         * Filesystem read chunk size
         * @default automatic based on file size
         */
        chunkSize?: number;

        /**
         * Encoding used to decode file names
         * @default UTF8
         */
        nameEncoding?: string;
    }

    interface ZipEntry {
        /**
         * file name
         */
        name: string;

        /**
         * true if it's a directory entry
         */
        isDirectory: boolean;

        /**
         * true if it's a file entry, see also isDirectory
         */
        isFile: boolean;

        /**
         * file comment
         */
        comment: string;

        /**
         * if the file is encrypted
         */
        encrypted: boolean;

        /**
         * version made by
         */
        verMade: number;

        /**
         * version needed to extract
         */
        version: number;

        /**
         * encrypt, decrypt flags
         */
        flags: number;

        /**
         * compression method
         */
        method: number;

        /**
         * modification time
         */
        time: number;

        /**
         * uncompressed file crc-32 value
         */
        crc: number;

        /**
         * compressed size
         */
        compressedSize: number;

        /**
         * uncompressed size
         */
        size: number;

        /**
         * volume number start
         */
        diskStart: number;

        /**
         * internal file attributes
         */
        inattr: number;

        /**
         * external file attributes
         */
        attr: number;

        /**
         * LOC header offset
         */
        offset: number;
    }

    class StreamZipAsync {
        constructor(config: StreamZipOptions);

        entriesCount: Promise<number>;
        comment: Promise<string>;

        entry(name: string): Promise<ZipEntry | undefined>;
        entries(): Promise<{ [name: string]: ZipEntry }>;
        entryData(entry: string | ZipEntry): Promise<Buffer>;
        stream(entry: string | ZipEntry): Promise<NodeJS.ReadableStream>;
        extract(entry: string | ZipEntry | null, outPath: string): Promise<number | undefined>;

        on(event: 'entry', handler: (entry: ZipEntry) => void): void;
        on(event: 'extract', handler: (entry: ZipEntry, outPath: string) => void): void;

        close(): Promise<void>;
    }
}

type StreamZipOptions = StreamZip.StreamZipOptions;
type ZipEntry = StreamZip.ZipEntry;

declare class StreamZip {
    constructor(config: StreamZipOptions);

    /**
     * number of entries in the archive
     */
    entriesCount: number;

    /**
     * archive comment
     */
    comment: string;

    on(event: 'error', handler: (error: any) => void): void;
    on(event: 'entry', handler: (entry: ZipEntry) => void): void;
    on(event: 'ready', handler: () => void): void;
    on(event: 'extract', handler: (entry: ZipEntry, outPath: string) => void): void;

    entry(name: string): ZipEntry | undefined;

    entries(): { [name: string]: ZipEntry };

    stream(
        entry: string | ZipEntry,
        callback: (err: any | null, stream?: NodeJS.ReadableStream) => void
    ): void;

    entryDataSync(entry: string | ZipEntry): Buffer;

    openEntry(
        entry: string | ZipEntry,
        callback: (err: any | null, entry?: ZipEntry) => void,
        sync: boolean
    ): void;

    extract(
        entry: string | ZipEntry | null,
        outPath: string,
        callback: (err?: any, res?: number) => void
    ): void;

    close(callback?: (err?: any) => void): void;

    static async: typeof StreamZip.StreamZipAsync;
}

export = StreamZip;
