import React, { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import DashboardHeader from '../../components/DashboardHeader';
import { User, DollarSign, QrCode, Calendar, CheckSquare, BarChart2, Trophy, TrendingUp } from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import HudCorner from '../../components/HudCorner';
import { Role, Event } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import UnitIcon from '../../components/UnitIcon';

const PathfinderDashboard: React.FC = () => {
  const { currentUser, users, events, isInitialized } = useAppContext();
  const [showQr, setShowQr] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeRankingTab, setActiveRankingTab] = useState<'pathfinders' | 'units'>('pathfinders');
  const navigate = useNavigate();

  const pathfinderRanking = useMemo(() => {
    return users
        .filter(u => u.role === Role.Pathfinder && u.classProgress)
        .sort((a, b) => (b.classProgress?.signatures ?? 0) - (a.classProgress?.signatures ?? 0));
  }, [users]);

  interface UnitRank {
      name: string;
      averageScore: number;
      memberCount: number;
  }

  const unitRanking = useMemo(() => {
      const units: { [key: string]: { totalScore: number, count: number } } = {};
      const pathfinders = users.filter(u => u.role === Role.Pathfinder && u.classProgress);

      pathfinders.forEach(p => {
          const unitName = p.clubUnit || 'Sem Unidade';
          if (!units[unitName]) {
              units[unitName] = { totalScore: 0, count: 0 };
          }
          units[unitName].totalScore += p.classProgress?.signatures ?? 0;
          units[unitName].count++;
      });

      const rankedUnits: UnitRank[] = Object.entries(units).map(([name, data]) => ({
          name,
          averageScore: data.count > 0 ? data.totalScore / data.count : 0,
          memberCount: data.count,
      })).sort((a, b) => b.averageScore - a.averageScore);

      return rankedUnits;
  }, [users]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role !== Role.Pathfinder) {
    return <Navigate to="/login" replace />;
  }

  const progressPercentage = currentUser.classProgress 
    ? (currentUser.classProgress.signatures / currentUser.classProgress.totalSignatures) * 100
    : 0;
  
  const ActionButton: React.FC<{icon: React.ReactNode, label: string, onClick?: () => void, className?: string}> = ({icon, label, onClick, className}) => (
     <button onClick={onClick} className={`flex flex-col items-center justify-center p-4 ui-card transition-all ${className}`}>
        {icon}
        <span className="font-heading mt-2">{label}</span>
    </button>
  );

  const tabBaseClass = "w-1/2 pb-2 font-heading text-center transition-colors text-sm";
  const activeTabClass = "text-white border-b-2 border-[var(--primary-purple)]";
  const inactiveTabClass = "text-gray-400 hover:text-white";

  return (
    <div className="pb-10">
      <DashboardHeader showSettings showStahlText />
      <HudCorner />

      <main className="p-4 space-y-6">
        {/* Profile Card */}
        <section className="ui-card p-4">
          <div className="flex items-center space-x-4">
            <img src={currentUser.profilePictureUrl || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt={currentUser.fullName} className="w-20 h-20 rounded-full border-4 border-[var(--primary-purple)] object-cover" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-heading">{currentUser.fullName}</h2>
                <UnitIcon unit={currentUser.clubUnit} className="w-8 h-8 text-xl" />
              </div>
              <p className="text-sm text-gray-400">Idade: {currentUser.age}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-around text-center">
            <div>
              <p className="font-bold text-lg text-green-400">{currentUser.dollars}</p>
              <p className="text-xs text-gray-400">Dólares</p>
            </div>
            <div>
              <TrendingUp size={28} className="text-amber-400 mx-auto" />
              <p className="text-xs text-gray-400 mt-1">Progresso</p>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section>
          <h3 className="font-heading text-xl mb-3 flex items-center"><Trophy className="mr-2 text-[var(--primary-purple)]" /> Conquistas</h3>
          <div className="ui-card p-4">
            {currentUser.achievements && currentUser.achievements.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {currentUser.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Nenhuma conquista ainda.</p>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 gap-4">
          <ActionButton icon={<User size={28} className="text-[var(--primary-purple)]" />} label="Perfil" onClick={() => navigate('/profile')} />
          <ActionButton icon={<DollarSign size={28} className="text-[var(--primary-purple)]" />} label="Carteira" onClick={() => navigate('/pathfinder/wallet')} />
          <ActionButton onClick={() => setShowQr(true)} className="col-span-2" icon={<QrCode size={28} className="text-[var(--primary-purple)]" />} label="Meu QR Code" />
        </section>

        {/* Class Progress */}
        <section className="ui-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-lg flex items-center"><BarChart2 className="mr-2 text-[var(--primary-purple)]" /> Progresso</h3>
            <span className="text-sm font-semibold">{currentUser.classProgress?.signatures}/{currentUser.classProgress?.totalSignatures}</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-4 border border-gray-600">
            <div className="bg-[var(--primary-purple)] h-full rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </section>
        
        {/* Ranking Section */}
        <section>
            <h3 className="font-heading text-xl mb-3 flex items-center"><Trophy className="mr-2 text-[var(--primary-purple)]" /> Ranking do Clube</h3>
            <div className="ui-card p-4">
                <div className="flex border-b border-[var(--border-color)] mb-4">
                    <button onClick={() => setActiveRankingTab('pathfinders')} className={`${tabBaseClass} ${activeRankingTab === 'pathfinders' ? activeTabClass : inactiveTabClass}`}>
                        Desbravadores
                    </button>
                    <button onClick={() => setActiveRankingTab('units')} className={`${tabBaseClass} ${activeRankingTab === 'units' ? activeTabClass : inactiveTabClass}`}>
                        Unidades
                    </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {activeRankingTab === 'pathfinders' && pathfinderRanking.map((user, index) => (
                        <div key={user.id} className={`p-2 rounded-lg flex items-center justify-between transition-all ${user.id === currentUser.id ? 'bg-white/10 border border-[var(--primary-purple)]' : 'bg-black/20'}`}>
                            <div className="flex items-center space-x-3">
                                <span className="font-heading text-lg w-6 text-center">{index + 1}</span>
                                <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <p className="font-semibold text-sm">{user.fullName}</p>
                                    <p className="text-xs text-gray-400">{user.clubUnit}</p>
                                </div>
                            </div>
                            <p className="font-bold text-amber-400">{user.classProgress?.signatures}</p>
                        </div>
                    ))}

                    {activeRankingTab === 'units' && unitRanking.map((unit, index) => (
                         <div key={unit.name} className={`p-2 rounded-lg flex items-center justify-between transition-all ${unit.name === currentUser.clubUnit ? 'bg-white/10 border border-[var(--primary-purple)]' : 'bg-black/20'}`}>
                            <div className="flex items-center space-x-3">
                                <span className="font-heading text-lg w-6 text-center">{index + 1}</span>
                                <UnitIcon unit={unit.name} className="w-10 h-10" />
                                <div>
                                    <p className="font-semibold text-sm">{unit.name}</p>
                                    <p className="text-xs text-gray-400">{unit.memberCount} membro(s)</p>
                                </div>
                            </div>
                            <p className="font-bold text-amber-400">{unit.averageScore.toFixed(0)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Events */}
        <section>
          <h3 className="font-heading text-xl mb-3 flex items-center"><Calendar className="mr-2 text-[var(--primary-purple)]" /> Próximos Eventos</h3>
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="ui-card overflow-hidden cursor-pointer" onClick={() => setSelectedEvent(event)}>
                <img src={event.imageUrl} alt={event.title} className="w-full h-32 object-cover opacity-80" />
                <div className="p-3">
                  <h4 className="font-heading">{event.title}</h4>
                  <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Tasks */}
        <section>
          <h3 className="font-heading text-xl mb-3 flex items-center"><CheckSquare className="mr-2 text-[var(--primary-purple)]" /> Tarefas</h3>
          <div className="space-y-2">
            {currentUser.tasks?.slice(0, 3).map(task => (
              <div key={task.id} className={`flex items-center justify-between p-3 ui-card ${task.completed ? 'border-green-500' : ''}`}>
                <div>
                  <p className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
                  <p className="text-xs text-green-400">+{task.dollarReward} Dólares</p>
                </div>
                {task.completed && <CheckSquare className="text-green-500" />}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/pathfinder/tasks')} className="btn-secondary w-full mt-3 text-sm py-2">Ver todas as tarefas</button>
        </section>
      </main>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowQr(false)}>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-lg text-center" onClick={e => e.stopPropagation()}>
            <div className="bg-white p-4 rounded-md">
              <QRCode value={currentUser.qrCodeValue} size={256} bgColor="#FFFFFF" fgColor="#0d0d0d" />
            </div>
            <p className="text-white text-center mt-4 font-heading">{currentUser.fullName}</p>
            <button onClick={() => setShowQr(false)} className="btn-primary w-full mt-4">Fechar</button>
          </div>
        </div>
      )}

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

export default PathfinderDashboard;