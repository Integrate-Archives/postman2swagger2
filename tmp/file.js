//getting response body
var data = JSON.parse(responseBody);

//getting result body
var result = data.result;

//reponse schema for get a single campaign
var responseSchema = {
 "type": "object",
 "properties": {
     "result" : {
         "type": "object"
     },
     "errors": {
         "type": "array"
     }
 }
};

//response schema for assets array
var resultSchema = {
    "type": "object",
    "items": {
        "type": "object",
        "required": ["id", "name", "assetType", "parentId", "metadata", "creator", "associations"],
        "properties": {
            "id" : {
                "type": "string"
            },
            "name" : {
                "type": "string"
            },
            "assetType" : {
                "type": "string"
            },
            "parentId" : {
                "type": "string"
            },
            "metadata": {
                "type": ["object", "null"],
                "required": ["path", "fileType", "status", "fileSize", "resolution"],
                "properties": {
                    "path": {
                        "type": "string"
                    },
                    "fileType": {
                        "type": "string"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["locked", "unlocked"]
                    },
                    "fileSize": {
                        "type": "string"
                    },
                    "resolution": {
                        "type": "string"
                    }
                }
            },
            "creator" : {
                "type": ["string", "null"]
            },
            "associations" : {
                "type": ["array", "null"],
                "items" : {
                    "type": "string"
                }
            }
        }
    }
};

tests["Status code is 200"] = responseCode.code === 200;

//testing parentID being properly set
tests["Parent ID Properly Set"] = result.parentId === environment['orgSharedFolder'];

//testing response schema
tests["Valid Response Schema"] = tv4.validate(data, responseSchema);

//testing result schema
tests["Valid Result Array Schema"] = tv4.validate(result, resultSchema);

//logging schema errors
console.log('error ', tv4.error);