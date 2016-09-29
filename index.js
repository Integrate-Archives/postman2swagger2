'use strict';

var fs = require('fs');
var path = require('path');

var Converter = module.exports = {};

var newSwaggerDocument = {};
var postmanDocument = {};
var requestOptions = {};
var environmentMapping = Object.create(null);
var requestUrls = [];
var commonUrl;
var basePath;
var hostUrl;

Converter.convert = function(options, callback) {
  requestOptions = options;
  newSwaggerDocument = {};
  var filepath = path.resolve(requestOptions.url);  

  //Get access to JSON object from user passed in Postman JSON.
  fs.readFile(filepath, 'utf8', function(err, data) {
    if (err) {
      throw err;
    }
    postmanDocument = JSON.parse(data);
    if (requestOptions.environment) {
      var envFilepath = path.resolve(requestOptions.environment);

      //Get access to JSON object from user passed in Environment JSON.
      fs.readFile(envFilepath, 'utf8', function(err, environment) {
        var environmentVariables = JSON.parse(environment);
        replaceEnvironmentVariables(environmentVariables.values);
        convertToPostman(postmanDocument);
      })
    } else {
      convertToPostman(postmanDocument);
    }
    fs.writeFile(requestOptions.outPut, JSON.stringify(newSwaggerDocument), 'utf8', function() {
      //successfull file write.
    });
    
  });
}

/**
 * Replace all environment variables.
 * 
 * @param values {array} Array of all Environment variables for Postman.
 */
function replaceEnvironmentVariables(values) {
  for (var value = 0; value < values.length; value++) {
    if (typeof values[value].value === 'string' && values[value].value.length > 0) {
      environmentMapping[values[value].key] = values[value].value; 
    }
  }
  postmanDocument = objectWalker(postmanDocument);
}

/**
 * Replace all environment variables with value from environment JSON passed in by user.
 * 
 * @param {object} obj Postman JSON passed in my user.
 * @return {obj} Altered Postman JSON with replaced environment variables.
 */
function objectWalker(obj) {
  var k;
  var has = Object.prototype.hasOwnProperty.bind(obj);
  for (k in obj) {
    if (has(k)) {
      switch (typeof obj[k]) {
        case 'object':
          objectWalker(obj[k]);
          break;
        case 'string':
          var variablesFound = obj[k].match(/{{\s*[\w\.]+\s*}}/g);
          if (variablesFound && variablesFound.length) {
            for (var variable = 0; variable < variablesFound.length; variable++) {
              var variableName = variablesFound[variable].replace('{{', '').replace('}}', '');
              obj[k] = obj[k].replace(variablesFound[variable], environmentMapping[variableName])
            }
          } 
      }
    }
  }
  return obj;
}

/**
 * Call all function to convert Postman JSON to Swagger JSON.
 * 
 * @param {object} data Postman JSON object from file passed in by user.
 */
function convertToPostman(data) {
  setSwaggerVersion();
  setSwaggerInfo();
  findBaseUrl();
  setSwaggerHost();
  setSwaggerBasePath();
  setSwaggerPaths();
}

/**
 * Set the swagger verison in JSON.
 */
function setSwaggerVersion() {
  //TODO(jcarter): Make dynamic when Swagger Version 1 is supported.
  newSwaggerDocument.swagger = "2.0"
}

/**
 * Build the swagger info object. http://swagger.io/specification/#infoObject
 */
function setSwaggerInfo() {
  /* 
   * Not included:
   * termsOfService: string: The Terms of Service for the API.
   * contact: http://swagger.io/specification/#contactObject: The contact information for the exposed API.
   * license: http://swagger.io/specification/#licenseObject: The license information for the exposed API.
  */
  newSwaggerDocument.info = {
    "version": "",
    "title": postmanDocument.name,
    "description": postmanDocument.description
  }
}

/**
 * Find the common base of all requests to use as base Url.
 * 
 * @return {string} The most commonly found substring in all request URLs.
 */
