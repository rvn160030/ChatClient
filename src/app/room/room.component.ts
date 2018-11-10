import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  // @Input() roomPerson: string;

  constructor() {
  }

  ngOnInit() {
    document.getElementById('buttons').addEventListener('click', this.myFunc, false);
    // document.getElementById('submit').addEventListener('submit', this.submit(el.name), false);
    document.getElementById('checklist').style.display = 'none';
  }


  myFunc() {
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('checklist').style.display = 'inline';
  }
  submit() {
    const all_checked = new Array();
    if (document.getElementById('Adrian')[0].checked) {
      all_checked.push('Adrian');
    } else if (document.getElementById('Melvin')[0].checked) {
      all_checked.push('Joseph');
    } else if (document.getElementById('Joseph')[0].checked) {
      all_checked.push('Joseph');
    } else if (document.getElementById('Anmol')[0].checked) {
      all_checked.push('Anmol');
    }

  }
}
