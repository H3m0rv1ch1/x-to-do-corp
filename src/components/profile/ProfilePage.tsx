import React, { useMemo, useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi';
import { MdVerified } from 'react-icons/md';
import { type UserProfile, Page } from '@/types';
import { Avatar } from '@/components/ui';
import { TodoItem } from '@/components/todo';
import { EditProfileModal } from '@/components/modals';
import { useAppContext } from '@/hooks/useAppContext';

interface ProfilePageProps {
  userProfile: UserProfile;
  setPage: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, setPage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    todos,
    handleSaveProfile,
    handleToggleTodo, 
    handleDeleteTodo, 
    handleEditTodo, 
    handleToggleImportant, 
    handleToggleSubtask, 
    handleEditSubtask,
  } = useAppContext();

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [todos]);

  const bannerStyle = userProfile.bannerUrl
    ? { backgroundImage: `url(${userProfile.bannerUrl})` }
    : {};

  return (
    <div>
      <header className="sticky top-0 z-20 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md border-b border-[rgba(var(--border-primary-rgb))]">
        <div className="flex items-center space-x-4 p-2 sm:p-4 h-16">
          <button onClick={() => setPage('home')} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" aria-label="Go back">
            <HiArrowLeft className="w-5 h-5 text-[rgba(var(--foreground-primary-rgb))]" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[rgba(var(--foreground-primary-rgb))]">{userProfile.name}</h1>
            <p className="text-xs sm:text-sm text-[rgba(var(--foreground-secondary-rgb))]">{stats.total} Tasks</p>
          </div>
        </div>
      </header>

      <div>
        <div 
          className="h-36 sm:h-48 bg-[rgba(var(--background-tertiary-rgb))] bg-cover bg-center relative"
          style={bannerStyle}
        >
            {/* Banner Image */}
        </div>
        <div className="p-4 border-b border-[rgba(var(--border-primary-rgb))]">
            <div className="flex justify-between items-start">
                <div className="w-24 h-24 sm:w-30 sm:h-30 rounded-full -mt-12 sm:-mt-20 border-4 border-[rgba(var(--background-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] relative">
                     <Avatar imageUrl={userProfile.avatarUrl} />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="border border-[rgba(var(--border-secondary-rgb))] rounded-full px-4 py-1.5 font-bold hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors"
                >
                    Edit profile
                </button>
            </div>

            <div className="mt-2">
                <div className="flex flex-wrap items-center gap-x-1.5">
                    <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                    {userProfile.verificationType === 'user' && (
                        <MdVerified className="w-5 h-5 text-[rgba(var(--accent-rgb))] flex-shrink-0" />
                    )}
                    {userProfile.verificationType === 'business' && (
                        <MdVerified className="w-5 h-5 text-[rgba(var(--warning-rgb))] flex-shrink-0" />
                    )}
                    {userProfile.organizationAvatarUrl && (
                         <a href="#" title={userProfile.organization || 'Organization'} className="flex items-center flex-shrink-0" onClick={(e) => e.preventDefault()}>
                            <img src={userProfile.organizationAvatarUrl} alt={`${userProfile.organization || 'Organization'} logo`} className="w-5 h-5 rounded-sm object-cover" />
                        </a>
                    )}
                </div>
                <p className="text-[rgba(var(--foreground-secondary-rgb))]">{userProfile.username}</p>
            </div>
            
            <div className="mt-4 text-[rgba(var(--foreground-primary-rgb))]">
                <p>{userProfile.bio}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[rgba(var(--foreground-secondary-rgb))]">
                <span><span className="font-bold text-[rgba(var(--foreground-primary-rgb))]">{stats.total}</span> Total Tasks</span>
                <span><span className="font-bold text-[rgba(var(--foreground-primary-rgb))]">{stats.completed}</span> Completed</span>
                <span><span className="font-bold text-[rgba(var(--foreground-primary-rgb))]">{stats.pending}</span> Pending</span>
            </div>
        </div>
      </div>
      
      {isModalOpen && (
        <EditProfileModal 
            userProfile={userProfile}
            onSave={handleSaveProfile}
            onClose={() => setIsModalOpen(false)}
        />
      )}
      
      <div>
        {todos.map(todo => (
            <TodoItem
                key={todo.id}
                todo={todo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onEditTodo={handleEditTodo}
                onToggleImportant={handleToggleImportant}
                onToggleSubtask={handleToggleSubtask}
                onEditSubtask={handleEditSubtask}
            />
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;