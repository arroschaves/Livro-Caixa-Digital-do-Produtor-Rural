import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Category } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatInstance: Chat | null = null;

const classificationSchema = {
    type: Type.OBJECT,
    properties: {
        category: {
            type: Type.STRING,
            enum: Object.values(Category).filter(c => c !== Category.PENDENTE),
            description: "A categoria da transação"
        },
        description: {
            type: Type.STRING,
            description: "Uma breve descrição gerada para a transação a partir do nome do arquivo."
        },
        amount: {
            type: Type.NUMBER,
            description: "Um valor monetário realista estimado com base no nome do arquivo, como 15000.50 para venda de gado ou 350.75 para insumos."
        }
    },
    required: ["category", "description", "amount"],
};


export const classifyTransactionContent = async (fileName: string): Promise<{ category: Category; description: string; amount: number }> => {
    try {
        const prompt = `Analise o seguinte nome de arquivo de uma transação de um produtor rural e classifique-o em uma das seguintes categorias: ${Object.values(Category).join(', ')}. Gere também uma breve descrição e um valor monetário estimado realista. Nome do arquivo: "${fileName}"`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            // Fix: Use the correct model name for gemini flash lite per coding guidelines.
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: classificationSchema
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        const categoryValue = jsonResponse.category as keyof typeof Category;
        if (Category[categoryValue]) {
            return {
                category: Category[categoryValue],
                description: jsonResponse.description,
                amount: jsonResponse.amount,
            };
        }
        
        return { category: Category.OUTROS, description: 'Não foi possível classificar', amount: 0 };
    } catch (error) {
        console.error("Error classifying transaction:", error);
        return { category: Category.OUTROS, description: 'Erro na classificação', amount: 0 };
    }
};

export const runCattleAgentAnalysis = async (text: string): Promise<string> => {
    try {
        const prompt = `Você é um agente especialista em agronegócio para produtores rurais. Sua tarefa é analisar a descrição de uma transação para identificar se é uma transferência de gado. Se for, detalhe a quantidade, calcule o saldo transportado e forneça uma análise clara e estruturada. Se não for, explique por que não se trata de uma transferência de gado.

        Descrição da Transação: "${text}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                temperature: 0.2,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error with agent analysis:", error);
        return "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.";
    }
};


const initializeChat = () => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'Você é um assistente de chatbot amigável e prestativo para um aplicativo de Livro Caixa para Produtores Rurais. Responda às perguntas dos usuários sobre finanças, agronegócio e funcionalidades do aplicativo de forma concisa e útil.',
            },
        });
    }
    return chatInstance;
}

export const sendMessageToChatStream = (message: string) => {
    const chat = initializeChat();
    return chat.sendMessageStream({ message });
};