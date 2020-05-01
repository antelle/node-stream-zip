Release notes
-------------
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
