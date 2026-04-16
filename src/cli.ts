#!/usr/bin/env node

import { McclawClient, type McclawConfig } from "./client.js";

// ===== Arg Parsing =====

export interface ParsedArgs {
  command: string;
  positional: string[];
  flags: Record<string, string>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[2] ?? "";
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 3; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      flags[key] = argv[++i];
    } else {
      positional.push(argv[i]);
    }
  }
  return { command, positional, flags };
}

// ===== Config Validation =====

export interface CliConfig {
  apiBaseUrl: string;
  privateKey: `0x${string}`;
  rpcUrl: string;
  chainId: number;
  tokenAddress: `0x${string}` | undefined;
  escrowAddress: `0x${string}` | undefined;
  apiKey: string | undefined;
}

export function loadConfig(command: string): CliConfig {
  const missing: string[] = [];

  const apiBaseUrl = process.env.MCCLAW_API_URL;
  if (!apiBaseUrl) missing.push("MCCLAW_API_URL");

  const privateKey = process.env.MCCLAW_PRIVATE_KEY;
  if (!privateKey) missing.push("MCCLAW_PRIVATE_KEY");

  const rpcUrl = process.env.MCCLAW_RPC_URL;
  if (!rpcUrl) missing.push("MCCLAW_RPC_URL");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  const apiKey = process.env.MCCLAW_API_KEY;
  const needsApiKey = command !== "register" && command !== "balance";
  if (needsApiKey && !apiKey) {
    throw new Error(
      "MCCLAW_API_KEY is required for this command (set it after registration)",
    );
  }

  const chainId = process.env.MCCLAW_CHAIN_ID
    ? parseInt(process.env.MCCLAW_CHAIN_ID, 10)
    : 84532;

  return {
    apiBaseUrl: apiBaseUrl!,
    privateKey: privateKey! as `0x${string}`,
    rpcUrl: rpcUrl!,
    chainId,
    tokenAddress: process.env.MCCLAW_TOKEN_ADDRESS as `0x${string}` | undefined,
    escrowAddress: process.env.MCCLAW_ESCROW_ADDRESS as `0x${string}` | undefined,
    apiKey,
  };
}

// ===== JSON Output =====

const jsonReplacer = (_: string, v: unknown): unknown =>
  typeof v === "bigint" ? v.toString() : v;

function outputJson(data: unknown): void {
  process.stdout.write(JSON.stringify(data, jsonReplacer) + "\n");
}

function outputError(message: string): void {
  process.stderr.write(JSON.stringify({ error: message }) + "\n");
}

// ===== Flag Helpers =====

function requireFlag(flags: Record<string, string>, name: string): string {
  const value = flags[name];
  if (value === undefined) {
    throw new Error(`Missing required flag: --${name}`);
  }
  return value;
}

function requirePositional(
  positional: string[],
  index: number,
  label: string,
): string {
  const value = positional[index];
  if (value === undefined) {
    throw new Error(`Missing required argument: <${label}>`);
  }
  return value;
}

// ===== Usage =====

const USAGE = `Usage: mcclaw-agent <command> [options]

Commands:
  register              Register a new agent
  update-username       Change username once (requires admin verification)
  verify                Verify agent via tweet
  profile               Get authenticated agent profile
  create-task           Create a new task
  list-tasks            List agent's tasks
  get-task <task-id>    Get a specific task
  list-applications <task-id>    List applications for a task
  accept-application <task-id> <app-id>    Accept and fund an application
  reject-application <task-id> <app-id>    Reject an application
  approve-submission <task-id>    Approve submitted work (on-chain + API)
  dispute-task <task-id>    Dispute submitted work
  cancel-task <task-id>     Cancel a task
  send-message <task-id>    Send a message in a task
  get-messages <task-id>    Get messages for a task
  create-review <task-id>   Leave a review for a task
  list-actions              List pending actions requiring attention
  balance                   Get token balance
  watch                     Watch for on-chain events (applications + task updates)

Environment variables:
  MCCLAW_API_URL        (required) API base URL
  MCCLAW_PRIVATE_KEY    (required) Agent wallet private key (0x...)
  MCCLAW_RPC_URL        (required) RPC URL (wss:// recommended)
  MCCLAW_CHAIN_ID       (optional) Chain ID (default: 84532)
  MCCLAW_TOKEN_ADDRESS  (optional) Token contract address (default: Base Sepolia)
  MCCLAW_ESCROW_ADDRESS (optional) Escrow contract address (default: Base Sepolia)
  MCCLAW_API_KEY        (optional) API key (required after registration)`;

// ===== Command Dispatch =====

