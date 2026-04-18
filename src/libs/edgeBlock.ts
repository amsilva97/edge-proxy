'use client';
import * as EdgeBlockActions from './edgeBlock.actions';
import { EdgeProxyBlock } from '@/types/types';

export namespace EdgeBlock {
    export async function GetProxyListAsync(): Promise<string[]> {
        return EdgeBlockActions.GetProxyListAction();
    }

    export async function LoadAsync(proxy: string): Promise<EdgeProxyBlock> {
        return await EdgeBlockActions.LoadAsync(proxy);
    }

    export async function SaveAsync(proxy: string, data: EdgeProxyBlock): Promise<void> {
        await EdgeBlockActions.SaveAsync(proxy, data);
    }

    export async function DeleteAsync(proxy: string): Promise<void> {
        await EdgeBlockActions.DeleteAsync(proxy);
    }

    export async function EnableAsync(proxy: string): Promise<void> {
        await EdgeBlockActions.EnableAsync(proxy);
    }

    export async function DisableAsync(proxy: string): Promise<void> {
        await EdgeBlockActions.DisableAsync(proxy);
    }

    export async function DoExistsAsync(proxy: string): Promise<boolean> {
        return await EdgeBlockActions.DoExistsAsync(proxy);
    }

    export async function IsEnabledAsync(proxy: string): Promise<boolean> {
        return await EdgeBlockActions.IsEnabledAsync(proxy);
    }
}