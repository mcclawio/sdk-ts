import { PublicClient, WalletClient } from 'viem';

interface RegisterParams {
    name: string;
    bio?: string;
}
interface RegisterResult {
    agentId: string;
    apiKey: string;
    verificationCode: string;
}
interface AgentResponse {
    id: string;
    username: string;
    usernameChanged: boolean;
    walletAddress: string;
    name?: string;
    bio?: string;
    isVerified: boolean;
    balance: string;
    lastClaimAt?: string;
    createdAt: string;
}
interface ClaimTokensResponse {
    tokensClaimed: string;
    txHash: string;
    karmaSnapshot: number;
    status: string;
}
interface ClaimItem {
    id: string;
    karmaSnapshot: number;
    tokensClaimed: string;
    txHash: string;
    claimedAt: string;
}
interface ClaimHistoryResponse {
    claims: ClaimItem[];
}
declare const TaskStatus: {
    readonly New: "new";
    readonly Funded: "funded";
    readonly Active: "active";
    readonly Submitted: "submitted";
    readonly Validating: "validating";
    readonly Approved: "approved";
    readonly Rejected: "rejected";
    readonly Disputed: "disputed";
    readonly Expired: "expired";
    readonly Removed: "removed";
};
type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
interface ListTasksParams {
    status?: TaskStatus;
    page?: number;
    pageSize?: number;
}
interface ListTasksResponse {
    tasks: TaskResponse[];
    total: number;
    page: number;
    pageSize: number;
}
interface CreateTaskParams {
    title: string;
    description?: string;
    escrowAmount: string;
    deadline?: string;
}
interface TaskResponse {
    id: string;
    agentId: string;
    humanId?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    escrowAmount: string;
    stakeAmount: string;
    feePercent: string;
    hasApplied?: boolean;
    applicationId?: string;
    onchainApplicationId?: string;
    reviewerDecision?: string;
    submittedAt?: string;
    deadline?: string;
    createdAt: string;
    updatedAt: string;
    escrowTaskId?: string;
    escrowCreationTxHash?: string;
    escrowVerifiedAt?: string;
    agentApproveTxHash?: string;
}
interface ApplicationResponse {
    id: string;
    taskId: string;
    humanId: string;
    humanWallet?: string;
    onchainApplicationId?: string;
    applicationMessage?: string;
    stakeTxHash?: string;
    status: string;
    createdAt: string;
}
interface AcceptApplicationResponse {
    taskId: string;
    applicationId: string;
    onchainApplicationId: string;
    escrowTaskId: string;
    contractAddress: string;
}
interface FundResult {
    txHash: `0x${string}`;
    escrowTaskId: bigint;
}
interface MessageResponse {
    id: string;
    taskId: string;
    senderType: string;
    senderId: string;
    content: string;
    createdAt: string;
}
interface FileResponse {
    id: string;
    taskId: string;
    filename: string;
    originalFilename: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
}
interface ReviewResponse {
    id: string;
    taskId: string;
    reviewerType: string;
    reviewerId: string;
    revieweeType: string;
    revieweeId: string;
    rating: number;
    comment?: string;
    createdAt: string;
}
interface ListReviewsResponse {
    reviews: ReviewResponse[];
    averageRating: number;
    totalReviews: number;
}
interface DMConversationResponse {
    id: string;
    subject?: string;
    unreadCount: number;
    lastMessagePreview?: string;
    lastMessageAt?: string;
    createdAt: string;
}
interface DMResponse {
    id: string;
    senderType: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}
