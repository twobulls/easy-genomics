import { buildClient, CommitmentPolicy, DecryptOutput, KmsKeyringNode } from '@aws-crypto/client-node';
import { DecryptOptions } from '@aws-crypto/decrypt-node/build/main/src/decrypt';
import { EncryptInput, EncryptOutput } from '@aws-crypto/encrypt-node/build/main/src/encrypt';

const cryptoClient = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT);
const context = {
  stage: `${process.env.ENV_TYPE}`,
  purpose: `${process.env.DOMAIN_NAME}`,
  origin: `${process.env.REGION}`,
};
const keyring = new KmsKeyringNode({
  generatorKeyId: process.env.DYNAMODB_KMS_KEY_ID,
  keyIds: [process.env.DYNAMODB_KMS_KEY_ARN],
});

export async function encrypt(plainText?: string): Promise<string | undefined> {
  if (plainText && plainText !== '') {
    const encrypted: EncryptOutput = await cryptoClient.encrypt(keyring, plainText, <EncryptInput>{ encryptionContext: context });
    return encrypted.result.toString('hex');
  } else {
    return undefined;
  }
}

export async function decrypt(cipherText?: string): Promise<string | undefined> {
  if (cipherText) {
    const decrypted: DecryptOutput = await cryptoClient.decrypt(keyring, cipherText, <DecryptOptions>{ encoding: 'hex' });
    return decrypted.plaintext.toString();
  } else {
    return undefined;
  }
}
