// Convert CommonJS requires to ES6 imports
import { addKeyword} from '@builderbot/bot';
import AIClassCauterizacion from './experimental/determineCauterizacion.js';
import { blacklist } from'./muteState.js';
import { handlerAI } from '../utils.js';
import { filterAfterAtSymbol } from './filterArroba.js';
import { isImageMessage } from './experimental/functions.js';


//contructor con open ai

const ai = new AIClassCauterizacion('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', 'gpt-3.5-turbo');

//flujo inicial

const flowCauterizacion =  addKeyword(['¡Hola! estoy interesada en la cauterizacion', '¡Hola! estoy interesado en la cauterizacion.', '¡Hola! estoy interesada en la eliminacion de un lunar o verruga', 'Hola! estoy interesado en la eliminacion de un lunar o verruga'])
.addAnswer(["¡Bienvenido a Matices! Con más de 10 años de experiencia, somos los expertos en cauterización de verrugas, lunares, milliums, xantelasma, pecas y manchas.",
   "",
   "*En Matices, ofrecemos un servicio de cauterización que no solo elimina estas imperfecciones, sino que también mejora tu calidad de vida y autoestima.* ",
   "",
   "¿Cuentame que deseas saber sobre la cauterización?",
   ], { capture: true }, async (ctx, {fallBack, provider, endFlow}) => {
   try {
      const remoteJid = await filterAfterAtSymbol(ctx.key.remoteJid);
      console.log(`Este es el remoteJid: ${remoteJid}`);
      const prompt = ctx.body;
      const rsp = await ai.chat(prompt, provider, ctx, endFlow);

    //verifica si el mensaje es una imagen
      if (ctx.body.includes("_event_media")) {
         const imgRecived = await isImageMessage(ctx.body, provider, ctx, endFlow);
         return imgRecived;
        }

      // Verifica si esta en lista negra
      if(blacklist.includes(remoteJid))
        {
           console.log('Flujo finalizado a  debido a lista negra');
           return endFlow();
        }

    //verfica si calledfunction es ejecuta
    if (rsp.calledFunction) {
        return;
     }

   
    
      //Verificacion nota de voz y procesamiento
      if (ctx.body.includes("event_voice_note")){
        const prompt = await handlerAI(ctx);
        console.log(`Nota de voz recibida de ${ctx.key.remoteJid} ${prompt}`);
        const rsp = await ai.chat(prompt, provider, ctx, endFlow);
        if (rsp.calledFunction) {
            return;
         }
        return fallBack(rsp); 
    }
      //Envia respuesta y hace fallback
       else {

          await fallBack(rsp);
          console.log(`Este es el mensaje: ${rsp}`);
      }
  } catch (error) {
   console.error('Error en el flujo:', error);
   
}
  
   

});

export default flowCauterizacion;

