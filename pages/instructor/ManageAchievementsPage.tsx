import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { User, Role } from '../../types';
import UnitIcon from '../../components/UnitIcon';

const ManageAchievementsPage: React.FC = () => {
    const navigate = useNavigate();
    const { users, addAchievement, removeAchievement } = useAppContext();
    const [selectedPathfinder, setSelectedPathfinder] = useState<User | null>(null);

    const pathfinders = users.filter(u => u.role === Role.Pathfinder);

    const handleBack = () => {
        if (selectedPathfinder) {
            setSelectedPathfinder(null);
        } else {
            navigate('/instructor');
        }
    };
    
    // This effect will update the selectedPathfinder state if the user data changes in the context
    useEffect(() => {
        if (selectedPathfinder) {
            const updatedUser = users.find(u => u.id === selectedPathfinder.id);
            if (updatedUser) {
                setSelectedPathfinder(updatedUser);
            }
        }
    }, [users, selectedPathfinder]);

    return (
        <div className="min-h-screen pb-10">
            <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center border-b border-[var(--border-color)]">
                <button onClick={handleBack} className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] p-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-heading mx-auto">
                    {selectedPathfinder ? `Conquistas de ${selectedPathfinder.fullName.split(' ')[0]}` : 'Gerenciar Conquistas'}
                </h1>
                <div className="w-10"></div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-4">
                {!selectedPathfinder ? (
                    <PathfinderListView pathfinders={pathfinders} onSelect={setSelectedPathfinder} />
                ) : (
                    <AchievementsDetailView 
                        pathfinder={selectedPathfinder} 
                        onAddAchievement={(achievement) => addAchievement(selectedPathfinder.id, achievement)}
                        onRemoveAchievement={(index) => removeAchievement(selectedPathfinder.id, index)}
                    />
                )}
            </main>
        </div>
    );
};

const PathfinderListView: React.FC<{ pathfinders: User[], onSelect: (user: User) => void }> = ({ pathfinders, onSelect }) => (
    <>
        <h2 className="font-body text-lg text-center text-gray-400 mb-4">Selecione um desbravador para gerenciar suas conquistas.</h2>
        {pathfinders.map(user => (
            <button key={user.id} onClick={() => onSelect(user)} className="w-full ui-card p-4 flex items-center justify-between text-left animate-fade-in">
                <div className="flex items-center space-x-4">
                    <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-[var(--primary-purple)]" />
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-heading text-lg">{user.fullName}</p>
                            <UnitIcon unit={user.clubUnit} className="w-8 h-8 text-lg" />
                        </div>
                        <p className="text-sm text-gray-400">{user.clubUnit || 'Unidade não definida'}</p>
                    </div>
                </div>
                <div className="text-right">
                     <p className="font-semibold text-amber-400">{user.achievements?.length || 0}</p>
                     <p className="text-xs text-gray-500">Conquistas</p>
                </div>
            </button>
        ))}
    </>
);

const AchievementsDetailView: React.FC<{
    pathfinder: User;
    onAddAchievement: (achievement: string) => { success: boolean, message: string };
    onRemoveAchievement: (index: number) => { success: boolean, message: string };
}> = ({ pathfinder, onAddAchievement, onRemoveAchievement }) => {
    const [newAchievement, setNewAchievement] = useState('');
    const [error, setError] = useState('');

    const handleAdd = () => {
        setError('');
        if (!newAchievement.trim()) {
            setError("O texto da conquista não pode ser vazio.");
            return;
        }
        const result = onAddAchievement(newAchievement);
        if (result.success) {
            setNewAchievement('');
        } else {
            setError(result.message);
        }
    };

    const handleRemove = (index: number) => {
        if (window.confirm("Tem certeza que deseja remover esta conquista?")) {
            onRemoveAchievement(index);
        }
    };

    return (
        <div className="animate-fade-in space-y-4">
            <div className="ui-card p-4">
                <h3 className="font-heading text-lg mb-3">Adicionar Nova Conquista</h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newAchievement} 
                        onChange={(e) => setNewAchievement(e.target.value)}
                        className="form-input flex-grow"
                        placeholder="Ex: Especialidade de Nós"
                    />
                    <button onClick={handleAdd} className="btn-primary p-3"><Plus size={20} /></button>
                </div>
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            </div>

            <div className="ui-card p-4">
                <h3 className="font-heading text-lg mb-3">Conquistas Atuais</h3>
                <div className="space-y-2">
                    {pathfinder.achievements && pathfinder.achievements.length > 0 ? (
                        pathfinder.achievements.map((ach, index) => (
                            <div key={index} className="flex justify-between items-center bg-black/40 p-3 rounded-md">
                                <p>{ach}</p>
                                <button onClick={() => handleRemove(index)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={18} /></button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhuma conquista registrada.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageAchievementsPage;
