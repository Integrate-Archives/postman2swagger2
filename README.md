# postman2swagger2
Convert Postman JSON (version 1) to Swagger version 2 JSON

**Currently only supports Postman Collection Version 1 JSON, version 2 support coming soon**

## Installation

```bash
$ npm install -g postman2swagger2
```

## Usage

```bash
$ postman2swagger2 --help

  Usage: postman2swagger2 [options] <URL|filename>

  Convert API descriptions from Postman to Swagger.

  Options:

    -h, --help                       output usage information
    -V, --version                    output the version number
    -e, --environment <environment>  Specifies Postman Environment to use for dynamic values in Postman file.
    -h, --host <host>                Specifies global host.
    -o, --out <out>                  Specify the path and filename you want to output your swagger document to. Defaults to "./swagger2.json"
```

### Example

```bash
$ postman2swagger2 ./apidocs/tests.postman_collection.json --out ../../swagger-file.json
```

## Contributing

Contributions are welcome and encouraged. See CONTRIBUTING.md for instructions.
