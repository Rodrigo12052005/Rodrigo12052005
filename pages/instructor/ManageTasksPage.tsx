import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Edit, EyeOff } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Task } from '../../types';

const ManageTasksPage: React.FC = () => {
    const navigate = useNavigate();
    const { tasks, addTaskToAllPathfinders, updateTask, deleteTask } = useAppContext();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        dollarReward: '10',
        dueDate: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setTaskFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleOpenModal = (task: Task | null = null) => {
        setError('');
        if (task) {
            setEditingTask(task);
            setTaskFormData({
                title: task.title,
                description: task.description,
                dollarReward: String(task.dollarReward),
                dueDate: task.dueDate || ''
            });
        } else {
            setEditingTask(null);
            setTaskFormData({ title: '', description: '', dollarReward: '10', dueDate: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const reward = parseInt(taskFormData.dollarReward, 10);
        if (!taskFormData.title || !taskFormData.description || isNaN(reward) || reward <= 0) {
            setError('Por favor, preencha todos os campos com valores válidos.');
            return;
        }

        let result;
        if (editingTask) {
            result = updateTask({
                ...editingTask,
                ...taskFormData,
                dollarReward: reward,
                dueDate: taskFormData.dueDate || undefined,
            });
        } else {
            result = addTaskToAllPathfinders({
                title: taskFormData.title,
                description: taskFormData.description,
                dollarReward: reward,
                dueDate: taskFormData.dueDate || undefined,
            });
        }

        if (result.success) {
            setIsModalOpen(false);
            setError('');
            alert(result.message);
        } else {
            setError(result.message);
        }
    };
    
    const handleDelete = (taskId: number, taskTitle: string) => {
        if (window.confirm(`Tem certeza que deseja mover a tarefa "${taskTitle}" para a lixeira? Ela será removida das listas ativas de todos os desbravadores.`)) {
            const result = deleteTask(taskId);
            alert(result.message);
        }
    };

    const handleModalDelete = () => {
        if (editingTask) {
            if (window.confirm(`Tem certeza que deseja mover a tarefa "${editingTask.title}" para a lixeira?`)) {
                const result = deleteTask(editingTask.id);
                alert(result.message);
                setIsModalOpen(false);
            }
        }
    };

    const visibleTasks = tasks.filter(task => !task.isDeleted);

    return (
        <div className="min-h-screen">
            <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center justify-between border-b border-[var(--border-color)]">
                <button onClick={() => navigate('/instructor')} className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] p-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-heading">Gerenciar Tarefas</h1>
                <button onClick={() => handleOpenModal()} className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] p-2">
                    <PlusCircle size={24} />
                </button>
            </header>
            <main className="p-4 max-w-lg mx-auto space-y-4">
                {visibleTasks.length > 0 ? (
                    visibleTasks.map(task => (
                        <div key={task.id} className="ui-card p-4 animate-fade-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-heading text-lg">{task.title}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                                    <p className="text-sm text-green-400 font-bold mt-2">Recompensa: {task.dollarReward} Dólares</p>
                                    {task.dueDate && <p className="text-xs text-gray-400 mt-2">Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
                                </div>
                                <div className="flex items-center flex-shrink-0 ml-2">
                                    <button onClick={() => handleOpenModal(task)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                                        <Edit size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(task.id, task.title)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label={`Ocultar ${task.title}`}>
                                        <EyeOff size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 mt-16 animate-fade-in">
                        <p className="text-lg">Nenhuma tarefa global criada.</p>
                        <button onClick={() => handleOpenModal()} className="btn-primary mt-4">
                            Criar Primeira Tarefa
                        </button>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-sm ui-card p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="font-heading text-2xl text-center mb-6 text-white">{editingTask ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input id="title" type="text" value={taskFormData.title} onChange={handleInputChange} className="form-input" placeholder="Título da Tarefa" required />
                            <textarea id="description" value={taskFormData.description} onChange={handleInputChange} className="form-input" placeholder="Descrição" required />
                            <input id="dollarReward" type="number" value={taskFormData.dollarReward} onChange={handleInputChange} className="form-input" placeholder="Recompensa em Dólares" required />
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento (Opcional)</label>
                                <input id="dueDate" type="date" value={taskFormData.dueDate} onChange={handleInputChange} className="form-input" />
                            </div>
                            
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <div className="flex gap-4 pt-4 w-full justify-between items-center">
                                <div>
                                    {editingTask && (
                                        <button
                                            type="button"
                                            onClick={handleModalDelete}
                                            className="btn-secondary !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white"
                                        >
                                            Ocultar
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                                    <button type="submit" className="btn-primary">{editingTask ? 'Salvar' : 'Adicionar'}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTasksPage;