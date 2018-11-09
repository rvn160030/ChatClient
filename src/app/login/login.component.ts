import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  // template: '<app-child[roomPerson]="person"> </app-child>',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    console.log(this.router.url, 'Current URL');
  }
  onClick() {
    const person = {
      name: (<HTMLInputElement>document.getElementById('Name')).value,
      publicKey: (<HTMLInputElement>document.getElementById('PublicKey')).value,
      privateKey: (<HTMLInputElement>document.getElementById('PrivateKey')).value,
      modulus: (<HTMLInputElement>document.getElementById('Modulus')).value,
    };
    return person;
  }
}
