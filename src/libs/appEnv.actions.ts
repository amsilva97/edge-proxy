'use server'
import fs from 'fs/promises';

const ENV_LOCAL = '.env.local';
const ENV_DEFAULT = '.env';

export async function LoadEnvAsync(): Promise<Record<string, string>> {
    try {
        const contentLocal = await fs.readFile(ENV_LOCAL, 'utf-8');
        return ParseEnvFile(contentLocal);
    } catch {
        try {
            const contentDefault = await fs.readFile(ENV_DEFAULT, 'utf-8');
            return ParseEnvFile(contentDefault);
        } catch {
            return {}
        }
    }
}

export async function SaveEnvAsync(dict: Record<string, string>): Promise<void> {
    const lines = Object.entries(dict).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
    await fs.writeFile(ENV_LOCAL, lines);
}

function ParseEnvFile(content: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const raw of content.split('\n')) {
        const line = raw.replace(/#.*$/, '').trim();
        if (!line) continue;
        const i = line.indexOf('=');
        if (i === -1) continue;
        out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    return out;
}
