import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "dashboard",
    loadComponent: () => import("./pages/dashboard").then((M) => M.dashbaord),
  },
  {
    path: "**",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
];
