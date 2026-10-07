

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import DashboardHeader from '../../components/DashboardHeader';
import { Role, User } from '../../types';
import { Trophy, Edit, Save, TrendingUp, X } from 'lucide-react';
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


const RankingPage: React.FC = () => {
    const navigate = useNavigate();
    const { users } = useAppContext();
    const [modalState, setModalState] = useState<{ isOpen: boolean; user: User | null; title: string }>({ isOpen: false, user: null, title: '' });

    const pathfinders = users
        .filter(u => u.role === Role.Pathfinder && u.classProgress)
        .sort((a, b) => (b.classProgress?.signatures ?? 0) - (a.classProgress?.signatures ?? 0));

    const getRankColor = (rank: number) => {
        if (rank === 0) return 'border-amber-400';
        if (rank === 1) return 'border-gray-400';
        if (rank === 2) return 'border-yellow-700';
        return 'border-[var(--border-color)]';
    };
    
    const getRankIcon = (rank: number) => {
         if (rank === 0) return '🥇';
         if (rank === 1) return '🥈';
         if (rank === 2) return '🥉';
         return `#${rank + 1}`;
    };

    const handleOpenModal = (user: User) => {
        setModalState({ isOpen: true, user, title: `Ajustar Pontos de ${user.fullName.split(' ')[0]}` });
    };
    const handleCloseModal = () => {
        setModalState({ isOpen: false, user: null, title: '' });
    };

    return (
        <div className="min-h-screen pb-10">
            <DashboardHeader title="Ranking de Desbravadores" onBack={() => navigate('/instructor')} />
            <main className="p-4 space-y-3 max-w-2xl mx-auto">
                <div className="ui-card p-4 flex items-center justify-center gap-3 mb-4">
                    <Trophy className="text-[var(--primary-purple)]" size={24}/>
                    <p className="font-heading text-lg">Ranking por Progresso</p>
                </div>
                {pathfinders.map((user, index) => (
                    <div key={user.id} className={`ui-card p-3 flex items-center justify-between animate-fade-in border-2 ${getRankColor(index)}`}>
                        <div className="flex items-center space-x-3">
                            <span className="font-heading text-2xl w-10 text-center">{getRankIcon(index)}</span>
                            <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.fullName} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="font-heading text-lg">{user.fullName}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>{user.clubUnit}</span>
                                    <UnitIcon unit={user.clubUnit} className="w-5 h-5 text-xs" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="text-right">
                                <p className="font-bold text-xl text-amber-400">{user.classProgress?.signatures}</p>
                                <p className="text-xs text-gray-400">Pontos</p>
                            </div>
                            <button 
                                onClick={() => handleOpenModal(user)} 
                                className="p-2 text-gray-400 hover:text-white"
                                aria-label={`Ajustar pontos de ${user.fullName}`}
                            >
                                <Edit size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {pathfinders.length === 0 && (
                     <div className="text-center text-gray-400 mt-16 animate-fade-in">
                        <p className="text-lg">Nenhum desbravador encontrado.</p>
                    </div>
                )}
            </main>
             {modalState.isOpen && modalState.user && (
                <RankingAdjustmentModal
                    usersToAdjust={[modalState.user]}
                    onClose={handleCloseModal}
                    title={modalState.title}
                />
            )}
        </div>
    );
};

export default RankingPage;
