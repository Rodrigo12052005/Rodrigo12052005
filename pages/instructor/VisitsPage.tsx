import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import DashboardHeader from '../../components/DashboardHeader';
import { Role } from '../../types';
import { UserPlus, Calendar, Phone, User as UserIcon } from 'lucide-react';

const VisitsPage: React.FC = () => {
    const navigate = useNavigate();
    const { users, visits, addVisit } = useAppContext();
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorPhone: '',
        invitedById: '',
        visitDate: new Date().toISOString().split('T')[0], // Default to today
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const pathfinders = users.filter(u => u.role === Role.Pathfinder);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.visitorName || !formData.invitedById || !formData.visitDate) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const invitedByPathfinder = pathfinders.find(p => p.id === formData.invitedById);
        if (!invitedByPathfinder) {
            setError('Desbravador que convidou não foi encontrado.');
            return;
        }

        const result = addVisit({
            ...formData,
            invitedByName: invitedByPathfinder.fullName,
        });
        
        if (result.success) {
            setSuccess(result.message);
            setFormData({ // Reset form
                visitorName: '',
                visitorPhone: '',
                invitedById: '',
                visitDate: new Date().toISOString().split('T')[0],
            });
            setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen pb-10">
            <DashboardHeader title="Controle de Visitas" onBack={() => navigate('/instructor')} />
            <main className="p-4 max-w-2xl mx-auto space-y-6">
                
                {/* Registration Form */}
                <section className="ui-card p-6 animate-fade-in">
                    <h2 className="font-heading text-xl mb-4 text-gradient-purple flex items-center gap-2">
                        <UserPlus /> Registrar Nova Visita
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="visitorName" className="block text-sm font-medium text-gray-300 mb-1">Nome do Visitante</label>
                            <input id="visitorName" type="text" value={formData.visitorName} onChange={handleChange} className="form-input" placeholder="Nome completo" required />
                        </div>
                        <div>
                            <label htmlFor="visitorPhone" className="block text-sm font-medium text-gray-300 mb-1">Telefone do Visitante (Opcional)</label>
                            <input id="visitorPhone" type="tel" value={formData.visitorPhone} onChange={handleChange} className="form-input" placeholder="(00) 90000-0000" />
                        </div>
                        <div>
                            <label htmlFor="invitedById" className="block text-sm font-medium text-gray-300 mb-1">Convidado por</label>
                            <select id="invitedById" value={formData.invitedById} onChange={handleChange} className="form-input" required>
                                <option value="" disabled>Selecione um Desbravador</option>
                                {pathfinders.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="visitDate" className="block text-sm font-medium text-gray-300 mb-1">Data da Visita</label>
                            <input id="visitDate" type="date" value={formData.visitDate} onChange={handleChange} className="form-input" required />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {success && <p className="text-green-400 text-sm text-center">{success}</p>}

                        <button type="submit" className="btn-primary w-full !mt-6">Registrar</button>
                    </form>
                </section>

                {/* Visit History */}
                <section className="ui-card p-4 animate-fade-in">
                     <h2 className="font-heading text-xl mb-4 text-gradient-purple flex items-center gap-2">
                        <Calendar /> Histórico de Visitas
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {visits.length > 0 ? visits.map(visit => (
                            <div key={visit.id} className="bg-black/40 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-heading text-lg">{visit.visitorName}</p>
                                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                            <UserIcon size={14} /> Convidado por: {visit.invitedByName}
                                        </p>
                                        {visit.visitorPhone && (
                                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                                <Phone size={14} /> {visit.visitorPhone}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 whitespace-nowrap">{new Date(visit.visitDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 py-8">Nenhuma visita registrada ainda.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default VisitsPage;