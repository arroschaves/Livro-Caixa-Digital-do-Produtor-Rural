
import React, { useState, useCallback, ChangeEvent } from 'react';
import { Transaction, Category } from '../types';
import { classifyTransactionContent } from '../services/geminiService';
import { ArrowUpTrayIcon, SparklesIcon } from './icons';

interface TransactionsProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const categoryStyles: { [key in Category]: string } = {
    [Category.RECEITA]: 'bg-green-100 text-green-800',
    [Category.DESPESA]: 'bg-red-100 text-red-800',
    [Category.TRANSFERENCIA]: 'bg-blue-100 text-blue-800',
    [Category.OUTROS]: 'bg-gray-100 text-gray-800',
    [Category.PENDENTE]: 'bg-yellow-100 text-yellow-800 animate-pulse',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const FileUpload: React.FC<{ onFileUpload: (files: FileList) => void }> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileUpload(e.dataTransfer.files);
        }
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileUpload(e.target.files);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Adicionar Transações</h2>
            <label
                htmlFor="file-upload"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex justify-center items-center w-full h-48 px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'} border-dashed rounded-md cursor-pointer transition-colors duration-200`}
            >
                <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <span className="relative font-medium text-green-600 hover:text-green-500">
                            <span>Carregue seus arquivos XML e PDF</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                        </span>
                        <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">Gemini AI irá classificar automaticamente</p>
                </div>
            </label>
        </div>
    );
};

const Transactions: React.FC<TransactionsProps> = ({ transactions, setTransactions }) => {
    
    const handleFileUpload = useCallback(async (files: FileList) => {
        const newTransactions: Transaction[] = Array.from(files).map(file => {
            const tempId = `temp-${Date.now()}-${Math.random()}`;
            return {
                id: tempId,
                date: new Date().toISOString().split('T')[0],
                description: 'Processando...',
                amount: 0,
                category: Category.PENDENTE,
                fileName: file.name
            };
        });

        setTransactions(prev => [...newTransactions, ...prev]);

        for (const transaction of newTransactions) {
            const result = await classifyTransactionContent(transaction.fileName);
            setTransactions(prev => prev.map(t =>
                t.id === transaction.id ? { ...t, ...result, date: new Date().toISOString().split('T')[0] } : t
            ));
        }

    }, [setTransactions]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Transações</h1>
            <FileUpload onFileUpload={handleFileUpload} />
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-700">Histórico</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.length > 0 ? transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{t.description}</div>
                                        <div className="text-sm text-gray-500">{t.fileName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${categoryStyles[t.category]}`}>
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${t.category === Category.DESPESA ? 'text-red-600' : 'text-green-600'}`}>
                                        {currencyFormatter.format(t.amount)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        <SparklesIcon className="mx-auto h-12 w-12 text-gray-300" />
                                        <p className="mt-2">Nenhuma transação ainda.</p>
                                        <p className="text-sm">Faça o upload de seus documentos para começar.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
