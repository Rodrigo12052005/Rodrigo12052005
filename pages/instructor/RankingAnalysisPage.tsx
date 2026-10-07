

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import DashboardHeader from '../../components/DashboardHeader';
import { Role, User } from '../../types';
import { Users, BarChart2, Star, Trophy, Edit, Save, TrendingUp, X } from 'lucide-react';
import UnitIcon from '../../components/UnitIcon';

interface RankingAdjustmentModalProps {
    usersToAdjust: User[];
    onClose: () => void;
    title: string;
}

const RankingAdjustmentModal: React.FC<RankingAdjustmentModalProps> = ({ usersToAdjust, onClose, title }) => {
    const { adjustPathfinderProgress, users } = useAppContext();
    const [adjustmentValues, setAdjustmentValues] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<Record<string, { type: 'success' | 'error', message: string }>>({});
    
    const getLatestUser = (userId: string) => users.find(u => u.id === userId);

    const handleValueChange = (userId: string, value: string) => {
        setAdjustmentValues(prev => ({ ...prev, [userId]: value }));
        setFeedback(prev => {
            const newFeedback = { ...prev };
            delete newFeedback[userId];
            return newFeedback;
        });
    };

    const handleSave = (userId: string) => {
        const value = parseInt(adjustmentValues[userId] || '0', 10);
        if (isNaN(value) || value === 0) {
            setFeedback(prev => ({ ...prev, [userId]: { type: 'error', message: 'Valor inválido ou zero.' } }));
            return;
        }

        const result = adjustPathfinderProgress(userId, value);
        
        setFeedback(prev => ({
            ...prev,
            [userId]: {
                type: result.success ? 'success' : 'error',
                message: result.message
            }
        }));
        
        if (result.success) {
            handleValueChange(userId, ''); // Reset input
        }

        setTimeout(() => setFeedback(prev => {
            const newFeedback = { ...prev };
            delete newFeedback[userId];
            return newFeedback;
        }), 4000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md ui-card p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-heading text-2xl text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <p className="font-body text-gray-400 text-sm text-center mb-4">
                    Use valores positivos para adicionar pontos e negativos para remover.
                </p>
                <div className="space-y-4 overflow-y-auto pr-2">
                    {usersToAdjust.map(user => {
                        const latestUserData = getLatestUser(user.id) || user;
                        return (
                             <div key={user.id} className="bg-black/40 p-3 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <img src={latestUserData.profilePictureUrl || `https://i.pravatar.cc/150?u=${latestUserData.id}`} alt={latestUserData.fullName} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-heading text-md">{latestUserData.fullName}</p>
                                        <p className="text-sm text-gray-400 flex items-center gap-1">
                                            <TrendingUp size={14} className="text-amber-400" />
                                            {latestUserData.classProgress?.signatures} Pontos
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2 items-center">
                                    <input
                                        type="number"
                                        placeholder="Ex: 10 ou -5"
                                        value={adjustmentValues[latestUserData.id] || ''}
                                        onChange={(e) => handleValueChange(latestUserData.id, e.target.value)}
                                        className="form-input flex-grow !py-2"
                                    />
                                    <button
                                        onClick={() => handleSave(latestUserData.id)}
                                        className="btn-primary p-3"
                                        aria-label={`Salvar ajuste para ${latestUserData.fullName}`}
                                    >
                                        <Save size={20} />
                                    </button>
                                </div>
                                {feedback[latestUserData.id] && (
                                    <p className={`text-xs mt-2 text-center ${feedback[latestUserData.id].type === 'success' ? 'text-green-400' : 'text-red-500'}`}>
                                        {feedback[latestUserData.id].message}
                                    </p>
                                )}
                             </div>
                        );
                    })}
                </div>
                <button onClick={onClose} className="btn-secondary w-full mt-6">Fechar</button>
            </div>
        </div>
    );
};


const RankingAnalysisPage: React.FC = () => {
    const navigate = useNavigate();
    const { users } = useAppContext();
    const [modalState, setModalState] = useState<{ isOpen: boolean; users: User[]; title: string }>({ isOpen: false, users: [], title: '' });

    const analysisData = useMemo(() => {
        const pathfinders = users.filter(u => u.role === Role.Pathfinder && u.classProgress);
        if (pathfinders.length === 0) {
            return {
                totalPathfinders: 0,
                averageProgress: 0,
                topUnit: { name: 'N/A', score: 0 },
                unitStats: [],
                topPathfinders: [],
                pathfinders,
            };
        }

        const totalProgress = pathfinders.reduce((acc, curr) => acc + (curr.classProgress?.signatures ?? 0), 0);
        const averageProgress = totalProgress / pathfinders.length;

        const units: { [key: string]: { totalScore: number, count: number } } = {};
        pathfinders.forEach(p => {
            const unit = p.clubUnit || 'Sem Unidade';
            if (!units[unit]) {
                units[unit] = { totalScore: 0, count: 0 };
            }
            units[unit].totalScore += p.classProgress?.signatures ?? 0;
            units[unit].count += 1;
        });

        const unitStats = Object.entries(units).map(([name, data]) => ({
            name,
            averageScore: data.totalScore / data.count,
        })).sort((a, b) => b.averageScore - a.averageScore);

        const topUnit = unitStats.length > 0 ? { name: unitStats[0].name, score: unitStats[0].averageScore } : { name: 'N/A', score: 0 };
        
        const topPathfinders = [...pathfinders].sort((a, b) => (b.classProgress?.signatures ?? 0) - (a.classProgress?.signatures ?? 0)).slice(0, 3);

        return {
            totalPathfinders: pathfinders.length,
            averageProgress,
            topUnit,
            unitStats,
            topPathfinders,
            pathfinders,
        };
    }, [users]);

    const maxUnitScore = Math.max(...analysisData.unitStats.map(u => u.averageScore), 1);

    const handleOpenModal = (users: User[], title: string) => {
        setModalState({ isOpen: true, users, title });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, users: [], title: '' });
    };

    return (
        <div className="min-h-screen pb-10">
            <DashboardHeader title="Análise de Ranking" onBack={() => navigate('/instructor')} />
            <main className="p-4 space-y-6 max-w-2xl mx-auto">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={<Users />} title="Total DBVs" value={analysisData.totalPathfinders.toString()} />
                    <StatCard icon={<BarChart2 />} title="Média Geral" value={analysisData.averageProgress.toFixed(0)} />
                    <StatCard icon={<Star />} title="Unidade Destaque" value={analysisData.topUnit.name} />
                </section>
                
                <section className="ui-card p-4">
                    <h2 className="font-heading text-xl mb-4 text-gradient-purple">Progressão por Unidade</h2>
                    <div className="space-y-4">
                        {analysisData.unitStats.map(unit => (
                            <div key={unit.name}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold flex items-center gap-2">{unit.name} <UnitIcon unit={unit.name} className="w-5 h-5 text-xs"/>
                                        <button 
                                            onClick={() => handleOpenModal(analysisData.pathfinders.filter(p => (p.clubUnit || 'Sem Unidade') === unit.name), `Ajustar Unidade ${unit.name}`)}
                                            className="ml-2 text-gray-400 hover:text-white"
                                            aria-label={`Ajustar pontos da unidade ${unit.name}`}
                                        >
                                            <Edit size={14} />
                                        </button>
                                    </span>
                                    <span className="text-xs font-bold text-amber-400">{unit.averageScore.toFixed(0)}</span>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-4 border border-gray-600">
                                    <div 
                                        className="bg-[var(--primary-purple)] h-full rounded-full" 
                                        style={{ width: `${(unit.averageScore / maxUnitScore) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                         {analysisData.unitStats.length === 0 && <p className="text-center text-gray-400 py-4">Dados insuficientes para análise.</p>}
                    </div>
                </section>

                <section className="ui-card p-4">
                    <h2 className="font-heading text-xl mb-4 text-gradient-purple flex items-center gap-2"><Trophy /> Top 3 Desbravadores</h2>
                     <div className="space-y-3">
                        {analysisData.topPathfinders.map((user, index) => (
                             <div key={user.id} className="bg-black/40 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="font-heading text-lg w-6 text-center">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                                    <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-semibold">{user.fullName}</p>
                                        <p className="text-xs text-gray-400">{user.clubUnit}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg text-amber-400">{user.classProgress?.signatures}</p>
                                    <button 
                                        onClick={() => handleOpenModal([user], `Ajustar Pontos de ${user.fullName.split(' ')[0]}`)} 
                                        className="text-gray-400 hover:text-white"
                                        aria-label={`Ajustar pontos de ${user.fullName}`}
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                         {analysisData.topPathfinders.length === 0 && <p className="text-center text-gray-400 py-4">Nenhum desbravador no ranking.</p>}
                    </div>
                </section>
            </main>
            {modalState.isOpen && (
                <RankingAdjustmentModal
                    usersToAdjust={modalState.users}
                    onClose={handleCloseModal}
                    title={modalState.title}
                />
            )}
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string }> = ({ icon, title, value }) => (
    <div className="ui-card p-4 flex items-center space-x-4">
        <div className="text-[var(--primary-purple)] p-2 bg-black/30 rounded-full">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="font-heading text-xl">{value}</p>
        </div>
    </div>
);

export default RankingAnalysisPage;
