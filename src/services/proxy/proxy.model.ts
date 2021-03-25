export interface Proxy {
	id: string;
	method: string;
	incoming_url_match: string;
	proxy_to_url?: string;
	headers?: { [key: string]: any };
	body_data?: { [key: string]: any };
	mock_response?: MockResponse;
}

interface MockResponse {
	status: number,
	data_file_name: string;
}