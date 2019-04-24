import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
    selector: 'info-component',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.css']
})
export class InfoComponent {

    constructor(
        public dialogRef: MatDialogRef<InfoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

}
