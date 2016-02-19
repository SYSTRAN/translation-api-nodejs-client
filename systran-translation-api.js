// Copyright (c) 2016 SYSTRAN S.A.

/*jshint -W069 */
/**
 * ### Introduction

Translation API is a tool that automatically translates text from one language to another.

The source text is the text to be translated. The source language is the language that the source text is written in. The target language is the language that the source text is translated into.

This document is intended for developers who want to write applications that can interact with the Translation API. You can use the Translation API to programmatically translate text on your webpages or apps.

You need an API Key to use Translate API.


### Cross Domain

Translation API supports cross-domain requests through the JSONP or the CORS mechanism.

Translation API also supports the Silverlight client access policy file (clientaccesspolicy.xml) and the Adobe Flash cross-domain policy file (crossdomain.xml) that handles cross-domain requests.

#### JSONP Support

Translation API supports JSONP by providing the name of the callback function as a parameter. The response body will be contained in the parentheses:

```javascript
callbackFunctionName(/* response body as defined in each API section *\/);
```
#### CORS

Translation API supports the CORS mechanism to handle cross-domain requests. The server will correctly handle the OPTIONS requests used by CORS.

The following headers are set as follows:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: X-Requested-With,Content-Type,X-HTTP-METHOD-OVERRIDE
```

### Langage Code Values

The language codes to be used are the two-letter codes defined by the ISO 639-1:2002, Codes for the representation of names of languages - Part 1: Alpha-2 code standard.

Refer to the column 'ISO 639-1 code' of this list: http://www.loc.gov/standards/iso639-2/php/code_list.php.

In addition to this list, the following codes are used:

Language Code |	Language
--------------|---------
auto | Language Detection
tj | Tajik (cyrillic script)
zh-Hans | Chinese (Simplified)
zh-Hant |	Chinese (Traditional)


### Escaping of the input text

The input text passed as a URL parameter will be escaped with an equivalent of the javascript 'encodeURIComponent' function.

### Encoding of the input text

The input text must be encoded in UTF-8.

### Encoding of the output text

The output text (translated text, error and warning strings) will be encoded in UTF-8.

### Mobile API keys

** iOS **: If you use an iOS API key, you need to add the following parameter to each request:
* `bundleId`: Your application bundle ID

<br />

** Android **: If you use an Android API key, you need to add the following parameters to each request:
* `packageName`: Your application package name
* `certFingerprint`: Your application certificate fingerprint

 * @class SystranTranslationApi
 * @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
 * @param {string} [domainOrOptions.domain] - The project domain
 * @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties
 */
