import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { RedZoomModule } from 'ngx-red-zoom';

import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './app/shared-services/encryptionservice/returntoken/token-interceptor.service';



bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),

    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        timeOut: 1500,
        preventDuplicates: true
      }),
      RedZoomModule
    ),

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),

    provideHttpClient(
      withInterceptors([
        tokenInterceptor
      ])
    ),


  ]
}).catch(err => console.error(err));
