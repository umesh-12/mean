import { Injectable } from '@angular/core';
import * as CryptoTS from 'crypto-ts';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  // Secret key lai euta constant ma rakheko
  private readonly secretKey = 'next@1234'; 

  constructor() {}

  // Encrypt
  encryptionAES(msg: any): string {
    if (!msg) return '';
    const ciphertext = CryptoTS.AES.encrypt(msg.toString(), this.secretKey);
    return ciphertext.toString();
  }

 
  // Decrypt
  decryptionAES(msg: any): string {
    if (!msg) return '';
    try {
      const bytes = CryptoTS.AES.decrypt(msg, this.secretKey);
      const plaintext = bytes.toString(CryptoTS.enc.Utf8);
      return plaintext;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }
}