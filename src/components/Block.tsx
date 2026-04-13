import { JSX } from "react";

export type BlockData = [BlockKey, ...any[]];

export enum BlockKey {
    Root,
    Server,
    Listen,
    ServerName,
}

interface BlockProps {
    data: BlockData;
}

function renderContent(blockKey: BlockKey, content: any[]): JSX.Element {
    console.log(content.length);
    switch (blockKey) {
        case BlockKey.Root:
        case BlockKey.Server:
            return (<>
                <div>{BlockKey[blockKey]}</div>
                <div className="ml-4">
                    {content.map((child, index) => (
                        <Block key={index} data={child} />
                    ))}
                </div>
            </>);
        case BlockKey.ServerName:
            return (
                <div className="flex items-center gap-2">
                    <div>{BlockKey[blockKey]}</div>
                    <div className="flex flex-col gap-1">
                        {(content as any[]).map((value, index) => (
                            <input key={index} defaultValue={value} />
                        ))}
                    </div>
                </div>
            );
        default:
            return (<pre>{BlockKey[blockKey]} {JSON.stringify(content)}</pre>);
    }
}

export default function Block({ data }: BlockProps) {
    const blockKey = data[0];
    const content = data[1];
    return renderContent(blockKey, content);
}