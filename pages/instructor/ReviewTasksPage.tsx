import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Image as ImageIcon, XCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { User, Role, Task } from '../../types';
import UnitIcon from '../../components/UnitIcon';

const ReviewTasksPage: React.FC = () => {
    const navigate = useNavigate();
    const { users, rejectUserTask } = useAppContext();
    const [selectedPathfinder, setSelectedPathfinder] = useState<User | null>(null);

    const pathfinders = users.filter(u => u.role === Role.Pathfinder);

    const handleBack = () => {
        if (selectedPathfinder) {
            setSelectedPathfinder(null);
        } else {
            navigate('/instructor');
        }
    };

    const handleRejectTask = (task: Task) => {
        if (!selectedPathfinder) return;

        if (window.confirm(`Tem certeza que deseja reverter a tarefa "${task.title}" de ${selectedPathfinder.fullName}? O status será revertido para "não concluído" e a recompensa será deduzida.`)) {
            const result = rejectUserTask(selectedPathfinder.id, task.id);
            alert(result.message);
            if (result.success) {
                // Force a re-render by updating the selected pathfinder state with the latest data
                const updatedUsers = users.find(u => u.id === selectedPathfinder.id);
                if(updatedUsers) setSelectedPathfinder(updatedUsers);
            }
        }
    };

    return (
        <div className="min-h-screen pb-10">
            <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center border-b border-[var(--border-color)]">
                <button onClick={handleBack} className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] p-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-heading mx-auto">
                    {selectedPathfinder ? `Tarefas de ${selectedPathfinder.fullName.split(' ')[0]}` : 'Revisar Tarefas'}
                </h1>
                <div className="w-10"></div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-4">
                {!selectedPathfinder ? (
                    <PathfinderListView pathfinders={pathfinders} onSelect={setSelectedPathfinder} />
                ) : (
                    <TasksDetailView pathfinder={selectedPathfinder} onRejectTask={handleRejectTask} />
                )}
            </main>
        </div>
    );
};

const PathfinderListView: React.FC<{ pathfinders: User[], onSelect: (user: User) => void }> = ({ pathfinders, onSelect }) => (
    <>
        <h2 className="font-body text-lg text-center text-gray-400 mb-4">Selecione um desbravador para ver suas tarefas.</h2>
        {pathfinders.map(user => {
            const completedTasks = user.tasks?.filter(t => t.completed).length || 0;
            const totalTasks = user.tasks?.length || 0;
            return (
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
                         <p className="font-semibold text-green-400">{completedTasks} / {totalTasks}</p>
                         <p className="text-xs text-gray-500">Concluídas</p>
                    </div>
                </button>
            );
        })}
    </>
);

const TasksDetailView: React.FC<{ pathfinder: User, onRejectTask: (task: Task) => void }> = ({ pathfinder, onRejectTask }) => {
    const sortedTasks = [...(pathfinder.tasks || [])].sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

    return (
        <div className="animate-fade-in space-y-4">
             {sortedTasks.length > 0 ? sortedTasks.map(task => (
                <div key={task.id} className={`ui-card p-4 transition-all ${task.completed ? 'border-green-500/50' : ''}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`font-heading text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                            <p className="text-sm text-green-400 font-bold mt-2">Recompensa: {task.dollarReward} Dólares</p>
                            {task.dueDate && <p className="text-xs text-gray-500 mt-2">Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>}
                        </div>
                        {task.completed && (
                            <div className="flex items-center gap-2 text-green-500 font-bold flex-shrink-0 ml-4">
                                <Check size={20} />
                                <span>Concluída</span>
                            </div>
                        )}
                    </div>
                    {task.completed && task.submission && (
                         <div className="mt-4 pt-4 border-t border-[var(--border-color)]/30">
                            <h4 className="font-semibold text-sm mb-2 text-gray-300">Envio:</h4>
                            <p className="text-sm bg-black/30 p-3 rounded-md italic">"{task.submission.message}"</p>
                            <p className="text-xs text-gray-500 text-right mt-1">{new Date(task.submission.timestamp).toLocaleString()}</p>
                            {task.submission.imageUrl && (
                                <div className="mt-3">
                                    <h5 className="font-semibold text-xs mb-2 text-gray-300 flex items-center gap-2"><ImageIcon size={14}/> Comprovante:</h5>
                                    <img src={task.submission.imageUrl} alt="Comprovante" className="rounded-lg max-w-full h-auto max-h-60 object-contain" />
                                </div>
                            )}
                             <button
                                onClick={() => onRejectTask(task)}
                                className="btn-secondary w-full mt-4 !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} />
                                Reverter Conclusão
                            </button>
                        </div>
                    )}
                </div>
            )) : (
                 <div className="text-center text-gray-400 mt-16">
                    <p className="text-lg">Nenhuma tarefa atribuída a este desbravador.</p>
                </div>
            )}
        </div>
    );
};


export default ReviewTasksPage;