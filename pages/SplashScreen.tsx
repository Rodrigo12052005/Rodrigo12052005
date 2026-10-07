import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';

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
        <div className="relative min-h-screen flex flex-col items-center justify-center text-center p-4 overflow-hidden">
            
            <div className="animate-fade-in flex flex-col items-center">
                <h1 className="font-heading text-9xl text-[var(--primary-purple)]">STAHL</h1>
                <p className="font-body text-lg text-gray-300 mt-4 tracking-wide">
                    Sua jornada começa aqui.
                </p>
            </div>
           
            <div className="absolute bottom-20">
                 <div className="loading-bar">
                    <div className="loading-bar-inner"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;