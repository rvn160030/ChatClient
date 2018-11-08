import { Injectable } from '@angular/core';
import {Buffer} from 'buffer';
//import {Math} from 'math';

@Injectable({
  providedIn: 'root'
})


export class SymmetricEncryptionService {

  private key :number;

  constructor() {

    /* Test code. Ignore for now.

    let n = this.generate_key();
    this.set_key(n);

    console.log("Test SymmetricEncryptionService");
    let m=this.encrypt(Buffer.from("Hello!"))
    console.log(m.toString());
    console.log(this.decrypt(m).toString());
    */
  }

  //TODO:Generate larger keys.
  public generate_key() : number{
    return Math.floor(Math.random()*10000);
  }


  //Setting is separate since most clients will be sent the key by the "organizer"
  public set_key(n : number){
    this.key=n;
  }

  //Currently implementing a simple xor encryption. Will be upgraded later.
  public  encrypt(message : Buffer):Buffer{
    let m=message;
    //Encrypt
    for (let i=0; i<m.length; i++) {
      //console.log("Converting " + m[i]+ " to " +(m[i]^124));
      m[i]=m[i]^this.key;
    }

    return m;
  }

  //Currently the same as encryption because of how xor works.
  public decrypt(ciphertext : Buffer):Buffer{
    let m=ciphertext;

    //Decrypt
    for (let i=0; i<m.length; i++) {
      //console.log("Converting " + m[i]+ " to " +(m[i]^124));
      m[i]=m[i]^this.key;
    }
    return m;
  }


}
