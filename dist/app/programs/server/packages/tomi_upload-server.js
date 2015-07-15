(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var RoutePolicy = Package.routepolicy.RoutePolicy;

/* Package-scope variables */
var UploadServer;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/tomi:upload-server/upload_server.js                                                            //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
var formidable = Npm.require('formidable');                                                                // 1
var http = Npm.require('http');                                                                            // 2
var sys = Npm.require('sys');                                                                              // 3
//var connect = Npm.require('connect');                                                                    // 4
var url = Npm.require('url');                                                                              // 5
var path = Npm.require('path');                                                                            // 6
var fs = Npm.require('fs');                                                                                // 7
var Fiber = Npm.require('fibers');                                                                         // 8
                                                                                                           // 9
var _existsSync = fs.existsSync || path.existsSync;                                                        // 10
var imageMagick = Npm.require('imagemagick');                                                              // 11
                                                                                                           // 12
var options = {                                                                                            // 13
  /** @type String*/                                                                                       // 14
  tmpDir: null,                                                                                            // 15
  /** @type String*/                                                                                       // 16
  uploadDir: null,                                                                                         // 17
  uploadUrl: '/upload/',                                                                                   // 18
  checkCreateDirectories: false,                                                                           // 19
  maxPostSize: 11000000000, // 11 GB                                                                       // 20
  minFileSize: 1,                                                                                          // 21
  maxFileSize: 10000000000, // 10 GB                                                                       // 22
  acceptFileTypes: /.+/i,                                                                                  // 23
  // Files not matched by this regular expression force a download dialog,                                 // 24
  // to prevent executing any scripts in the context of the service domain:                                // 25
  inlineFileTypes: /\.(gif|jpe?g|png)$/i,                                                                  // 26
  imageTypes: /\.(gif|jpe?g|png)$/i,                                                                       // 27
  imageVersions: {                                                                                         // 28
    'thumbnail': {                                                                                         // 29
      width: 200,                                                                                          // 30
      height: 200                                                                                          // 31
    }                                                                                                      // 32
  },                                                                                                       // 33
  cacheTime: 86400,                                                                                        // 34
  getDirectory: function (fileInfo, formData) {                                                            // 35
    return ""                                                                                              // 36
  },                                                                                                       // 37
  getFileName: function (fileInfo, formData) {                                                             // 38
    return fileInfo.name;                                                                                  // 39
  },                                                                                                       // 40
  finished: function () {                                                                                  // 41
  },                                                                                                       // 42
  validateRequest: function () {                                                                           // 43
    return null;                                                                                           // 44
  },                                                                                                       // 45
  validateFile: function () {                                                                              // 46
    return null;                                                                                           // 47
  },                                                                                                       // 48
  accessControl: {                                                                                         // 49
    allowOrigin: '*',                                                                                      // 50
    allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',                                                 // 51
    allowHeaders: 'Content-Type, Content-Range, Content-Disposition'                                       // 52
  },                                                                                                       // 53
  mimeTypes: {                                                                                             // 54
    "html": "text/html",                                                                                   // 55
    "jpeg": "image/jpeg",                                                                                  // 56
    "jpg": "image/jpeg",                                                                                   // 57
    "png": "image/png",                                                                                    // 58
    "gif": "image/gif",                                                                                    // 59
    "js": "text/javascript",                                                                               // 60
    "css": "text/css",                                                                                     // 61
    "pdf": "application/pdf",                                                                              // 62
    "doc": "application/msword",                                                                           // 63
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",                     // 64
    "zip": "application/zip, application/x-compressed-zip",                                                // 65
    "txt": "text/plain"                                                                                    // 66
  }                                                                                                        // 67
  /* Uncomment and edit this section to provide the service via HTTPS:                                     // 68
   ssl: {                                                                                                  // 69
   key: fs.readFileSync('/Applications/XAMPP/etc/ssl.key/server.key'),                                     // 70
   cert: fs.readFileSync('/Applications/XAMPP/etc/ssl.crt/server.crt')                                     // 71
   },                                                                                                      // 72
   */                                                                                                      // 73
};                                                                                                         // 74
                                                                                                           // 75
                                                                                                           // 76
UploadServer = {                                                                                           // 77
  init: function (opts) {                                                                                  // 78
    if (opts.checkCreateDirectories != null) options.checkCreateDirectories = opts.checkCreateDirectories; // 79
                                                                                                           // 80
    if (opts.tmpDir == null) {                                                                             // 81
      throw new Meteor.Error('Temporary directory needs to be assigned!');                                 // 82
    } else {                                                                                               // 83
      options.tmpDir = opts.tmpDir;                                                                        // 84
    }                                                                                                      // 85
                                                                                                           // 86
    if (opts.cacheTime) {                                                                                  // 87
      options.cacheTime = opts.cacheTime;                                                                  // 88
    }                                                                                                      // 89
                                                                                                           // 90
    if (opts.mimeTypes != null) {                                                                          // 91
      for (var key in opts.mimeTypes) {                                                                    // 92
        options.mimeTypes[key] = opts.mimeTypes[key];                                                      // 93
      }                                                                                                    // 94
    }                                                                                                      // 95
                                                                                                           // 96
    if (opts.checkCreateDirectories) {                                                                     // 97
      checkCreateDirectory(options.tmpDir);                                                                // 98
    }                                                                                                      // 99
                                                                                                           // 100
    if (opts.uploadDir == null) {                                                                          // 101
      throw new Meteor.Error('Upload directory needs to be assigned!');                                    // 102
    } else {                                                                                               // 103
      options.uploadDir = opts.uploadDir;                                                                  // 104
    }                                                                                                      // 105
                                                                                                           // 106
    if (options.checkCreateDirectories) {                                                                  // 107
      checkCreateDirectory(options.uploadDir);                                                             // 108
    }                                                                                                      // 109
                                                                                                           // 110
    if (opts.maxPostSize != null) options.maxPostSize = opts.maxPostSize;                                  // 111
    if (opts.minFileSize != null) options.minFileSize = opts.maxPostSize;                                  // 112
    if (opts.maxFileSize != null) options.maxFileSize = opts.maxFileSize;                                  // 113
    if (opts.acceptFileTypes != null) options.acceptFileTypes = opts.acceptFileTypes;                      // 114
    if (opts.imageTypes != null) options.imageTypes = opts.imageTypes;                                     // 115
    if (opts.validateRequest != null) options.validateRequest = opts.validateRequest;                      // 116
    if (opts.validateFile != null) options.validateFile = opts.validateFile;                               // 117
    if (opts.getDirectory != null) options.getDirectory = opts.getDirectory;                               // 118
    if (opts.getFileName != null) options.getFileName = opts.getFileName;                                  // 119
    if (opts.finished != null) options.finished = opts.finished;                                           // 120
                                                                                                           // 121
    if (opts.uploadUrl) options.uploadUrl = opts.uploadUrl;                                                // 122
                                                                                                           // 123
    if (opts.imageVersions != null) options.imageVersions = opts.imageVersions                             // 124
    else options.imageVersions = [];                                                                       // 125
  },                                                                                                       // 126
  delete: function (filePath) {                                                                            // 127
                                                                                                           // 128
    // make sure paths are correct                                                                         // 129
    fs.unlinkSync(path.join(options.uploadDir, filePath));                                                 // 130
  },                                                                                                       // 131
  serve: function (req, res) {                                                                             // 132
    if (options.tmpDir == null || options.uploadDir == null) {                                             // 133
      throw new Meteor.Error('Upload component not initialised!');                                         // 134
    }                                                                                                      // 135
                                                                                                           // 136
    res.setHeader(                                                                                         // 137
      'Access-Control-Allow-Origin',                                                                       // 138
      options.accessControl.allowOrigin                                                                    // 139
    );                                                                                                     // 140
    res.setHeader(                                                                                         // 141
      'Access-Control-Allow-Methods',                                                                      // 142
      options.accessControl.allowMethods                                                                   // 143
    );                                                                                                     // 144
    res.setHeader(                                                                                         // 145
      'Access-Control-Allow-Headers',                                                                      // 146
      options.accessControl.allowHeaders                                                                   // 147
    );                                                                                                     // 148
    var handleResult = function (result, redirect) {                                                       // 149
        if (redirect) {                                                                                    // 150
          res.writeHead(302, {                                                                             // 151
            'Location': redirect.replace(                                                                  // 152
              /%s/,                                                                                        // 153
              encodeURIComponent(JSON.stringify(result))                                                   // 154
            )                                                                                              // 155
          });                                                                                              // 156
          res.end();                                                                                       // 157
        } else if (result.error) {                                                                         // 158
          res.writeHead(403, {'Content-Type': 'text/plain'});                                              // 159
          res.write(result.error);                                                                         // 160
          res.end();                                                                                       // 161
        } else {                                                                                           // 162
          //res.writeHead(200, {                                                                           // 163
          //  'Content-Type': req.headers.accept                                                           // 164
          //    .indexOf('application/json') !== -1 ?                                                      // 165
          //    'application/json' : 'text/plain'                                                          // 166
          //});                                                                                            // 167
          res.end(JSON.stringify(result));                                                                 // 168
        }                                                                                                  // 169
      },                                                                                                   // 170
      setNoCacheHeaders = function () {                                                                    // 171
        if (options.cacheTime) {                                                                           // 172
          res.setHeader('Cache-Control', 'public, max-age=' + options.cacheTime);                          // 173
        } else {                                                                                           // 174
          res.setHeader('Pragma', 'no-cache');                                                             // 175
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');                           // 176
          // res.setHeader('Content-Disposition', 'inline; filename="files.json"');                        // 177
        }                                                                                                  // 178
      },                                                                                                   // 179
      handler = new UploadHandler(req, res, handleResult);                                                 // 180
                                                                                                           // 181
                                                                                                           // 182
    // validate the request                                                                                // 183
    var error = options.validateRequest(req, res);                                                         // 184
    if (error) {                                                                                           // 185
      res.writeHead(403, {'Content-Type': 'text/plain'});                                                  // 186
      res.write(error);                                                                                    // 187
      res.end();                                                                                           // 188
      return;                                                                                              // 189
    }                                                                                                      // 190
                                                                                                           // 191
    switch (req.method) {                                                                                  // 192
      case 'OPTIONS':                                                                                      // 193
        res.end();                                                                                         // 194
        break;                                                                                             // 195
      case 'HEAD':                                                                                         // 196
      case 'GET':                                                                                          // 197
        setNoCacheHeaders();                                                                               // 198
                                                                                                           // 199
        var uri = url.parse(req.url).pathname;                                                             // 200
        var filename = path.join(options.uploadDir, unescape(uri));                                        // 201
        var stats;                                                                                         // 202
                                                                                                           // 203
        try {                                                                                              // 204
          stats = fs.lstatSync(filename); // throws if path doesn't exist                                  // 205
        } catch (e) {                                                                                      // 206
          res.writeHead(404, {'Content-Type': 'text/plain'});                                              // 207
          res.write('404 Not Found\n');                                                                    // 208
          res.end();                                                                                       // 209
          return;                                                                                          // 210
        }                                                                                                  // 211
                                                                                                           // 212
        if (stats.isFile()) {                                                                              // 213
          // path exists, is a file                                                                        // 214
          var mimeType = options.mimeTypes[path.extname(filename).split(".").reverse()[0]];                // 215
          if (!mimeType) {                                                                                 // 216
            mimeType = "application/octet-stream";                                                         // 217
          }                                                                                                // 218
          res.writeHead(200, {'Content-Type': mimeType});                                                  // 219
                                                                                                           // 220
          //connect.static(options.uploadDir)(req, res);                                                   // 221
          var fileStream = fs.createReadStream(filename);                                                  // 222
          fileStream.pipe(res);                                                                            // 223
                                                                                                           // 224
        } else if (stats.isDirectory()) {                                                                  // 225
          // path exists, is a directory                                                                   // 226
          res.writeHead(403, {'Content-Type': 'text/plain'});                                              // 227
          res.write('Access denied');                                                                      // 228
          res.end();                                                                                       // 229
        } else {                                                                                           // 230
          res.writeHead(500, {'Content-Type': 'text/plain'});                                              // 231
          res.write('500 Internal server error\n');                                                        // 232
          res.end();                                                                                       // 233
        }                                                                                                  // 234
        break;                                                                                             // 235
      case 'POST':                                                                                         // 236
        // validate post                                                                                   // 237
        setNoCacheHeaders();                                                                               // 238
        handler.post();                                                                                    // 239
        break;                                                                                             // 240
      //case 'DELETE':                                                                                     // 241
      //  handler.destroy();                                                                               // 242
      //  break;                                                                                           // 243
      default:                                                                                             // 244
        res.statusCode = 405;                                                                              // 245
        res.end();                                                                                         // 246
    }                                                                                                      // 247
  }                                                                                                        // 248
}                                                                                                          // 249
                                                                                                           // 250
var utf8encode = function (str) {                                                                          // 251
  return unescape(encodeURIComponent(str));                                                                // 252
};                                                                                                         // 253
                                                                                                           // 254
var nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/;                                                  // 255
                                                                                                           // 256
var nameCountFunc = function (s, index, ext) {                                                             // 257
  return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');                                      // 258
};                                                                                                         // 259
                                                                                                           // 260
var FileInfo = function (file) {                                                                           // 261
  this.name = file.name;                                                                                   // 262
  this.size = file.size;                                                                                   // 263
  this.type = file.type;                                                                                   // 264
};                                                                                                         // 265
                                                                                                           // 266
var UploadHandler = function (req, res, callback) {                                                        // 267
  this.req = req;                                                                                          // 268
  this.res = res;                                                                                          // 269
  this.callback = callback;                                                                                // 270
};                                                                                                         // 271
                                                                                                           // 272
FileInfo.prototype.validate = function () {                                                                // 273
  this.error = null;                                                                                       // 274
  if (options.minFileSize && options.minFileSize > this.size) {                                            // 275
    this.error = 'File is too small';                                                                      // 276
  } else if (options.maxFileSize && options.maxFileSize < this.size) {                                     // 277
    this.error = 'File is too big';                                                                        // 278
  } else if (!options.acceptFileTypes.test(this.name)) {                                                   // 279
    this.error = 'Filetype not allowed';                                                                   // 280
  }                                                                                                        // 281
  return this.error;                                                                                       // 282
};                                                                                                         // 283
                                                                                                           // 284
FileInfo.prototype.safeName = function () {                                                                // 285
  // Prevent directory traversal and creating hidden system files:                                         // 286
  this.name = path.basename(this.name).replace(/^\.+/, '');                                                // 287
  // Prevent overwriting existing files:                                                                   // 288
  while (_existsSync(options.uploadDir + '/' + this.name)) {                                               // 289
    this.name = this.name.replace(nameCountRegexp, nameCountFunc);                                         // 290
  }                                                                                                        // 291
};                                                                                                         // 292
                                                                                                           // 293
FileInfo.prototype.initUrls = function (req, form) {                                                       // 294
  if (!this.error) {                                                                                       // 295
    var that = this,                                                                                       // 296
      subDirectory = options.getDirectory(this.name, form.formFields),                                     // 297
      baseUrl = (options.ssl ? 'https:' : 'http:') +                                                       // 298
        '//' + req.headers.host + options.uploadUrl;                                                       // 299
    this.url = baseUrl + (subDirectory ? (subDirectory + '/') : '') + encodeURIComponent(this.name);       // 300
    Object.keys(options.imageVersions).forEach(function (version) {                                        // 301
      if (_existsSync(                                                                                     // 302
          options.uploadDir + '/' + version + '/' + that.name                                              // 303
        )) {                                                                                               // 304
        that[version + 'Url'] = baseUrl + version + '/' +                                                  // 305
        encodeURIComponent(that.name);                                                                     // 306
      }                                                                                                    // 307
    });                                                                                                    // 308
  }                                                                                                        // 309
};                                                                                                         // 310
                                                                                                           // 311
UploadHandler.prototype.post = function () {                                                               // 312
  var handler = this,                                                                                      // 313
    form = new formidable.IncomingForm(),                                                                  // 314
    tmpFiles = [],                                                                                         // 315
    files = [],                                                                                            // 316
    map = {},                                                                                              // 317
    counter = 1,                                                                                           // 318
    redirect,                                                                                              // 319
    finish = function () {                                                                                 // 320
      counter -= 1;                                                                                        // 321
      if (!counter) {                                                                                      // 322
        files.forEach(function (fileInfo) {                                                                // 323
          fileInfo.initUrls(handler.req, form);                                                            // 324
        });                                                                                                // 325
        handler.callback({files: files}, redirect);                                                        // 326
      }                                                                                                    // 327
    };                                                                                                     // 328
  form.uploadDir = options.tmpDir;                                                                         // 329
  form.on('fileBegin', function (name, file) {                                                             // 330
    tmpFiles.push(file.path);                                                                              // 331
    var fileInfo = new FileInfo(file, handler.req, true);                                                  // 332
    fileInfo.safeName();                                                                                   // 333
                                                                                                           // 334
    // validate post                                                                                       // 335
    var error = options.validateFile(file);                                                                // 336
    if (error) {                                                                                           // 337
      res.writeHead(403, {'Content-Type': 'text/plain'});                                                  // 338
      res.write(error);                                                                                    // 339
      res.end();                                                                                           // 340
      return;                                                                                              // 341
    }                                                                                                      // 342
                                                                                                           // 343
    map[path.basename(file.path)] = fileInfo;                                                              // 344
    files.push(fileInfo);                                                                                  // 345
  }).on('field', function (name, value) {                                                                  // 346
    if (name === 'redirect') {                                                                             // 347
      redirect = value;                                                                                    // 348
    }                                                                                                      // 349
    // remember all the form fields                                                                        // 350
    if (this.formFields == null) {                                                                         // 351
      this.formFields = {};                                                                                // 352
    }                                                                                                      // 353
    //  console.log('Form field: ' + name + "-" + value);                                                  // 354
    this.formFields[name] = value;                                                                         // 355
  }).on('file', function (name, file) {                                                                    // 356
    var fileInfo = map[path.basename(file.path)];                                                          // 357
    fileInfo.size = file.size;                                                                             // 358
                                                                                                           // 359
    var error = fileInfo.validate();                                                                       // 360
    if (error) {                                                                                           // 361
      // delete file                                                                                       // 362
      fs.unlinkSync(file.path);                                                                            // 363
      // callback with error                                                                               // 364
      handler.callback({error: error});                                                                    // 365
      return;                                                                                              // 366
    }                                                                                                      // 367
                                                                                                           // 368
    // we can store files in subdirectories                                                                // 369
    var folder = options.getDirectory(fileInfo, this.formFields);                                          // 370
    // check if directory exists, if not, create all the directories                                       // 371
    var subFolders = folder.split('/');                                                                    // 372
    var currentFolder = options.uploadDir;                                                                 // 373
    for (var i = 0; i < subFolders.length; i++) {                                                          // 374
      currentFolder += '/' + subFolders[i];                                                                // 375
                                                                                                           // 376
      if (!fs.existsSync(currentFolder)) {                                                                 // 377
        fs.mkdirSync(currentFolder);                                                                       // 378
      }                                                                                                    // 379
    }                                                                                                      // 380
                                                                                                           // 381
    // possibly rename file if needed;                                                                     // 382
    var newFileName = options.getFileName(fileInfo, this.formFields);                                      // 383
                                                                                                           // 384
    // set the file name                                                                                   // 385
    fileInfo.name = newFileName;                                                                           // 386
    fileInfo.path = folder + "/" + newFileName;                                                            // 387
                                                                                                           // 388
    fs.renameSync(file.path, currentFolder + "/" + newFileName);                                           // 389
                                                                                                           // 390
    if (options.imageTypes.test(fileInfo.name)) {                                                          // 391
      Object.keys(options.imageVersions).forEach(function (version) {                                      // 392
        counter += 1;                                                                                      // 393
        var opts = options.imageVersions[version];                                                         // 394
                                                                                                           // 395
        // check if version directory exists                                                               // 396
        if (!fs.existsSync(currentFolder + '/' + version)) {                                               // 397
          fs.mkdirSync(currentFolder + '/' + version);                                                     // 398
        }                                                                                                  // 399
                                                                                                           // 400
        imageMagick.resize({                                                                               // 401
          width: opts.width,                                                                               // 402
          height: opts.height,                                                                             // 403
          srcPath: currentFolder + '/' + newFileName,                                                      // 404
          dstPath: currentFolder + '/' + version + '/' + newFileName                                       // 405
        }, finish);                                                                                        // 406
      });                                                                                                  // 407
    }                                                                                                      // 408
                                                                                                           // 409
    // call the feedback within its own fiber                                                              // 410
    var formFields = this.formFields;                                                                      // 411
    Fiber(function () {                                                                                    // 412
      options.finished(fileInfo, formFields);                                                              // 413
    }).run();                                                                                              // 414
                                                                                                           // 415
  }).on('aborted', function () {                                                                           // 416
    tmpFiles.forEach(function (file) {                                                                     // 417
      fs.unlink(file);                                                                                     // 418
    });                                                                                                    // 419
  }).on('error', function (e) {                                                                            // 420
    console.log('ERROR');                                                                                  // 421
    console.log(e);                                                                                        // 422
  }).on('progress', function (bytesReceived, bytesExpected) {                                              // 423
    if (bytesReceived > options.maxPostSize) {                                                             // 424
      handler.req.connection.destroy();                                                                    // 425
    }                                                                                                      // 426
  }).on('end', finish).parse(handler.req);                                                                 // 427
};                                                                                                         // 428
                                                                                                           // 429
UploadHandler.prototype.destroy = function () {                                                            // 430
  var handler = this,                                                                                      // 431
    fileName;                                                                                              // 432
  if (handler.req.url.slice(0, options.uploadUrl.length) === options.uploadUrl) {                          // 433
    fileName = path.basename(decodeURIComponent(handler.req.url));                                         // 434
    if (fileName[0] !== '.') {                                                                             // 435
      fs.unlink(options.uploadDir + '/' + fileName, function (ex) {                                        // 436
        Object.keys(options.imageVersions).forEach(function (version) {                                    // 437
          fs.unlink(options.uploadDir + '/' + version + '/' + fileName);                                   // 438
        });                                                                                                // 439
        handler.callback({success: !ex});                                                                  // 440
      });                                                                                                  // 441
      return;                                                                                              // 442
    }                                                                                                      // 443
  }                                                                                                        // 444
  handler.callback({success: false});                                                                      // 445
};                                                                                                         // 446
                                                                                                           // 447
// create directories                                                                                      // 448
                                                                                                           // 449
var checkCreateDirectory = function (dir) {                                                                // 450
  if (!dir) {                                                                                              // 451
    return;                                                                                                // 452
  }                                                                                                        // 453
                                                                                                           // 454
  var dirParts = dir.split('/');                                                                           // 455
  var currentDir = '/';                                                                                    // 456
                                                                                                           // 457
  for (var i = 0; i < dirParts.length; i++) {                                                              // 458
    if (!dirParts[i]) {                                                                                    // 459
      continue;                                                                                            // 460
    }                                                                                                      // 461
                                                                                                           // 462
    currentDir += dirParts[i] + '/';                                                                       // 463
                                                                                                           // 464
    if (!fs.existsSync(currentDir)) {                                                                      // 465
      fs.mkdirSync(currentDir);                                                                            // 466
      console.log('Created directory: ' + currentDir);                                                     // 467
    }                                                                                                      // 468
  }                                                                                                        // 469
}                                                                                                          // 470
                                                                                                           // 471
// declare routes                                                                                          // 472
                                                                                                           // 473
RoutePolicy.declare(options.uploadUrl, 'network');                                                         // 474
WebApp.connectHandlers.use(options.uploadUrl, UploadServer.serve);                                         // 475
                                                                                                           // 476
                                                                                                           // 477
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/tomi:upload-server/router.js                                                                   //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
//Router.route('/upload', function () {                                                                    // 1
//  var req = this.request;                                                                                // 2
//  var res = this.response;                                                                               // 3
//                                                                                                         // 4
//  console.log('doing something');                                                                        // 5
//                                                                                                         // 6
//  UploadServer.serve(req, res);                                                                          // 7
//}, { where: 'server' });                                                                                 // 8
                                                                                                           // 9
                                                                                                           // 10
//Router.map(function () {                                                                                 // 11
//  this.route('upload', {                                                                                 // 12
//    path: '/upload/(.*)',                                                                                // 13
//    where: 'server',                                                                                     // 14
//    action: function() {                                                                                 // 15
//      UploadServer.serve(this.request, this.response);                                                   // 16
//    }                                                                                                    // 17
//  });                                                                                                    // 18
//});                                                                                                      // 19
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['tomi:upload-server'] = {
  UploadServer: UploadServer
};

})();

//# sourceMappingURL=tomi_upload-server.js.map
