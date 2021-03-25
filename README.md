# Express Proxy
An easily configurable express server for proxying requests and mocking responses.

# Getting Started
Clone or dowload this repo.
Run `npm install` and `npm start` to start the server locally. By default the server runs on port 3000 but can be changed from the file `proxy.config.json` The server aslo sets up a host that can be used instead of `localhost:3000` The default value for this is `http://www.expressproxy.com:3000/`

### How it works
Once the proxy server is run, it will create RequestHandlers for all proxies within the `proxy.config.json` file. Once a url is hit, it will proxy the request with your configured options. If there was **NO** proxy config set, the request will be proxied using the `default_proxy_to_url`.

If this is **NOT MATCHED**

### Configuration
Inside the main folder you should find a file named `proxy.config.json` This holds the configuration of the server, and any url proxy configuration. The config file should have a similar structure as below.

```json
{
	"port": 3000,
	"default_proxy_to_url": "URL TO PROXY TO IF NOT SPECIFIED IN THE PROXY CONFIG BELOW",
	"default_headers": {},
	"host_patch": {
		"enabled": true,
		"url": "www.expressproxy.com"
	},
	"proxies": [
		{
			"id": "ID_OF_PROXY_URL",
			"incoming_url_match": "THE_URL_TO_MATCH_FOR_PROXY",
			"proxy_to_url": "URL_TO_SEND_THE_ACTUAL_REQUEST_TO",
			"headers": {},
			"body_data": {},
			"mock_response": {
				"status": "RESPONSE_STATUS_CODE",
				"data_file_name": "NAME_OF_MOCK_DATA_FILE.mock.json"
			}
		}
	]
}
```

### Explanation
`port` This is the default port which the server runs on.
`default_proxy_to_url` If the hit url is not matched with a proxy in the proxies array, then the requests are forwarded to this "default" url.
`default_headers`: These headers are used along with the `default_proxy_to_url`.
`host_patch` This is optional and is used to set a pretty url in the OS hosts files istead of using localhost.
`proxies` An array of objects, each containing configuration for proxying / generating responses for urls.

The proxy object inside the proxies array:
`id` An identification for the url that is going to be proxied.
`incoming_url_match` The url to that you want to proxy requests for.
`proxy_to_url` The url to send the actual request to.
`headers` Any headers you need to send with the request.
`body_data` POST data that needs to be sent with the request.
`mock_response` If this is present for the proxy, the url will not be proxied but data will sent from a mock file.

The mock_response object
`status` The status code to send back to the client.
`data_file_name` The name of the file with your mock data.

### Generated Response
The `mock_response` gives the possiblity to return mock data to your configured paths. This can be done by creating a mock `.json` file inside `mock_responses` folder, and adding the name of the file in the configuration object. Once the url is hit, the server will NOT proxy the url, but instead will return the data from the `.json` file that was created.