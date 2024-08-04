import pkg from "openai";
import { cauterizacionContext }  from '../cauterizacion-context.js';
import { scheduleAppointment, isImageMessage } from './functions.js';
const { Configuration, OpenAIApi } = pkg;

/**
 * Función para identificar si el cliente quiere apartar una cita
 * @param {string} message - El mensaje del usuario
 * @param {function} provider - Función para enviar un mensaje al cliente
 * @returns {Promise<void>}
 */

class AIClassCauterizacion {
    /**
     * Constructor para inicializar la clase AIClass
     * @param {string} apiKey - La clave de la API de OpenAI
     * @param {string} _model - El modelo de lenguaje a utilizar
     */
    constructor(apiKey, _model) {
        if (!apiKey || apiKey.length === 0) {
            throw new Error("OPENAI_KEY is missing");
        }

        const configuration = new Configuration({
            apiKey: apiKey,
        });
        this.openai = new OpenAIApi(configuration);
        this.model = _model;
        this.sessions = {};
    }


  // Función para obtener o crear una sesión de usuario
    getSession(userId) {
        if (!this.sessions[userId]) {
            this.sessions[userId] = [];
        }
        return this.sessions[userId];
    }

    // Función para guardar el historial de mensajes en la sesión
    saveMessage(userId, role, content) {
        const session = this.getSession(userId);
        session.push({ role, content });
    }

    clearSession(userId) {
        if (this.sessions[userId]) {
            delete this.sessions[userId];
        }
    }
    /**
     * Método experimental determineChatFn para predecir la intención del usuario
     * @param {Array} messages - Array de mensajes de chat
     * @param {string} [model] - Modelo de lenguaje a utilizar (opcional)
     * @param {number} [temperature=0] - Temperatura para el modelo de lenguaje (opcional)
     * @returns {Promise<{ prediction: string }>} - Predicción de la intención del usuario
     */
    
    async chat(prompt, provider, ctx, endFlow) {
        try {
            
            const userId = ctx.key.remoteJid;
            const session = this.getSession(userId);
            const systemMessage = {
                role: "system",
                content: cauterizacionContext
            };
            const functions = [
                {
                    name: "schedule",
                    description: "Identificar si el cliente quiere agendar una cita",
                    parameters: {
                        type: "object",
                        properties: {
                            scheduleCita: {
                                type: "string",
                                description: "La fecha y hora para agendar la cita"
                            }
                        },
                        required: ["scheduleCita"]
                    }
                }
            ];

            this.saveMessage(userId, "user", prompt);
            const messages = [systemMessage, ...session];
            const response = await this.openai.createChatCompletion({
                model: this.model,
                messages: [systemMessage, ...messages],
                max_tokens: 500,
                functions: functions,
                function_call: "auto"
                
            })
            


           
            if (response.data && response.data.choices && response.data.choices.length > 0) {
                const message = response.data.choices[0].message;
                this.saveMessage(userId, "assistant", message.content);
                if (message.function_call) {
                    const calledFunction = message.function_call;

                    if (calledFunction.name === "schedule") {
                        const scheduleResponse = JSON.parse(calledFunction.arguments).scheduleCita;
                        const scheduleApp = await scheduleAppointment(scheduleResponse , provider, ctx, endFlow);
                        this.clearSession(userId);
                        return {
                            message: scheduleApp,
                            calledFunction: calledFunction.name
                            
                        };
                    }
                    
                }

                return message.content;
            } else {
                console.error('Unexpected response structure:', response.data);
                return {
                    message: 'Unexpected response structure from OpenAI API.',
                    calledFunction: null
                };
            }
        } catch (err) {
            console.error('Error processing the request:', err);
            return {
                message: 'An error occurred while processing your request.',
                calledFunction: null
            };
        }
    
    }
}

export default AIClassCauterizacion;
