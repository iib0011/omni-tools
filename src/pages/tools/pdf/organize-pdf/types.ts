export type OrganizerPageId = string;

interface OrganizerPageBase {
  id: OrganizerPageId;
  width: number;
  height: number;
  rotation: number;
}

export interface OrganizerSourcePage extends OrganizerPageBase {
  kind: 'source';
  sourceIndex: number;
  sourcePageNumber: number;
}

export interface OrganizerBlankPage extends OrganizerPageBase {
  kind: 'blank';
}

export type OrganizerPage = OrganizerSourcePage | OrganizerBlankPage;

export interface OrganizerSnapshot {
  pages: readonly OrganizerPage[];
  selectedIds: readonly OrganizerPageId[];
}

export interface OrganizerHistory {
  past: readonly OrganizerSnapshot[];
  present: OrganizerSnapshot;
  future: readonly OrganizerSnapshot[];
}

export type DropPlacement = 'before' | 'after';
export type MoveDirection = -1 | 1;

export type OrganizerAction =
  | { type: 'delete-selected' }
  | { type: 'duplicate-selected'; newIds: readonly OrganizerPageId[] }
  | { type: 'reverse-all' }
  | { type: 'move-selected-to-start' }
  | { type: 'move-selected-to-end' }
  | { type: 'move-selected-by'; direction: MoveDirection }
  | {
      type: 'reorder-selected';
      pageIds: readonly OrganizerPageId[];
      targetId: OrganizerPageId;
      placement: DropPlacement;
    }
  | {
      type: 'insert-blank';
      blankPage: OrganizerBlankPage;
      placement: DropPlacement;
    };

export interface OrganizerInspection {
  pages: OrganizerSourcePage[];
  pageCount: number;
  hasSignatureFields: boolean;
}

export type OrganizerStage =
  | 'reading'
  | 'inspecting'
  | 'copying'
  | 'saving'
  | 'verifying';

export interface OrganizerProgress {
  stage: OrganizerStage;
  current: number;
  total: number;
}

export type OrganizerErrorCode =
  | 'INVALID_PDF'
  | 'PASSWORD_REQUIRED'
  | 'EMPTY_DOCUMENT'
  | 'INVALID_ORGANIZATION'
  | 'EXPORT_FAILED'
  | 'VERIFICATION_FAILED'
  | 'WORKER_ERROR';

export interface OrganizerErrorPayload {
  code: OrganizerErrorCode;
  message: string;
}

export interface OrganizerExportVerification {
  pageCount: number;
  expectedPageCount: number;
  geometryVerified: boolean;
  sequence: readonly string[];
}

export interface OrganizerExportResult {
  bytes: ArrayBuffer;
  verification: OrganizerExportVerification;
}

export type OrganizerWorkerRequest =
  | {
      type: 'inspect';
      requestId: string;
      source: ArrayBuffer;
    }
  | {
      type: 'export';
      requestId: string;
      source: ArrayBuffer;
      pages: OrganizerPage[];
    };

export type OrganizerWorkerResponse =
  | {
      type: 'progress';
      requestId: string;
      progress: OrganizerProgress;
    }
  | {
      type: 'inspected';
      requestId: string;
      inspection: OrganizerInspection;
    }
  | {
      type: 'exported';
      requestId: string;
      result: OrganizerExportResult;
    }
  | {
      type: 'error';
      requestId: string;
      error: OrganizerErrorPayload;
    };

export interface BrowserOutputVerification {
  verified: boolean;
  pageCount: number;
  geometryMatches: boolean;
  textMatches: boolean;
  visualMatches: boolean;
  textPagesChecked: number;
  visualPagesChecked: number;
  blankPagesChecked: number;
}
