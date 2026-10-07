import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import InstallPWAButton from '../components/InstallPWAButton';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';
import { StahlMascot } from '../components/BrandAssets';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [instructorPassword, setInstructorPassword] = useState('');
  const [showInstructorPassword, setShowInstructorPassword] = useState(false);
  const [instructorError, setInstructorError] = useState('');
  
  const navigate = useNavigate();
  const { login, users, setCurrentUser } = useAppContext();

  const INSTRUCTOR_SECRET_PASSWORD = '976431';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);

    if (result.success && result.user) {
      switch (result.user.role) {
        case Role.Pathfinder:
          navigate('/pathfinder');
          break;
        case Role.Leader:
          navigate('/leader');
          break;
        default:
          setError('Tipo de usuário não suportado para login direto.');
      }
    } else {
      setError(result.message);
    }
  };

  const handleInstructorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setInstructorError('');

    if (instructorPassword === INSTRUCTOR_SECRET_PASSWORD) {
        const instructorUser = users.find(u => u.role === Role.Instructor);
        if (instructorUser) {
            setCurrentUser(instructorUser);
            navigate('/instructor');
        } else {
            setInstructorError('Nenhum usuário instrutor encontrado no sistema.');
        }
    } else {
        setInstructorError('Senha de acesso incorreta.');
    }
  };

  return (
    <div className="stahl-page min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-sm text-center mb-7">
        <div className="mascot-stage h-52 mb-1">
          <StahlMascot className="h-48 w-36 animate-mascot-sway relative z-10" />
        </div>
        <div className="stahl-brand-lockup">
          <h1 className="font-heading text-7xl text-white">STAHL</h1>
        </div>
        <div className="doodle-line mx-auto mt-2" />
        <h2 className="font-heading text-3xl mt-5 mb-2 text-white">BEM-VINDO!</h2>
        <p className="font-body text-sm text-gray-400">Entre na sua jornada.</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <div className="space-y-4">
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="form-input" 
            placeholder="E-mail" 
            required 
            aria-label="E-mail"
          />
          <div className="password-container">
            <input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="form-input pr-12" 
              placeholder="Senha" 
              required 
              aria-label="Senha"
            />
            <div className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

        <button type="submit" className="btn-primary w-full text-lg py-3 mt-6">
          ENTRAR
        </button>
        <InstallPWAButton />
        <button 
            type="button"
            onClick={() => setIsInstructorModalOpen(true)}
            className="btn-secondary w-full text-lg py-3 mt-4"
        >
            MODO INSTRUTOR
        </button>
      </form>
      
      <p className="mt-8 text-sm">
        <span className="text-gray-400">Não tem uma conta? </span>
        <Link to="/register" className="font-bold text-[var(--primary-purple)] hover:underline">
          Criar conta
        </Link>
      </p>

      {isInstructorModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="w-full max-w-sm ui-card p-6" onClick={e => e.stopPropagation()}>
                <h3 className="font-heading text-2xl text-center mb-6 text-white">Acesso Instrutor</h3>
                <form onSubmit={handleInstructorLogin} className="space-y-4">
                    <div className="password-container">
                        <input 
                            type={showInstructorPassword ? 'text' : 'password'} 
                            placeholder="Senha de Acesso" 
                            className="form-input pr-12" 
                            value={instructorPassword}
                            onChange={(e) => setInstructorPassword(e.target.value)}
                            required 
                        />
                        <div className="password-toggle-icon" onClick={() => setShowInstructorPassword(!showInstructorPassword)}>
                            {showInstructorPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </div>
                    </div>
                    
                    {instructorError && <p className="text-red-500 text-sm text-center">{instructorError}</p>}

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsInstructorModalOpen(false)} className="btn-secondary w-full">Cancelar</button>
                        <button type="submit" className="btn-primary w-full">Entrar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;