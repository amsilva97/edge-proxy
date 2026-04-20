'use server';
import fs from 'fs/promises';

export async function ReadDirAsync(path: string): Promise<string[]> {
    return await fs.readdir(path);
}

export async function ReadFileAsync(path: string): Promise<string> {
    return await fs.readFile(path, 'utf8');
}

export async function MakeDirAsync(path: string, options: any): Promise<void> {
    await fs.mkdir(path, options);
}

export async function WriteFileAsync(path: string, data: string): Promise<void> {
    await fs.writeFile(path, data, 'utf8');
}

export async function RemoveFileAsync(path: string, options: { force?: boolean; recursive?: boolean }): Promise<void> {
    await fs.rm(path, options);
}

export async function MakeSymlinkAsync(target: string, link: string): Promise<void> {
    await fs.symlink(target, link);
}

export async function ExistsAsync(path: string): Promise<boolean> {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}