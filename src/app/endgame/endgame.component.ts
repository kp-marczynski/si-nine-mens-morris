import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {EndgameData} from "../model/endgame-data.model";

@Component({
    selector: 'app-endgame',
    templateUrl: './endgame.component.html',
    styleUrls: ['./endgame.component.css']
})
export class EndgameComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<EndgameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EndgameData) {
    }

    ngOnInit() {
    }

}
