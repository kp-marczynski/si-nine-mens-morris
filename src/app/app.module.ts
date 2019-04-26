import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {GameComponent} from './game.component';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
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
import {MatDialogModule} from '@angular/material/dialog';
import {InfoComponent} from './info/info.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import { EndgameComponent } from './endgame/endgame.component';
@NgModule({
    declarations: [
        GameComponent,
        InfoComponent,
        EndgameComponent
    ],
    entryComponents: [
        InfoComponent,
        EndgameComponent
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
        MatDialogModule,
        MatExpansionModule,
        MatToolbarModule,
        MatMenuModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
    ],
    providers: [],
    bootstrap: [GameComponent]
})
export class AppModule {
}
