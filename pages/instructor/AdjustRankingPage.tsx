

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import DashboardHeader from '../../components/DashboardHeader';
import { Role, User } from '../../types';
import { TrendingUp, Save } from 'lucide-react';

const AdjustRankingPage: React.FC = () => {
    const navigate = useNavigate();
    const { users, adjustPathfinderProgress } = useAppContext();
    const [adjustmentValues, setAdjustmentValues] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<Record<string, { type: 'success' | 'error', message: string }>>({});

    const pathfinders = users.filter(u => u.role === Role.Pathfinder && u.classProgress)
      .sort((a, b) => (b.classProgress?.signatures ?? 0) - (a.classProgress?.signatures ?? 0));

    const handleValueChange = (userId: string, value: string) => {
        setAdjustmentValues(prev => ({ ...prev, [userId]: value }));
    };

    const handleSave = (userId: string) => {
        const value = parseInt(adjustmentValues[userId] || '0', 10);
        if (isNaN(value)) {
            setFeedback(prev => ({ ...prev, [userId]: { type: 'error', message: 'Valor inválido.' } }));
            return;
        }
        if (value === 0) {
            setFeedback(prev => ({ ...prev, [userId]: { type: 'error', message: 'O valor do ajuste não pode ser zero.' } }));
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
        
        if(result.success) {
            handleValueChange(userId, ''); // Reset input on success
        }

        // Clear feedback after a few seconds
        setTimeout(() => setFeedback(prev => {
            const newFeedback = { ...prev };
            delete newFeedback[userId];
            return newFeedback;
        }), 4000);
    };
    
    return (
        <div className="min-h-screen pb-10">
            <DashboardHeader title="Ajuste Manual de Ranking" onBack={() => navigate('/instructor')} />
            <main className="p-4 space-y-3 max-w-2xl mx-auto">
                <div className="ui-card p-4 text-center mb-4">
                    <p className="font-body text-gray-300">
                        Adicione ou remova Pontos do progresso de cada desbravador.
                        Use valores positivos (ex: 50) para adicionar e negativos (ex: -20) para remover.
                    </p>
                </div>

                {pathfinders.map(user => (
                    <div key={user.id} className="ui-card p-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.fullName} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="font-heading text-md">{user.fullName}</p>
                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                        <TrendingUp size={14} className="text-amber-400" />
                                        {user.classProgress?.signatures} Pontos
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2 items-center">
                            <input
                                type="number"
                                placeholder="Ex: 10 ou -5"
                                value={adjustmentValues[user.id] || ''}
                                onChange={(e) => handleValueChange(user.id, e.target.value)}
                                className="form-input flex-grow"
                            />
                            <button
                                onClick={() => handleSave(user.id)}
                                className="btn-primary p-3"
                                aria-label={`Salvar ajuste para ${user.fullName}`}
                            >
                                <Save size={20} />
                            </button>
                        </div>
                        {feedback[user.id] && (
                            <p className={`text-xs mt-2 text-center ${feedback[user.id].type === 'success' ? 'text-green-400' : 'text-red-500'}`}>
                                {feedback[user.id].message}
                            </p>
                        )}
                    </div>
                ))}

                {pathfinders.length === 0 && (
                    <div className="text-center text-gray-400 mt-16">
                        <p className="text-lg">Nenhum desbravador encontrado.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdjustRankingPage;