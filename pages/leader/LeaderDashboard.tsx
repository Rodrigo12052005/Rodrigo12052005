

import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import { useAppContext } from '../../context/AppContext';
import { Eye, Users, Calendar, User as UserIcon } from 'lucide-react';
import { Role, Event } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import UnitIcon from '../../components/UnitIcon';

const LeaderDashboard: React.FC = () => {
    const { users, events, currentUser, isInitialized } = useAppContext();
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const pathfinders = users.filter(u => u.role === Role.Pathfinder);
    const navigate = useNavigate();

    if (!isInitialized) {
        return <LoadingScreen />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    
    if (currentUser.role !== Role.Leader) {
        return <Navigate to="/login" replace />;
    }


    return (
        <div>
            <DashboardHeader />
            <main className="p-4 space-y-6">
                <section className="p-4 text-center ui-card">
                    <h2 className="text-xl font-heading">Painel do Líder</h2>
                    <p className="text-gray-400">Visão geral do clube</p>
                </section>
                
                <button 
                  onClick={() => navigate('/profile')} 
                  className="w-full ui-card p-4 flex items-center justify-center gap-3"
                >
                  <UserIcon className="text-[var(--primary-purple)]" />
                  <span className="font-heading text-lg">Meu Perfil</span>
                </button>

                {/* Pathfinders List */}
                <section className="p-4 ui-card">
                    <h3 className="font-heading text-xl mb-3 flex items-center"><Users className="mr-2 text-[var(--primary-purple)]" /> Desbravadores ({pathfinders.length})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {pathfinders.map(user => (
                            <div key={user.id} className="flex items-center justify-between bg-black/50 p-3 rounded-md border border-[var(--border-color)]">
                                <div className="flex items-center space-x-3">
                                    <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{user.fullName}</p>
                                            <UnitIcon unit={user.clubUnit} className="w-6 h-6 text-base"/>
                                        </div>
                                        <p className="text-xs text-green-400">{user.dollars} Dólares</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                    className="p-2 rounded-full text-[var(--accent-gray)] hover:bg-[var(--primary-purple)] hover:text-white"
                                    aria-label={`Ver perfil de ${user.fullName}`}
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Events List */}
                <section>
                  <h3 className="font-heading text-xl mb-3 flex items-center"><Calendar className="mr-2 text-[var(--primary-purple)]" /> Eventos do Clube</h3>
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} className="ui-card overflow-hidden cursor-pointer" onClick={() => setSelectedEvent(event)}>
                        <img src={event.imageUrl} alt={event.title} className="w-full h-32 object-cover opacity-75" />
                        <div className="p-3">
                          <h4 className="font-heading">{event.title}</h4>
                          <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
            </main>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedEvent(null)}>
                  <div className="w-full max-w-lg ui-card overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="overflow-y-auto">
                      {selectedEvent.imageUrl && (
                        <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4">
                        <h1 className="font-heading text-3xl text-gradient-purple mb-2">{selectedEvent.title}</h1>
                        <p className="font-semibold text-gray-300 mb-4">
                          {new Date(selectedEvent.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                        </p>
                        <p className="text-gray-200 whitespace-pre-wrap">{selectedEvent.description}</p>
                      </div>

                      {selectedEvent.videoUrl && (
                        <div className="p-4 border-t border-[var(--border-color)]">
                          <h2 className="font-heading text-xl mb-3">Vídeo do Evento</h2>
                          <div className="aspect-w-16 aspect-h-9 relative" style={{paddingBottom: '56.25%'}}>
                             <video src={selectedEvent.videoUrl} controls className="absolute top-0 left-0 w-full h-full rounded-lg" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-[var(--border-color)] mt-auto bg-[var(--card-bg)]">
                      <button onClick={() => setSelectedEvent(null)} className="btn-primary w-full">Fechar</button>
                    </div>
                  </div>
                </div>
            )}
        </div>
    );
};

export default LeaderDashboard;