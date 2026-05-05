'use server'
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

const AUTH_FILE = path.join('data', 'auth.json');

interface AuthRecord {
    username: string;
    passwordHash: string;
}

async function readAuthRecord(): Promise<AuthRecord | null> {
    try {
        const raw = await fs.readFile(AUTH_FILE, 'utf-8');
        return JSON.parse(raw) as AuthRecord;
    } catch {
        return null;
    }
}

/** Returns true when no auth file exists (first-time setup needed). */
export async function isSetup(): Promise<boolean> {
    const record = await readAuthRecord();
    return record === null;
}

export async function login(username: string, password: string): Promise<boolean> {
    const record = await readAuthRecord();
    if (!record) return false;
    if (record.username !== username) return false;
    return bcrypt.compare(password, record.passwordHash);
}

export async function registerAdmin(username: string, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 12);
    const record: AuthRecord = { username, passwordHash };
    await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });
    await fs.writeFile(AUTH_FILE, JSON.stringify(record, null, 2));
}
