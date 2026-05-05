'use server'
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_FILE = path.join('data', 'auth.json');
const SESSION_FILE = path.join('data', 'session.txt');

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

export async function createSession(): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    await fs.mkdir(path.dirname(SESSION_FILE), { recursive: true });
    await fs.writeFile(SESSION_FILE, token, 'utf-8');
    return token;
}

export async function validateSession(token: string): Promise<boolean> {
    try {
        const stored = await fs.readFile(SESSION_FILE, 'utf-8');
        return stored.trim() === token;
    } catch {
        return false;
    }
}

export async function destroySession(): Promise<void> {
    try {
        await fs.unlink(SESSION_FILE);
    } catch {}
}

export async function logout(): Promise<void> {
    await destroySession();
    const store = await cookies();
    store.delete('sid');
    redirect('/login');
}

export async function checkSession(): Promise<boolean> {
    const store = await cookies();
    const token = store.get('sid')?.value;
    if (!token) return false;
    return validateSession(token);
}

export async function submitLogin(username: string, password: string): Promise<{ error: string } | null> {
    if (await isSetup()) return { error: 'App has not been configured yet.' };

    const ok = await login(username, password);
    if (!ok) return { error: 'Invalid username or password.' };

    try {
        const token = await createSession();
        const store = await cookies();
        store.set('sid', token, { httpOnly: true, path: '/', sameSite: 'lax' });
    } catch {
        return { error: 'Failed to create session. Please try again.' };
    }

    redirect('/http-hosts');
}

export async function submitSetup(username: string, password: string): Promise<{ error: string } | null> {
    if (!(await isSetup())) return { error: 'App is already configured.' };

    try {
        await registerAdmin(username, password);
        const token = await createSession();
        const store = await cookies();
        store.set('sid', token, { httpOnly: true, path: '/', sameSite: 'lax' });
    } catch {
        return { error: 'Failed to create account. Please try again.' };
    }

    redirect('/http-hosts');
}
