import { join } from 'path';
import { JsonConverter } from './json/json-converter';
import { ApiResponse } from './response';
import { get as httpsGet } from 'https';
import { createBatch, range, sleep } from './utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export class Api {
    private baseUrl: string;
    private cachePath: string;

    public constructor() {
        if (!process.env.REQUEST_URL) throw new Error('Invalid url on env.');
        this.baseUrl = process.env.REQUEST_URL;
        if (!this.baseUrl.endsWith('/')) this.baseUrl += '/';

        if (!process.env.CACHE_PATH) throw new Error('Invalid cache path.');
        this.cachePath = process.env.CACHE_PATH;
        if (this.cachePath.startsWith('.')) this.cachePath = join(process.cwd(), this.cachePath);
    }

    private async request(path: string, cachekey?: string): Promise<ApiResponse> {
        return new Promise((res, rej) => {
            try {
                const fullpath = `${this.baseUrl}${path}`;
                const request = httpsGet(fullpath, (response) => {
                    const chunks: Buffer[] = [];

                    response.on('data', (chunk: Buffer) => {
                        chunks.push(chunk);
                    });

                    response.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        const rawData = buffer.toString('utf-8');
                        const result = JsonConverter.parse(ApiResponse, rawData);

                        if (!!cachekey) {
                            const cacheFilePath = join(this.cachePath, `${cachekey}.cache`);
                            writeFileSync(cacheFilePath, rawData, { encoding: 'utf-8' });
                        }

                        res(result);
                    });
                });

                request.on('error', (err) => {
                    rej(err);
                });

                request.end();
            } catch (err: unknown) {
                rej(err);
            }
        });
    }

    private async requestOne(id: number, type: string): Promise<ApiResponse> {
        const path = `${type}/${id}`;
        const cachekey = `${type}-${id}`;
        return await this.request(path, cachekey);
    }

    private async checkCache(id: number, type: string): Promise<ApiResponse | void> {
        return new Promise<ApiResponse | void>((res, rej) => {
            try {
                const cacheFilePath = join(this.cachePath, `${type}-${id}.cache`);
                if (!existsSync(cacheFilePath)) res();

                const result = readFileSync(cacheFilePath, { encoding: 'utf-8' });
                res(JsonConverter.parse(ApiResponse, result));
            } catch (err: unknown) {
                rej(err);
            }
        });
    }

    public async get(id: number, type: string): Promise<ApiResponse> {
        const cacheValue = await this.checkCache(id, type);
        if (!!cacheValue && cacheValue instanceof ApiResponse) return cacheValue;
        return await this.requestOne(id, type);
    }

    public async getLatest(type: string): Promise<ApiResponse> {
        return await this.request(type);
    }

    public async getMultiple(from: number, to: number, batchSize: number, type: string) {
        const ids = range(from, to);
        const batchs = createBatch(ids, batchSize);

        console.log(` 🚀 Iniciando processamento de ${batchs.length} conjuntos.\n`);

        const results: ApiResponse[] = [];
        for (const { index, batch } of batchs.map((batch, index) => (({ index, batch })))) {
            console.log(` ⚙️ Processando conjunto de numero ${index + 1}`);
            const promises = batch.map(async (item) => await this.get(item, type));
            const result = await Promise.all(promises);
            results.push(...result);
            await sleep(500);
        }

        return results;
    }
}
