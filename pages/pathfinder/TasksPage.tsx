import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, UploadCloud, Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Task } from '../../types';

const TasksPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, completeUserTask } = useAppContext();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [completionMessage, setCompletionMessage] = useState('');
    const [completionImage, setCompletionImage] = useState<string | null>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setCompletionImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (task: Task) => {
        if (!task.completed) {
            setSelectedTask(task);
            setCompletionMessage('');
            setCompletionImage(null);
        }
    };

    const handleSubmit = () => {
        if (selectedTask && completionMessage) {
            const result = completeUserTask(currentUser.id, selectedTask.id, {
                message: completionMessage,
                imageUrl: completionImage || undefined,
            });
            alert(result.message);
            if (result.success) {
                setSelectedTask(null);
            }
        } else {
            alert("Por favor, escreva uma mensagem descrevendo a conclusão da tarefa.");
        }
    };

    const tasks = currentUser.tasks || [];

    return (
        <div className="min-h-screen">
            <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center border-b border-[var(--border-color)]">
                <button onClick={() => navigate('/pathfinder')} className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] p-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-heading mx-auto">Minhas Tarefas</h1>
            </header>
            <main className="p-4 max-w-lg mx-auto space-y-4">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <button 
                            key={task.id} 
                            onClick={() => handleOpenModal(task)}
                            disabled={task.completed}
                            className={`w-full text-left ui-card p-4 animate-fade-in transition-all ${task.completed ? 'opacity-50 border-green-500/50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`font-heading text-lg ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{task.description.substring(0, 100)}...</p>
                                    <p className="text-sm text-green-400 font-bold mt-2">Recompensa: {task.dollarReward} Dólares</p>
                                    {task.dueDate && <p className="text-xs text-gray-500 mt-1">Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>}
                                </div>
                                {task.completed && (
                                    <div className="flex items-center gap-2 text-green-500 font-bold flex-shrink-0 ml-4">
                                        <CheckSquare size={20} />
                                        <span>Concluída</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center text-gray-400 mt-16 animate-fade-in">
                        <p className="text-lg">Nenhuma tarefa atribuída no momento.</p>
                    </div>
                )}
            </main>

            {selectedTask && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedTask(null)}>
                    <div className="w-full max-w-lg ui-card overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 overflow-y-auto">
                            <h2 className="font-heading text-3xl text-gradient-purple mb-2">{selectedTask.title}</h2>
                            <p className="text-green-400 font-semibold mb-4">Recompensa: +{selectedTask.dollarReward} Dólares</p>
                            {selectedTask.dueDate && <p className="text-sm text-gray-400 mb-4">Vencimento: {new Date(selectedTask.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>}
                            <p className="text-gray-300 whitespace-pre-wrap mb-6">{selectedTask.description}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="completionMessage" className="block text-sm font-medium text-gray-300 mb-1">Mensagem de Conclusão</label>
                                    <textarea 
                                        id="completionMessage" 
                                        value={completionMessage} 
                                        onChange={(e) => setCompletionMessage(e.target.value)} 
                                        className="form-input min-h-[100px]" 
                                        placeholder="Descreva como você completou a tarefa..."
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Anexar Comprovante (Opcional)</label>
                                    <input type="file" accept="image/*" ref={imageInputRef} onChange={handleFileChange} className="hidden" />
                                    <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full btn-secondary flex items-center justify-center gap-2">
                                       <UploadCloud size={18}/> Selecionar Imagem
                                    </button>
                                    {completionImage && <img src={completionImage} alt="Preview" className="mt-4 rounded-lg w-full object-cover max-h-40" />}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-[var(--border-color)] mt-auto bg-[var(--card-bg)] flex gap-4">
                            <button onClick={() => setSelectedTask(null)} className="btn-secondary w-full">Cancelar</button>
                            <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
                                <Send size={18} /> Enviar Tarefa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPage;