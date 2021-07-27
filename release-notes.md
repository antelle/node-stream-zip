Release notes
-------------
##### v1.14.0 (2021-07-27)
`+` exported StreamZipAsync type  

##### v1.13.6 (2021-06-23)
`-` fixed compatibility with old node.js  

##### v1.13.5 (2021-06-08)
`-` fix #77: using recursive mkdir for deeply nested archives  

##### v1.13.4 (2021-05-04)
`+` funding link

##### v1.13.3 (2021-04-01)
`-` fixed typings (entry)

##### v1.13.2 (2021-02-23)
`-` fixed typings (entryData)  

##### v1.13.1 (2021-02-14)
`-` added missing `close` definition  

##### v1.13.0 (2021-02-05)
`+` added simple Promise api available as StreamZip.async  
`*` all methods now throw Error, not string  

##### v1.12.0 (2020-11-15)
`+` added an option to pass fd instead of file name  

##### v1.11.7 (2020-11-06)
`-` fixed type definitions  

##### v1.11.6 (2020-11-04)
`-` fixed type definitions  

##### v1.11.5 (2020-11-03)
`-` improved type definitions  

##### v1.11.4 (2020-10-31)
`-` fixed type definitions  

##### v1.11.3 (2020-08-14)
`-` fixed parameter type definition  

##### v1.11.2 (2020-06-02)
`-` fixed some TypeScript definitions  

##### v1.11.1 (2020-05-15)
`+` fixed typescript interface definition

##### v1.11.0 (2020-05-13)
`+` removed deflate64

##### v1.10.0 (2020-05-01)
`+` missing file added

##### v1.10.0 (2020-05-01)
`+` typescript interface

##### v1.9.2 (2020-04-28)
`-` fixed close() when zip was not found

##### v1.9.1 (2020-01-14)
`-` fixed callbacks in close()

##### v1.9.0 (2020-01-14)
`*` closing a file cancels all pending events

##### v1.8.2 (2019-07-04)
`+` upgraded modules

##### v1.8.1 (2019-07-04)
`+` included the license

##### v1.8.0 (2019-01-30)
`+` fixed deprecations

##### v1.7.0 (2018-04-20)
`+` parsing time values

##### v1.6.0 (2018-03-22)
`+` callback in `close` method

##### v1.5.0 (2018-02-28)
`+` openEntry method

##### v1.4.2 (2017-12-02)
`+` option to specify custom fs: `StreamZip.setFs`

##### v1.4.1 (2017-11-19)
`-` fixed folder extraction

##### v1.4.0 (2017-10-28)
Archives with malicious entries will throw an error  
`+` option to disable it: `skipEntryNameValidation`

##### v1.3.8 (2017-10-27)
Fix #20: throw errors

##### v1.3.7 (2017-01-16)
Fixed compatibility with node.js v0.10

##### v1.3.6 (2017-01-03)
Fix #14: error unpacking archives with a special comment  

##### v1.3.5 (2016-11-26)
Fix #12: descriptive error messages  

##### v1.3.4 (2016-07-23)
Fix #10: extraction of files larger than 4GB  

##### v1.3.3 (2016-04-05)
Fixed headerOffset bug  

##### v1.3.2 (2016-03-20)
Support 4GB+ ZIP64 archives  
`-` fix #5: correct parsing of ZIP64 headers  

##### v1.3.1 (2015-12-19)
ZIP64 unit test  

##### v1.3.0 (2015-12-19)
ZIP64 format support  

##### v1.2.2 (2015-11-24)
Tiny archives reading bugfix  
`-` fix #3: reading archives smaller than 1kb  

##### v1.2.1 (2015-03-01)
Exporting header offsets info  
`+` `headerOffset`, `centralDirectory`  

##### v1.1.1 (2015-03-01)
Bugfix  
`-` npm packging bug fixed  

##### v1.1.0 (2015-02-28)
Sync read feature  
`+` `StreamZip.entryDataSync` method

##### v1.0.0 (2015-02-23)
First stable release  
