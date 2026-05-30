import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ContactInput {
    subject: string;
    name: string;
    email: string;
    message: string;
}
export type UserId = Principal;
export type Timestamp = bigint;
export interface UpdateUserInput {
    organizationName?: string;
    subscriptionTier?: SubscriptionTier;
    email?: string;
}
export interface ContactSubmission {
    id: bigint;
    subject: string;
    name: string;
    submittedAt: Timestamp;
    email: string;
    message: string;
}
export interface RecordUsageInput {
    modelName: string;
}
export interface CreateUserInput {
    organizationName?: string;
    email?: string;
}
export interface CreateApiKeyResult {
    key: ApiKeyPublic;
    rawKey: string;
}
export interface CreateApiKeyInput {
    name: string;
}
export interface ApiKeyPublic {
    id: bigint;
    lastUsedAt?: Timestamp;
    owner: UserId;
    name: string;
    createdAt: Timestamp;
    isActive: boolean;
    keyHash: string;
}
export interface UsageStats {
    dailyBreakdown: Array<[string, bigint]>;
    modelBreakdown: Array<[string, bigint]>;
    totalRequests: bigint;
}
export interface UserProfilePublic {
    id: UserId;
    organizationName?: string;
    createdAt: Timestamp;
    subscriptionTier: SubscriptionTier;
    email?: string;
}
export enum SubscriptionTier {
    pro = "pro",
    enterprise = "enterprise",
    starter = "starter",
    free = "free"
}
export interface backendInterface {
    createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult>;
    createUser(input: CreateUserInput): Promise<UserProfilePublic>;
    deleteApiKey(keyId: bigint): Promise<boolean>;
    getUsageStats(): Promise<UsageStats>;
    getUser(): Promise<UserProfilePublic | null>;
    listApiKeys(): Promise<Array<ApiKeyPublic>>;
    recordUsage(input: RecordUsageInput): Promise<void>;
    submitContact(input: ContactInput): Promise<ContactSubmission>;
    updateUser(input: UpdateUserInput): Promise<UserProfilePublic | null>;
}
