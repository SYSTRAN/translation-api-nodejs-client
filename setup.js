// Copyright (c) 2016 SYSTRAN S.A.

var util = require('util');
var multipart = require('formidable/lib/multipart_parser');
var translationApi = require('./systran-translation-api');

var systranPlatformUrl = 'https://api-platform.systran.net';
var systranApiKey = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

var initOptions = {
  domain: systranPlatformUrl,
  token: {
    value: systranApiKey,
    isQuery: true,
    headerOrQueryName: 'key'
  }
};

exports.parseResponse = function (response, rawData, cb) {
  if (!cb) {cb = rawData; rawData = undefined;}

  if (!response) {
    console.error('Undefined response');
    cb('Undefined response');
    return;
  }

  response.then(function (value) {
    if (value.response)
      console.log('Response statusCode:', value.response.statusCode);

    if (Buffer.isBuffer(value.body) && !rawData)
      value.body = value.body.toString();

    if (typeof value.body === 'object')
      console.log('Response content:', util.inspect(value.body, false, null));
    else
      console.log('Response content:', value.body);

    cb(null, value.response, value.body);
  }, function (reason) {
    if (reason.response)
      console.error('reason.response.statusCode', reason.response.statusCode);

    if (reason.body)
      console.error('reason.body', reason.body);

    if (!reason.response && !reason.body)
      console.error('reason', reason);

    cb(reason);
  });
};

exports.parseMultipartResponse = function (response, cb) {
  if (!response) {
    console.error('Undefined response');
    cb('Undefined response');
    return;
  }

  response.then(function (value) {
    if (value.response)
      console.log('Response statusCode:', value.response.statusCode);

    console.log('Response header', value.response.headers, value.response.headers['content-type'] && value.response.headers['content-type'].split(';')[0] === 'multipart/mixed');
    console.log('Response content:', value.body);

    var languageDetection;
    var sourceContent;
    var outputContent;
    var m;
    if (!value.response.headers || !value.response.headers['content-type'] || value.response.headers['content-type'].split(';')[0] !== 'multipart/mixed') {
      console.log('Response header', value.response.headers, value.response.headers['content-type'] && value.response.headers['content-type'].split(';')[0] === 'multipart/mixed');
      console.error('invalid response header');
      cb('invalid multipart response header');
      return;
    }

    if ((m = value.response.headers['content-type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i))) {
      var parts = [];
      var partChunks = [];
      var mp_parser = new multipart.MultipartParser();
      var headerField = '', headerValue = '', headers = {}, counter = -1;

      mp_parser.initWithBoundary(m[1] || m[2]);

      mp_parser.onPartBegin = function() {
        partChunks = [];
        counter ++;
        headers[counter] = {};
      };

      mp_parser.onPartData = function(b, start, end) {
        var d = b.slice(start, end);
        partChunks.push(d);
      };

      mp_parser.onHeaderField = function(b, start, end) {
        headerField += b.toString('ascii', start, end);
      };

      mp_parser.onHeaderValue = function(b, start, end) {
        headerValue += b.toString('ascii', start, end);
      };

      mp_parser.onHeaderEnd = function() {
        if (headerField !== '')
          headers[counter][headerField] = headerValue;
        headerField = '';
        headerValue = '';
      };

      mp_parser.onPartEnd = function() {
        var b = Buffer.concat(partChunks);
        parts.push(b);
      };

      mp_parser.onEnd = function() {
        console.log('Finish multipart parser');

        if (parts.length <= 1 || parts.length > 3) {
          console.error('invalid multiparts length');
          cb('invalid multiparts length');
          return;
        }

        if (parts.length === 3) {
          languageDetection = JSON.parse(parts[0]);
          sourceContent = parts[1];
          outputContent = parts[2];
        } else {
          var header = headers[0] || {};
          if (header['part-name'] === 'detectedLanguage') {
            languageDetection = JSON.parse(parts[0]);
          } else {
            sourceContent = parts[0];
          }
          outputContent = parts[1];
        }

        cb(null, { languageDetection: languageDetection, sourceContent: sourceContent, outputContent: outputContent });
      };

      if (!Buffer.isBuffer(value.body)) {
        var data = value.body;
        if (data.length >= 2 && data[0] === '\r' && data[1] === '\n') {
          data = data.substr(2);
        }
        mp_parser.write(new Buffer(data, 'utf8'));
      }
      else {
        mp_parser.write(value.body);
      }
    }
    else {
      console.error('invalid multipart content');
      cb('invalid multipart content');
    }
  }, function (reason) {
    if (reason.response)
      console.log('reason.response.statusCode', reason.response.statusCode);

    if (reason.body)
      console.log('reason.body', reason.body);

    if (!reason.response && !reason.body)
      console.log('reason', reason);

    cb(reason);
  });
};

exports.translationClient = new translationApi.SystranTranslationApi(initOptions);
