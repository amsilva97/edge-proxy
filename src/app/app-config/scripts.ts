'use client';

import { AppConfig } from "@/libs/appConfig";

export async function LoadConfig() {
    return await AppConfig.LoadAsync();
}

export async function SaveConfig(config: any) {
    await AppConfig.SaveAsync(config);
}