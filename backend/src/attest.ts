import { helpers, logger } from './utils/index';
import { EAS_CONTRACT_ADDRESS, SCHEMA_UID } from './constants';
// const provider = helpers.getProvider();
// const wallet = helpers.getWallet();
// const schemaEncoder = helpers.getSchemaEncoder();

export async function attest() {
  logger.info('Connecting to wallet...');
  const signer = await helpers.getSigner();
  if (!EAS_CONTRACT_ADDRESS || !SCHEMA_UID || !signer) {
    logger.error(
      'Important constants not found in .env file. Please check your .env file and try again.'
    );
  } else {
    try {
      const { ipfsHash, offchainAttestationId } =
        await helpers.signOffchainAttestation();
      logger.success('OFFCHAIN EAS SIGNED AND PUBLISH TO IPFS SUCCESSFULLY!');
      console.log(`IPFS Hash=` + ipfsHash);
      console.log(
        `EAS IPFS Address = https://eas.infura-ipfs.io/ipfs/` + ipfsHash
      );
      console.log(`ID ${offchainAttestationId}`);
    } catch (e) {
      console.log(e);
    }
  }
}

attest();
