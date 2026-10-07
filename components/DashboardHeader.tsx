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
    <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center justify-between border-b border-[var(--border-color)]">
      <button 
        onClick={handleBack} 
        className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] transition-colors p-2"
        aria-label="Voltar"
      >
        <ArrowLeft size={24} />
      </button>
      {title ? (
        <h1 className="font-heading text-2xl text-[var(--primary-purple)]">{title}</h1>
      ) : showStahlText ? (
        <h1 className="font-heading text-4xl text-[var(--primary-purple)]">STAHL</h1>
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
    </header>
  );
};

export default DashboardHeader;