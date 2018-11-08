import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {RsaService} from '../rsa/rsa.service';
import {SymmetricEncryptionService} from '../symmetric_encryption/symmetric-encryption.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {

  constructor(rsa :RsaService, encryption: SymmetricEncryptionService, private router: Router) { }

  ngOnInit() {
    console.log(this.router.url, 'Current URL');

  }

}
