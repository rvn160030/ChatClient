import { Injectable } from '@angular/core';
import {Buffer} from 'buffer';

@Injectable({
  providedIn: 'root'
})

/*NOTA BENE: Many functions return a buffer rather than a string. This is because the encryption
 * process will often result values that are larger than that of a valid character. (I think that)
 * this is what results in undefined behavior when calling Buffer.from([previously encrypted string]).
 * Thus, the object remains as a Buffer until it has been unencrypted and unsigned at the other end.
 */
export class RsaService {
//For the moment, these keys are hard-coded.
  //Support for user-provided keys will be added at a later date.
  //TODO: This^.
private _publicKey: Number = 31;
private privateKey : Number = 31;
private _modulus = 221;

  //private _modulus : number = Number(window.atob("lAA0cW2UH9VQDuNipXCF8TK2mMABRLY8XLJ35+ZucLsqUmDiDD1cRwis3UF2WJIm+Slc8DSvsy++l+En7VLtGvSQFFzRlnOPIE5zCWV0Ka5dG/tO+Dle6y7kHDHelcVNzkjldm9VJD6uZmUYqnbM8PoMrckzdOqN0t+F7sCFxjk="))
  //private privateKey : number = Number(window.atob(""))

  get modulus(): number {
    return this._modulus;
  }
  get publicKey(): Number {
    return this._publicKey;
  }


  //TODO; Either add support for provided keys, or implement non-"textbook RSA"
  constructor(/*s : String*/) {
    /* Test code ignore for now.
    console.log("Test");
    let str =this.sign("");
    console.log(str.toString());
    console.log(this.decrypt(str));*/
  }


  sign(message : string) : Buffer{
    const buff : Buffer = Buffer.from(message);

    //Iterate through each character (int) in the buffer
    for (let i=0; i<buff.length; i++){
      let tempNum=buff[i].valueOf();
      let originalNum = tempNum;

      //Taking buff[i]=(buff[i])^privateKey % modulus recursively rather than using the power operator
      //Doing it as written above results in loss of precision issues during division.
      for(let i=0; i<this.privateKey.valueOf()-1; i++){
        if ((tempNum*buff[i])%this._modulus!=0)
          tempNum=(tempNum*originalNum)%this._modulus;

        else
          tempNum=(tempNum*originalNum);
      }
      buff[i]= tempNum;
    }
    return buff;
  }


  decrypt(message : Buffer, key : number, modulus : number) : string{
    const buff : Buffer = message;

    for (let i=0; i<buff.length; i++){
      let tempNum=buff[i].valueOf();
      let originalNum = tempNum;

      //Taking buff[i]=(buff[i])^privateKey % modulus recursively rather than using the power operator
      //Doing it as written above results in loss of precision issues during division.
      for(let i=0; i<key.valueOf()-1; i++){
        if ((tempNum*buff[i])%modulus!=0)
          tempNum=(tempNum*originalNum)%modulus;

        else
          tempNum=(tempNum*originalNum);
      }
      buff[i]= tempNum;
    }


    return buff.toString();
  }


  /*Used before sending the symmetric key
  Variables:
  - symKey the key to be encrypted
  -pubKey and
  -modulus: These are the public key of the person that you're sending the session key to.
  */
  enecryptSymKey(symKey : number, pubKey : number, modulus : number) : Buffer{

    //Split the symKey into blocks of two digits
    // ***We convert every two digits into the buffer instead of one for better encryption***
    //Any larger than two and weird stuff happens when generating the buffer
    let keyString: string = symKey.toString();

    let chunks = [];
    for (let i = 0, charsLength = keyString.length; i < charsLength; i += 2) {
      chunks.push(keyString.substring(i, i + 2));
    }
    const buff : Buffer = Buffer.from(chunks);

    //encrypt
    for (let i=0; i<buff.length; i++){
      let tempNum=buff[i].valueOf();
      let originalNum = tempNum;

      //Taking buff[i]=(buff[i])^pubKey % modulus recursively rather than using the power operator
      //Doing it as written above results in loss of precision issues during division.
      for(let i=0; i<pubKey.valueOf()-1; i++){
        if ((tempNum*buff[i])%modulus!=0)
          tempNum=(tempNum*originalNum)%modulus;

        else
          tempNum=(tempNum*originalNum);
      }
      buff[i]= tempNum;
    }


    return buff;
  }

  decryptSymKey(symKey : Buffer): number{
    const buff = symKey;

    //decrypt
    for (let i=0; i<buff.length; i++){
      let tempNum=buff[i].valueOf();
      let originalNum = tempNum;

      //Taking buff[i]=(buff[i])^privateKey % modulus recursively rather than using the power operator
      //Doing it as written above results in loss of precision issues during division.
      for(let i=0; i<this.privateKey.valueOf()-1; i++){
        if ((tempNum*buff[i])%this._modulus!=0)
          tempNum=(tempNum*originalNum)%this._modulus;

        else
          tempNum=(tempNum*originalNum);
      }
      buff[i]= tempNum;
    }

    //Convert the buffer back into the corresponding number
    //First make it a contiguous string...
    let s: string =""
    for (let i=0; i<buff.length; i++){
    s+=buff[i].toString();
  }
  //Then use the plus like so to magically make it a number!
  return +s;
}


}
