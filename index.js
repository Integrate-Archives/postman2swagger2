'use strict';

var fs = require('fs');
var path = require('path');
var uglifyjs = require('uglify-js');
var swaggerBaseObject = require('./lib/swagger.js');

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
  //console.log('Swagger Object ', newSwaggerDocument);

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

function setSwaggerPaths() {
  newSwaggerDocument.paths = {};
  var count = 0;
  for (var request = 0; request < postmanDocument.requests.length; request++) {
    //console.log('Saved paths: ', postmanDocument.requests[request].url.replace(commonUrl, ''));
    var tempPath = postmanDocument.requests[request].url.replace(commonUrl, '');

    //Checking to see if entry already exists for this path.
    if (newSwaggerDocument.paths['/' + tempPath] === undefined) {
      newSwaggerDocument.paths['/' + tempPath] = {};
    }

    //Checking to see if method entry already exists for this path.
    if (newSwaggerDocument.paths['/' + tempPath][postmanDocument.requests[request].method.toLowerCase()] === undefined) {
      newSwaggerDocument.paths['/' + tempPath][postmanDocument.requests[request].method.toLowerCase()] = {};
    } else {
      //TODO(jcarter): Logic to gracefully merge requests and check for different response code types.
    }

    /*
			id: "03168e23-32a3-5c23-b0b1-b94bcfddcada",
			headers: "Authorization: dev|{{singleUser}}\nContent-Type: application/json\n",
			url: "{{baseUrl}}/api/organizations/{{singleOrg}}/files/{{singleFile}}",
			preRequestScript: "",
			pathVariables: {},
			method: "POST",
			data: [],
			dataMode: "raw",
			version: 2,
			currentHelper: "normal",
			helperAttributes: {},
			time: 1474912195608,
			name: "Move A File with Extra Body Properties copy",
			description: "Move file with extra properties on request.",
			collectionId: "0d314be7-6067-c3ff-34a7-02adbd79a504",
			rawModeData: "{\n    \"newParentId\":\"{{orgSharedFolder}}\",\n    \"starWars\": \"Luke Skywalker\"\n}"
		};
    */

    /*
    {
        "tags": ["Asset Management"],
        "summary": "Retrieve all folders a user has access too in regards to their current Organization.",
        "operationId": "Retrieve All Folders_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "query",
            "in": "query",
            "required": false,
            "x-is-map": false,
            "type": "string"
          },
          {
            "name": "skip",
            "in": "query",
            "required": false,
            "x-is-map": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "take",
            "in": "query",
            "required": false,
            "x-is-map": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "sortBy",
            "in": "query",
            "required": false,
            "x-is-map": false,
            "type": "string"
          },
          {
            "name": "isAscending",
            "in": "query",
            "required": false,
            "x-is-map": false,
            "type": "boolean"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      }
    */
  }
}

//Helper Functions
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