/**
 * WebSocket通信関連の型定義
 */

// クライアント → サーバー イベント
export interface ClientToServerEvents {
    'file:watch': (path: string) => void;
    'file:unwatch': (path: string) => void;
    'file:edit:start': (path: string) => void;
    'file:edit:end': (path: string) => void;
}

// サーバー → クライアント イベント
export interface ServerToClientEvents {
    'file:changed': (data: FileChangeEvent) => void;
    'file:created': (data: FileCreateEvent) => void;
    'file:deleted': (data: FileDeleteEvent) => void;
    'file:conflict': (data: FileConflictEvent) => void;
    'connection:status': (data: ConnectionStatusEvent) => void;
}

export interface FileChangeEvent {
    path: string;
    content: string;
    lastModified: string;
    changeType: 'content' | 'rename' | 'move';
    source: 'local' | 'remote';
}

export interface FileCreateEvent {
    path: string;
    type: 'file' | 'folder';
    lastModified: string;
}

export interface FileDeleteEvent {
    path: string;
    type: 'file' | 'folder';
}

export interface FileConflictEvent {
    path: string;
    localContent: string;
    remoteContent: string;
    localLastModified: string;
    remoteLastModified: string;
    conflictType: 'edit_conflict' | 'local_change_during_edit';
}

export interface ConnectionStatusEvent {
    status: 'connected' | 'disconnected' | 'reconnecting';
    timestamp: string;
}