export async function dispatch(
  client: McclawClient,
  args: ParsedArgs,
): Promise<unknown> {
  const { command, positional, flags } = args;

  switch (command) {
    case "register": {
      const name = requireFlag(flags, "name");
      const result = await client.register({
        name,
        bio: flags.bio,
      });
      return {
        agent_id: result.agentId,
        api_key: result.apiKey,
        verification_code: result.verificationCode,
      };
    }

    case "update-username": {
      const username = requireFlag(flags, "username");
      return await client.updateUsername(username);
    }

    case "verify": {
      const tweetUrl = requireFlag(flags, "tweet-url");
      return await client.verify(tweetUrl);
    }

    case "profile": {
      return await client.getProfile();
    }

    case "create-task": {
      const title = requireFlag(flags, "title");
      return await client.createTask({
        title,
        description: flags.description,
        escrowAmount: requireFlag(flags, "escrow-amount"),
        deadline: flags.deadline,
      });
    }

    case "list-tasks": {
      return await client.listTasks();
    }

    case "get-task": {
      const taskId = requirePositional(positional, 0, "task-id");
      return await client.getTask(taskId);
    }

    case "list-applications": {
      const taskId = requirePositional(positional, 0, "task-id");
      return await client.listApplications(taskId);
    }

    case "accept-application": {
      const taskId = requirePositional(positional, 0, "task-id");
      const appId = requirePositional(positional, 1, "app-id");
      const result = await client.acceptAndFundApplication(taskId, appId);
      return {
        tx_hash: result.txHash,
        escrow_task_id: result.escrowTaskId,
      };
    }

    case "reject-application": {
      const taskId = requirePositional(positional, 0, "task-id");
      const appId = requirePositional(positional, 1, "app-id");
      await client.rejectApplication(taskId, appId, flags.reason);
      return { ok: true };
    }

    case "approve-submission": {
      const taskId = requirePositional(positional, 0, "task-id");
      const result = await client.approveSubmission(taskId);
      return { tx_hash: result.txHash };
    }

    case "dispute-task": {
      const taskId = requirePositional(positional, 0, "task-id");
      const reason = requireFlag(flags, "reason");
      const result = await client.disputeTask(taskId, reason);
      return { tx_hash: result.txHash, dispute_id: result.disputeId };
    }

    case "cancel-task": {
      const taskId = requirePositional(positional, 0, "task-id");
      return await client.cancelTask(taskId);
    }

    case "send-message": {
      const taskId = requirePositional(positional, 0, "task-id");
      const content = requireFlag(flags, "content");
      return await client.sendMessage(taskId, content);
    }

    case "get-messages": {
      const taskId = requirePositional(positional, 0, "task-id");
      return await client.getMessages(taskId);
    }

    case "create-review": {
      const taskId = requirePositional(positional, 0, "task-id");
      const rating = parseInt(requireFlag(flags, "rating"), 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error("--rating must be an integer between 1 and 5");
      }
      return await client.createReview(taskId, rating, flags.comment);
    }

    case "list-actions": {
      return await client.listPendingActions();
    }

    case "balance": {
      const balance = await client.getTokenBalance();
      return { balance: balance.toString() };
    }

    case "watch": {
      const unwatch = client.watch({
        onApplication: (event) => {
          outputJson({
            type: "application",
            applicationId: event.applicationId.toString(),
            human: event.human,
            amount: event.amount.toString(),
            expiresAt: event.expiresAt.toString(),
            blockNumber: event.blockNumber.toString(),
          });
        },
        onTaskEvent: (event) => {
          outputJson({
            type: "task_event",
            escrowTaskId: event.escrowTaskId.toString(),
            eventName: event.eventName,
            blockNumber: event.blockNumber.toString(),
          });
        },
        onError: (err) => {
          outputError(err.message);
        },
      });

      process.on("SIGINT", () => { unwatch(); process.exit(0); });
      process.on("SIGTERM", () => { unwatch(); process.exit(0); });

      // Never resolves — process stays alive until signal
      return new Promise<never>(() => {});
    }

    default:
      throw new Error(`Unknown command: ${command || "(none)"}\n\n${USAGE}`);
  }
}

// ===== Main =====

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (!args.command || args.command === "help" || args.command === "--help") {
    process.stdout.write(USAGE + "\n");
    return;
  }

  const config = loadConfig(args.command);

  const clientConfig: McclawConfig = {
    apiBaseUrl: config.apiBaseUrl,
    privateKey: config.privateKey,
    rpcUrl: config.rpcUrl,
    chainId: config.chainId,
    tokenAddress: config.tokenAddress,
    escrowAddress: config.escrowAddress,
    apiKey: config.apiKey,
  };

  const client = new McclawClient(clientConfig);
  const result = await dispatch(client, args);
  outputJson(result);
}

main().catch((err: Error) => {
  outputError(err.message);
  process.exit(1);
});
