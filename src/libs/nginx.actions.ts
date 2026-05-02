'use server'
import { exec } from 'child_process';

export type NginxStatus = { active: boolean; enabled: boolean }
export type NginxProcess = { pid: number; user: string; cpu: string; mem: string; stat: string; command: string }

function run(cmd: string): Promise<string> {
    return new Promise((resolve, reject) =>
        exec(cmd, (err, stdout) => err ? reject(err) : resolve(stdout.trim()))
    );
}

function runSafe(cmd: string): Promise<string> {
    return new Promise(resolve =>
        exec(cmd, (_err, stdout) => resolve(stdout.trim()))
    );
}

export async function GetNginxStatusAsync(): Promise<NginxStatus> {
    const [activeOut, enabledOut] = await Promise.all([
        runSafe('systemctl is-active nginx'),
        runSafe('systemctl is-enabled nginx'),
    ]);
    return {
        active: activeOut === 'active',
        enabled: enabledOut === 'enabled',
    };
}

export async function GetNginxProcessesAsync(): Promise<NginxProcess[]> {
    const out = await runSafe("ps aux | grep '[n]ginx'");
    if (!out) return [];
    return out.split('\n').filter(Boolean).map(line => {
        const parts = line.trim().split(/\s+/);
        return {
            pid: parseInt(parts[1]),
            user: parts[0],
            cpu: parts[2],
            mem: parts[3],
            stat: parts[7],
            command: parts.slice(10).join(' '),
        };
    });
}

export async function StartNginxAsync(): Promise<void> {
    await run('systemctl enable nginx && systemctl start nginx');
}

export async function StopNginxAsync(): Promise<void> {
    await run('systemctl disable nginx && systemctl stop nginx');
}

export async function ReloadNginxAsync(): Promise<void> {
    await run('nginx -s reload');
}
