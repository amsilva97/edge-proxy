import * as AuthActions from './auth.actions';

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
}
