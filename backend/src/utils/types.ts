export type StoreAttestationRequest = { filename: string; textJson: string };
export type StoreIPFSActionReturn = {
  error: null | string;
  ipfsHash: string | null;
  offchainAttestationId: string | null;
};
export enum OfferType {
  BUY = 'BUY',
  SELL = 'SELL',
}
export interface AttestationDataParams {
  easID: string;
  schemaID: string;
  offerType: OfferType;
}
export interface GameCreateParams {
  name: string;
  releaseDate: string;
  price: number;
  itemImage: string;
}
interface BigNumberValue {
  type: 'BigNumber';
  hex: string;
}
export interface DecodedItem {
  name: string;
  type: string;
  signature: string;
  value: {
    name: string;
    type: string;
    value: string;
  };
}
export interface Offer {
  id: number;
  offerType: 'BUY' | 'SELL';
  offerPrice: number;
}

export interface ItemObject {
  userAddress?: DecodedItem;
  itemID?: DecodedItem;
  offerPrice?: DecodedItem;
  itemChainID?: DecodedItem;
  paymentChainID?: DecodedItem;
}

export interface AttestationData {
  __typename: 'Attestation';
  id: string;
  data: string;
  schemaId: string;
  attester: string;
  isOffchain: boolean;
  timeCreated: number;
  decodedDataJson: string;
  revoked: boolean;
  txid: string;
}

export interface AttestationResponse {
  error: boolean;
  data?: AttestationData;
}
export interface OfferData {
  success: boolean;
  data:
    | {
        id: number;
        createdAt: Date;
        offerUser: string;
        offerGame: number;
        offerPrice: number;
        offerType: string;
        status: boolean;
        game: {
          id: number;
          name: string;
          releaseDate: string;
        };
      }
    | [];
}
//         offerUser: string,
//         offerGame: number,
//         offerPrice: number,
//         offerType: string,
//         status: boolean,

export interface CreateOffer {
  offerUser: string;
  offerGame: number;
  offerPrice: number;
  offerType: OfferType;
  itemChainID: number;
  paymentChainID: number;
  status: boolean;
}

export interface OffchainAttest {
  userAddress: string;
  itemID: number;
  paymentChainID: number;
  itemChainID: number;
  offerType: number;
  offerPrice: number;
}