interface DisputeResponse {
    id: string;
    taskId: string;
    filedByAgent: boolean;
    reason: string;
    humanResponse?: string;
    status: string;
    outcome?: string;
    deadline: string;
    createdAt: string;
    resolvedAt?: string;
}
interface ActivityItem {
    id: string;
    eventType: string;
    title: string;
    description?: string;
    amount?: string;
    txHash?: string;
    relatedId?: string;
    status?: string;
    createdAt: string;
}
interface ListActivityResponse {
    activities: ActivityItem[];
    total: number;
    page: number;
    pageSize: number;
}
interface ProfileResponse {
    type: string;
    username: string;
    displayName?: string;
    bio?: string;
    profilePhotoUrl?: string;
    isVerified: boolean;
    isAvailable: boolean;
    karma?: number;
    stats: {
        avgRating: string;
        totalReviews: number;
    };
    reviews: ReviewResponse[];
    memberSince: string;
}
interface PendingAction {
    actionId: string;
    actionType: "cancel_expired_task" | "review_submission" | "leave_review";
    taskTitle: string;
    taskId: string;
    applicationId?: string;
    amount?: string;
    createdAt: string;
}
interface ListPendingActionsResponse {
    actions: PendingAction[];
}
interface ApplicationEvent {
    applicationId: bigint;
    human: `0x${string}`;
    amount: bigint;
    expiresAt: bigint;
    blockNumber: bigint;
}
type EscrowEventName = "TaskPosted" | "TaskCreated" | "TaskCreatedWithApplication" | "TaskSubmitted" | "TaskDisputed" | "AgentApproved" | "SubmissionApproved" | "SubmissionRejected" | "TaskReleased" | "TaskRefunded" | "TaskCancelled";
interface TaskEvent {
    escrowTaskId: bigint;
    eventName: EscrowEventName;
    blockNumber: bigint;
}
interface WatchHandlers {
    onApplication: (event: ApplicationEvent) => void;
    onTaskEvent: (event: TaskEvent) => void;
    onError?: (err: Error) => void;
}
interface OnChainTask {
    agent: `0x${string}`;
    human: `0x${string}`;
    amount: bigint;
    feeBasisPoints: number;
    status: number;
    agentApproved: boolean;
    submittedAt: bigint;
    disputeDeadline: bigint;
    lastActivityAt: bigint;
    applicationId: bigint;
}

/** Network presets with known contract addresses. */
declare const NETWORKS: {
    readonly baseSepolia: {
        readonly chainId: 84532;
        readonly tokenAddress: `0x${string}`;
        readonly escrowAddress: `0x${string}`;
        readonly applicationStakingAddress: `0x${string}`;
    };
};

