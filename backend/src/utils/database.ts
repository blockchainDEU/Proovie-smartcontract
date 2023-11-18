import { helpers } from 'utils';
// interface Offer {
//   offerType: string;
//   offerUser: string;
//   offerGame: string;
//   offerPrice: number;
// }
// offerTime  DateTime  @default(now())
//   offerUser  String    @db.VarChar(255)
//   offerGame  String    @db.VarChar(255)
//   offerPrice Decimal
//   offerType  OfferType
//offers: Offer[]
export async function insertOffers() {
  const offers = await helpers.prisma.offer.create({
    data: {
      offerUser: 'kushynoda',
      offerGame: 'Metin2',
      offerPrice: 123.45,
      offerType: 'BUY',
    },
  });
  return offers;
}
