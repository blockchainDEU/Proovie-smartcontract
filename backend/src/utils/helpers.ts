import {ContractInterface, ethers, Wallet} from 'ethers';
import * as fs from 'fs';
import axios from 'axios';
import {PrismaClient} from '@prisma/client';
import {ApolloClient, gql, InMemoryCache} from '@apollo/client';
import {
  AttestationShareablePackageObject,
  EAS,
  SchemaEncoder,
  SchemaRegistry,
} from '@ethereum-attestation-service/eas-sdk';
import {
  AttestationData,
  CreateOffer,
  DecodedItem,
  GameCreateParams,
  ItemObject,
  OffchainAttest,
  OfferData,
  StoreAttestationRequest,
  StoreIPFSActionReturn,
} from './types';
import {
  EAS_CONTRACT_ADDRESS,
  EASSCAN_URI,
  PRIVATE_KEY,
  SCHEMA_REGISTRY,
  SCHEMA_STRUCT,
  SCHEMA_UID,
  SEPHOLIA_RPC_URL,
} from '../constants';
import dayjs from 'dayjs';

export const prisma = new PrismaClient();

const provider = getProvider();

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(SEPHOLIA_RPC_URL);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getWallet(): ethers.Wallet {
  if (!PRIVATE_KEY) {
    throw new Error(
      'Private key not found in .env file. Please check your .env file and try again.'
    );
  }
  return new ethers.Wallet(PRIVATE_KEY);
}

export function getSchemaEncoder(): SchemaEncoder {
  return new SchemaEncoder(SCHEMA_STRUCT);
}

export function getEASAbi(): any {
  const rawData: string = fs.readFileSync('src/utils/EASabi.json', 'utf-8');
  return JSON.parse(rawData) as ContractInterface[];
}

export async function getSigner(): Promise<Wallet> {
  // It will be coming from frontend
  const wallet = getWallet();
  return wallet.connect(provider);
}

export function getEASContract(): ethers.Contract {
  const contractAddress = EAS_CONTRACT_ADDRESS || '';
  const contractABI = getEASAbi();
  return new ethers.Contract(contractAddress, contractABI, provider);
}

export async function getSchemaInfo(schemaUID: string) {
  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY);
  schemaRegistry.connect(provider);

  return await schemaRegistry.getSchema({uid: schemaUID});
}

export async function getSchemaStruct(schemaUID: string) {
  const schemaRecord = await getSchemaInfo(schemaUID);
  return schemaRecord.schema;
}

export async function getAttestationInfoFromAPI(EASid: string) {
  const client = new ApolloClient({
    uri: EASSCAN_URI + `/graphql`,
    cache: new InMemoryCache(),
  });
  const attestationQuery = gql`
    query Attestations($where: AttestationWhereInput) {
      attestations(where: $where) {
        id
        data
        schemaId
        attester
        isOffchain
        timeCreated
        decodedDataJson
        revoked
        txid
      }
    }
  `;
  try {
    const attestationData = client.query({
      query: attestationQuery,
      variables: {
        where: {
          id: {
            equals: EASid,
          },
        },
      },
    });
    return (await attestationData).data.attestations;
  } catch (error) {
    throw error;
  }
}

