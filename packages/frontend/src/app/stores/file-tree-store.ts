import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { FileItem } from '@kiro-lens/shared';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { FilesAPI } from '../api/files.api';
import { tapResponse } from '@ngrx/operators';

type FileTreeState = {
  files: FileItem[];
};

export const FileTreeStore = signalStore(
  { providedIn: 'root' },
  withState<FileTreeState>({ files: [] }),
  withProps(() => ({
    filesAPI: inject(FilesAPI),
  })),
  withMethods(({ filesAPI, ...store }) => ({
    getFileTree: rxMethod<{ projectId: string }>(
      pipe(
        switchMap(({ projectId }) => {
          return filesAPI.getFiles({ id: projectId }).pipe(
            tapResponse({
              next: ({ data }) => {
                if (!data) {
                  return;
                }

                const { files } = data;

                patchState(store, { files });
              },
              error: (error) => {
                console.log(error);
              },
            }),
          );
        }),
      ),
    ),
  })),
);
