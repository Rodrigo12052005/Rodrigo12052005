
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, User, Bell, Trash2, Eye, EyeOff, Shield as PrivacyShield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SettingsSection: React.FC<{ title: string, children: React.ReactNode, icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold font-heading text-[var(--primary-purple)] flex items-center mb-4">
            {icon}
            <span className="ml-3">{title}</span>
        </h2>
        <div className="ui-card p-4">
            {children}
        </div>
    </div>
);

const SettingItem: React.FC<{ label: string, children: React.ReactNode, icon?: React.ReactNode }> = ({ label, children, icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)]/20 last:border-b-0">
        <div className="flex items-center">
            {icon && <span className="text-[var(--primary-purple)] mr-3">{icon}</span>}
            <label className="text-sm font-body">{label}</label>
        </div>
        <div>{children}</div>
    </div>
);


const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, updateUser, updatePassword } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
    });
    
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState('dark');
    
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                fullName: currentUser.fullName,
                email: currentUser.email,
            });
        }
    }, [currentUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        if (currentUser) {
            updateUser({
                ...currentUser,
                fullName: formData.fullName,
                email: formData.email,
            });
            setIsEditing(false);
            alert('Perfil atualizado com sucesso!');
        }
    };

    const handleCancel = () => {
        if (currentUser) {
            setFormData({
                fullName: currentUser.fullName,
                email: currentUser.email,
            });
        }
        setIsEditing(false);
    };

    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && currentUser) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({
                    ...currentUser,
                    profilePictureUrl: reader.result as string,
                });
                alert('Foto de perfil atualizada!');
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const handlePasswordModalClose = () => {
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordError('');
        setPasswordSuccess('');
    };
    
    const handlePasswordChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
    
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('As novas senhas não correspondem.');
            return;
        }
        if (!currentUser) {
            setPasswordError('Usuário não encontrado.');
            return;
        }
    
        const result = updatePassword(currentUser.id, passwordData.currentPassword, passwordData.newPassword);
    
        if (result.success) {
            setPasswordSuccess(result.message);
            setTimeout(() => {
                handlePasswordModalClose();
            }, 2000);
        } else {
            setPasswordError(result.message);
        }
    };

    return (
        <div className="min-h-screen font-body">
            <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center justify-between border-b border-[var(--border-color)]">
                <button 
                    onClick={() => navigate(-1)} 
                    className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] transition-colors p-2"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-heading">Configurações</h1>
                <div className="w-10"></div>
            </header>

            <main className="p-4 md:p-6 max-w-2xl mx-auto">
                <SettingsSection title="Idioma" icon={<Globe size={24} />}>
                    <SettingItem label="Idioma do Aplicativo">
                        <span className="text-gray-400 text-sm">Português (Brasil)</span>
                    </SettingItem>
                </SettingsSection>
                
                <SettingsSection title="Configurações de Perfil" icon={<User size={24} />}>
                     <div className="flex items-center justify-center mb-6">
                        <img 
                            src={currentUser?.profilePictureUrl || `https://i.pravatar.cc/150?u=${currentUser?.id}`} 
                            alt="Foto de Perfil" 
                            className="w-24 h-24 rounded-full border-4 border-[var(--primary-purple)]"
                        />
                    </div>
                    <div className="space-y-4">
                        <SettingItem label="Nome Completo">
                           {isEditing ? (
                                <input 
                                    id="fullName" 
                                    type="text" 
                                    value={formData.fullName} 
                                    onChange={handleInputChange} 
                                    className="form-input !py-1 !px-2 text-sm text-right bg-transparent w-48"
                                />
                           ) : (
                                <span className="text-gray-400 text-sm">{currentUser?.fullName || 'Usuário'}</span>
                           )}
                        </SettingItem>
                         <SettingItem label="E-mail">
                            {isEditing ? (
                                <input 
                                    id="email" 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    className="form-input !py-1 !px-2 text-sm text-right bg-transparent w-48"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">{currentUser?.email || 'email@example.com'}</span>
                            )}
                        </SettingItem>
                         <SettingItem label="Foto de Perfil">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleProfilePictureChange}
                                className="hidden"
                            />
                            <button onClick={triggerFileSelect} className="btn-secondary px-3 py-1 !rounded-md !text-xs">Alterar</button>
                        </SettingItem>
                         <SettingItem label="Alterar Senha">
                            <button onClick={() => setIsPasswordModalOpen(true)} className="btn-secondary px-3 py-1 !rounded-md !text-xs">Alterar</button>
                        </SettingItem>
                         <SettingItem label="Privacidade" icon={<PrivacyShield size={16}/>}>
                            <button onClick={() => alert('Funcionalidade de gerenciamento de privacidade em desenvolvimento.')} className="btn-secondary px-3 py-1 !rounded-md !text-xs">Gerenciar</button>
                        </SettingItem>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[var(--border-color)]/20">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} className="btn-secondary px-4 py-2 !rounded-md !text-sm">Cancelar</button>
                                <button onClick={handleSave} className="btn-primary px-4 py-2 !rounded-md !text-sm">Salvar Alterações</button>
                            </>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="btn-primary px-4 py-2 !rounded-md !text-sm">Editar Perfil</button>
                        )}
                    </div>
                </SettingsSection>

                <SettingsSection title="Preferências do App" icon={<Bell size={24} />}>
                    <div className="space-y-4">
                        <SettingItem label="Notificações">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--primary-purple)]/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-purple)]"></div>
                            </label>
                        </SettingItem>
                        <SettingItem label="Tema">
                             <div className="flex space-x-2 text-sm">
                                <button onClick={() => setTheme('dark')} className={`px-4 py-1 btn-secondary !rounded-md !text-xs ${theme === 'dark' ? '!bg-[var(--primary-purple)] !text-white font-bold' : ''}`}>Escuro</button>
                                <button disabled className="px-4 py-1 btn-secondary !rounded-md !text-xs opacity-50 cursor-not-allowed">Claro</button>
                            </div>
                        </SettingItem>
                    </div>
                </SettingsSection>

                <SettingsSection title="Avançado" icon={<Trash2 size={24} />}>
                    <button onClick={() => alert('Cache limpo!')} className="w-full text-left p-3 rounded-md hover:bg-[var(--primary-purple)]/10 flex items-center transition-colors -m-3">
                        <Trash2 size={16} className="mr-3 text-red-400"/> Limpar cache
                    </button>
                </SettingsSection>
            </main>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="w-full max-w-sm ui-card p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="font-heading text-2xl text-center mb-6 text-white">Alterar Senha</h3>
                        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                            <div className="password-container">
                                <input type={showCurrentPassword ? 'text' : 'password'} placeholder="Senha Atual" className="form-input pr-12" value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} required />
                                <div className="password-toggle-icon" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                            <div className="password-container">
                                <input type={showNewPassword ? 'text' : 'password'} placeholder="Nova Senha" className="form-input pr-12" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} required />
                                <div className="password-toggle-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                             <div className="password-container">
                                <input type={showConfirmNewPassword ? 'text' : 'password'} placeholder="Confirmar Nova Senha" className="form-input pr-12" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
                                <div className="password-toggle-icon" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                                    {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>

                            {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
                            {passwordSuccess && <p className="text-green-400 text-sm text-center">{passwordSuccess}</p>}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={handlePasswordModalClose} className="btn-secondary w-full">Cancelar</button>
                                <button type="submit" className="btn-primary w-full">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;