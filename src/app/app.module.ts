import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {GameComponent} from './game.component';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


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
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [],
    bootstrap: [GameComponent]
})
export class AppModule {
}
