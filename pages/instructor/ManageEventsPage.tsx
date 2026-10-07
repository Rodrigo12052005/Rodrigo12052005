import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Edit, EyeOff } from 'lucide-react';

const ManageEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, deleteEvent } = useAppContext();

  const handleDelete = (eventId: number, eventTitle: string) => {
    if (window.confirm(`Tem certeza que deseja mover o evento "${eventTitle}" para a lixeira?`)) {
      const result = deleteEvent(eventId);
      alert(result.message);
    }
  };

  const handleEdit = (eventId: number) => {
    navigate(`/instructor/edit-event/${eventId}`);
  };

  const visibleEvents = events.filter(event => !event.isDeleted);

  return (
    <div className="min-h-screen">
      <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center justify-between border-b border-[var(--border-color)]">
        <button 
          onClick={() => navigate('/instructor')} 
          className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] p-2"
          aria-label="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-heading">Gerenciar Eventos</h1>
        <div className="w-10"></div>
      </header>
      <main className="p-4 max-w-lg mx-auto space-y-4">
        {visibleEvents.length > 0 ? (
          visibleEvents.map(event => (
            <div key={event.id} className="ui-card p-4 flex justify-between items-center animate-fade-in">
              <div>
                <h3 className="font-heading text-lg">{event.title}</h3>
                <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(event.id)} 
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label={`Editar ${event.title}`}
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(event.id, event.title)} 
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Ocultar ${event.title}`}
                >
                  <EyeOff size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 mt-16 animate-fade-in">
            <p className="text-lg">Nenhum evento criado ainda.</p>
            <button onClick={() => navigate('/instructor/create-event')} className="btn-primary mt-4">
              Criar Primeiro Evento
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageEventsPage;