"use client";

import { useState } from "react";

export default function FileEditorTextarea({ content }: { content: string }) {
    const [value, setValue] = useState(content);

    return (
        <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full flex-1 resize-none rounded-md border border-zinc-200 bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700"
            rows={24}
            spellCheck={false}
        />
    );
}
