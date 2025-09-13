import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AddProjectRequest, ProjectInfo } from '@kiro-lens/shared';
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
  selectedProject: ProjectInfo | null;
  isLoading: boolean;
};

export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState<ProjectsState>({
    projects: [],
    selectedProject: null,
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

    setSelectedProject: (projectId: string | null) => {
      const selectedProject = store
        .projects()
        .find((project) => project.id === projectId);

      if (selectedProject) {
        patchState(store, { selectedProject });
      }
    },

    addProject: rxMethod<AddProjectRequest>(
      pipe(
        switchMap((req) => {
          return projectsAPI.addProject(req).pipe(
            tapResponse({
              next: (res) => {
                const data = res.data?.project;

                if (data) {
                  patchState(store, {
                    projects: [...store.projects(), data],
                    selectedProject: data,
                  });
                }

                patchState(store, { isLoading: false });
              },
              error: (err) => {
                // TODO: error handling

                console.log(err);

                patchState(store, { isLoading: false });
              },
            }),
          );
        }),
      ),
    ),
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

      store.setSelectedProject(projectId);
    },
  }),
);
