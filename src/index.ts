import express, { Express } from 'express';
import cors from "cors";
import logger from "morgan";
import { Container } from "inversify";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { EOL } from "os";
import { T_REQUEST_SERVICE } from './services/requests/request.const';
import { T_PROXY_SERVICE } from './services/proxy/proxy.const';
import { RequestService } from "./services/requests/request.service";
import { ProxyService } from './services/proxy/proxy.service';
import * as PROXY_CONFIG from "./proxy.config.json";

class Main {
	private app: Express;

	constructor() {
		this.app = express();
		this.app.use(cors());
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(logger("dev"));

		const { enabled, url } = PROXY_CONFIG.host_patch;
		if (enabled) {
			this.setupHostFile();
		}

		const container = new Container({ defaultScope: "Singleton" });
		container.bind<RequestService>(T_REQUEST_SERVICE).to(RequestService);
		container.bind<ProxyService>(T_PROXY_SERVICE).to(ProxyService);

		// executing proxy service
		container.get<ProxyService>(T_PROXY_SERVICE).init(this.app);

		this.app.listen(PROXY_CONFIG.port, () => console.log(`⚡️[proxy-server]: Server is running at http://${enabled ? url : "localhost"}:${PROXY_CONFIG.port}`));
	}

	private setupHostFile(): void {
		try {
			const isWindows = process.platform === "win32";
			const isRoot = process.getuid && process.getuid() === 0;
			const isAdmin = this.isRunningAsAdmin();
			const isAdminUser = isRoot || isAdmin;
			const { host_patch: { url }, port } = PROXY_CONFIG;

			if (!isAdminUser) {
				console.info(
					`Cannot add hosts without admin priviliges. Please add hosts manually or run npm i as admin.`
				);
				return;
			}

			const hostsFileName = isWindows ? "C:\\Windows\\System32\\drivers\\etc\\hosts" : "/etc/hosts";
			console.info("Reading hosts file");
			const originalHostsFile = readFileSync(hostsFileName, "utf-8");
			let updatedHostFile = originalHostsFile;

			if (originalHostsFile.includes(url)) {
				console.info(`Host: ${url} already exists, skipping.`);
				return;
			}

			console.info(`Host: ${url} added.`);
			updatedHostFile += `${EOL}127.0.0.1 ${url}:${port}`;

			if (updatedHostFile !== originalHostsFile) {
				updatedHostFile += EOL;
				console.info("Writing hosts");
				writeFileSync(hostsFileName, updatedHostFile);
			}

		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	private isRunningAsAdmin(): boolean {
		if (process.platform !== "win32") {
			return false;
		}

		try {
			execSync("fsutil dirty query %systemdrive%");
			return true;
		} catch (error) {
			if (error.code === "ENOENT") {
				try {
					execSync("fltmc");
					return true;
				} catch (e) {
					return false;
				}
			}
		}
		return false;
	}
}

new Main();