export async function signOffchainAttestation(
  signerFromFrontend: Wallet | null = null,
  offchainData: OffchainAttest
) {
  try {
    const signer = signerFromFrontend || (await getSigner());
    const eas = new EAS(
      EAS_CONTRACT_ADDRESS || '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'
    );
    const schemaEncoder = getSchemaEncoder();
    const encoded = schemaEncoder.encodeData([
      {
        name: 'userAddress',
        type: 'address',
        value: offchainData.userAddress,
      },
      {
        name: 'itemID',
        type: 'uint64',
        value: offchainData.itemID,
      },
      {
        name: 'paymentChainID',
        type: 'uint64',
        value: offchainData.paymentChainID,
      },
      {
        name: 'itemChainID',
        type: 'uint64',
        value: offchainData.itemChainID,
      },
      {
        name: 'offerType',
        type: 'uint64',
        value: offchainData.offerType,
      },
      {
        name: 'offerPrice',
        type: 'uint256',
        value: offchainData.offerPrice,
      },
    ]);
    eas.connect(signer);

    const offChain = await eas.getOffchain();
    const signedOffchainAttestation = await offChain.signOffchainAttestation(
      {
        schema: SCHEMA_UID,
        recipient: ethers.ZeroAddress,
        refUID: ethers.zeroPadValue(ethers.ZeroAddress, 32),
        data: encoded,
        time: ethers.toBigInt(dayjs().unix()),
        revocable: false,
        expirationTime: ethers.toBigInt(0),
        version: 1,
        nonce: ethers.toBigInt(0),
      },
      signer
    );

    const pkg: AttestationShareablePackageObject = {
      signer: signer.address,
      sig: signedOffchainAttestation,
    };

    return await submitSignedAttestation(pkg);
  } catch (error) {
    console.error('Error submitting signed attestation:', error);
    throw error;
  }
}

export async function submitSignedAttestation(
  pkg: AttestationShareablePackageObject
): Promise<StoreIPFSActionReturn> {
  try {
    const data: StoreAttestationRequest = {
      filename: 'eas.txt',
      textJson: jsonStringifyWithBigInt(pkg),
    };
    const response = await axios.post<StoreIPFSActionReturn>(
      `${EASSCAN_URI}/offchain/store`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting signed attestation:', error);
    throw error;
  }
}

function jsonStringifyWithBigInt(data: AttestationShareablePackageObject) {
  return JSON.stringify(data, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  );
}
export function isAttestationData(data: any): data is AttestationData {
  return data.hasOwnProperty('id') && data.hasOwnProperty('data');
}

export function timestampToDate(timestamp: number): string {
  var timestampToJS = timestamp * 1000;
  const timestampObject = new Date(timestampToJS);
  return timestampObject.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
export async function insertOffers(offer: CreateOffer) {
  try {
    await prisma.offer.create({
      data: {
        offerUser: offer.offerUser,
        offerGame: offer.offerGame,
        offerPrice: offer.offerPrice,
        offerType: offer.offerType,
        paymentChainID: offer.paymentChainID,
        itemChainID: offer.itemChainID,
        status: offer.status,
      },
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function getOffersFromWalletAddr(offerUser: string) {
  try {
    const userOffers = await prisma.offer.findMany({
      where: {
        offerUser: offerUser,
      },
    });
    return { success: true, data: userOffers };
  } catch (error) {
    return { success: false, data: false };
  }
}
export async function getOfferFromOfferID(offerID: number): Promise<OfferData> {
  try {
    const offer = await prisma.offer.findUnique({
      where: {
        id: offerID,
      },
      include: {
        game: true,
      },
    });

    if (offer) {
      return { success: true, data: offer };
    } else {
      return { success: false, data: [] };
    }
  } catch (error) {
    console.error('Error fetching offer:', error);
    return { success: false, data: [] };
  }
}

export async function createGame(item: GameCreateParams) {
  try {
    const game = await prisma.game.create({
      data: {
        name: item.name,
        releaseDate: item.releaseDate,
        price: item.price,
        itemImage: item.itemImage,
      },
    });
    return { success: true, data: game };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export function findItem(
  decodedItems: DecodedItem[],
  itemName: string
): DecodedItem | undefined {
  return decodedItems.find((item) => item.name === itemName);
}

export function createItemObject(decodedItems: DecodedItem[]): ItemObject {
  return {
    userAddress: findItem(decodedItems, 'userAddress'),
    itemID: findItem(decodedItems, 'itemID'),
    offerPrice: findItem(decodedItems, 'offerPrice'),
    itemChainID: findItem(decodedItems, 'itemChainID'),
    paymentChainID: findItem(decodedItems, 'paymentChainID'),
  };
}
