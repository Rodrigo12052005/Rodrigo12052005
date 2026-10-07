import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { registerUser, currentUser } = useAppContext();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        dateOfBirth: '',
        motherName: '',
        fatherName: '',
        cpf: '',
        cep: '',
        phone: '',
        clubUnit: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isInstructorCreating = currentUser?.role === Role.Instructor;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const validateForm = () => {
        const requiredFields: (keyof typeof formData)[] = ['fullName', 'email', 'password', 'age', 'dateOfBirth', 'motherName', 'fatherName', 'cpf', 'cep', 'phone', 'clubUnit'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                return 'Por favor, preencha todos os campos.';
            }
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            return 'Formato de e-mail inválido.';
        }
        if (formData.password.length < 6) {
            return 'A senha deve ter pelo menos 6 caracteres.';
        }
        if (formData.password !== formData.confirmPassword) {
            return 'As senhas não correspondem.';
        }
        const ageNum = parseInt(formData.age, 10);
        if (isNaN(ageNum) || ageNum <= 0) {
            return 'Idade inválida.';
        }
        return null;
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        const result = registerUser({
            ...formData,
            age: parseInt(formData.age, 10),
            role: Role.Pathfinder,
            achievements: [],
            classProgress: { signatures: 0, totalSignatures: 500, life: 100 },
            // FIX: The property for currency is 'dollars', not 'coins', according to the User type.
            dollars: 50,
            tasks: [],
        }, { loginAfterRegister: !isInstructorCreating });

        if (result.success) {
            if (isInstructorCreating) {
                alert('Desbravador cadastrado com sucesso!');
                navigate('/instructor');
            } else {
                navigate('/pathfinder');
            }
        } else {
            setError(result.message);
        }
    };
    
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 pt-16 bg-dark-bg">
            <button 
                onClick={() => navigate(-1)} 
                className="absolute top-4 left-4 text-[var(--accent-gray)] hover:text-[var(--primary-purple)] transition-colors p-2 z-10"
                aria-label="Voltar"
            >
                <ArrowLeft size={24} />
            </button>
            
            <h1 className="font-heading text-8xl text-[var(--primary-purple)] mb-4">STAHL</h1>

            <div className="w-full max-w-sm text-center">
                <h1 className="font-heading text-3xl mb-2 text-white">
                    {isInstructorCreating ? 'Cadastrar Desbravador' : 'Criar Conta'}
                </h1>
                <p className="font-body text-md text-gray-400 mb-6">
                    {isInstructorCreating ? 'Preencha os dados do novo membro.' : 'Comece sua jornada como Desbravador.'}
                </p>
            </div>

            <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
                <input id="fullName" type="text" value={formData.fullName} onChange={handleChange} className="form-input" placeholder="Nome Completo" required />
                <input id="email" type="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Email" required />
                <div className="password-container">
                    <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} className="form-input pr-12" placeholder="Senha" required />
                    <div className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                </div>
                 <div className="password-container">
                    <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} className="form-input pr-12" placeholder="Confirmar Senha" required />
                    <div className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                </div>
                <div className="flex gap-4">
                    <input id="age" type="number" value={formData.age} onChange={handleChange} className="form-input w-1/3 text-center" placeholder="Idade" required />
                    <input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className="form-input w-2/3" required />
                </div>
                <input id="motherName" type="text" value={formData.motherName} onChange={handleChange} className="form-input" placeholder="Nome da Mãe" required />
                <input id="fatherName" type="text" value={formData.fatherName} onChange={handleChange} className="form-input" placeholder="Nome do Pai" required />
                <input id="cpf" type="text" value={formData.cpf} onChange={handleChange} className="form-input" placeholder="CPF" required />
                <input id="cep" type="text" value={formData.cep} onChange={handleChange} className="form-input" placeholder="CEP" required />
                <input id="phone" type="tel" value={formData.phone} onChange={handleChange} className="form-input" placeholder="Telefone" required />
                
                <select id="clubUnit" value={formData.clubUnit} onChange={handleChange} className="form-input" required>
                  <option value="" disabled>Selecione a Unidade</option>
                  <option value="Falcão">Falcão</option>
                  <option value="Águia">Águia</option>
                  <option value="Panda">Panda</option>
                  <option value="Puma">Puma</option>
                </select>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button type="submit" className="btn-primary w-full text-lg py-3 !mt-6">
                    SALVAR
                </button>
            </form>
            {!isInstructorCreating && (
                <button onClick={() => navigate('/login')} className="mt-6 text-sm text-gray-400 hover:text-[var(--primary-purple)]">
                    Já tem uma conta? Conectar
                </button>
            )}
        </div>
    );
};

export default RegisterPage;