
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import DashboardHeader from '../../components/DashboardHeader';
import { Role } from '../../types';
import { DollarSign, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import UnitIcon from '../../components/UnitIcon';

// Helper component for details
const DetailRow: React.FC<{ label: string, value?: string | number | null }> = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex flex-col sm:flex-row justify-between text-sm py-1.5 border-b border-[var(--border-color)]/20 last:border-b-0">
            <span className="font-semibold text-gray-300">{label}</span>
            <span className="text-gray-400 text-left sm:text-right">{value}</span>
        </div>
    );
};


const PathfinderListPage: React.FC = () => {
    const navigate = useNavigate();
    const { users } = useAppContext();
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

    const handleToggleExpand = (userId: string) => {
        setExpandedUserId(prevId => (prevId === userId ? null : userId));
    };

    const pathfinders = users.filter(u => u.role === Role.Pathfinder)
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

    return (
        <div className="min-h-screen pb-10">
            <DashboardHeader title="Lista de Desbravadores" onBack={() => navigate('/instructor')} />
            <main className="p-4 max-w-2xl mx-auto space-y-3">
                {pathfinders.map(user => {
                    const isExpanded = expandedUserId === user.id;
                    return (
                        <div key={user.id} className="ui-card p-3 animate-fade-in transition-all">
                            <button
                                onClick={() => handleToggleExpand(user.id)}
                                className="w-full flex items-center justify-between text-left"
                                aria-expanded={isExpanded}
                                aria-controls={`details-${user.id}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.fullName} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-heading text-lg">{user.fullName}</p>
                                            <UnitIcon unit={user.clubUnit} className="w-6 h-6 text-base"/>
                                        </div>
                                        <p className="text-sm text-green-400 flex items-center gap-1">
                                            <DollarSign size={14} /> {user.dollars}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-2 rounded-full text-[var(--accent-gray)]">
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </button>
                            {isExpanded && (
                                <div id={`details-${user.id}`} className="mt-4 pt-4 border-t border-[var(--border-color)]/50 space-y-1 animate-fade-in">
                                    <DetailRow label="E-mail" value={user.email} />
                                    <DetailRow label="Nascimento" value={new Date(user.dateOfBirth).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} />
                                    <DetailRow label="CPF" value={user.cpf} />
                                    <DetailRow label="Telefone" value={user.phone} />
                                    <DetailRow label="Endereço" value={user.address} />
                                    <DetailRow label="Nome da Mãe" value={user.motherName} />
                                    <DetailRow label="Nome do Pai" value={user.fatherName} />
                                    <DetailRow label="Contato de Emergência" value={user.emergencyContactName} />
                                    <DetailRow label="Telefone de Emergência" value={user.emergencyContactPhone} />
                                    <DetailRow label="Progresso (Pontos)" value={user.classProgress?.signatures} />

                                    <button
                                        onClick={() => navigate(`/profile/${user.id}`)}
                                        className="btn-secondary w-full !mt-4 flex items-center justify-center gap-2"
                                        aria-label={`Ver perfil completo de ${user.fullName}`}
                                    >
                                        <Eye size={18} /> Perfil Completo / Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {pathfinders.length === 0 && (
                     <div className="text-center text-gray-400 mt-16 animate-fade-in">
                        <p className="text-lg">Nenhum desbravador cadastrado.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PathfinderListPage;
