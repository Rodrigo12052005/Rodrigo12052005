
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, Edit3, Save, XCircle, DollarSign, Trophy, Fingerprint, KeyRound, Copy, UploadCloud, Eye, EyeOff } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import { useAppContext } from '../context/AppContext';
import StahlLogo from '../components/StahlLogo';
import { User as UserType, Role } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import UnitIcon from '../components/UnitIcon';

// Helper function to create a centered aspect crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const { currentUser, users, updateUser, updatePassword, isInitialized } = useAppContext();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<UserType>>({});
    
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const userToDisplay = useMemo(() => {
        if (userId) {
            return users.find(u => u.id === userId);
        }
        return currentUser;
    }, [userId, users, currentUser]);

    const isOwnProfile = !userId || (currentUser?.id === userToDisplay?.id);
    const canEdit = isOwnProfile || (currentUser?.role === Role.Instructor && userToDisplay?.role === Role.Pathfinder);

    useEffect(() => {
        if (userId && !userToDisplay && isInitialized) {
            navigate(-1);
        }
    }, [userId, userToDisplay, isInitialized, navigate]);

    useEffect(() => {
        if (userToDisplay) {
            setFormData(userToDisplay);
        }
    }, [userToDisplay]);

    if (!isInitialized) return <LoadingScreen />;
    if (!userToDisplay) {
        if (!currentUser) navigate('/login', { replace: true });
        return <LoadingScreen />;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        if (userToDisplay) {
            updateUser({ ...userToDisplay, ...formData });
            setIsEditing(false);
            alert('Perfil atualizado com sucesso!');
        }
    };
    
    const handleCancel = () => {
        setFormData(userToDisplay || {});
        setIsEditing(false);
    };
    
    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setIsCropModalOpen(true);
        }
    };
    
    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    };

    const handleSaveCrop = () => {
        if (!completedCrop || !imgRef.current) return;
        
        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const crop = completedCrop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
        const base64Image = canvas.toDataURL('image/jpeg');
        
        if (userToDisplay) {
            updateUser({ ...userToDisplay, profilePictureUrl: base64Image });
            alert('Foto de perfil atualizada!');
            setIsCropModalOpen(false);
            setImgSrc('');
        }
    };

    const calculateAge = (dateOfBirth: string): number => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleCopyId = () => {
        if (formData.id) {
            navigator.clipboard.writeText(formData.id);
            alert('ID copiado para a área de transferência!');
        }
    };

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
            setTimeout(() => handlePasswordModalClose(), 2000);
        } else {
            setPasswordError(result.message);
        }
    };

    return (
        <div className="min-h-screen pb-10">
            <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center justify-between border-b border-[var(--border-color)]">
                <button onClick={() => navigate(-1)} className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] p-2">
                    <ArrowLeft size={24} />
                </button>
                {userToDisplay.role === Role.Instructor ? (
                    <h1 className="font-heading text-2xl text-[var(--primary-purple)]">STAHL</h1>
                ) : (
                    <StahlLogo className="h-10" />
                )}
                <div className="w-10"></div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-6">
                <div className="ui-card p-4 flex flex-col items-center text-center">
                    <div className="relative">
                        <img 
                            src={formData.profilePictureUrl || `https://i.pravatar.cc/150?u=${userToDisplay.id}`} 
                            alt="Foto de Perfil"
                            className="w-28 h-28 rounded-full border-4 border-[var(--primary-purple)] object-cover"
                        />
                         {canEdit && (
                             <>
                                <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" id="profilePicUpload" />
                                <label htmlFor="profilePicUpload" className="absolute bottom-0 right-0 bg-[var(--primary-purple)] p-2 rounded-full text-white hover:bg-[var(--primary-purple-hover)] cursor-pointer">
                                    <Camera size={16}/>
                                </label>
                             </>
                         )}
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <h1 className="font-heading text-2xl">{formData.fullName}</h1>
                        {userToDisplay.role === Role.Pathfinder && <UnitIcon unit={formData.clubUnit} className="w-9 h-9 text-2xl" />}
                    </div>
                    <p className="text-gray-400">{formData.role}</p>
                     <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-black/30">
                        <span className="text-gray-300 text-sm font-mono tracking-wider">{formData.id}</span>
                        <button onClick={handleCopyId} className="text-[var(--primary-purple)] hover:text-[var(--primary-purple-hover)]">
                            <Copy size={16} />
                        </button>
                    </div>
                    <div className="mt-4 w-full flex justify-around border-t border-[var(--border-color)] pt-4">
                        <div className="flex items-center gap-2">
                            <DollarSign size={24} className="text-green-400"/>
                            <span className="font-bold text-2xl text-green-400">$ {formData.dollars}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Trophy size={18} className="text-cyan-400"/>
                            <span className="font-semibold">{calculateAge(formData.dateOfBirth || '')} Anos</span>
                        </div>
                    </div>
                </div>

                <div className="ui-card p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-heading text-xl text-gradient-purple flex items-center gap-2"><User /> Informações Pessoais</h2>
                        {canEdit && (
                            isEditing ? (
                                <div className="flex gap-2">
                                    <button onClick={handleCancel} className="btn-secondary !p-2"><XCircle size={20}/></button>
                                    <button onClick={handleSave} className="btn-primary !p-2"><Save size={20}/></button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="btn-primary !p-2"><Edit3 size={20}/></button>
                            )
                        )}
                    </div>
                    <div className="space-y-3">
                        <InfoRow label="Nome Completo" value={formData.fullName} id="fullName" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="Email" value={formData.email} id="email" type="email" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="Data de Nascimento" value={formData.dateOfBirth} id="dateOfBirth" type="date" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="CPF" value={formData.cpf} id="cpf" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="Telefone" value={formData.phone} id="phone" type="tel" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="CEP" value={formData.cep} id="cep" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="Endereço" value={formData.address} id="address" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="Nome da Mãe" value={formData.motherName} id="motherName" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="Nome do Pai" value={formData.fatherName} id="fatherName" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="Contato de Emergência" value={formData.emergencyContactName} id="emergencyContactName" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        <InfoRow label="Telefone de Emergência" value={formData.emergencyContactPhone} id="emergencyContactPhone" type="tel" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                        {userToDisplay.role === Role.Pathfinder && (
                          <InfoRow label="Unidade" value={formData.clubUnit} id="clubUnit" isEditing={isEditing && canEdit} onChange={handleInputChange} type="select">
                            <option value="">Selecione a Unidade</option>
                            <option value="Falcão">Falcão</option>
                            <option value="Águia">Águia</option>
                            <option value="Panda">Panda</option>
                            <option value="Puma">Puma</option>
                          </InfoRow>
                        )}
                        <InfoRow label="Gênero" value={formData.gender} id="gender" isEditing={isEditing && canEdit} onChange={handleInputChange} type="select">
                             <option value="">Selecione...</option>
                             <option value="Masculino">Masculino</option>
                             <option value="Feminino">Feminino</option>
                             <option value="Outro">Outro</option>
                             <option value="Prefiro não dizer">Prefiro não dizer</option>
                        </InfoRow>
                        <InfoRow label="Bio" value={formData.bio} id="bio" type="textarea" isEditing={isEditing && canEdit} onChange={handleInputChange}/>
                    </div>
                </div>
                
                 {isOwnProfile && (
                    <div className="ui-card p-4">
                         <h2 className="font-heading text-xl text-gradient-purple flex items-center gap-2 mb-4"><Shield /> Segurança e Privacidade</h2>
                         <div className="space-y-3">
                            <button onClick={() => setIsPasswordModalOpen(true)} className="w-full text-left p-3 rounded-md hover:bg-[var(--primary-purple)]/10 flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-3"><KeyRound size={18} /> Alterar Senha</div>
                                <span className="text-xs font-bold text-gray-400">›</span>
                            </button>
                             <button disabled className="w-full text-left p-3 rounded-md hover:bg-[var(--primary-purple)]/10 flex items-center justify-between transition-colors opacity-50 cursor-not-allowed">
                                <div className="flex items-center gap-3"><Fingerprint size={18} /> Login Biométrico</div>
                                <span className="text-xs font-bold text-green-400">Ativado</span>
                            </button>
                         </div>
                    </div>
                 )}
                 {isCropModalOpen && imgSrc && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99] p-4 animate-fade-in">
                        <div className="w-full max-w-md ui-card p-6" onClick={e => e.stopPropagation()}>
                            <h3 className="font-heading text-2xl text-center mb-6 text-white">Ajustar Foto de Perfil</h3>
                             <div className="flex justify-center">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop
                                    className="max-w-full max-h-[50vh]"
                                >
                                    <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
                                </ReactCrop>
                            </div>
                            <div className="flex gap-4 pt-6 mt-4 border-t border-[var(--border-color)]">
                                <button onClick={() => { setIsCropModalOpen(false); setImgSrc(''); }} className="btn-secondary w-full">Cancelar</button>
                                <button onClick={handleSaveCrop} className="btn-primary w-full" disabled={!completedCrop}>Salvar</button>
                            </div>
                        </div>
                    </div>
                )}
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
            </main>
        </div>
    );
};

interface InfoRowProps {
    label: string;
    value: any;
    id: string;
    isEditing: boolean;
    onChange: (e: React.ChangeEvent<any>) => void;
    type?: string;
    children?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, id, isEditing, onChange, type = 'text', children }) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-[var(--border-color)]/20 last:border-none">
        <label htmlFor={id} className="font-semibold text-sm text-gray-300 w-full sm:w-1/3">{label}</label>
        {isEditing ? (
            type === 'textarea' ? (
                 <textarea id={id} value={value || ''} onChange={onChange} className="form-input bg-black/50 w-full sm:w-2/3 text-sm"/>
            ) : type === 'select' ? (
                <select id={id} value={value || ''} onChange={onChange} className="form-input bg-black/50 w-full sm:w-2/3 text-sm">
                    {children}
                </select>
            ) : (
                <input id={id} type={type} value={value || ''} onChange={onChange} className="form-input bg-black/50 w-full sm:w-2/3 text-sm"/>
            )
        ) : (
            <span className="text-gray-400 text-sm w-full sm:w-2/3 text-left sm:text-right">{value || 'Não informado'}</span>
        )}
    </div>
);


export default ProfilePage;