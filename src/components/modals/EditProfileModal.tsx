import React, { useState, useRef } from 'react';
import { HiX, HiPhotograph } from 'react-icons/hi';
import { HiOutlineCamera } from 'react-icons/hi2';
import { type UserProfile } from '@/types';

interface EditProfileModalProps {
  userProfile: UserProfile;
  onSave: (newProfile: UserProfile) => void;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ userProfile, onSave, onClose }) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const organizationAvatarInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.replace(/@/g, '');
    setEditedProfile(prev => ({ ...prev, username: `@${newUsername}` }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl' | 'organizationAvatarUrl') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(editedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-[rgba(var(--background-primary-rgb))] rounded-2xl shadow-lg w-full max-w-lg mx-4 text-[rgba(var(--foreground-primary-rgb))] transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(var(--border-primary-rgb))]">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
              <HiX className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Edit profile</h2>
          </div>
          <button onClick={handleSave} className="bg-[rgba(var(--foreground-primary-rgb))] text-[rgba(var(--background-primary-rgb))] font-bold px-4 py-1.5 rounded-full hover:opacity-90">
            Save
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Banner and Avatar */}
          <div className="relative">
            <div className="h-48 bg-[rgba(var(--background-tertiary-rgb))] rounded-lg relative bg-cover bg-center" style={{ backgroundImage: `url(${editedProfile.bannerUrl})` }}>
              <button 
                onClick={() => bannerInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
              >
                <HiOutlineCamera className="w-9 h-9 text-white" />
              </button>
              <input type="file" accept="image/*" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'bannerUrl')} className="sr-only" />
            </div>
            <div className="absolute left-4 -bottom-12 w-24 h-24 border-4 border-[rgba(var(--background-primary-rgb))] rounded-full bg-[rgba(var(--background-tertiary-rgb))] bg-cover bg-center" style={{ backgroundImage: `url(${editedProfile.avatarUrl})` }}>
               <button 
                onClick={() => avatarInputRef.current?.click()}
                className="w-full h-full rounded-full flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
              >
                <HiOutlineCamera className="w-9 h-9 text-white" />
              </button>
              <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatarUrl')} className="sr-only" />
            </div>
          </div>

          <div className="pt-14 space-y-4">
            {/* Form Fields */}
            <div className="border border-[rgba(var(--border-secondary-rgb))] rounded-md p-3 focus-within:border-[rgba(var(--accent-rgb))]">
              <label htmlFor="name" className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Name</label>
              <input 
                type="text" 
                id="name"
                name="name" 
                value={editedProfile.name} 
                onChange={handleInputChange} 
                className="w-full bg-transparent text-lg focus:outline-none"
              />
            </div>

             <div className="border border-[rgba(var(--border-secondary-rgb))] rounded-md p-3 focus-within:border-[rgba(var(--accent-rgb))]">
                <label htmlFor="username" className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Username</label>
                <div className="flex items-baseline">
                    <span className="text-lg text-[rgba(var(--foreground-secondary-rgb))]">@</span>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={editedProfile.username.startsWith('@') ? editedProfile.username.substring(1) : editedProfile.username}
                        onChange={handleUsernameChange}
                        className="w-full bg-transparent text-lg focus:outline-none"
                    />
                </div>
            </div>

            <div className="border border-[rgba(var(--border-secondary-rgb))] rounded-md p-3 focus-within:border-[rgba(var(--accent-rgb))]">
              <label htmlFor="bio" className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Bio</label>
              <textarea 
                id="bio"
                name="bio"
                value={editedProfile.bio} 
                onChange={handleInputChange} 
                rows={3}
                className="w-full bg-transparent text-lg focus:outline-none resize-none"
              />
            </div>
            
             <div className="border border-[rgba(var(--border-secondary-rgb))] rounded-md p-3 focus-within:border-[rgba(var(--accent-rgb))]">
                <label htmlFor="organization" className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Organization</label>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex-shrink-0 relative">
                    {editedProfile.organizationAvatarUrl ? (
                        <img src={editedProfile.organizationAvatarUrl} alt="Organization logo" className="w-full h-full rounded-md object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-md bg-[rgba(var(--background-tertiary-rgb))] flex items-center justify-center">
                            <HiPhotograph className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))]" />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => organizationAvatarInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity rounded-md"
                        aria-label="Change organization logo"
                    >
                        <HiOutlineCamera className="w-5 h-5 text-white" />
                    </button>
                    <input type="file" accept="image/*" ref={organizationAvatarInputRef} onChange={(e) => handleFileChange(e, 'organizationAvatarUrl')} className="sr-only" />
                    </div>
                    <input
                    type="text"
                    id="organization"
                    name="organization"
                    placeholder="e.g. X Corp"
                    value={editedProfile.organization || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-lg focus:outline-none"
                    />
                </div>
            </div>

             <div className="p-3 border border-[rgba(var(--border-secondary-rgb))] rounded-md">
                <label className="text-xs text-[rgba(var(--foreground-secondary-rgb))] mb-2 block">Verification Type</label>
                <div className="flex justify-between space-x-2">
                    <button onClick={() => setEditedProfile(p => ({...p, verificationType: 'none'}))} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${editedProfile.verificationType === 'none' ? 'bg-[rgba(var(--foreground-secondary-rgb))] text-[rgba(var(--background-primary-rgb))] ring-2 ring-[rgba(var(--foreground-secondary-rgb))]' : 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--border-secondary-rgb))]'}`}>
                        None
                    </button>
                    <button onClick={() => setEditedProfile(p => ({...p, verificationType: 'user'}))} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${editedProfile.verificationType === 'user' ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] ring-2 ring-[rgba(var(--accent-rgb))]' : 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--border-secondary-rgb))]'}`}>
                        User
                    </button>
                     <button onClick={() => setEditedProfile(p => ({...p, verificationType: 'business'}))} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${editedProfile.verificationType === 'business' ? 'bg-[rgba(var(--warning-rgb))] text-black ring-2 ring-[rgba(var(--warning-rgb))]' : 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--border-secondary-rgb))]'}`}>
                        Business
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;