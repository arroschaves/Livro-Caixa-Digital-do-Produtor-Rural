
import React, { useState } from 'react';
import { runCattleAgentAnalysis } from '../services/geminiService';
import { SparklesIcon } from './icons';

const Agent: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalysis = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setAnalysisResult('');
        try {
            const result = await runCattleAgentAnalysis(inputText);
            setAnalysisResult(result);
        } catch (error) {
            setAnalysisResult('Ocorreu um erro durante a análise. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const exampleTexts = [
        "Nota fiscal de saída de 50 cabeças de gado Nelore para Fazenda vizinha, GTA emitida hoje.",
        "Pagamento de insumos agrícolas, compra de 10 sacos de semente de milho.",
        "Transferência de 30 novilhas Brangus para o pasto de engorda lote 4. Saldo anterior era 120."
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Agente de Análise</h1>
                <p className="mt-2 text-lg text-gray-600">Use o poder do Gemini Pro com 'Thinking Mode' para análises complexas.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-6 max-w-4xl mx-auto">
                <div>
                    <label htmlFor="agent-input" className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição da Transação
                    </label>
                    <textarea
                        id="agent-input"
                        rows={5}
                        className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Cole ou descreva aqui uma transação para análise..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <p className="text-sm text-gray-500 self-center">Exemplos:</p>
                    {exampleTexts.map((text, index) => (
                         <button
                            key={index}
                            onClick={() => setInputText(text)}
                            disabled={isLoading}
                            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                        >
                           Exemplo {index + 1}
                        </button>
                    ))}
                </div>

                <div className="text-center">
                    <button
                        onClick={handleAnalysis}
                        disabled={isLoading || !inputText.trim()}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analisando com 'Thinking Mode'...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="-ml-1 mr-2 h-5 w-5"/>
                                 Analisar Transferência de Gado
                            </>
                           
                        )}
                    </button>
                </div>
            </div>
            
            {(isLoading || analysisResult) && (
                 <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Resultado da Análise</h3>
                    {isLoading && !analysisResult ? (
                        <div className="space-y-4">
                            <div className="bg-gray-200 h-4 w-3/4 rounded animate-pulse"></div>
                            <div className="bg-gray-200 h-4 w-full rounded animate-pulse"></div>
                            <div className="bg-gray-200 h-4 w-5/6 rounded animate-pulse"></div>
                        </div>
                    ) : (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}
                        />
                    )}
                 </div>
            )}
        </div>
    );
};

export default Agent;
