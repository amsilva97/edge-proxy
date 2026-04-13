import Block from "@/components/Block";
import { getBlock } from "./scripts";

export default function ProxiesPage() {
    const blockData = getBlock();

    return (
        <main className="p-6">
            <Block data={blockData} />
        </main>
    );
}