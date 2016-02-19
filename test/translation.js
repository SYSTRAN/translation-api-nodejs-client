// Copyright (c) 2016 SYSTRAN S.A.

var fs = require('fs');
var path = require('path');
var async = require('async');
var setup = require('../setup');

describe('Translation', function() {
  this.timeout(60000);
  describe('Get api version', function() {
    it('should get api version without error', function(done) {
      var result = setup.translationClient.getTranslationApiVersion();
      setup.parseResponse(result, done);
    });
  });

  describe('Get supported languages', function() {
    it('should get list of supported languages without error', function(done) {
      var result = setup.translationClient.getTranslationSupportedLanguages();
      setup.parseResponse(result, done);
    });
  });

  describe('Get list of supported formats with their outputs for the translation', function() {
    it('should get list of supported formats without error', function(done) {
      var result = setup.translationClient.getTranslationSupportedLanguages();
      setup.parseResponse(result, done);
    });
  });

  describe('Get list of profiles available for translation', function() {
    it('should get list of profiles without error', function(done) {
      var result = setup.translationClient.getTranslationProfile();
      setup.parseResponse(result, done);
    });
  });

  describe('Translate text', function() {
    it('should translate a text from English to French', function(done) {
      var src = 'en';
      var tgt = 'fr';
      var input = 'This is a test';
      var result = setup.translationClient.postTranslationTextTranslate({source: src, target: tgt, input: input});
      setup.parseResponse(result, done);
    });

    it('should translate a text Auto into French', function(done) {
      var tgt = 'fr';
      var input = 'This is a sentence';
      var result = setup.translationClient.postTranslationTextTranslate({target: tgt, input: input});
      setup.parseResponse(result, done);
    });

    it('should translate several inputs Auto into French', function(done) {
      var tgt = 'fr';
      var input = ['This is a sentence', 'This is another sentence'];
      var result = setup.translationClient.postTranslationTextTranslate({target: tgt, input: input});
      setup.parseResponse(result, done);
    });

    it('should translate several inputs Auto into French and return source also in the response', function(done) {
      var tgt = 'fr';
      var withSource= true;
      var input = ['This is a sentence', 'This is another sentence'];
      var result = setup.translationClient.postTranslationTextTranslate({target: tgt, input: input, withSource: withSource});
      setup.parseResponse(result, function(err, res, body) {
        if (err) {
          done(new Error(err));
          return;
        }

        if (!body || !body.outputs || !body.outputs.length) {
          done(new Error('Unexpected response'));
          return;
        }

        for (var i = 0; i < body.outputs.length; i++) {
          var out = body.outputs[i];
          if (!out || !out.source || !out.detectedLanguage || !out.output) {
            done(new Error('Unexpected response'));
            return;
          }
        }

        done();
      });
    });

    it('should translate a html input Auto into French', function(done) {
      var tgt = 'fr';
      var input = '<html>this is <b>black</b> dog';
      var result = setup.translationClient.postTranslationTextTranslate({target: tgt, input: input});
      setup.parseResponse(result, done);
    });

    it('should translate several html inputs Auto into French with format and source annotation', function(done) {
      var tgt = 'fr';
      var input = ['<html>this is <b>black</b> dog', '<html>this is <b>white</b> cat'];
      var format = 'text/html';
      var withSource = true;
      var withAnnotation = true;
      var result = setup.translationClient.postTranslationTextTranslate({target: tgt, input: input, format: format, withSource: withSource, withAnnotations: withAnnotation});
      setup.parseResponse(result, function(err, res, body) {
        if (err) {
          done(new Error(err));
          return;
        }

        if (!body || !body.outputs || !body.outputs.length) {
          done(new Error('Unexpected response'));
          return;
        }

        for (var i = 0; i < body.outputs.length; i++) {
          var out = body.outputs[i];
          if (!out || !out.source || !out.detectedLanguage || !out.output) {
            done(new Error('Unexpected response'));
            return;
          }
        }

        done();
      });
    });
  });

  describe('Translate file synchronously', function() {
    it('should translate a file from English to French without error', function(done) {
      var src = 'en';
      var tgt = 'fr';
      var inputFile = fs.readFileSync(path.join(__dirname, 'test.html'));
      var result = setup.translationClient.postTranslationFileTranslate({source: src, target: tgt, input: inputFile});
      var rawData = true;
      setup.parseResponse(result, rawData, function(err, res, body) {
        if (err) {
          done(new Error(err));
          return;
        }

        fs.writeFile(path.join(__dirname, 'output_test.html'), body, function(err) {
          if (err) {
            done(new Error(err));
            return;
          }

          console.log('Translation result saved in :', path.join(__dirname, 'output_test.html'));
          done();
        });
      });
    });

    it('should translate a file Auto into French without error', function(done) {
      var tgt = 'fr';
      var inputFile = fs.readFileSync(path.join(__dirname, 'test.html'));
      var result = setup.translationClient.postTranslationFileTranslate({target: tgt, input: inputFile});
      setup.parseMultipartResponse(result, function(err, data) {
        if (err) {
          done(new Error(err));
          return;
        }

        console.log('Result', data);
        if (!data || !data.outputContent) {
          done(new Error('Invalid response'));
          return;
        }

        fs.writeFile(path.join(__dirname, 'output_test.html'), data.outputContent, function(err) {
          if (err) {
            done(new Error(err));
            return;
          }

          console.log('Translation result saved in :', path.join(__dirname, 'output_test.html'));
          done();
        });
      });
    });

    it('should translate a file from English to French with source returned in response', function(done) {
      var src = 'en';
      var tgt = 'fr';
      var withSource = true;
      var withAnnotations = true;
      var inputFile = fs.readFileSync(path.join(__dirname, 'test.html'));
      var result = setup.translationClient.postTranslationFileTranslate({source: src, target: tgt, withSource: withSource, withAnnotations: withAnnotations, input: inputFile});
      setup.parseMultipartResponse(result, function(err, data) {
        if (err) {
          done(new Error(err));
          return;
        }

        console.log('Result', data);
        if (!data || !data.outputContent || !data.sourceContent) {
          done(new Error('Invalid response'));
          return;
        }

        fs.writeFile(path.join(__dirname, 'output_test.html'), data.outputContent, function(err) {
          if (err) {
            done(new Error(err));
            return;
          }

          console.log('Translation result saved in :', path.join(__dirname, 'output_test.html'));
          fs.writeFile(path.join(__dirname, 'returned_source.html'), data.sourceContent, function(err) {
            if (err) {
              done(new Error(err));
              return;
            }

            console.log('Returned source saved in :', path.join(__dirname, 'returned_source.html'));
            done();
          });
        });
      });
    });
  });

  describe('Translate file asynchronously', function() {
    it('should translate a file from English to French in async mode', function(done) {
      var src = 'en';
      var tgt = 'fr';
      var async = true;
      var inputFile = fs.readFileSync(path.join(__dirname, 'test.html'));
      var result = setup.translationClient.postTranslationFileTranslate({source: src, target: tgt, input: inputFile, async: async});
      setup.parseResponse(result, function(err, res, body) {
        if (err) {
          done(new Error(err));
          return;
        }

        if (!body || !body.requestId) {
          done(new Error('Unexpected response'));
          return;
        }

        var requestId = body.requestId;
        var status = setup.translationClient.getTranslationFileStatus({requestId: requestId});
        setup.parseResponse(status, function(err, res, body) {
          if (err) {
            done(new Error(err));
            return;
          }

          var timeout = 5000;
          if (!body || body.status !== 'finished')
            timeout = 30000; // wait 30 seconds

          setTimeout(function() {
            var result = setup.translationClient.getTranslationFileResult({requestId: requestId});
            var rawData = true;
            setup.parseResponse(result, rawData, function(err, res, body) {
              if (err) {
                done(new Error(err));
                return;
              }

              fs.writeFile(path.join(__dirname, 'output_test.html'), body, function(err) {
                if (err) {
                  done(new Error(err));
                  return;
                }

                console.log('Translation result saved in :', path.join(__dirname, 'output_test.html'));
                done();
              });
            });
          }, timeout);
        });
      });
    });

    it('should translate a file from Auto into French in async mode with withSource and withAnnotation options', function(done) {
      var tgt = 'fr';
      var withSource = true;
      var withAnnotations = true;
      var async = true;
      var inputFile = fs.readFileSync(path.join(__dirname, 'test.html'));
      var result = setup.translationClient.postTranslationFileTranslate({target: tgt, input: inputFile, async: async, withSource: withSource, withAnnotations: withAnnotations});
      setup.parseResponse(result, function(err, res, body) {
        if (err) {
          done(new Error(err));
          return;
        }

        if (!body || !body.requestId) {
          done(new Error('Unexpected response'));
          return;
        }

        var requestId = body.requestId;
        var status = setup.translationClient.getTranslationFileStatus({requestId: requestId});
        setup.parseResponse(status, function(err, res, body) {
          if (err) {
            done(new Error(err));
            return;
          }

          var timeout = 5000;
          if (!body || body.status !== 'finished')
            timeout = 30000; // wait 30 seconds

          setTimeout(function() {
            var result = setup.translationClient.getTranslationFileResult({requestId: requestId});
            setup.parseMultipartResponse(result, function(err, data) {
              if (err) {
                done(new Error(err));
                return;
              }

              console.log('Result', data);
              if (!data || !data.outputContent || !data.sourceContent) {
                done(new Error('Invalid response'));
                return;
              }

              fs.writeFile(path.join(__dirname, 'output_test.html'), data.outputContent, function(err) {
                if (err) {
                  done(new Error(err));
                  return;
                }

                console.log('Translation result saved in :', path.join(__dirname, 'output_test.html'));
                fs.writeFile(path.join(__dirname, 'returned_source.html'), data.sourceContent, function(err) {
                  if (err) {
                    done(new Error(err));
                    return;
                  }

                  console.log('Returned source saved in :', path.join(__dirname, 'returned_source.html'));
                  done();
                });
              });
            });
          }, timeout);
        });
      });
    });
  });

  describe('Translate with batch', function() {
    it('should create a new batch to send several translation requests in this batch, get translation results and then close the batch', function(done) {
      async.waterfall([
        function(cb) {
          // create new batch
          var result = setup.translationClient.postTranslationFileBatchCreate();
          setup.parseResponse(result, function(err, res, body) {
            if (err) {
              cb(err);
              return;
            }

            if (!body || !body.batchId) {
              cb('Unexpected batch creation response');
              return;
            }

            cb(null, body.batchId);
          });
        },
        function(batchId, cb) {
          // show batch status
          var result = setup.translationClient.getTranslationFileBatchStatus({batchId: batchId});
          setup.parseResponse(result, function(err) {
            cb(err, batchId);
          });
        },
        function(batchId, cb) {
          // add a translation request to the batch
          var src = 'en';
          var tgt = 'fr';
          var async = true;
          var inputFile = fs.readFileSync(path.join(__dirname, 'test.html'));
          var result = setup.translationClient.postTranslationFileTranslate({source: src, target: tgt, input: inputFile, batchId: batchId, async: async});
          setup.parseResponse(result, function(err, res, body) {
            if (err) {
              cb(err);
              return;
            }

            if (!body || !body.requestId) {
              cb('Unexpected file translation response');
              return;
            }

            cb(null, batchId, body.requestId);
          });
        },
        function(batchId, requestId, cb) {
          // verify new status
          var result = setup.translationClient.getTranslationFileBatchStatus({batchId: batchId});
          setup.parseResponse(result, function(err, res, body) {
            if (err) {
              cb(err);
              return;
            }

            if (!body || !body.requests || !body.requests.length) {
              cb('Unexpected batch status');
              return;
            }

            var found;
            for(var i = 0; i < body.requests.length; i++) {
              var req = body.requests[i];
              if (req && req.id === requestId) {
                found = true;
                break;
              }
            }

            if (!found) {
              console.error('Cannot find the translation request ', requestId, ' in this batch');
              cb('Request not found in batch');
              return;
            }

            cb(null, batchId, requestId);
          });
        },
        function(batchId, requestId, cb) {
          // wait 5 second to get translation result
          setTimeout(function() {
            var result = setup.translationClient.getTranslationFileResult({requestId: requestId});
            var rawData = true;
            setup.parseResponse(result, rawData, function(err, res, body) {
              if (err) {
                cb(err);
                return;
              }

              fs.writeFile(path.join(__dirname, 'output_test.html'), body, function(err) {
                if (err) {
                  done(new Error(err));
                  return;
                }

                console.log('Translation result saved in :', path.join(__dirname, 'output_test.html'));
                cb(null, batchId);
              });
            });
          }, 5000);
        },
        function(batchId, cb) {
          // close the batch
          var result = setup.translationClient.postTranslationFileBatchClose({batchId: batchId});
          setup.parseResponse(result, function(err) {
            cb(err);
          });
        }
      ], function(err) {
        if (err)
          err = new Error(err);

        done(err);
      });
    });
  });
});