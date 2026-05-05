import * as AuthActions from './auth.actions';

export const SESSION_COOKIE = 'sid';

export class Auth {
    static async isSetup(): Promise<boolean> {
        return AuthActions.isSetup();
    }

    static async login(username: string, password: string): Promise<boolean> {
        return AuthActions.login(username, password);
    }

    static async registerAdmin(username: string, password: string): Promise<void> {
        return AuthActions.registerAdmin(username, password);
    }

    static async createSession(): Promise<string> {
        return AuthActions.createSession();
    }

    static async validateSession(token: string): Promise<boolean> {
        return AuthActions.validateSession(token);
    }

    static async destroySession(): Promise<void> {
        return AuthActions.destroySession();
    }

    static async submitSetup(username: string, password: string): Promise<{ error: string } | null> {
        return AuthActions.submitSetup(username, password);
    }
}
