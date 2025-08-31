export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded';
export type ServerState = 'running' | 'stopped' | 'error';

export interface HealthResponse {
    status: HealthStatus;
    timestamp: string;
    version: string;
    uptime: number;
    details?: {
        memory?: { used: number; total: number };
        errors?: string[];
        [key: string]: any;
    };
}

interface ServerInfo {
    port: number;
    url: string;
    status: ServerState;
    error?: string;
}

export interface ServerStatus {
    frontend: ServerInfo;
    backend: ServerInfo;
}

export interface ConnectionStatus {
    connected: boolean;
    lastPing: Date;
    latency?: number;
    error?: string;
}

export function isHealthyStatus(status: HealthStatus): boolean {
    return status === 'healthy';
}

export function createHealthResponse(
    status: HealthStatus,
    version: string,
    details?: HealthResponse['details']
): HealthResponse {
    return {
        status,
        timestamp: new Date().toISOString(),
        version,
        uptime: process.uptime(),
        ...(details && { details })
    };
}