
async function filterAfterAtSymbol(inputString) {
    const atIndex = inputString.indexOf('@');
    if (atIndex !== -1) {
        return inputString.substring(0, atIndex);
    }
    return inputString; // Si no hay '@' en la cadena, devuelve la cadena completa
  }

  export { filterAfterAtSymbol };