'use client';
import * as NginxActions from './nginx.actions';

export type { NginxStatus, NginxProcess } from './nginx.actions';

export namespace Nginx {
    export async function GetStatusAsync(): Promise<NginxActions.NginxStatus> {
        return NginxActions.GetNginxStatusAsync();
    }
    export async function GetProcessesAsync(): Promise<NginxActions.NginxProcess[]> {
        return NginxActions.GetNginxProcessesAsync();
    }
    export async function StartAsync(): Promise<void> {
        return NginxActions.StartNginxAsync();
    }
    export async function StopAsync(): Promise<void> {
        return NginxActions.StopNginxAsync();
    }
    export async function ReloadAsync(): Promise<void> {
        return NginxActions.ReloadNginxAsync();
    }
}
