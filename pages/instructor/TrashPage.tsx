import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import DashboardHeader from '../../components/DashboardHeader';
import { Event, Task, PixKey, User } from '../../types';
import { RotateCcw, Trash2 as TrashIcon, Calendar, ListChecks, KeyRound } from 'lucide-react';

const TrashPage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        events, restoreEvent, permanentlyDeleteEvent,
        tasks, restoreTask, permanentlyDeleteTask,
        users, restorePixKey, permanentlyRemovePixKey,
    } = useAppContext();

    const deletedEvents = events.filter(e => e.isDeleted);
    const deletedTasks = tasks.filter(t => t.isDeleted);
    
    const deletedPixKeys: ({ keyData: PixKey, user: User })[] = users.flatMap(user => 
        (user.pixKeys || [])
            .filter(key => key.isDeleted)
            .map(keyData => ({ keyData, user }))
    );

    const handleRestoreEvent = (id: number) => {
        if(window.confirm("Restaurar este evento? Ele ficará visível para todos novamente.")) {
             const result = restoreEvent(id);
             alert(result.message);
        }
    };
    const handlePermDeleteEvent = (id: number) => {
        if(window.confirm("EXCLUIR PERMANENTEMENTE este evento? Esta ação não pode ser desfeita.")) {
            const result = permanentlyDeleteEvent(id);
            alert(result.message);
        }
    };

    const handleRestoreTask = (id: number) => {
        if(window.confirm("Restaurar esta tarefa? Ela ficará visível para todos novamente.")) {
            const result = restoreTask(id);
            alert(result.message);
        }
    };
    const handlePermDeleteTask = (id: number) => {
        if(window.confirm("EXCLUIR PERMANENTEMENTE esta tarefa? Esta ação não pode ser desfeita.")) {
            const result = permanentlyDeleteTask(id);
            alert(result.message);
        }
    };

    const handleRestoreKey = (userId: string, key: string) => {
        if(window.confirm("Restaurar esta chave PIX?")) {
            const result = restorePixKey(userId, key);
            alert(result.message);
        }
    };
    const handlePermDeleteKey = (userId: string, key: string) => {
        if(window.confirm("EXCLUIR PERMANENTEMENTE esta chave PIX? Esta ação não pode ser desfeita.")) {
            const result = permanentlyRemovePixKey(userId, key);
            alert(result.message);
        }
    };

    return (
        <div className="min-h-screen pb-10">
            <DashboardHeader title="Lixeira" onBack={() => navigate('/instructor')} />
            <main className="p-4 max-w-2xl mx-auto space-y-6">
                
                <TrashSection title="Eventos Excluídos" icon={<Calendar />}>
                    {deletedEvents.length > 0 ? deletedEvents.map(event => (
                        <TrashItem key={`event-${event.id}`} title={event.title} subtitle={`Data: ${new Date(event.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`}>
                            <ItemActions 
                                onRestore={() => handleRestoreEvent(event.id)} 
                                onPermDelete={() => handlePermDeleteEvent(event.id)}
                            />
                        </TrashItem>
                    )) : <EmptyState />}
                </TrashSection>
                
                <TrashSection title="Tarefas Excluídas" icon={<ListChecks />}>
                    {deletedTasks.length > 0 ? deletedTasks.map(task => (
                        <TrashItem key={`task-${task.id}`} title={task.title} subtitle={`Recompensa: $${task.dollarReward}`}>
                             <ItemActions 
                                onRestore={() => handleRestoreTask(task.id)} 
                                onPermDelete={() => handlePermDeleteTask(task.id)}
                            />
                        </TrashItem>
                    )) : <EmptyState />}
                </TrashSection>

                <TrashSection title="Chaves PIX Excluídas" icon={<KeyRound />}>
                     {deletedPixKeys.length > 0 ? deletedPixKeys.map(({ keyData, user }) => (
                        <TrashItem key={`key-${user.id}-${keyData.key}`} title={keyData.key} subtitle={`Dono(a): ${user.fullName}`}>
                             <ItemActions 
                                onRestore={() => handleRestoreKey(user.id, keyData.key)} 
                                onPermDelete={() => handlePermDeleteKey(user.id, keyData.key)}
                            />
                        </TrashItem>
                    )) : <EmptyState />}
                </TrashSection>

            </main>
        </div>
    );
};

const TrashSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <section className="ui-card p-4">
        <h2 className="font-heading text-xl mb-4 text-gradient-purple flex items-center gap-2">
            {icon} {title}
        </h2>
        <div className="space-y-3">{children}</div>
    </section>
);

const TrashItem: React.FC<{ title: string, subtitle: string, children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="bg-black/40 p-3 rounded-lg flex items-center justify-between">
        <div>
            <p className="font-semibold">{title}</p>
            <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        {children}
    </div>
);

const ItemActions: React.FC<{ onRestore: () => void, onPermDelete: () => void }> = ({ onRestore, onPermDelete }) => (
    <div className="flex gap-2">
        <button onClick={onRestore} className="p-2 text-gray-400 hover:text-green-400 transition-colors" aria-label="Restaurar"><RotateCcw size={18} /></button>
        <button onClick={onPermDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Excluir Permanentemente"><TrashIcon size={18} /></button>
    </div>
);

const EmptyState: React.FC = () => (
    <p className="text-center text-gray-500 py-4">Lixeira vazia.</p>
);

export default TrashPage;