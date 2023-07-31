import * as cryptoRandomString from 'crypto-random-string';

export function getRandomNumber(min: number, max: number): number {
  const randomFraction = Math.random();
  return Math.floor(randomFraction * (max - min + 1)) + min;
}

export function generateRandomText(length: number): string {
  return cryptoRandomString({ length: length, type: 'distinguishable' });
}