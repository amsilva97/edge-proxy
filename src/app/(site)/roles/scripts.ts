'use client';
import { Role } from '@/types/types';
import { EdgeProxy } from '@/libs/edgeProxy';

export async function listRoles(): Promise<Role[]> {
    return EdgeProxy.GetRoleListAsync();
}

export async function getRole(name: string): Promise<Role> {
    return EdgeProxy.GetRoleAsync(name);
}

export async function roleExists(name: string): Promise<boolean> {
    try {
        const role = await EdgeProxy.GetRoleAsync(name);
        return !!role.name;
    } catch {
        return false;
    }
}

export async function saveRole(role: Role): Promise<void> {
    return EdgeProxy.SaveRoleAsync(role);
}

export async function setRolePassword(role: Role, password: string): Promise<void> {
    return EdgeProxy.SetRolePasswordAsync(role, password);
}

export async function clearRolePassword(role: Role): Promise<void> {
    return EdgeProxy.ClearRolePasswordAsync(role);
}

export async function grantRole(role: Role, roleToGrant: Role): Promise<void> {
    return EdgeProxy.GrantRoleAsync(role, roleToGrant);
}

export async function revokeRole(role: Role, roleToRevoke: Role): Promise<void> {
    return EdgeProxy.RevokeRoleAsync(role, roleToRevoke);
}
