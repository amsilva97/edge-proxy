import { readFile } from "fs/promises";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ fileName: string }> }
) {
    try {
        const { fileName } = await params;
        const content = await readFile(`//wsl.localhost/Ubuntu/etc/nginx/sites-available/${fileName}`, "utf-8");

        // For now, just return the content of the file as a response
        return new Response(content, { status: 200 });
    }
    catch (error) {
        return new Response(`Error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
    }
}