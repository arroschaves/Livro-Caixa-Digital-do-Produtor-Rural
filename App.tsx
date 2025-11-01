
import React, { useState, useMemo } from 'react';
import { Transaction, Category, MonthlyReport } from './types';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Agent from './components/Agent';
import Chatbot from './components/Chatbot';
import { ChartBarIcon, DocumentTextIcon, CpuChipIcon } from './components/icons';

type View = 'dashboard' | 'transactions' | 'reports' | 'agent';

const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const monthlyReports = useMemo<MonthlyReport[]>(() => {
        const reports: { [key: string]: MonthlyReport } = {};

        transactions
            .filter(t => t.category !== Category.PENDENTE)
            .forEach(t => {
                const month = new Date(t.date).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                if (!reports[month]) {
                    reports[month] = {
                        month,
                        revenue: 0,
                        expense: 0,
                        balance: 0,
                        transactions: []
                    };
                }
                if (t.category === Category.RECEITA) {
                    reports[month].revenue += t.amount;
                } else if (t.category === Category.DESPESA) {
                    reports[month].expense += t.amount;
                }
                reports[month].transactions.push(t);
            });
        
        return Object.values(reports)
            .map(report => ({
                ...report,
                balance: report.revenue - report.expense,
                transactions: report.transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            }))
            .sort((a, b) => {
                const dateA = new Date(a.transactions[0]?.date || 0);
                const dateB = new Date(b.transactions[0]?.date || 0);
                return dateB.getTime() - dateA.getTime();
            });

    }, [transactions]);

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard reports={monthlyReports} />;
            case 'transactions':
                return <Transactions transactions={transactions} setTransactions={setTransactions} />;
            case 'reports':
                return <Reports reports={monthlyReports} />;
            case 'agent':
                return <Agent />;
            default:
                return <Dashboard reports={monthlyReports} />;
        }
    };

    const NavItem: React.FC<{
        currentView: View;
        viewName: View;
        icon: React.ReactNode;
        label: string;
        onClick: (view: View) => void;
    }> = ({ currentView, viewName, icon, label, onClick }) => (
        <li>
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClick(viewName); }}
                className={`flex items-center p-3 text-base font-normal rounded-lg transition-all duration-200 ${
                    currentView === viewName
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
                {icon}
                <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
            </a>
        </li>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 shadow-sm hidden md:block">
                <div className="p-6">
                     <h1 className="text-xl font-bold text-green-700">Livro Caixa Digital</h1>
                     <p className="text-xs text-gray-500">Produtor Rural</p>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        <NavItem currentView={view} viewName="dashboard" label="Dashboard" onClick={setView} icon={<ChartBarIcon className="w-6 h-6" />} />
                        <NavItem currentView={view} viewName="transactions" label="Transações" onClick={setView} icon={<DocumentTextIcon className="w-6 h-6" />} />
                        <NavItem currentView={view} viewName="reports" label="Relatórios" onClick={setView} icon={<ChartBarIcon className="w-6 h-6 transform rotate-90" />} />
                        <NavItem currentView={view} viewName="agent" label="Agente IA" onClick={setView} icon={<CpuChipIcon className="w-6 h-6" />} />
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-auto">
                {renderView()}
            </main>
            
            <Chatbot />
            
            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg flex justify-around">
                 <button onClick={() => setView('dashboard')} className={`p-3 flex flex-col items-center ${view === 'dashboard' ? 'text-green-600' : 'text-gray-500'}`}>
                    <ChartBarIcon className="w-6 h-6" />
                    <span className="text-xs">Dashboard</span>
                 </button>
                 <button onClick={() => setView('transactions')} className={`p-3 flex flex-col items-center ${view === 'transactions' ? 'text-green-600' : 'text-gray-500'}`}>
                    <DocumentTextIcon className="w-6 h-6" />
                    <span className="text-xs">Transações</span>
                 </button>
                 <button onClick={() => setView('reports')} className={`p-3 flex flex-col items-center ${view === 'reports' ? 'text-green-600' : 'text-gray-500'}`}>
                    <ChartBarIcon className="w-6 h-6 transform rotate-90" />
                    <span className="text-xs">Relatórios</span>
                 </button>
                 <button onClick={() => setView('agent')} className={`p-3 flex flex-col items-center ${view === 'agent' ? 'text-green-600' : 'text-gray-500'}`}>
                    <CpuChipIcon className="w-6 h-6" />
                    <span className="text-xs">Agente</span>
                 </button>
            </nav>
        </div>
    );
};

export default App;
