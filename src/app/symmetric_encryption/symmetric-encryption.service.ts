import { Injectable } from '@angular/core';
import {Buffer} from 'buffer';

@Injectable({
  providedIn: 'root'
})

export class SymmetricEncryptionService {
  private key : Uint32Array;

  constructor() {
  }

  public generate_key() : Uint32Array{
    let array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return array;
  }


  //Setting is separate since most clients will be sent the key by the "organizer"
  public set_key(n : Uint32Array){
    this.key=n;
  }

  //Uses chacha20 for encryption
  public  encrypt(message : Buffer):Buffer{
    const nonce=this.generateNonce();
    this.chachaEncrypt(message,nonce);

    //Prepend nonce
    let toReturn:Buffer=new Buffer(message.length+8)
    let offset=0;
    offset=toReturn.writeUInt32BE(nonce[0], offset);
    offset=toReturn.writeUInt32BE(nonce[1], offset);
    toReturn.fill(message,offset);
    return toReturn;
  }


  private chachaEncrypt(message : Buffer, nonce : Uint32Array){
    /*Loop that generates a block consisting of 16 32-bit unsigned
    ints. Then xors each of those with a character of the message
    Continues until every character has been encrypted.

    Note for future: technically, each character is only 8 bits,
    not 32, so we can splice the block even more improve performance.
    */
    let pos = new Uint32Array(2);
    pos[0]=0;
    pos[1]=0;
    let numBlocks=Math.ceil(message.length/16);
    for(let i=0, charsEncrypted=0; i<numBlocks; i++){
      this.incrementPos(pos);
      let block=chacha.chachaBlock(this.key, nonce, pos);
      for(let j=0; j<16 && charsEncrypted<message.length; j++, charsEncrypted++){
        message[charsEncrypted]=message[charsEncrypted]^block[j];
      }

    }
    return message;
  }


  public decrypt(message : Buffer):Buffer{
    let nonce = new Uint32Array(2);
    let toReturn = new Buffer(0+(message.length-8));//0+ensures the right argument type
    nonce[0]=message.readUInt32BE(0);
    nonce[1]=message.readUInt32BE(4);
    toReturn.fill(message.slice(8));

    this.chachaEncrypt(toReturn, nonce);
    return toReturn;
  }

  generateNonce() : Uint32Array{
    let array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    return array;
  }

  incrementPos(pos : Uint32Array){
    // if pos[0] is maxed out, start filling pos[1]
    if((pos[0]^0xFFFFFFFF)==0){
      //if pos[1] is somehow also maxed out, restart counter
      //NOTE: There should be a limit in place upstream to prevent this.
      if((pos[1]^0xFFFFFFFF)==0){
        pos[0]=0;
        pos[1]=0;
      }
      //Else, increment pos[1]
      else
        pos[1]++
    }
    //Else, increment pos[0]
    else{
      pos[0]++
    }
  }
}


class chacha{
  //Based on C code from: https://en.wikipedia.org/wiki/Salsa20#ChaCha_variant
  static chachaBlock(key : Uint32Array, nonce : Uint32Array, pos: Uint32Array): Uint32Array{
    const numRounds=20;
    let input = chacha.generateStartBlock(key, nonce, pos);
    let x = new Uint32Array(16);
    let output = new Uint32Array(16);

    //make x=input
    for (let i = 0; i < 16; ++i) {
      x[i] = input[i];
    }

    // 10 loops × 2 rounds/loop = 20 rounds
    for (let i = 0; i < numRounds; i += 2) {
      // Odd round
      chacha.qr(x, 0, 4, 8, 12); // column 0
      chacha.qr(x,1, 5, 9, 13); // column 1
      chacha.qr(x,2, 6, 10, 14); // column 2
      chacha.qr(x,3, 7, 11, 15); // column 3
      // Even round
      chacha.qr(x,0, 5, 10, 15); // diagonal 1 (main diagonal)
      chacha.qr(x, 1, 6, 11, 12); // diagonal 2
      chacha.qr(x, 2, 7, 8, 13); // diagonal 3
      chacha.qr(x,3, 4, 9, 14); // diagonal 4
    }
    for (let i = 0; i < 16; ++i)
      output[i] = x[i] + input[i];

    return output;
  }


  static ROTL(a :number, b : number):number{
    return(((a) << (b)) | ((a) >> (32 - (b))))
  }

  static qr(array : Uint32Array, a:number, b:number, c:number, d:number ){
    array[a] += array[b];
    array[d] ^= array[a];
    array[d] = chacha.ROTL(array[d],16);
    array[c] += array[d];
    array[b] ^= array[c];
    array[b] = chacha.ROTL(array[b],12);
    array[a] += array[b];
    array[d] ^= array[a];
    array[d] = chacha.ROTL(array[d], 8);
    array[c] += array[d];
    array[b] ^= array[c];
    array[b] = chacha.ROTL(array[b], 7);
  }

  static generateStartBlock(key : Uint32Array, nonce : Uint32Array, pos: Uint32Array): Uint32Array{
    //Make block
    let block : Uint32Array= new Uint32Array(16);

    //Fill in the constant data
    /*These constant blocks are part of the algorythm
    and are the values of  "expa", "nd 3", "2-by", and "te k"
    in ASCII.
    Hex value taken from: https://crypto.stackexchange.com/questions/11182/security-considerations-on-expand-32-byte-k-magic-number-in-the-salsa20-family
     */
    block[0]=0x61707865;
    block[1]=0x3320646e;
    block[2]=0x79622d32;
    block[3]=0x6b206574;

    //Place the key values in 4-11
    for(let i=0; i<8; i++){
      block[i+4]=key[i];
    }

    //12-13 Are the position
    block[12]=pos[0];
    block[13]=pos[1];

    //14-15 are the nonce
    block[14]=nonce[0];
    block[15]=nonce[1];

    return block;
  }
}
