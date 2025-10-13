import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import CryptoJS from 'crypto-js';

/**
 * Utility functions for encryption and data processing
 */

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  /**
   * Encrypts a string using AES-CBC (PKCS7) with a random IV.
   * Returns a hex string of IV(16 bytes) + ciphertext. No Base64 is used.
   * @param text - The string to encrypt
   * @returns Hex string containing IV + ciphertext
   */
  encryptString(text: string): string {
    try {
      // Get encryption key from environment
      const encryptionKey = environment.encryptionKey;

      if (!encryptionKey) {
        throw new Error('Encryption key not found in environment');
      }

      // Validate key length (should be 32 bytes for AES-256)
      const keyBytes = CryptoJS.enc.Utf8.parse(encryptionKey);
      if (keyBytes.sigBytes !== 32) {
        throw new Error('Encryption key must be exactly 32 bytes (256-bit)');
      }

      // Generate a random IV for each encryption (16 bytes = 128-bit)
      const iv = CryptoJS.lib.WordArray.random(16);

      // Encrypt the text using AES with the parsed key bytes and IV
      const encrypted = CryptoJS.AES.encrypt(text, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Combine IV and encrypted data, then encode as HEX
      const result = iv.concat(encrypted.ciphertext);
      return result.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt string');
    }
  }

  /**
   * Decrypts a hex string produced by encryptString.
   * Expects IV(16 bytes) + ciphertext, both encoded as hex.
   * @param encryptedText - Hex string containing IV + ciphertext
   * @returns The decrypted string
   */
  decryptString(encryptedText: string): string {
    try {
      // Get encryption key from environment
      const encryptionKey = environment.encryptionKey;

      if (!encryptionKey) {
        throw new Error('Encryption key not found in environment');
      }

      // Validate key length (should be 32 bytes for AES-256)
      const keyBytes = CryptoJS.enc.Utf8.parse(encryptionKey);
      if (keyBytes.sigBytes !== 32) {
        throw new Error('Encryption key must be exactly 32 bytes (256-bit)');
      }

      // Convert HEX string back to WordArray
      const encryptedData = CryptoJS.enc.Hex.parse(encryptedText);

      // Extract IV (first 16 bytes = 4 words). Set sigBytes explicitly to 16.
      const iv = CryptoJS.lib.WordArray.create(
        encryptedData.words.slice(0, 4),
        16
      );

      // Extract ciphertext (remaining bytes after IV). Compute remaining sigBytes.
      const totalSigBytes = encryptedData.sigBytes ?? encryptedText.length / 2;
      const remainingSigBytes = totalSigBytes - 16;
      const ciphertext = CryptoJS.lib.WordArray.create(
        encryptedData.words.slice(4),
        remainingSigBytes
      );

      // Create cipher params object
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext,
      });

      // Decrypt the text using AES with the parsed key bytes and IV
      const decrypted = CryptoJS.AES.decrypt(cipherParams, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        throw new Error(
          'Failed to decrypt string - invalid key or corrupted data'
        );
      }

      return decryptedString;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt string');
    }
  }

  /**
   * Generates a random encryption key (for development/testing purposes)
   * @param length - The length of the key to generate in bytes (default: 32 for AES-256)
   * @returns A random encryption key
   */
  generateEncryptionKey(length: number = 32): string {
    // Generate exactly the specified number of bytes
    const key = CryptoJS.lib.WordArray.random(length);
    return key.toString();
  }

  /**
   * Generates a random IV (Initialization Vector) for AES encryption
   * @param length - The length of the IV to generate in bytes (default: 16 for 128-bit)
   * @returns A random IV
   */
  generateIV(length: number = 16): string {
    // Generate exactly the specified number of bytes
    const iv = CryptoJS.lib.WordArray.random(length);
    return iv.toString();
  }
}
