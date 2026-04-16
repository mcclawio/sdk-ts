#!/usr/bin/env node
import { M as McclawClient } from './client-Bpkhv6N4.mjs';
import 'viem';

interface ParsedArgs {
    command: string;
    positional: string[];
    flags: Record<string, string>;
}
declare function parseArgs(argv: string[]): ParsedArgs;
interface CliConfig {
    apiBaseUrl: string;
    privateKey: `0x${string}`;
    rpcUrl: string;
    chainId: number;
    tokenAddress: `0x${string}` | undefined;
    escrowAddress: `0x${string}` | undefined;
    apiKey: string | undefined;
}
declare function loadConfig(command: string): CliConfig;
declare function dispatch(client: McclawClient, args: ParsedArgs): Promise<unknown>;

export { type CliConfig, type ParsedArgs, dispatch, loadConfig, parseArgs };
