// Convert CommonJS requires to ES6 imports
import { addKeyword} from '@builderbot/bot';
import AIClassMicro from './experimental/determineMicro.js';
import { blacklist } from'./muteState.js';
import { handlerAI } from '../utils.js';
import { filterAfterAtSymbol } from './filterArroba.js';
import { isImageMessage } from './experimental/functions.js';


//contructor con open ai

const ai = new AIClassMicro('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', 'gpt-3.5-turbo');

//flujo inicial

const flowMicro =  addKeyword(['Quiero cotizar un rediseño de cejas', 'Estoy interesada en corregir mis cejas']).addAnswer(["¡Hola y bienvenido a Matices! Sabemos lo frustrante que puede ser tener cejas mal hechas.",
   "",
   "*Nuestra especialidad es corregir y rediseñar cejas, devolviéndote la confianza y mejorando tu calidad de vida.* ",
   "",
   "¿Cuentame que deseas mejorar en tus cejas?",
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

export default flowMicro;

