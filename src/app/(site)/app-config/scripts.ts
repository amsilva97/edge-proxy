import { AppEnv } from "@/libs/appEnv";

export async function LoadConfig() {
    return await AppEnv.LoadEnvAsync();
}

export async function SaveConfig(config: any) {
    await AppEnv.SaveEnvAsync(config);
}