function findBaseUrl() {
  requestUrls = [];
  for (var request = 0; request < postmanDocument.requests.length; request++) {
    requestUrls.push(postmanDocument.requests[request].url);
  }
  commonUrl = sharedSubString(requestUrls);
  return commonUrl;
}

/**
 * Set the swagger host.
 */
function setSwaggerHost() {
  //Find & remove protocol (http, ftp, etc.) and get domain
  if (commonUrl.indexOf("://") > -1) {
      hostUrl = commonUrl.split('/')[2];
  }
  else {
      hostUrl = commonUrl.split('/')[0];
  }
  //find & remove port number
  hostUrl = hostUrl.split(':')[0];

  if (requestOptions.host) {
    newSwaggerDocument.host = requestOptions.host;
  } else {
    newSwaggerDocument.host = hostUrl;
  }
}

/**
 * Get the base path from request URLs.
 */
function setSwaggerBasePath() {
  newSwaggerDocument.basePath = basePath = commonUrl.replace(hostUrl, '').replace('http://','').replace('https://','').replace('www.','');
}

/**
 * Set the swagger paths.
 */
function setSwaggerPaths() {

  //Set paths to empty object.
  newSwaggerDocument.paths = {};

  //Loop through requests from Postman file.
  for (var request = 0; request < postmanDocument.requests.length; request++) {
    
    //Set variable equal to request for this iteration from Postman file.
    var activePostmanRequest = postmanDocument.requests[request];

    //Getting path to set in swagger paths object.
    var tempPath = activePostmanRequest.url.replace(commonUrl, '');

    //Strip params
    var tempParams = getUrlVars(tempPath);

    tempPath = tempPath.split('?')[0];

    //Checking to see if entry already exists for this path.
    if (newSwaggerDocument.paths['/' + tempPath] === undefined) {
      newSwaggerDocument.paths['/' + tempPath] = {};
    } else {

      //TODO(jcarter): Need to do a graceful merge of information.
      continue;
    }

    //Checking to see if method entry already exists for this path.
    if (newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()] === undefined) {
      newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()] = {};
    } else {
  
      //TODO(jcarter): Need to do a graceful merge of information.
      continue;
    }

    //TODO(jcarter): Set tags option in CLI?
    newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].tags = [];
    newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].summary = activePostmanRequest.description;
    newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].operationId = activePostmanRequest.name + '_';
    newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].produces = [];
    //newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].consumes = [];

    //Get content type if available.
    activePostmanRequest.headers.replace('\n', '').replace('\r', '');
    var headersArray = activePostmanRequest.headers.match(/("[^"]+"|[^"\s]+)/g);
    var contentTypeIndex = headersArray.indexOf("Content-Type:");
    if (contentTypeIndex >= 0) {
      var contentTypeValue = headersArray[(contentTypeIndex + 1)];
      newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].produces.push(contentTypeValue);
      //newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].consumes.push(contentTypeValue); 
    }

    //Set parameters if any were found in path.
    newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].parameters = [];
    if (Object.keys(tempParams).length > 0) {
      for (var param in tempParams) {
        var parameterObject = {
          name: param,
          in: 'query',
          required: true,
          'x-is-map': false,
          type: 'string'
        }
        newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].parameters.push(parameterObject);
      }
    }

    //Set response on swagger JSON.
    //TODO(jcarter): I would really like to parse the test JS file in the Postman JSON to get reponse body and status code.
    newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].responses = {
      '200': {
        description: ''
      }
    };
    
    //Set security property on swagger JSON.
    newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].security = [];

    function buildPropertiesObject(obj) {

      /* Base object created */
      /*
      {
        type:
        !example
        !format
        !properties
        !items
      }


      */
      var tempObj = {};

      //Looping through keys of object to build properties object.
      for (var key in obj) {

        //Setting string type.
        if (typeof obj[key] === 'string') {
          tempObj.key = {
            type: 'string',
            example: obj[key]
          }

        //Setting number type.
        } else if (typeof obj[key] === 'number') {
          tempObj.key = {
            type: 'integer',
            format: 'int64'
          }

        //Setting null type.
        } else if (typeof obj[key] === null) {
          tempObj.key = {
            type: 'null'
          }
  
        //Setting array and object type.
        } else if (typeof obj[key] === 'object') {

          //Object vs. Array check.
          if (obj[key].length === undefined) {

            //If object call buildPropertiesObject recursively.
            tempObj.key = {
              type: 'object',
              properties: buildPropertiesObject(obj[key]) 
            }
          } else {
            tempObj.key = {
              type: 'array',
              items: {}
            }

            //Setting different array item types.
            var itemType = typeof obj[key][0];

            //Checking if array items are objects
            if (itemType === 'object' && obj[key].length === undefined) {
              tempObj.key.items = {
                type: 'object',
                properties: buildPropertiesObject(obj[key][0]) 
              };

            //Checking if array of strings
            } else if (itemType === 'string') {
            tempObj.key = {
              type: 'string',
              example: obj[key][0]
            }

          //Checking if array of numbers
          } else if (itemType === 'number') {
            tempObj.key = {
              type: 'integer',
              example: 'int64'
            }
          } else if (itemType === 'null') {
            tempObj.key = {
              type: 'null'
            }
          }
        }
      }
      return tempObj;
    }

    //Set body parameter.
    //TODO(jcarter): Need to support other content types beside application/json.
    /**
     * Assumptions being made:
     * All parent level properties are required.
     * No enums or descriptions for any properties are created.
     */
    if (activePostmanRequest.rawModeData && (newSwaggerDocument.paths['/' + tempPath][activePostmanRequest.method.toLowerCase()].produces.indexOf('application/json') >= 0)) {
      var bodyData = JSON.parse(activePostmanRequest.rawModeData);
      console.log('object keys ', Object.keys(bodyData));
      buildPropertiesObject(bodyData);

      /*
      array
      A JSON array.
      boolean
      A JSON boolean.
      integer
      A JSON number without a fraction or exponent part.
      number
      Any JSON number. Number includes integer.
      null
      The JSON null value.
      object
      A JSON object.
      string
      A JSON string.
      */
      var bodyParam = {
          "in": "body",
          "name": "body",
          "description": "",
          "required": true,
          "schema": {
            "type": "object",
            "required": Object.keys(bodyData),
            "properties": {
                "id": {
                    "type": "integer",
                    "format": "int64"
                },
                "category": {
                    "$ref": "#/definitions/Category"
                },
                "name": {
                    "type": "string",
                    "example": "doggie"
                },
                "photoUrls": {
                    "type": "array",
                    "xml": {
                        "name": "photoUrl",
                        "wrapped": true
                    },
                    "items": {
                        "type": "string"
                    }
                },
                "tags": {
                    "type": "array",
                    "xml": {
                        "name": "tag",
                        "wrapped": true
                    },
                    "items": {
                        "$ref": "#/definitions/Tag"
                    }
                },
                "status": {
                    "type": "string",
                    "description": "pet status in the store",
                    "enum": [
                        "available",
                        "pending",
                        "sold"
                    ]
                }
            },
            "xml": {
                "name": "Pet"
            }
        }
      }
    }
  }
}

//Helper Functions//

/**
 * Find the longest shared sub string to strip out common parts of request URLs
 * 
 * @param {array.<string>} array An array of all request URLs.
 */
function sharedSubString(array){
  var sortedArray = array.concat().sort();
  var firstString = sortedArray[0];
  var lastString = sortedArray[sortedArray.length-1];
  var firstStringLength = firstString.length
  var i = 0;
  while (i < firstStringLength && firstString.charAt(i) === lastString.charAt(i)) {
    i++;
  }
  return firstString.substring(0, (i - 1));
}

/**
 * Get parameters from path.
 * 
 * @param {string} path Path that we are parsing for params.
 * @return {objcet} Key value pair of params.
 */
function getUrlVars(path) {
    var vars = {};
    var hash;
    if (path.indexOf('?') >= 0) {
      var hashes = path.slice(path.indexOf('?') + 1).split('&');
      for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
      }
      return vars;
    } else {
      return false;
    }
}
