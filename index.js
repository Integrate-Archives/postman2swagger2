'use strict';

var fs = require('fs');
var path = require('path');
var schemaGenerator = require('json2schema');

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
  commonUrl = sharedSegments(requestUrls);
  return commonUrl;
}

/**
 * Set the swagger host.
 */
function setSwaggerHost() {
  //Find & remove protocol (http, ftp, etc.) and get domain
  if (commonUrl.length === 0) {
    hostUrl = '';
  } else {
    if (commonUrl.indexOf("://") > -1) {
        hostUrl = commonUrl.split('/')[2];
    }
    else {
        hostUrl = commonUrl.split('/')[0];
    }

    //find & remove port number
    hostUrl = hostUrl.split(':')[0];
  }
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
    var tempPath = '';

    //Getting path to set in swagger paths object.
    tempPath = activePostmanRequest.url.replace(commonUrl, '')

    //Strip params
    var tempParams = getUrlVars(tempPath);

    tempPath = tempPath.split('?')[0];

    //Checking to see if entry already exists for this path.
    if (newSwaggerDocument.paths[tempPath] === undefined) {
      newSwaggerDocument.paths[tempPath] = {};
    }

    //Checking to see if method entry already exists for this path.
    if (newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()] === undefined) {
      newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()] = {};
    } else {
  
      //TODO(jcarter): Need to do a graceful merge of information.
      continue;
    }

    //TODO(jcarter): Set tags option in CLI?
    newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].tags = [];
    newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].summary = activePostmanRequest.description;
    newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].operationId = activePostmanRequest.name + '_';
    newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].produces = [];
    newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].consumes = [];

    //Set Headers for request.


    //Get content type if available.
    activePostmanRequest.headers.replace('\n', '').replace('\r', '');
    var headersArray = activePostmanRequest.headers.match(/("[^"]+"|[^"\s]+)/g);
    var contentTypeIndex = headersArray.indexOf("Content-Type:");
    if (contentTypeIndex >= 0) {
      var contentTypeValue = headersArray[(contentTypeIndex + 1)];
      newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].produces.push(contentTypeValue);
      newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].consumes.push(contentTypeValue); 
    }

    newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].parameters = [];

    //Set headers for request
    /* 
     * All headers found are set to required by default.
     * All header types are set to string by default.
     */
    for (var header = 0; header < headersArray.length; header++) {
      var headerObject = {}

      //searching for key in header array.
      if (headersArray[header].endsWith(':')) {
        headerObject = {
          name: headersArray[header].substring(0, (headersArray[header].length - 1)),
          in: 'header',
          description: '',
          required: true,
          type: 'string'
        }
        newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].parameters.push(headerObject);  
      }
    }

    //Set parameters if any were found in path.
    if (Object.keys(tempParams).length > 0) {
      for (var param in tempParams) {
        var parameterObject = {
          name: param,
          in: 'query',
          required: true,
          'x-is-map': false,
          type: 'string'
        }
        newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].parameters.push(parameterObject);
      }
    }

    //Set response on swagger JSON.
    //TODO(jcarter): I would really like to parse the test JS file in the Postman JSON to get reponse body and status code.
    newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].responses = {
      '200': {
        description: ''
      }
    };
    
    //Set security property on swagger JSON.
    newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].security = [];

    //Set body parameter.
    //TODO(jcarter): Need to support other content types beside application/json.
    /**
     * Assumptions being made:
     * All properties are required.
     * No enums or descriptions for any properties are created.
     * Multiple types not supported at this time.
     */
    if (activePostmanRequest.rawModeData &&
        (newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].produces.indexOf('application/json') >= 0)) {
      var bodyData = JSON.parse(activePostmanRequest.rawModeData);

      var bodyParam = {
        "in": "body",
        "name": "body",
        "description": "",
        "required": true,
        "schema": schemaGenerator.convert({data: bodyData})
        
      }

      newSwaggerDocument.paths[tempPath][activePostmanRequest.method.toLowerCase()].parameters.push(bodyParam);
    }
  }
}

//Helper Functions//

/**
 * Find the longest shared sub string to strip out common parts of request URLs
 * 
 * @param {array.<string>} array An array of all request URLs.
 * @return {string} String representing shared URI for all requests.
 */
//Abandoned this and switched to checking common segments.
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
 * Find the longest shared portion of the URI.
 * 
 * @param {array.<string>} array An array of all request URLs.
 * @return {string} String representing shared URI for all requests.
 */
function sharedSegments(array){
  var sortedArray = array.concat().sort();
  if (array.length === 1) {
    return '';
  }
  for (var uri = 0; uri < sortedArray.length; uri++) {
    sortedArray[uri] = sortedArray[uri].split('/');
  }
  var firstSegmentArray = sortedArray[0];
  var lastSegmentArray = sortedArray[sortedArray.length-1];
  var segment = 0;
  while (firstSegmentArray[segment] === lastSegmentArray[segment]) {
    segment++;
  }

  //If segment to splice is undefined, go back one before returning commonUrl.
  var spliceCount = segment;
  if (!firstSegmentArray[segment]) {
    spliceCount = segment -1;
  }
  return firstSegmentArray.splice(0, spliceCount).join('/');
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
