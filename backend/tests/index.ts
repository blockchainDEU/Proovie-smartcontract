import {helpers} from '../src/utils/index';
import {CreateOffer, GameCreateParams, OfferType} from 'utils/types';

async function createMockItems() {
  const ItemData: GameCreateParams = {
    name: 'GTA Vice City',
    releaseDate: '',
    price: 30,
    itemImage:
      'https://howlongtobeat.com/games/4075_Grand_Theft_Auto_Vice_City.jpg',
  };
  await helpers.createGame(ItemData);
}

async function testCreateOffer() {
  const testData: CreateOffer = {
    offerUser: '0xfefe',
    offerGame: 1,
    offerPrice: 1,
    offerType: OfferType.BUY,
    paymentChainID: 1,
    itemChainID: 1,
    status: true,
  };
  await helpers.insertOffers(testData);
}

async function getAttestationDataFromEASID() {
  const easID =
    '0x881489ef72100cea020b7cad240a1c4546401e15c46402e3580ed58c8925c00c';
  const data = await helpers.getAttestationInfoFromAPI(easID);
  console.log(data);
}

const arg = process.argv.slice(2);
switch (arg[0]) {
  case 'createItem':
    createMockItems().then(r => console.log(r));
    break;
  case 'createOffer':
    testCreateOffer().then(r => console.log(r));
    break;
  case 'getEas':
    getAttestationDataFromEASID().then(r => console.log(r));
    break;
}
