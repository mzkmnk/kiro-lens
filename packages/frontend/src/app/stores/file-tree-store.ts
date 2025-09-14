import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { FileItem } from '@kiro-lens/shared';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { FilesAPI } from '../api/files.api';
import { tapResponse } from '@ngrx/operators';

type FileTreeState = {
  projectFiles: Record<string, FileItem[]>;
};

export const FileTreeStore = signalStore(
  { providedIn: 'root' },
  withState<FileTreeState>({ projectFiles: {} }),
  withProps(() => ({
    filesAPI: inject(FilesAPI),
  })),
  withMethods(({ filesAPI, ...store }) => ({
    getFileTree: rxMethod<{ projectId: string }>(
      pipe(
        switchMap(({ projectId }) => {
          console.log(store.projectFiles());
          if (Object.hasOwn(store.projectFiles(), projectId)) {
            return EMPTY;
          }

          return filesAPI.getFiles({ id: projectId }).pipe(
            tapResponse({
              next: ({ data }) => {
                if (!data) {
                  return;
                }

                const { files } = data;

                patchState(store, {
                  projectFiles: {
                    ...store.projectFiles(),
                    [projectId]: files,
                  },
                });
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
