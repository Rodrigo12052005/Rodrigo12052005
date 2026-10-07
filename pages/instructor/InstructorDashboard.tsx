
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import { ScanLine, CalendarPlus, UserPlus, ShieldCheck, DollarSign, User as UserIcon, CalendarDays, Wallet, ListChecks, ClipboardCheck, BarChart3, UserCheck, Trash2, Users, Trophy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { Role, User } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const checkinItems = [
  { id: 'biblia', label: 'Bíblia', reward: 5 },
  { id: 'caderno', label: 'Caderno Classe', reward: 5 },
  { id: 'caneta', label: 'Caneta', reward: 5 },
  { id: 'uniforme', label: 'Uniforme', reward: 10 },
  { id: 'presenca', label: 'Presença', reward: 10 },
  { id: 'pontualidade', label: 'Pontualidade', reward: 10 },
  { id: 'visita', label: 'Visita', reward: 20 }
];

interface CheckinRecord {
  userId: string;
  userName: string;
  timestamp: string;
  totalReward: number;
  checkedItems: { id: string, label: string, reward: number }[];
}


const InstructorDashboard: React.FC = () => {
    const { users, updateUser, currentUser, isInitialized, logout } = useAppContext();
    const [isScanning, setIsScanning] = React.useState(false);
    const [scannedUser, setScannedUser] = React.useState<User | null>(null);
    const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});
    const [checkinHistory, setCheckinHistory] = React.useState<CheckinRecord[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = React.useState(false);

    const pathfinders = users.filter(u => u.role === Role.Pathfinder);
    const navigate = useNavigate();

    const instructorDisplayDollars = 100_000_000_000;

    if (!isInitialized) {
        return <LoadingScreen />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    
    if (currentUser.role !== Role.Instructor) {
        return <Navigate to="/login" replace />;
    }

    const handleScan = (result: string) => {
        if (result) {
            const userId = result;
            const user = pathfinders.find(p => p.qrCodeValue === userId);
            if(user) {
                setScannedUser(user);
                setCheckedItems({}); // Reset checklist for new user
                setIsScanning(false);
            } else {
                alert('Desbravador não encontrado!');
                setIsScanning(false);
            }
        }
    };

    const handleError = (err: any) => {
        console.error(err);
        alert('Erro ao acessar a câmera. Verifique as permissões.');
        setIsScanning(false);
    };

    const handleCheckinConfirm = () => {
        if (scannedUser) {
            const totalReward = checkinItems
                .filter(item => checkedItems[item.id])
                .reduce((sum, item) => sum + item.reward, 0);

            if (totalReward > 0) {
                const updatedUser = {
                    ...scannedUser,
                    dollars: (scannedUser.dollars || 0) + totalReward
                };
                updateUser(updatedUser);

                const newCheckinRecord: CheckinRecord = {
                  userId: scannedUser.id,
                  userName: scannedUser.fullName,
                  timestamp: new Date().toISOString(),
                  totalReward,
                  checkedItems: checkinItems.filter(item => checkedItems[item.id])
                };
                setCheckinHistory(prev => [newCheckinRecord, ...prev]);

                alert(`${totalReward} dólares de recompensa adicionados para ${scannedUser.fullName}!`);
            }
            setScannedUser(null);
        }
    };
    
    const handleToggleCheckItem = (itemId: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const ActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, className?: string }> = ({ icon, label, onClick, className }) => (
        <button onClick={onClick} className={`flex flex-col items-center justify-center p-6 space-y-2 ui-card transition-all ${className}`}>
            {icon}
            <span className="font-heading text-center">{label}</span>
        </button>
    );

    return (
        <div>
            <DashboardHeader onBack={handleLogout} title="STAHL APP" />
            <main className="p-4 space-y-6">
                <section className="p-4 text-center ui-card">
                    <h2 className="text-xl font-heading">Painel do Instrutor</h2>
                    <p className="flex items-center justify-center text-green-400 font-semibold mt-2 text-lg">
                        <DollarSign className="mr-2"/> {instructorDisplayDollars.toLocaleString('pt-BR')}
                    </p>
                </section>
                
                <div className="grid grid-cols-3 gap-4">
                    <ActionButton icon={<ScanLine size={32} className="text-[var(--primary-purple)]" />} label="Escanear QR" onClick={() => setIsScanning(true)} />
                    <ActionButton icon={<ListChecks size={32} className="text-[var(--primary-purple)]" />} label="DBVs Escaneados" onClick={() => setIsHistoryVisible(true)} />
                    <ActionButton icon={<Users size={32} className="text-[var(--primary-purple)]" />} label="Lista de DBVs" onClick={() => navigate('/instructor/pathfinder-list')} />
                    <ActionButton icon={<CalendarPlus size={32} className="text-[var(--primary-purple)]" />} label="Adicionar Evento" onClick={() => navigate('/instructor/create-event')} />
                    <ActionButton icon={<UserPlus size={32} className="text-[var(--primary-purple)]" />} label="Cadastrar DBV" onClick={() => navigate('/register')} />
                    <ActionButton icon={<UserCheck size={32} className="text-[var(--primary-purple)]" />} label="Visitas" onClick={() => navigate('/instructor/visits')} />
                    <ActionButton icon={<ShieldCheck size={32} className="text-[var(--primary-purple)]" />} label="Gerenciar Tarefas" onClick={() => navigate('/instructor/manage-tasks')} />
                    <ActionButton icon={<Trophy size={32} className="text-[var(--primary-purple)]" />} label="Gerenciar Conquistas" onClick={() => navigate('/instructor/manage-achievements')} />
                    <ActionButton icon={<ClipboardCheck size={32} className="text-[var(--primary-purple)]" />} label="Tarefas dos DBVs" onClick={() => navigate('/instructor/review-tasks')} />
                    <ActionButton icon={<CalendarDays size={32} className="text-[var(--primary-purple)]" />} label="Gerenciar Eventos" onClick={() => navigate('/instructor/manage-events')} />
                    <ActionButton icon={<Wallet size={32} className="text-[var(--primary-purple)]" />} label="Carteira" onClick={() => navigate('/instructor/wallet')} />
                    <ActionButton icon={<UserIcon size={32} className="text-[var(--primary-purple)]" />} label="Meu Perfil" onClick={() => navigate('/profile')} />
                    <ActionButton icon={<BarChart3 size={32} className="text-[var(--primary-purple)]" />} label="Análise de Ranking" onClick={() => navigate('/instructor/ranking-analysis')} />
                    <ActionButton icon={<Trash2 size={32} className="text-[var(--primary-purple)]" />} label="Lixeira" onClick={() => navigate('/instructor/trash')} />
                </div>
            </main>

            {isScanning && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
                    <h3 className="text-xl font-heading mb-4 text-[var(--primary-purple)]">Aponte para o QR Code</h3>
                    <div className="w-full max-w-sm rounded-lg overflow-hidden border-2 border-[var(--primary-purple)]">
                        <QrScanner
                            onError={handleError}
                            onDecode={handleScan}
                            videoStyle={{ width: '100%' }}
                        />
                    </div>
                    <button onClick={() => setIsScanning(false)} className="btn-secondary mt-6">Cancelar</button>
                </div>
            )}
            
            {scannedUser && (
                 <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4" onClick={() => setScannedUser(null)}>
                     <div className="p-6 w-full max-w-sm text-center ui-card" onClick={e => e.stopPropagation()}>
                         <img src={scannedUser.profilePictureUrl || `https://i.pravatar.cc/150?u=${scannedUser.id}`} alt={scannedUser.fullName} className="w-24 h-24 rounded-full mx-auto border-4 border-[var(--primary-purple)] object-cover" />
                         <h3 className="text-xl font-heading mt-4">{scannedUser.fullName}</h3>
                         <p className="text-green-400 mb-4">{scannedUser.dollars} Dólares</p>
                         
                         <div className="mt-4 space-y-2 text-left">
                            <h4 className="font-heading text-lg text-center mb-3">Check-in do Dia</h4>
                            {checkinItems.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => handleToggleCheckItem(item.id)}
                                    className={`w-full p-3 rounded-lg text-left transition-all flex justify-between items-center ${
                                        checkedItems[item.id] 
                                        ? 'bg-[var(--primary-purple)] text-white' 
                                        : 'bg-black/40 hover:bg-black/60'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    <span className="font-semibold text-green-400">+{item.reward}</span>
                                </button>
                            ))}
                         </div>
                         
                         <button onClick={handleCheckinConfirm} className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 font-heading">Confirmar Check-in</button>
                         <button onClick={() => setScannedUser(null)} className="w-full mt-2 text-gray-400 hover:text-white py-2 rounded-lg">Fechar</button>
                     </div>
                 </div>
            )}
            
            {isHistoryVisible && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4" onClick={() => setIsHistoryVisible(false)}>
                    <div className="p-6 w-full max-w-sm ui-card" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-heading text-center mb-4">Histórico de Check-ins</h3>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {checkinHistory.length > 0 ? checkinHistory.map((record, index) => (
                                <div key={index} className="bg-black/40 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold">{record.userName}</p>
                                        <p className="font-bold text-green-400">+{record.totalReward} Dólares</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">{new Date(record.timestamp).toLocaleString()}</p>
                                    <ul className="text-sm list-disc list-inside">
                                        {record.checkedItems.map(item => <li key={item.id}>{item.label}</li>)}
                                    </ul>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 py-8">Nenhum check-in registrado.</p>
                            )}
                        </div>
                        <button onClick={() => setIsHistoryVisible(false)} className="w-full mt-4 btn-primary">Fechar</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InstructorDashboard;