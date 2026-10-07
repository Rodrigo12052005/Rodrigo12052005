import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';
import { User as UserIcon, Compass } from 'lucide-react';
import StahlLogo from '../components/StahlLogo';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, currentUser, setCurrentUser } = useAppContext();

  const handleRoleSelect = (role: Role) => {
    // Find a user that matches the selected role from the available users
    const userForRole = users.find(u => u.role === role); 
    
    // In a real app, you'd check if the currentUser has this role.
    // For this demo, we'll just switch to a user with that role.
    // If the current user already has the selected role, we don't need to do anything.
    if (currentUser && currentUser.role === role) {
        // No change needed, just navigate
    } else if (userForRole) {
        // If a user with that role exists, set them as current for the demo
        setCurrentUser(userForRole);
    } else if (currentUser) {
       // If no user with that role exists, update the current user's role for this session
       setCurrentUser({ ...currentUser, role });
    } else {
      // Should not happen if user is logged in
      navigate('/login');
      return;
    }


    switch (role) {
      case Role.Pathfinder:
        navigate('/pathfinder');
        break;
      case Role.Instructor:
        navigate('/instructor');
        break;
      case Role.Leader:
        navigate('/leader');
        break;
    }
  };

  const RoleButton: React.FC<{ role: Role, icon: React.ReactNode }> = ({ role, icon }) => (
    <button
      onClick={() => handleRoleSelect(role)}
      className="w-full max-w-sm ui-card p-8 text-center"
    >
      <div className="flex items-center justify-center mb-4 text-[var(--primary-purple)]">
        {icon}
      </div>
      <h2 className="font-heading text-3xl text-white">{role}</h2>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <StahlLogo className="w-40 h-40 mb-12" />
      <div className="space-y-6 w-full flex flex-col items-center">
        <RoleButton role={Role.Pathfinder} icon={<Compass size={48} />} />
        <RoleButton role={Role.Instructor} icon={<UserIcon size={48} />} />
        <RoleButton role={Role.Leader} icon={<span className="font-heading text-4xl">STAHL</span>} />
      </div>
    </div>
  );
};

export default RoleSelectionPage;