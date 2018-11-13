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
//Improvement for the future: Use something other than the number class to allow for larger values.
  //Also, refactoring to abstract out the reused code would really improve maintainability.
public publicKey: Number;
public privateKey : Number;
public modulus:number;

  constructor() {
  }

  sign(message : string) : Buffer{
    let byteSpan = 4;
    const buff : Buffer = Buffer.from(message);
    //We'll be needing a larger buffer to return because of RSA with large moduli
    //For more info, see signSymKey();
    const toReturn : Buffer= Buffer.alloc(buff.length*byteSpan)

    //Iterate through each character (int) in the buffer
    for (let i=0; i<buff.length; i++){
      let tempNum=buff[i].valueOf();
      let originalNum = tempNum;

      //Taking buff[i]=(buff[i])^privateKey % modulus recursively rather than using the power operator
      //Doing it as written above results in loss of precision issues during division.
      for(let i=0; i<this.privateKey.valueOf()-1; i++){
        if ((tempNum*buff[i])%this.modulus!=0)
          tempNum=(tempNum*originalNum)%this.modulus;

        else
          tempNum=(tempNum*originalNum);
      }
      toReturn.writeUInt32BE(tempNum,i*byteSpan);
    }
    return toReturn;
  }


  decrypt(message : Buffer, key : number, modulus : number) : string{
    let byteSpan = 4;
    const buff : Buffer = message;
    let toReturn=Buffer.alloc(buff.length/byteSpan)

    for (let i=0; i<buff.length/byteSpan; i++){
      let tempNum=buff.readUInt32BE(i*byteSpan);
      let originalNum = tempNum;

      //Taking buff[i]=(buff[i])^privateKey % modulus recursively rather than using the power operator
      //Doing it as written above results in loss of precision issues during division.
      for(let i=0; i<key.valueOf()-1; i++){
        if ((tempNum*buff[i])%modulus!=0)
          tempNum=(tempNum*originalNum)%modulus;

        else
          tempNum=(tempNum*originalNum);
      }
      toReturn[i]= tempNum;
    }

    return toReturn.toString();
  }

  /*Used before sending the symmetric key
  Variables:
  - symKey the key to be encrypted
  -pubKey and
  -modulus: These are the public key of the person that you're sending the session key to.
  */
  enecryptSymKey(symKey : Uint32Array, pubKey : number, modulus : number) : Buffer{

    let byteSpan = 4; //due to the fact that the ints are 32-bit and thus take 4 bytes
    //Convert the key into an array buffer
    let arrBuffer = new ArrayBuffer(byteSpan*symKey.length);
    let view=new DataView(arrBuffer);
    for (let i=0; i<symKey.length; i++){
      view.setUint32(byteSpan*i, symKey[i]);
    }

    /*Buffer is larger (not symKey.length*byteSpan) because we'll actually be storing
    16 bit values in it. The modulus can be so large that the encrypted value exceeds what
    we would store in 8 bits.
    */
    const buff : Buffer = Buffer.alloc(symKey.length*byteSpan*byteSpan);

    //encrypt
    let offset=0;
    for(let i=0; i<symKey.length*byteSpan; i++){
      let tempNum=view.getUint8(i);
      let originalNum = tempNum;


      //Taking buff[i]=(buff[i])^pubKey % modulus recursively rather than using the power operator
      //Doing it as written above results in loss of precision issues during division.
      for(let j=0; j<pubKey-1; j++){
        if ((tempNum*originalNum)%modulus!=0)
          tempNum=(tempNum*originalNum)%modulus;

        else
          tempNum=(tempNum*originalNum);
      }
      offset=buff.writeUInt32BE(tempNum, offset);
    }

    return buff;
  }

  decryptSymKey(encryptedKey : Buffer): Uint32Array {

    let byteSpan = 4;//Bad name, due to the fact that the ints are 32-bit and thus take 4 bytes
    let numBytes = 16;
    let arrBuffer = new ArrayBuffer(numBytes*byteSpan);
    let view = new DataView(arrBuffer);

    //decrypt
    for (let i = 0; i < encryptedKey.length/byteSpan; i++) {
      let tempNum = encryptedKey.readUInt32BE(i*4);
      let originalNum = tempNum;

      //Taking buff[i]=(buff[i])^privateKey % modulus recursively rather than using the power operator
      //Doing it as written above results in loss of precision issues during division.
      for (let j = 0; j < this.privateKey.valueOf() - 1; j++) {
        if ((tempNum * originalNum) % this.modulus != 0)
          tempNum = (tempNum * originalNum) % this.modulus;

        else
          tempNum = (tempNum * originalNum);
      }

      //Place it in the array buffer
      view.setUint8(i, tempNum)

    }
    //Convert the array buffer back into a Uint32Array
    let toReturn: number[] = [];
    for (let i = 0; i < 8; i++) {
      toReturn.push(view.getInt32(i * 4))
    }

    return new Uint32Array(toReturn);
  }

}
