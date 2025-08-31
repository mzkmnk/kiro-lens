import { BaseError, ValidationResult } from './common.js';

export interface PortConfiguration {
    frontend: number;
    backend: number;
    autoDetected: boolean;
    requestedPorts?: {
        frontend?: number;
        backend?: number;
    };
}

export interface CLIOptions {
    port?: number;
    frontendPort?: number;
    backendPort?: number;
    noOpen?: boolean;
    verbose?: boolean;
}

export interface PortValidationResult {
    isAvailable: boolean;
    conflictingProcess?: string;
    suggestedAlternative?: number;
}

export enum FoundationErrorType {
    PORT_IN_USE = 'PORT_IN_USE',
    PORT_PERMISSION_DENIED = 'PORT_PERMISSION_DENIED',
    KIRO_DIR_NOT_FOUND = 'KIRO_DIR_NOT_FOUND',
    SERVER_START_FAILED = 'SERVER_START_FAILED',
    INVALID_PROJECT_DIR = 'INVALID_PROJECT_DIR'
}

export interface FoundationError extends BaseError {
    type: FoundationErrorType;
    timestamp: Date;
    recoverable: boolean;
    suggestedAction?: string;
}

export function isValidPort(port: number): boolean {
    return Number.isInteger(port) && port > 0 && port <= 65535;
}

export function validatePortConfiguration(config: PortConfiguration): ValidationResult {
    const errors: string[] = [];

    if (!isValidPort(config.frontend)) {
        errors.push(`Invalid frontend port: ${config.frontend}`);
    }

    if (!isValidPort(config.backend)) {
        errors.push(`Invalid backend port: ${config.backend}`);
    }

    if (config.frontend === config.backend) {
        errors.push('フロントエンドとバックエンドのポートは同じにできません');
    }

    return { isValid: errors.length === 0, errors };
}

export function createPortConfiguration(options: CLIOptions): PortConfiguration {
    const defaultFrontend = 8000;

    if (options.frontendPort && options.backendPort) {
        return {
            frontend: options.frontendPort,
            backend: options.backendPort,
            autoDetected: false,
            requestedPorts: { frontend: options.frontendPort, backend: options.backendPort }
        };
    }

    if (options.port) {
        return {
            frontend: options.port,
            backend: options.port + 1,
            autoDetected: false,
            requestedPorts: { frontend: options.port }
        };
    }

    return {
        frontend: defaultFrontend,
        backend: defaultFrontend + 1,
        autoDetected: true
    };
}