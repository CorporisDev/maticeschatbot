
import { createFlow,  createBot,  MemoryDB } from '@builderbot/bot';

import { createProvider } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { blackListed } from './flujos/muteState.js';
import flowBotox from './flujos/flow-botox.js';
import flowCauterizacion from './flujos/flow-cauterizacion.js';
import flowMicro from './flujos/flow-micro.js';
import flowTratamientos from './flujos/flow-tratamientos.js';


const main = async () => {
  const adapterDB = new MemoryDB();

  const adapterFlow = createFlow([
    blackListed,
    flowBotox,
    flowCauterizacion,
    flowMicro,
    flowTratamientos

  ]);

  const adapterProvider = createProvider(BaileysProvider);


  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
};

main();
