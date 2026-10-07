import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import StahlLogo from './StahlLogo';
import { useAppContext } from '../context/AppContext';

interface DashboardHeaderProps {
  showSettings?: boolean;
  onBack?: () => void;
  title?: string;
  showStahlText?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ showSettings = false, onBack, title, showStahlText = false }) => {
  const navigate = useNavigate();
  const { logout } = useAppContext();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 p-3 md:p-4 flex items-center justify-between border-b border-white/10 bg-[#08090b]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.35)] relative overflow-hidden">
      <button 
        onClick={handleBack} 
        className="text-[var(--accent-gray)] hover:text-white transition-colors p-2"
        aria-label="Voltar"
      >
        <ArrowLeft size={24} />
      </button>
      {title ? (
        <h1 className="font-heading text-2xl text-white">{title}</h1>
      ) : showStahlText ? (
        <h1 className="font-heading text-4xl text-white">STAHL</h1>
      ) : (
        <StahlLogo className="h-10" />
      )}
      {showSettings ? (
        <button 
          className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] transition-colors p-2"
          aria-label="Configurações"
          onClick={() => navigate('/settings')}
        >
          <Settings size={24} />
        </button>
      ) : (
        <div className="w-10"></div> // Placeholder for alignment
      )}
    <div className="absolute left-0 bottom-0 h-[3px] w-24 bg-[var(--stahl-red)] shadow-[24px_0_0_var(--stahl-yellow),48px_0_0_var(--stahl-purple)]"></div>
    </header>
  );
};

export default DashboardHeader;