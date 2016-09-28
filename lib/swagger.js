var swaggerBaseObject = module.exports = {
  "swagger": "",
  "info": {
    "version": "",
    "title": "",
    "description": ""
  },
  "host": "",
  "basePath": "",
  "schemes": [],
  "consumes": [],
  "produces": [],
  "paths": {
    "/folders": {
      "get": {
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
      },
      "post": {
        "tags": ["Asset Management"],
        "summary": "Create A New Folder For User and Their Organization.",
        "operationId": "Create A New Folder_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "required": true,
            "x-is-map": false,
            "schema": {
              "$ref": "#/definitions/CreateANewFolderRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      }
    },
    "/folders/{folderId}": {
      "get": {
        "summary": "Retrieve a single folder.",
        "tags": ["Asset Management"],
        "operationId": "Retrieve A Single Folder_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "folderId",
            "in": "path",
            "required": true,
            "x-is-map": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      },
      "put": {
        "summary": "Edit a single folder to change properties and attributes",
        "tags": ["Asset Management"],
        "operationId": "Update_Edit A Single Folder_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "required": true,
            "x-is-map": false,
            "schema": {
              "$ref": "#/definitions/EditASingleFolderRequest"
            }
          },
          {
            "name": "folderId",
            "in": "path",
            "required": true,
            "x-is-map": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      },
      "post": {
        "summary": "Move a folder so that it has a new parent.",
        "tags": ["Asset Management"],
        "operationId": "Create_Move A Folder_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "required": true,
            "x-is-map": false,
            "schema": {
              "$ref": "#/definitions/MoveAFolderRequest"
            }
          },
          {
            "name": "folderId",
            "in": "path",
            "required": true,
            "x-is-map": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      },
      "delete": {
        "summary": "Deleting a folder will remove it from the database.",
        "tags": ["Asset Management"],
        "operationId": "Delete A Folder_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "folderId",
            "in": "path",
            "required": true,
            "x-is-map": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      }
    },
    "/folders/{fileId}": {
      "delete": {
        "summary": "Deleting a file will remove it from the database.",
        "description": "Soon to be changed to '/files/{fileId}'",
        "tags": ["Asset Management"],
        "operationId": "Delete A File_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "x-is-map": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        }
      }
    },
    "/files": {
      "post": {
        "summary": "Upload a file to be deleted later by other API tests.",
        "tags": ["Asset Management"],
        "operationId": "Upload A File To Be Deleted Later_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "myFile",
            "in": "formData",
            "required": true,
            "x-is-map": false,
            "type": "file",
            "format": "file"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      }
    },
    "/files/{fileId}": {
      "put": {
        "summary": "Edit the name and properties on a single file.",
        "tags": ["Asset Management"],
        "operationId": "Update_Edit A Single File_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "required": true,
            "x-is-map": false,
            "schema": {
              "$ref": "#/definitions/EditASingleFileRequest"
            }
          },
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "x-is-map": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      },
      "post": {
        "summary": "Move file with missing properties to ensure correct response.",
        "tags": ["Asset Management"],
        "operationId": "Create_Move A File with Missing Body Properties_",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "required": true,
            "x-is-map": false,
            "schema": {
              "$ref": "#/definitions/MoveAFilewithMissingBodyPropertiesRequest"
            }
          },
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "x-is-map": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      }
    },
    "/folders/root": {
      "get": {
        "summary": "Retrieve the organizations root folder, \"Organizations Shared Folder\"",
        "tags": ["Asset Management"],
        "operationId": "Retrieve Root Folder_",
        "produces": [
          "application/json"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": []
      }
    } 
  },
  "definitions": {
    "MoveAFilewithExtraBodyPropertiescopyRequest": {
      "title": "Move A File with Extra Body Properties copyRequest",
      "type": "object",
      "properties": {
        "newParentId": {
          "type": "string"
        },
        "starWars": {
          "type": "string"
        }
      },
      "required": [
        "newParentId",
        "starWars"
      ]
    },
    "CreateasecondnewfolderRequest": {
      "title": "Create a second new folderRequest",
      "type": "object",
      "properties": {
        "parentId": {
          "type": "string"
        },
        "name": {
          "type": "string"
        }
      },
      "required": [
        "parentId",
        "name"
      ]
    },
    "CreateANewFolderwithBadDataRequest": {
      "title": "Create A New Folder with Bad DataRequest",
      "type": "object",
      "properties": {
        "parentId": {
          "type": "integer",
          "format": "int32"
        },
        "name": {
          "type": "boolean"
        }
      },
      "required": [
        "parentId",
        "name"
      ]
    },
    "MoveAFileRequest": {
      "title": "Move A FileRequest",
      "type": "object",
      "properties": {
        "newParentId": {
          "type": "string"
        }
      },
      "required": [
        "newParentId"
      ]
    },
    "MoveAFilewithMissingBodyPropertiesRequest": {
      "title": "Move A File with Missing Body PropertiesRequest",
      "type": "object",
      "properties": {
        "hello": {
          "type": "string"
        }
      },
      "required": [
        "hello"
      ]
    },
    "EditASingleFileRequest": {
      "title": "Edit A Single FileRequest",
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ]
    },
    "CreateANewFolderwithMissingPropertiesRequest": {
      "title": "Create A New Folder with Missing PropertiesRequest",
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ]
    },
    "EditASingleFolderRequest": {
      "title": "Edit A Single FolderRequest",
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ]
    },
    "MoveAFolderwithMissingPropertiesinRequestRequest": {
      "title": "Move A Folder with Missing Properties in RequestRequest",
      "type": "object",
      "properties": {
        "starWars": {
          "type": "string"
        }
      },
      "required": [
        "starWars"
      ]
    },
    "CreateANewFolderRequest": {
      "title": "Create A New FolderRequest",
      "type": "object",
      "properties": {
        "parentId": {
          "type": "string"
        },
        "name": {
          "type": "string"
        }
      },
      "required": [
        "parentId",
        "name"
      ]
    },
    "MoveAFolderwithBadDatainRequestRequest": {
      "title": "Move A Folder with Bad Data in RequestRequest",
      "type": "object",
      "properties": {
        "newParentId": {
          "type": "integer",
          "format": "int32"
        }
      },
      "required": [
        "newParentId"
      ]
    },
    "MoveAFolderRequest": {
      "title": "Move A FolderRequest",
      "type": "object",
      "properties": {
        "newParentId": {
          "type": "string"
        }
      },
      "required": [
        "newParentId"
      ]
    }
  },
  "paramters": {},
  "reponses": {},
  "securityDefinitions": {},
  "security": [],
  "tags": [],
  "externalDocs": {}
};