import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { 
  X, UserCircle, Palette, Star, Users, Shield, 
  Wifi, HelpCircle, LogOut, ChevronRight, ArrowLeft 
} from 'lucide-react';

const DRAWER_SECTIONS = [
  { id: 'profile', icon: <UserCircle size={20} />, label: 'Profile' },
  { id: 'customization', icon: <Palette size={20} />, label: 'Chat Customization' },
  { id: 'favourites', icon: <Star size={20} />, label: 'Favourites' },
  { id: 'groups', icon: <Users size={20} />, label: 'Groups' },
  { id: 'privacy', icon: <Shield size={20} />, label: 'Privacy & Security' },
  { id: 'datasaver', icon: <Wifi size={20} />, label: 'Data Saver' },
  { id: 'help', icon: <HelpCircle size={20} />, label: 'Help & Support' },
];

export default function DrawerPanel({ isOpen, onClose }) {
  const [activeView, setActiveView] = useState('main'); // 'main', 'profile', 'customization', etc.
  const { authUser, logout } = useAuthStore();
  const { theme, setTheme } = useSettingsStore();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const currentSection = DRAWER_SECTIONS.find(s => s.id === activeView);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer Body */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full sm:w-[380px] h-full bg-[#111111] flex flex-col border-l border-[#262626]"
          >
            {/* Header */}
            <div className="flex items-center px-4 py-6 border-b border-[#262626]">
              {activeView !== 'main' ? (
                <button 
                  onClick={() => setActiveView('main')}
                  className="p-2 mr-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={20} className="text-white" />
                </button>
              ) : null}
              
              <h2 className="text-lg font-semibold brand-font flex-1">
                {activeView === 'main' ? 'Settings' : currentSection?.label}
              </h2>

              <button 
                onClick={onClose}
                className="p-2 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              <AnimatePresence mode="wait">
                
                {/* HEAD VIEW */}
                {activeView === 'main' && (
                  <motion.div 
                    key="main"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    {/* User Mini Profile Header */}
                    <div className="p-6 flex items-center gap-4 border-b border-[#262626]">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-[#141414] border border-[#262626]">
                        <img 
                          src={authUser?.profilePic || "/avatar.png"} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold brand-font tracking-wide">{authUser?.fullName}</h3>
                        <p className="text-sm text-white/50">{authUser?.status || "Hey there! I am using Chatify."}</p>
                      </div>
                    </div>

                    {/* Nav Items */}
                    <div className="p-4 space-y-2 mt-2">
                      {DRAWER_SECTIONS.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setActiveView(section.id)}
                          className="w-full flex items-center justify-between p-4 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-all group"
                        >
                          <div className="flex items-center gap-4 transition-colors">
                            <div className="p-2 rounded-lg bg-[#141414] group-hover:bg-[#262626] transition-colors">
                              {section.icon}
                            </div>
                            <span className="font-medium text-[15px]">{section.label}</span>
                          </div>
                          <ChevronRight size={18} className="text-[#333] group-hover:text-[#a3a3a3] transition-colors" />
                        </button>
                      ))}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 mt-6 rounded-xl hover:bg-rose-500/10 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20 transition-colors">
                          <LogOut size={20} />
                        </div>
                        <span className="font-medium text-[15px] text-rose-500/80 group-hover:text-rose-500">Log out</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* PROFILE VIEW */}
                {activeView === 'profile' && (
                  <motion.div 
                    key="profile" initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                    className="p-6 flex flex-col items-center"
                  >
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-[#141414] border border-[#262626] mb-6 relative group cursor-pointer">
                      <img 
                        src={authUser?.profilePic || "/avatar.png"} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <UserCircle size={32} />
                      </div>
                    </div>
                    <div className="w-full space-y-6">
                      <div>
                        <label className="text-xs text-[#a3a3a3] uppercase tracking-widest font-semibold mb-2 block">Display Name</label>
                        <input type="text" defaultValue={authUser?.fullName} className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-white focus:outline-none focus:border-[#555]" />
                      </div>
                      <div>
                        <label className="text-xs text-[#a3a3a3] uppercase tracking-widest font-semibold mb-2 block">About</label>
                        <input type="text" defaultValue={authUser?.status || "Hey there! I am using Chatify."} className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-white focus:outline-none focus:border-[#555]" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CUSTOMIZATION VIEW */}
                {activeView === 'customization' && (
                  <motion.div 
                    key="customization" initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                    className="p-6"
                  >
                     <div className="space-y-8">
                        <div>
                          <h4 className="text-sm font-semibold text-[#a3a3a3] mb-4 uppercase tracking-wider">Premium Theme</h4>
                          <div className="grid grid-cols-2 gap-3">
                              {['Monochrome', 'Carbon', 'Obsidian', 'Midnight'].map(t => (
                                <button key={t} className="p-3 bg-[#141414] rounded-xl border border-[#262626] hover:border-[#555] hover:bg-[#1a1a1a] transition-all capitalize">
                                  {t}
                                </button>
                              ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#a3a3a3] mb-4 uppercase tracking-wider">Wallpapers</h4>
                          <div className="grid grid-cols-3 gap-3">
                              {[1, 2, 3].map(i => (
                                <div key={i} className={`h-24 rounded-lg border-2 ${i === 1 ? 'border-[#ffffff]' : 'border-transparent'} bg-[#141414] overflow-hidden cursor-pointer hover:border-[#555] flex items-center justify-center`}>
                                   <div className="w-full h-full bg-[#000000]"></div>
                                </div>
                              ))}
                          </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {/* DEFAULT FALLBACK FOR TBD VIEWS */}
                {!['main', 'profile', 'customization'].includes(activeView) && (
                  <motion.div 
                    key="fallback" initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                    className="p-6 flex flex-col items-center justify-center h-full text-center"
                  >
                     <div className="w-20 h-20 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mb-6 text-[#555]">
                       <Shield size={32} />
                     </div>
                     <h3 className="text-lg font-bold brand-font mb-2 text-white">Coming Soon</h3>
                     <p className="text-[#a3a3a3] text-sm max-w-[240px]">This premium feature is currently being developed.</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