var SystranTranslationApi = (function() {
    'use strict';

    var request = require('request');
    var Q = require('q');

    function SystranTranslationApi(options) {
        var domain = (typeof options === 'object') ? options.domain : options;
        this.domain = domain ? domain : '';
        if (this.domain.length === 0) {
            throw new Error('Domain parameter must be specified as a string.');
        }
        this.token = (typeof options === 'object') ? (options.token ? options.token : {}) : {};
    }

    /**
     * Set Token
     * @method
     * @name SystranTranslationApi#setToken
     * @param {string} value - token's value
     * @param {string} headerOrQueryName - the header or query name to send the token at
     * @param {boolean} isQuery - true if send the token as query param, otherwise, send as header param
     *
     */
    SystranTranslationApi.prototype.setToken = function(value, headerOrQueryName, isQuery) {
        this.token.value = value;
        this.token.headerOrQueryName = headerOrQueryName;
        this.token.isQuery = isQuery;
    };

    /**
     * Translate text from source language to target language

     * @method
     * @name SystranTranslationApi#postTranslationTextTranslate
     * @param {array} input - Input text. This parameter can be repeated. 100000 paragraphs / 50 MB maximum per request (please contact SYSTRAN support for more).

     * @param {string} source - Source language code ([details](#description_langage_code_values)) or `auto`.

    When the value is set to `auto`, the language will be automatically detected, used to enhance the translation, and returned in output.

     * @param {string} target - Target language code ([details](#description_langage_code_values))
     * @param {string} format - Format of the source text.

    Use 'name' property of supported formats api response ([details](#Translation_get_translation_supportedFormats)).

     * @param {integer} profile - Profile id to apply for translation (Advanced usage - Please contact SYSTRAN representative for more details on how to get customized translation profiles).

     * @param {boolean} withSource - If `true`, the source will also be sent back in the response message. It can be useful when used with the withAnnotations option to align the source document with the translated document

     * @param {boolean} withAnnotations - If `true`, different annotations will be provided in the translated document. If the option 'withSource' is used, the annotations will also be provided in the source document. It will provide segments, tokens, not found words,...

     * @param {string} withDictionary - User Dictionary or/and Normalization Dictionary ids to be applied to the translation result. Each dictionary 'id' has to be separated by a comma (5 dictionaries maximum). This option has to be used in combination with Dictionary Resource Management APIs.

     * @param {string} withCorpus - Corpus to be applied to the translation result. Each corpus 'id' has to be separated by a comma. If an exact match is found in one of the corpuses selected during translation, then the translation from the corpus will be applied instead of the automatic translation. (5 corpus maximum). This option has to be used in combination with Corpus Resource Management APIs.

     * @param {boolean} backTranslation - If `true`, the translated text will be translated back in source language

     * @param {array} options - Additional advanced options that may be given by SYSTRAN Support team for specific use cases.

    An option can be a JSON object containing a set of key/value generic options supported by the translator. It can also be a string with the syntax '<key>:<value>' to pass a key/value generic option to the translator.

     * @param {string} encoding - Encoding. `base64` can be useful to send binary documents in the JSON body. Please note that another alternative is to use translateFile

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.postTranslationTextTranslate = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/text/translate';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['input'] !== undefined) {
            queryParameters['input'] = parameters['input'];
        }

        if (parameters['input'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: input'));
            return deferred.promise;
        }

        if (parameters['source'] !== undefined) {
            queryParameters['source'] = parameters['source'];
        }

        if (parameters['target'] !== undefined) {
            queryParameters['target'] = parameters['target'];
        }

        if (parameters['target'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: target'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        if (parameters['profile'] !== undefined) {
            queryParameters['profile'] = parameters['profile'];
        }

        if (parameters['withSource'] !== undefined) {
            queryParameters['withSource'] = parameters['withSource'];
        }

        if (parameters['withAnnotations'] !== undefined) {
            queryParameters['withAnnotations'] = parameters['withAnnotations'];
        }

        if (parameters['withDictionary'] !== undefined) {
            queryParameters['withDictionary'] = parameters['withDictionary'];
        }

        if (parameters['withCorpus'] !== undefined) {
            queryParameters['withCorpus'] = parameters['withCorpus'];
        }

        if (parameters['backTranslation'] !== undefined) {
            queryParameters['backTranslation'] = parameters['backTranslation'];
        }

        if (parameters['options'] !== undefined) {
            queryParameters['options'] = parameters['options'];
        }

        if (parameters['encoding'] !== undefined) {
            queryParameters['encoding'] = parameters['encoding'];
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'POST',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Translate a file from source language to target language


    * In asynchronous mode (async=true), the response will be a JSON containing a request identifier. This identifier can then be used to poll the request status and its result when completed.

      ```
      {
         "requestId": "54a3d860e62ea467b136eddb" /* Request identifier to use to get the status,
                                                    the result of the request and to cancel it *\/
         "error": {
           "message": "" /* Error at request level *\/
           "info": {}
         }
      }
      ```

    * In synchronous mode, the response will be either:

      * The **translated document**, directly, if `source` parameters was not `auto` and `withSource` was not true
      * A `multipart/mixed` document with the following parts:

        1. **Detected language**, if request was done with `auto` source language

          * Header:

            `part-name: detectedLanguage`

          * Body: JSON document
            ```
            {
              detectedLanguage: "string"
              detectedLanguageConfidence : number
            }
            ```

        2. **Source document**, if request was done with `withSource`:

          * Header: `part-name: source`
          * Body: Source document

        3. **Translated document**

          * Header: `part-name: output`

          * Body: Translated document

     * @method
     * @name SystranTranslationApi#postTranslationFileTranslate
     * @param {file} input - Input file. 100000 paragraphs / 50 MB maximum per request (please contact SYSTRAN support for more).

     * @param {string} source - Source language code ([details](#description_langage_code_values)) or `auto`.

    When the value is set to `auto`, the language will be automatically detected, used to enhance the translation, and returned in output.

     * @param {string} target - Target language code ([details](#description_langage_code_values))
     * @param {string} format - Format of the source text.

    Use 'name' property of supported formats api response ([details](#Translation_get_translation_supportedFormats)).

     * @param {integer} profile - Profile id to apply for translation (Advanced usage - Please contact SYSTRAN representative for more details on how to get customized translation profiles).

     * @param {boolean} withSource - If `true`, the source will also be sent back in the response message. It can be useful when used with the withAnnotations option to align the source document with the translated document

     * @param {boolean} withAnnotations - If `true`, different annotations will be provided in the translated document. If the option 'withSource' is used, the annotations will also be provided in the source document. It will provide segments, tokens, not found words,...

     * @param {string} withDictionary - User Dictionary or/and Normalization Dictionary ids to be applied to the translation result. Each dictionary 'id' has to be separated by a comma (5 dictionaries maximum). This option has to be used in combination with Dictionary Resource Management APIs.

     * @param {string} withCorpus - Corpus to be applied to the translation result. Each corpus 'id' has to be separated by a comma. If an exact match is found in one of the corpuses selected during translation, then the translation from the corpus will be applied instead of the automatic translation. (5 corpus maximum). This option has to be used in combination with Corpus Resource Management APIs.

     * @param {array} options - Additional advanced options that may be given by SYSTRAN Support team for specific use cases.

    An option can be a JSON object containing a set of key/value generic options supported by the translator. It can also be a string with the syntax '<key>:<value>' to pass a key/value generic option to the translator.

     * @param {string} encoding - Encoding. `base64` can be useful to send binary documents in the JSON body. Please note that another alternative is to use translateFile

     * @param {boolean} async - If `true`, the translation is performed asynchronously.

    The "/translation/file/status" service must be used to wait for the completion of the request and the "/translation/file/result" service must be used to get the final result. The "/translation/file/cancel" can be used to cancel the request.

     * @param {string} batchId - Batch Identifier of the batch to which the translation request will be associated. Only asynchronous requests (`async=true`) can be associated to a batch.

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.postTranslationFileTranslate = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/file/translate';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['input'] !== undefined) {
            form['input'] = parameters['input'];
        }

        if (parameters['input'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: input'));
            return deferred.promise;
        }

        if (parameters['source'] !== undefined) {
            queryParameters['source'] = parameters['source'];
        }

        if (parameters['target'] !== undefined) {
            queryParameters['target'] = parameters['target'];
        }

        if (parameters['target'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: target'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        if (parameters['profile'] !== undefined) {
            queryParameters['profile'] = parameters['profile'];
        }

        if (parameters['withSource'] !== undefined) {
            queryParameters['withSource'] = parameters['withSource'];
        }

        if (parameters['withAnnotations'] !== undefined) {
            queryParameters['withAnnotations'] = parameters['withAnnotations'];
        }

        if (parameters['withDictionary'] !== undefined) {
            queryParameters['withDictionary'] = parameters['withDictionary'];
        }

        if (parameters['withCorpus'] !== undefined) {
            queryParameters['withCorpus'] = parameters['withCorpus'];
        }

        if (parameters['options'] !== undefined) {
            queryParameters['options'] = parameters['options'];
        }

        if (parameters['encoding'] !== undefined) {
            queryParameters['encoding'] = parameters['encoding'];
        }

        if (parameters['async'] !== undefined) {
            queryParameters['async'] = parameters['async'];
        }

        if (parameters['batchId'] !== undefined) {
            queryParameters['batchId'] = parameters['batchId'];
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'POST',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Get the status of an asynchronous translation request

    The translation result is available when the value of the status field is `finished`.

    The translation request is unsuccessful when the value of the status field is `error`.

     * @method
     * @name SystranTranslationApi#getTranslationFileStatus
     * @param {string} requestId - Request Identifier

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.getTranslationFileStatus = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/file/status';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['requestId'] !== undefined) {
            queryParameters['requestId'] = parameters['requestId'];
        }

        if (parameters['requestId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: requestId'));
            return deferred.promise;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'GET',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Cancel an asynchronous translation request. Requests with status `Finished` or `error` are not modified. Requests with other statuses are cancelled. Note that for the statuses `started` and `pending`, the cancellation can take some time to be effective.

     * @method
     * @name SystranTranslationApi#postTranslationFileCancel
     * @param {string} requestId - Request Identifier

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.postTranslationFileCancel = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/file/cancel';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['requestId'] !== undefined) {
            queryParameters['requestId'] = parameters['requestId'];
        }

        if (parameters['requestId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: requestId'));
            return deferred.promise;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'POST',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Get the result of an asynchronous translation request

    Depending on the initial request, the response can have multiple formats:
      * The **translated document**, directly, if `source` parameters was not `auto` and `withSource` was not true
      * A `multipart/mixed` document with the following parts:

        1. **Detected language**, if request was done with `auto` source language

          * Header:

            `part-name: detectedLanguage`

          * Body: JSON document
            ```
            {
              detectedLanguage: "string"
              detectedLanguageConfidence : number
            }
            ```

        2. **Source document**, if request was done with `withSource`:

          * Header: `part-name: source`
          * Body: Source document

        3. **Translated document**

          * Header: `part-name: output`

          * Body: Translated document

    An error can occur in the following cases:
    * Invalid request ID
    * No result available (see request status for more information)
    * Unable to retrieve the result
    * ...

     * @method
     * @name SystranTranslationApi#getTranslationFileResult
     * @param {string} requestId - Request Identifier

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.getTranslationFileResult = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/file/result';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['requestId'] !== undefined) {
            queryParameters['requestId'] = parameters['requestId'];
        }

        if (parameters['requestId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: requestId'));
            return deferred.promise;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'GET',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Create a new translation batch, to which asynchronous translation requests can be associated. You may create a batch if you want to follow up simultaneously several translation requests. 

     * @method
     * @name SystranTranslationApi#postTranslationFileBatchCreate
     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.postTranslationFileBatchCreate = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/file/batch/create';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'POST',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Get the status of the translation requests of a translation batch

     * @method
     * @name SystranTranslationApi#getTranslationFileBatchStatus
     * @param {string} batchId - Batch Identifier

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.getTranslationFileBatchStatus = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/file/batch/status';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['batchId'] !== undefined) {
            queryParameters['batchId'] = parameters['batchId'];
        }

        if (parameters['batchId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: batchId'));
            return deferred.promise;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'GET',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Cancel a translation batch. This will cancel also all ongoing translation requests.

     * @method
     * @name SystranTranslationApi#postTranslationFileBatchCancel
     * @param {string} batchId - Batch Identifier

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.postTranslationFileBatchCancel = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/file/batch/cancel';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['batchId'] !== undefined) {
            queryParameters['batchId'] = parameters['batchId'];
        }

        if (parameters['batchId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: batchId'));
            return deferred.promise;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'POST',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Close a translation batch. This will prevent new requests to be added to the batch. Eventual ongoing translation requests of the batch will go on.

     * @method
     * @name SystranTranslationApi#postTranslationFileBatchClose
     * @param {string} batchId - Batch Identifier

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.postTranslationFileBatchClose = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/file/batch/close';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['batchId'] !== undefined) {
            queryParameters['batchId'] = parameters['batchId'];
        }

        if (parameters['batchId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: batchId'));
            return deferred.promise;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'POST',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * List of language pairs in which translation is supported.

    This list can be limited to a specific source language or target language.

     * @method
     * @name SystranTranslationApi#getTranslationSupportedLanguages
     * @param {array} source - Language code of the source text

     * @param {array} target - Language code into which to translate the source text

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.getTranslationSupportedLanguages = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/supportedLanguages';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['source'] !== undefined) {
            queryParameters['source'] = parameters['source'];
        }

        if (parameters['target'] !== undefined) {
            queryParameters['target'] = parameters['target'];
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'GET',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * List of supported formats with their outputs for the translation.

     * @method
     * @name SystranTranslationApi#getTranslationSupportedFormats
     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.getTranslationSupportedFormats = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/supportedFormats';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'GET',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * Current version for translation apis

     * @method
     * @name SystranTranslationApi#getTranslationApiVersion
     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.getTranslationApiVersion = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/apiVersion';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'GET',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };
    /**
     * List of profiles available for translation.

     * @method
     * @name SystranTranslationApi#getTranslationProfile
     * @param {string} source - Source language code of the profile
     * @param {string} target - Target Language code of the profile

     * @param {array} id - Identifier of the profile

     * @param {string} callback - Javascript callback function name for JSONP Support

     * 
     */
    SystranTranslationApi.prototype.getTranslationProfile = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/translation/profile';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (this.token.isQuery) {
            queryParameters[this.token.headerOrQueryName] = this.token.value;
        } else if (this.token.headerOrQueryName) {
            headers[this.token.headerOrQueryName] = this.token.value;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token.value;
        }

        if (parameters['source'] !== undefined) {
            queryParameters['source'] = parameters['source'];
        }

        if (parameters['target'] !== undefined) {
            queryParameters['target'] = parameters['target'];
        }

        if (parameters['id'] !== undefined) {
            queryParameters['id'] = parameters['id'];
        }

        if (parameters['callback'] !== undefined) {
            queryParameters['callback'] = parameters['callback'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'GET',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body,
            encoding: null
        };
        if (Object.keys(form).length > 0) {
            req.formData = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };

    return SystranTranslationApi;
})();

exports.SystranTranslationApi = SystranTranslationApi;