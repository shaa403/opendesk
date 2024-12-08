
## Httpc

A node based utility for making http/s requests via terminals.

## Installation
```bash
npm i -g skit-httpc
```


### Usage
After installation, create a `httpc.json` file in your current working directory and add the following content:

```json
{
  "method": "<get | post | put | patch | head | delete | options | trace>", 
  "url": "<url>",
  "headers": {
     "<key>": "<value>"
  },
  "body": "<Only add this if there is a request body and the request method supports HTTP request payloads>"
}
```

the object's body (request body) field can be of any valid json type. 

Run `httpc` to make the request specified in the `httpc.json` object.

To make multiple requests one at a time (you might receive responses in an unordered manner), place each request 
object in a single _root_ array in the `httpc.json` file. For example:

```json
[
  {...requestA},
  {...requestB}
]
```

In cases where your request objects are placed in an array in the `httpc.json` file and you don’t want to make 
all the requests, but instead just a specific one, run `httpc <indexOfObject>`. For example, calling `httpc 4` when you 
have up to 6 objects in the array, will cause `httpc` to only make the 5th request in the array.

Indexes starts at 0.

