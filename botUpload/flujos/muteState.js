import { addKeyword } from '@builderbot/bot';

const ADMIN_PHONE_NUMBER = '573014330782';

// Lista negra para almacenar los números muteados
let blacklist = [];

// Función para limpiar el número
const numberClean = (number) => {
    return number.replace(/\D/g, '');
};

// Verificar si el número está en la lista negra
const isBlackListed = (number) => {
    return blacklist.includes(number);
};

// Añadir un número a la lista negra
const addToBlacklist = (number) => {
    if (!isBlackListed(number)) {
        blacklist.push(number);
    }
};

// Eliminar un número de la lista negra
const removeFromBlacklist = (number) => {
    blacklist = blacklist.filter(item => item !== number);
};

const blackListed = addKeyword(['mute'])
    .addAction(async (ctx, { flowDynamic }) => {
        if (ctx.key.remoteJid === ADMIN_PHONE_NUMBER + '@s.whatsapp.net') {
            const toMute = numberClean(ctx.body); // Ejemplo: mute 573104495895
            const isMuted = isBlackListed(toMute);
            if (!isMuted) {
                addToBlacklist(toMute);
                await flowDynamic(`❌ ${toMute} ha sido silenciado`);
            } else {
                removeFromBlacklist(toMute);
                await flowDynamic(`🆗 ${toMute} ha sido des-silenciado`);
            }
        }
    });

const checkIfBlackListed = (userId) => {
    return isBlackListed(userId);
};

export { blackListed, checkIfBlackListed, blacklist };

