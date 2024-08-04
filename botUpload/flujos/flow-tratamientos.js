// Convert CommonJS requires to ES6 imports
import { addKeyword} from '@builderbot/bot';
import AIClassBotox from './experimental/determineBotox.js';
import { blacklist } from'./muteState.js';
import { handlerAI } from '../utils.js';
import { filterAfterAtSymbol } from './filterArroba.js';
import { isImageMessage } from './experimental/functions.js';


//contructor con open ai

const ai = new AIClassBotox('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', 'gpt-3.5-turbo');

//flujo inicial

const flowTratamientos = addKeyword(['Estoy interesado en los tratamientos faciales', 'Estoy interesada en los tratamientos faciales']).addAnswer(["¡Hola! Bienvenida a Matices, Gracias por comunicarte con nosotros. Veo que estás interesada/o en nuestros tratamientos✨",
   "",
   "*Sabemos que cuidar de tu apariencia es importante para ti* ",
   "",
   "¿Cuentame en que tratamiento estas interesa/o?",
   ], { capture: true }, async (ctx, {fallBack, provider, endFlow}) => {
   try {
      
      const remoteJid = await filterAfterAtSymbol(ctx.key.remoteJid);
      console.log(`Este cliente ${remoteJid} ha entrado en el flujo de tratamientos avanzados con el Dr Andres`);
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
           console.log(`Flujo finalizado a ${remoteJid} por estar en lista negra`);
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
         console.log(`Respuesta de la nota de voz ${rsp}`);
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

export default flowTratamientos;

