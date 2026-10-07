import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';
import { StahlMascot } from '../components/BrandAssets';

const SplashScreen: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();

    useEffect(() => {
        // Automatically navigate after a short delay to show the splash screen
        const navigationTimer = setTimeout(() => {
            if (currentUser) {
                switch (currentUser.role) {
                    case Role.Pathfinder:
                        navigate('/pathfinder', { replace: true });
                        break;
                    case Role.Instructor:
                        navigate('/instructor', { replace: true });
                        break;
                    case Role.Leader:
                        navigate('/leader', { replace: true });
                        break;
                    default:
                        navigate('/login', { replace: true });
                }
            } else {
                navigate('/login', { replace: true });
            }
        }, 2500); // 2.5 seconds delay

        // Cleanup the timer if the component unmounts
        return () => clearTimeout(navigationTimer);
    }, [currentUser, navigate]);

    return (
        <div className="stahl-page relative min-h-screen flex flex-col items-center justify-center text-center p-4 overflow-hidden">
          <div className="absolute top-8 left-8 w-16 h-2 bg-[var(--stahl-red)] rotate-[-4deg]" />
          <div className="absolute top-12 left-24 w-8 h-2 bg-[var(--stahl-lime)] rotate-[5deg]" />
          <div className="animate-fade-in flex flex-col items-center">
            <div className="mascot-stage h-72 w-56 mb-2">
              <StahlMascot className="animate-mascot-sway h-64 w-48 relative z-10" />
            </div>
            <div className="stahl-brand-lockup">
              <h1 className="font-heading text-8xl text-white">STAHL</h1>
            </div>
            <div className="doodle-line mt-3" />
            <p className="font-body text-sm text-gray-300 mt-5 tracking-[.22em] uppercase">
              Sua jornada começa aqui.
            </p>
          </div>
          <div className="absolute bottom-16 flex flex-col items-center gap-3">
            <span className="font-heading text-xs tracking-[.18em] text-gray-500">INICIALIZANDO SISTEMA</span>
            <div className="loading-bar"><div className="loading-bar-inner"></div></div>
          </div>
        </div>
    );
};

export default SplashScreen;