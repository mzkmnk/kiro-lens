import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { providePrimeNG } from "primeng/config";

import { provideHttpClient } from "@angular/common/http";
import { routes } from "./app.routes";
import { Noir } from "./noir-theme";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Noir,
      },
    }),
  ],
};
