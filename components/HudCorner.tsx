import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { DollarSign, Trophy } from 'lucide-react';
import { Role } from '../types';

const HudCorner: React.FC = () => {
    const { currentUser, users } = useAppContext();

    const pathfinderRank = useMemo(() => {
        if (!currentUser || !users) return 0;
        
        const pathfinderRanking = users
            .filter(u => u.role === Role.Pathfinder && u.classProgress)
            .sort((a, b) => (b.classProgress?.signatures ?? 0) - (a.classProgress?.signatures ?? 0));

        const rankIndex = pathfinderRanking.findIndex(u => u.id === currentUser.id);
        
        return rankIndex !== -1 ? rankIndex + 1 : 0;
    }, [currentUser, users]);

    if (!currentUser || currentUser.role !== Role.Pathfinder) {
        return null;
    }

    return (
        <div className="fixed top-[70px] right-4 z-40 animate-fade-in">
            <div className="ui-card flex items-center space-x-4 p-2 px-3 bg-[var(--card-bg)]/80 backdrop-blur-sm shadow-lg">
                <div className="flex items-center space-x-2">
                    <DollarSign size={20} className="text-green-400" />
                    <span className="font-heading text-lg text-green-400">{currentUser.dollars ?? 0}</span>
                </div>
                {pathfinderRank > 0 && (
                    <>
                        <div className="w-px h-6 bg-[var(--border-color)]"></div>
                        <div className="flex items-center space-x-2">
                            <Trophy size={20} className="text-cyan-400" />
                            <span className="font-heading text-lg text-cyan-400">{pathfinderRank}º</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HudCorner;