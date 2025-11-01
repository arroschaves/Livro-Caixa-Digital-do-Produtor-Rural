import React from 'react';
import { MonthlyReport } from '../types';
import { Category } from '../types';
import { DocumentTextIcon } from './icons';

interface ReportsProps {
    reports: MonthlyReport[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const categoryStyles: { [key in Category]: string } = {
    [Category.RECEITA]: 'bg-green-100 text-green-800',
    [Category.DESPESA]: 'bg-red-100 text-red-800',
    [Category.TRANSFERENCIA]: 'bg-blue-100 text-blue-800',
    [Category.OUTROS]: 'bg-gray-100 text-gray-800',
    [Category.PENDENTE]: 'bg-yellow-100 text-yellow-800',
};


const Reports: React.FC<ReportsProps> = ({ reports }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Relatórios Mensais</h1>
            {reports.length > 0 ? (
                <div className="space-y-12">
                {reports.map((report) => (
                    <div key={report.month} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-700 border-b pb-4 mb-4">{report.month}</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-green-700">Receita</h4>
                                <p className="text-xl font-bold text-green-600">{currencyFormatter.format(report.revenue)}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-red-700">Despesa</h4>
                                <p className="text-xl font-bold text-red-600">{currencyFormatter.format(report.expense)}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-700">Saldo</h4>
                                <p className={`text-xl font-bold ${report.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {currencyFormatter.format(report.balance)}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Detalhes das Transações</h3>
                         <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {report.transactions.map(t => (
                                        <tr key={t.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{t.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${categoryStyles[t.category]}`}>
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${t.category === Category.DESPESA ? 'text-red-600' : 'text-green-600'}`}>
                                                {currencyFormatter.format(t.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="bg-white text-center p-12 rounded-2xl shadow-md border border-gray-200">
                    <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-800">Nenhum relatório para exibir</h3>
                    <p className="mt-1 text-sm text-gray-500">Adicione transações para gerar seus relatórios mensais.</p>
                </div>
            )}
        </div>
    );
};

export default Reports;