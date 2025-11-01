
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyReport } from '../types';

interface DashboardProps {
    reports: MonthlyReport[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-bold text-gray-700">{`Mês: ${label}`}</p>
                <p className="text-green-600">{`Receita: ${currencyFormatter.format(payload[0].value)}`}</p>
                <p className="text-red-600">{`Despesa: ${currencyFormatter.format(payload[1].value)}`}</p>
            </div>
        );
    }
    return null;
};


const Dashboard: React.FC<DashboardProps> = ({ reports }) => {
    const totalRevenue = reports.reduce((acc, report) => acc + report.revenue, 0);
    const totalExpense = reports.reduce((acc, report) => acc + report.expense, 0);
    const netBalance = totalRevenue - totalExpense;

    const chartData = reports.map(r => ({
        name: r.month,
        Receita: r.revenue,
        Despesa: r.expense,
    }));

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Financeiro</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
                    <p className="text-3xl font-bold text-green-600">{currencyFormatter.format(totalRevenue)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-gray-500">Despesa Total</h3>
                    <p className="text-3xl font-bold text-red-600">{currencyFormatter.format(totalExpense)}</p>
                </div>
                <div className={`bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-center ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    <h3 className="text-sm font-medium text-gray-500">Saldo Líquido</h3>
                    <p className="text-3xl font-bold">{currencyFormatter.format(netBalance)}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Evolução Mensal</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                            barGap={6}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280' }}/>
                            <YAxis tickFormatter={(value) => currencyFormatter.format(value as number)} tick={{ fill: '#6b7280' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}/>
                            <Legend wrapperStyle={{ color: '#4b5563' }} />
                            <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