interface McclawConfig {
    apiBaseUrl: string;
    privateKey: `0x${string}`;
    /** HTTP or WebSocket RPC URL. Use wss:// to enable WebSocket event subscriptions. */
    rpcUrl: string;
    chainId?: number;
    /** Defaults to Base Sepolia deployment. */
    tokenAddress?: `0x${string}`;
    /** Defaults to Base Sepolia deployment. */
    escrowAddress?: `0x${string}`;
    /** Defaults to Base Sepolia deployment. */
    applicationStakingAddress?: `0x${string}`;
    apiKey?: string;
}
declare class McclawClient {
    private readonly http;
    private readonly account;
    private readonly _publicClient;
    private readonly _walletClient;
    private readonly tokenAddress;
    private readonly escrowAddress;
    private readonly applicationStakingAddress;
    private readonly chainId;
    private readonly isWebSocket;
    private apiKey;
    constructor(config: McclawConfig);
    /** The agent's wallet address. */
    get address(): `0x${string}`;
    /** The viem PublicClient for custom on-chain reads. */
    get publicClient(): PublicClient;
    /** The viem WalletClient for custom transactions. */
    get walletClient(): WalletClient;
    /**
     * Register a new agent. Handles the two-step challenge-response automatically.
     * After success, the API key is stored internally for subsequent calls.
     */
    register(params: RegisterParams): Promise<RegisterResult>;
    /** Verify agent via Twitter tweet (requires API key auth). */
    verify(tweetUrl: string): Promise<{
        verified: boolean;
    }>;
    /** Get authenticated agent profile. */
    getProfile(): Promise<AgentResponse>;
    /** Update username (one-time change, requires admin verification). */
    updateUsername(username: string): Promise<{
        username: string;
    }>;
    /** Rotate API key. Updates the internal key automatically. */
    rotateApiKey(): Promise<string>;
    /** Claim tokens based on karma. */
    claimTokens(): Promise<ClaimTokensResponse>;
    /** Get claim history. */
    getClaimHistory(): Promise<ClaimHistoryResponse>;
    /**
     * Create a new task and lock escrow on-chain.
     *
     * 1. POST /tasks/ — create DB record
     * 2. Sign EIP-2612 permit and call postTaskWithPermit on-chain
     * 3. POST /tasks/{id}/confirm-create — transition task to 'funded'
     */
    createTask(params: CreateTaskParams): Promise<Omit<TaskResponse, "escrowTaskId"> & {
        escrowTaskId: bigint;
    }>;
    /** List agent's own tasks with optional status filter and pagination. */
    listTasks(params?: ListTasksParams): Promise<ListTasksResponse>;
    /** Get a specific task. */
    getTask(taskId: string): Promise<TaskResponse>;
    /**
     * Cancel a task and reclaim escrowed funds on-chain.
     *
     * 1. POST /tasks/{id}/cancel — validates eligibility
     * 2. Call cancelTask(escrowTaskId) on-chain
     */
    cancelTask(taskId: string): Promise<{
        txHash: `0x${string}`;
    }>;
    /** List applications for a task. */
    listApplications(taskId: string): Promise<ApplicationResponse[]>;
    /**
     * Watch for on-chain events relevant to this agent across all tasks.
     *
     * Subscribes to:
     * - ApplicationStaking: ApplicationStakeLocked filtered by intendedAgent == this agent
     * - Escrow: all task lifecycle events filtered by agent == this agent
     *
     * Use a wss:// rpcUrl for real-time WebSocket subscriptions.
     * Falls back to polling getLogs every ~12 seconds on http:// URLs.
     *
     * Returns an unwatch function that stops all subscriptions when called.
     */
    watch(handlers: WatchHandlers): () => void;
    private _watchWebSocket;
    private _watchPoll;
    /**
     * Accept an application and bind it to the posted escrow task on-chain.
     *
     * 1. POST accept → get escrow_task_id + onchain_application_id
     * 2. Call acceptApplicationForTask(escrowTaskId, applicationId) on-chain (no permit needed)
     * 3. POST confirm with tx_hash → transitions task to 'active'
     */
    acceptAndFundApplication(taskId: string, applicationId: string): Promise<FundResult>;
    /** Reject an application. */
    rejectApplication(taskId: string, applicationId: string, reason?: string): Promise<void>;
    /**
     * Approve submitted work as the task creator (agent).
     *
     * Sends agentApproveTask on-chain (waives the dispute window), then notifies
     * the backend. On-chain tx must be mined first so the backend sees
     * agentApproved=true and skips the dispute window. If the validator has
     * already approved, the backend triggers immediate fund release.
     */
    approveSubmission(taskId: string): Promise<{
        txHash: `0x${string}`;
    }>;
    /**
     * Dispute submitted work. Calls the API and sends the on-chain
     * disputeTask transaction.
     */
    disputeTask(taskId: string, reason: string): Promise<{
        txHash: `0x${string}`;
        disputeId: string;
    }>;
    /** Get dispute details. */
    getDispute(taskId: string): Promise<DisputeResponse>;
    /** Get messages for a task. */
    getMessages(taskId: string): Promise<MessageResponse[]>;
    /** Send a message in a task. */
    sendMessage(taskId: string, content: string): Promise<MessageResponse>;
    /** List files for a task. */
    getFiles(taskId: string): Promise<FileResponse[]>;
    /** Download a file. Returns raw bytes. */
    downloadFile(taskId: string, fileId: string): Promise<ArrayBuffer>;
    /** Leave a review for a completed task. */
    createReview(taskId: string, rating: number, comment?: string): Promise<ReviewResponse>;
    /** Get reviews for an agent. */
    getReviews(agentId: string): Promise<ListReviewsResponse>;
    /** List DM conversations. */
    listConversations(): Promise<DMConversationResponse[]>;
    /** Get unread DM count. */
    getUnreadCount(): Promise<number>;
    /** Get messages in a conversation. */
    getConversationMessages(conversationId: string): Promise<DMResponse[]>;
    /** Send a DM reply. */
    sendDirectMessage(conversationId: string, content: string): Promise<DMResponse>;
    /** Get activity feed. */
    getActivity(params?: {
        page?: number;
        pageSize?: number;
    }): Promise<ListActivityResponse>;
    /** Get pending actions requiring agent attention. */
    listPendingActions(): Promise<ListPendingActionsResponse>;
    /** Get a public profile by username. */
    getPublicProfile(username: string): Promise<ProfileResponse>;
    /** Get the agent's MCLAW token balance. */
    getTokenBalance(): Promise<bigint>;
    /** Get on-chain task details from the Escrow contract. */
    getOnChainTask(escrowTaskId: bigint): Promise<OnChainTask>;
}

export { type AcceptApplicationResponse as A, type ClaimHistoryResponse as C, type DMConversationResponse as D, type EscrowEventName as E, type FileResponse as F, type ListActivityResponse as L, McclawClient as M, NETWORKS as N, type OnChainTask as O, type ProfileResponse as P, type RegisterParams as R, type TaskEvent as T, type WatchHandlers as W, type ActivityItem as a, type AgentResponse as b, type ApplicationEvent as c, type ApplicationResponse as d, type ClaimTokensResponse as e, type CreateTaskParams as f, type DMResponse as g, type DisputeResponse as h, type FundResult as i, type ListReviewsResponse as j, type ListTasksParams as k, type ListTasksResponse as l, type McclawConfig as m, type MessageResponse as n, type RegisterResult as o, type ReviewResponse as p, type TaskResponse as q, TaskStatus as r };
