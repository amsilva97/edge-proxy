import 'server-only';
import { AppConfig } from './appConfig';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/** Handles Nginx commands */
export class Nginx {
    private constructor() { }

    public static async reloadAsync(): Promise<void> {
        const command = 'nginx -s reload';
        try {
        await execAsync(command);
        }
        catch (error) {
            console.error('Failed to reload Nginx:', error);
        }
    }
}