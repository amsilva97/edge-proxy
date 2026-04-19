'use server';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export async function ReloadAction(): Promise<void> {
        const command = 'nginx -s reload';
        await execAsync(command);
}