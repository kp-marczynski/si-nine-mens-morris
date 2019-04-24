import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {GameComponent} from './game.component';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {MatListModule} from '@angular/material/list';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        GameComponent
    ],
    imports: [
        BrowserModule,
        NoopAnimationsModule,
        MatCardModule,
        MatGridListModule,
        MatButtonModule,
        MatListModule,
        MatSnackBarModule,
        MatButtonToggleModule,
        MatIconModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
    ],
    providers: [],
    bootstrap: [GameComponent]
})
export class AppModule {
}
