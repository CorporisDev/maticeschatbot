import { filterAfterAtSymbol } from '../filterArroba.js';

async function scheduleAppointment(scheduleResponse, provider, ctx, endFlow) {
    
    const remoteJid = await filterAfterAtSymbol(ctx.key.remoteJid);
    
    console.log(`el dia y la fecha para agendar la cita ${scheduleResponse}`);
    
    const sock = await provider.getInstance();
    
    const msg = {
         text: `El cliente ${remoteJid} quiere apartar una cita para el ${scheduleResponse}`,
      };
    
      await sock.sendMessage('573014330782@s.whatsapp.net', msg);
    
      return endFlow();
    
    }

async function isImageMessage(imgResponse, provider, ctx, endFlow) { 

    const remoteJid = await filterAfterAtSymbol(ctx.key.remoteJid);
    
    console.log(`el mensaje recibido de ${remoteJid} es una imagen`);
    
    const sock = await provider.getInstance();
    
    const msg = {
         text: `El cliente ${remoteJid} ha enviado una imagen para valoracion`,
      };
    
      await sock.sendMessage('573014330782@s.whatsapp.net', msg);
    
      return endFlow();
}

    export { scheduleAppointment, isImageMessage };