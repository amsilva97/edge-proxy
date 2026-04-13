import { BlockData, BlockKey } from "@/components/Block";

    //#region Test Methods
export function getBlock() {
    const data: BlockData = [
        BlockKey.Root,
        [
            [
                BlockKey.Server,
                [
                    [
                        BlockKey.Listen,
                        ["443", "ssl"]
                    ],
                    [
                        BlockKey.ServerName,
                        ["example.com"]
                    ]
                ]
            ]
        ]
    ];
    return data;
}