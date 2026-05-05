'use client';
import { submitSetup, isSetup, checkSession } from '@/libs/auth.actions';

export async function getSessionValid(): Promise<boolean> {
    return checkSession();
}

export async function checkIsSetup(): Promise<boolean> {
    return isSetup();
}

export async function registerAdmin(username: string, password: string): Promise<{ error: string } | null> {
    return submitSetup(username, password);
}
