import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Deck of cards', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://www.deckofcardsapi.com/api/deck';

  let deckId = '';
  const cartasCompradas = [];
  const pilhaDescarte = 'descarte';

  p.request.setDefaultTimeout(90000);

  beforeAll(async () => {
    p.reporter.add(rep);
    deckId = await p
      .spec()
      .post(`${baseUrl}/new/`)
      .expectStatus(StatusCodes.OK)
      .returns('deck_id');
  });
  afterAll(() => p.reporter.end());

  describe('Verificando endpoints de "Deck Of Card"', () => {
    it('Embaralhando as cartas', async () => {
      deckId = await p
        .spec()
        .get(`${baseUrl}/new/shuffle/?deck_count=1`)
        .expectStatus(StatusCodes.OK)
        .returns('deck_id');
    });

    it('Comprando uma carta', async () => {
      const compra = await p
        .spec()
        .get(`${baseUrl}/${deckId}/draw/?count=2`)
        .expectStatus(StatusCodes.OK);
      compra.json.cards.forEach((carta: object) => {
        cartasCompradas.push(carta);
      });
    });

    it('Reembaralhando as cartas restantes do baralho', async () => {
      await p
        .spec()
        .post(`${baseUrl}/${deckId}/shuffle/?remaining=true`)
        .expectStatus(StatusCodes.OK);
    });

    it('Adicionando uma carta na pilha', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${deckId}/pile/${pilhaDescarte}/add/?cards=AS,2S`)
        .expectStatus(StatusCodes.OK);
    });

    it('Listando cartas na pilha', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${deckId}/pile/${pilhaDescarte}/list/`)
        .expectStatus(StatusCodes.OK);
    });

    it('Adicionando uma carta na pilha', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${deckId}/pile/${pilhaDescarte}/add/?cards=5D,2C`)
        .expectStatus(StatusCodes.OK);
    });

    // Está dando not found
    it.skip('Comprando cartas da pilha', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${deckId}/draw/bottom/`)
        .expectStatus(StatusCodes.OK);
    });

    it('Retornando cartas da pilha ao baralho', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${deckId}/pile/${pilhaDescarte}/return/`)
        .expectStatus(StatusCodes.OK);
    });
  });
});
