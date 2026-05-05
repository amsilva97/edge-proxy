'use client';
import { submitLogin, isSetup, checkSession } from '@/libs/auth.actions';

export async function getSessionValid(): Promise<boolean> {
    return checkSession();
}

export async function checkIsSetup(): Promise<boolean> {
    return isSetup();
}

export async function signIn(username: string, password: string): Promise<{ error: string } | null> {
    return submitLogin(username, password);
}
