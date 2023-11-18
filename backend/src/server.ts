import Fastify from 'fastify';
import { getAttestationDataFromEASID } from './solver';
import {
  AttestationDataParams,
  CreateOffer,
  GameCreateParams,
} from 'utils/types';
import { prisma } from 'utils/helpers';
import { helpers } from './utils';
const fastify = Fastify({ logger: true });

fastify.get('/', function (req : any, res : any) {
  res.send({ hello: 'ETHGlobal' });
});

// Return data and save offer to database
interface DecodedItem {
  name: string;
  value: string;
}

fastify.get<{ Params: AttestationDataParams }>(
  '/eas/:easID/:offerType',
  async function (req, res) {
    const { easID, offerType } = req.params;
    if (easID && offerType) {
      try {
        const attestationData = await getAttestationDataFromEASID(easID);
        if (attestationData.data && !attestationData.error) {
          const attestationDataFormatted = attestationData.data;
          const decodedItems: DecodedItem[] = [];
          const decodedJsonData = JSON.parse(
            attestationDataFormatted.decodedDataJson
          );
          decodedJsonData.forEach((item: any) => {
            const decodedItem: DecodedItem = {
              name: item.name,
              value: item.value?.value || '',
            };
            decodedItems.push(decodedItem);
          });
          const userAddress = decodedItems.find(
            (item) => item.name === 'userAddress'
          );
          const itemID = decodedItems.find((item) => item.name === 'itemID');
          const offerPrice = decodedItems.find(
            (item) => item.name === 'offerPrice'
          );
          const itemChainID = decodedItems.find(
            (item) => item.name === 'itemChainID'
          );
          const paymentChainID = decodedItems.find(
            (item) => item.name === 'paymentChainID'
          );
          if (
            userAddress &&
            itemID &&
            offerPrice &&
            itemChainID &&
            paymentChainID
          ) {
            const offerData: CreateOffer = {
              offerUser: userAddress.value,
              offerType: offerType,
              status: true,
              offerPrice: Number(offerPrice.value),
              offerGame: Number(itemID.value),
              itemChainID: Number(itemChainID.value),
              paymentChainID: Number(paymentChainID.value),
            };
            try {
              await helpers.insertOffers(offerData);
              const buyOffers = await prisma.offer.findMany({
                where: {
                  offerType: 'BUY',
                },
                orderBy: {
                  offerPrice: 'desc',
                },
              });
              const sellOffers = await prisma.offer.findMany({
                where: {
                  offerType: 'SELL',
                },
                orderBy: {
                  offerPrice: 'asc',
                },
              });

              const matchedOffers: { buyOffer: any; sellOffer: any }[] = [];

              for (const buyOffer of buyOffers) {
                for (const sellOffer of sellOffers) {
                  if (buyOffer.offerPrice >= sellOffer.offerPrice) {
                    matchedOffers.push({ buyOffer, sellOffer });
                    break;
                  }
                }
              }
              res.status(200).send(matchedOffers);
            } catch (error) {
              res.status(500).send({
                error: 'An error occured!',
              });
            }
          }
          res.status(500).send({
            error: 'Something Happened',
          });
        } else {
          res.send({ error: 'Attestation data could not be retrieved.' });
        }
      } catch (error) {
        res.status(500).send({ error: error });
      }
    } else {
      res.status(400).send({ error: 'easID is required.' });
    }
  }
);

fastify.post<{ Body: GameCreateParams }>(
  '/game/createGame',
  async function (req, res) {
    const { name, releaseDate, price, itemImage } = req.body;
    const game = await prisma.game.create({
      data: {
        name: name,
        releaseDate: releaseDate,
        price: price,
        itemImage: itemImage,
      },
    });
    res.status(200).send({ success: true, data: game });
  }
);

fastify.get('/game/getAll', async function (req, res) {
  try {
    const games = await prisma.game.findMany();
    res.status(200).send(games);
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

fastify.listen(
  {
    port: 3000,
  },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Server running on ${address}`);
  }
);
