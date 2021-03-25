import { IRequest } from "./request.model";
import fetch, { Response } from "node-fetch";
import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export class RequestService {

	private baseOptions: IRequest = {
		method: "GET",
		headers: {}
	};

	public GET(url: string, data?: any): Promise<Response> {
		const options = { ...this.baseOptions};
		options.method = "GET";
		if (data?.headers) {
			options.headers = { ...this.baseOptions.headers, ...data.headers }
		}
		return this.processRequest(url, options);
	}

	public POST(url: string, options?: any): Promise<Response> {
		const formData = options && options.formData;
		const reqOptions = { ...this.baseOptions};
		formData ? delete reqOptions.headers["Content-Type"] : undefined;
		reqOptions.method = "POST";
		reqOptions.body = JSON.stringify(options.body);
		if (options?.headers) {
			reqOptions.headers = { ...this.baseOptions.headers, ...options.headers }
		}
		return this.processRequest(url, reqOptions);
	}

	public PUT(url: string, data: any): Promise<Response> {
		const options = this.baseOptions;
		options.method = "PUT";
		options.body = JSON.stringify(data);
		return this.processRequest(url, options);
	}

	public PATCH(url: string, data: any): Promise<Response>  {
		const options = this.baseOptions;
		options.method = "PATCH";
		options.body = JSON.stringify(data);
		return this.processRequest(url, options);
	}

	public DELETE(url: string, data: any = {}): Promise<Response>  {
		const options = this.baseOptions;
		options.method = "delete";
		options.body = JSON.stringify(data);
		return this.processRequest(url, options);
	}

	private processRequest(url: string, options: any): Promise<Response> {
		return fetch(url, options)
			.then((response) => {
				if (response.status === 200) {
					return response;
				}
				return Promise.reject(response);
			})
	}
}