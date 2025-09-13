import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { ProjectInfo } from '@kiro-lens/shared';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { ProjectsAPI } from '../api/projects.api';

type ProjectsState = {
  projects: ProjectInfo[];
  selectedProjectId: string | null;
  isLoading: boolean;
};

export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState<ProjectsState>({
    projects: [],
    selectedProjectId: null,
    isLoading: false,
  }),
  withProps(() => ({
    projectsAPI: inject(ProjectsAPI),
    router: inject(Router),
  })),
  withMethods(({ projectsAPI, ...store }) => ({
    getAllProjects: rxMethod(
      pipe(
        switchMap(() => {
          patchState(store, { isLoading: true });
          return projectsAPI.getAllProjects().pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  projects: response.data?.projects ?? [],
                  isLoading: false,
                });
              },
              error: () => {
                patchState(store, { isLoading: false });
              },
            }),
          );
        }),
      ),
    ),

    setSelectedProjectId: (projectId: string | null) => {
      patchState(store, { selectedProjectId: projectId });
    },
  })),
  withHooks({
    onInit({ router, ...store }) {
      store.getAllProjects({});

      let params = {};

      let stack: ActivatedRouteSnapshot[] = [router.routerState.snapshot.root];

      while (stack.length > 0) {
        const route = stack.pop()!;
        params = { ...params, ...route.params };
        stack.push(...route.children);
      }

      const projectId = Object.hasOwn(params, 'id')
        ? (params as { id: string })['id']
        : null;

      store.setSelectedProjectId(projectId);
    },
  }),
);
