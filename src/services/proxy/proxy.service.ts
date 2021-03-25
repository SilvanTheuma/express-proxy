import fs from "fs";
import path from "path";
import { Express, Request, Response } from 'express';
import { Response as FetchResponse } from "node-fetch";
import { injectable, inject } from "inversify";
import { T_REQUEST_SERVICE } from "../requests/request.const";
import { RequestService } from "../requests/request.service";
import { Proxy } from "./proxy.model";
import * as PROXY_CONFIG from "../../proxy.config.json";
import "reflect-metadata";

@injectable()
export class ProxyService {

	constructor(
		@inject(T_REQUEST_SERVICE) private requestService: RequestService
	) {}

	public init(app: Express) {
		for (const proxy of PROXY_CONFIG.proxies) {
			app[proxy.method.toLowerCase()](
				proxy.incoming_url_match,
				(req: Request, res: Response) => this.proxy(req, res, proxy)
			);
		}

		app.route("*")
			.get((req: Request, res: Response) => this.proxy_default(req, res))
			.post((req: Request, res: Response) => this.proxy_default(req, res))
			.patch((req: Request, res: Response) => this.proxy_default(req, res))
			.put((req: Request, res: Response) => this.proxy_default(req, res))
			.delete((req: Request, res: Response) => this.proxy_default(req, res));
	}

	private proxy(req: Request, res: Response, proxy: Proxy) {
		const {
			incoming_url_match,
			proxy_to_url,
			headers,
			body_data,
			mock_response,
		} = proxy;

		if (mock_response?.data_file_name) {
			const { status, data_file_name } = mock_response;
			const file = fs.readFileSync(path.resolve(__dirname, `../../mock_responses/${data_file_name}`));

			res.statusMessage = "MOCKED";
			res.status(status).send(JSON.parse(file.toString()));
			return;
		}

		if (!proxy_to_url) {
			throw new Error("No Proxy URL Provided");
		}

		const url = proxy_to_url 
			? proxy_to_url + incoming_url_match
			: PROXY_CONFIG.default_proxy_to_url + incoming_url_match;

		this.requestService[req.method](url, { headers: { ...req.headers, ...headers }, body: body_data || req.body })
			.then((resp: FetchResponse) => resp.json())
			.then((data: any) => res.json(data))
			.catch((err: FetchResponse) => res.status(err.status || 500).send({ code: err.statusText, message: err }))
	}

	private async proxy_default(req: Request, res: Response) {
		const url = PROXY_CONFIG.default_proxy_to_url + req.url;
		const headers = { ...req.headers, ...PROXY_CONFIG.default_headers };

		this.requestService[req.method](url, { headers, body: req.body })
			.then((resp: FetchResponse) => resp.json())
			.then((data: any) => res.json(data))
			.catch((err: FetchResponse) => res.status(err.status || 500).send({ code: err.statusText, message: err }));
	}
}