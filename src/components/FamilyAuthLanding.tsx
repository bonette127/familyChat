import React, { useState } from 'react';
import { 
  Shield, 
  Crown, 
  Users, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Mail, 
  User, 
  IdCard, 
  Calendar, 
  Baby, 
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Building
} from 'lucide-react';
import { FamilyMember, SecurityAuditLog } from '../types/family';

interface FamilyAuthLandingProps {
  onLoginMember: (memberId: string) => void;
  onLoginWithCredentials: (email: string, pass: string) => boolean;
  onRegisterFamilyHead: (data: {
    name: string;
    email: string;
    password: string;
    age: number;
    nationalIdNumber: string;
    hasChildren: boolean;
    childrenCount: number;
    familyName: string;
    familyRole: string;
  }) => void;
  existingMembers: FamilyMember[];
  securityLogs: SecurityAuditLog[];
}

export const FamilyAuthLanding: React.FC<FamilyAuthLandingProps> = ({
  onLoginMember,
  onLoginWithCredentials,
  onRegisterFamilyHead,
  existingMembers,
  securityLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register_head' | 'superadmin'>('signin');
  
  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Family Head State (Criteria: 25+, National ID, Has Children)
  const [headName, setHeadName] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [headPassword, setHeadPassword] = useState('');
  const [headAge, setHeadAge] = useState<number | ''>(32);
  const [nationalId, setNationalId] = useState('');
  const [hasChildren, setHasChildren] = useState(true);
  const [childrenCount, setChildrenCount] = useState<number | ''>(2);
  const [familyNameInput, setFamilyNameInput] = useState('');
  const [familyRole, setFamilyRole] = useState('Mother');
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Super Admin view state
  const [superAdminEmail, setSuperAdminEmail] = useState('kibondoqueenmary2022@gmail.com');
  const [superAdminPass, setSuperAdminPass] = useState('admin');
  const [superAdminError, setSuperAdminError] = useState<string | null>(null);

  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = onLoginWithCredentials(loginEmail.trim(), loginPassword);
    if (!success) {
      setLoginError('Invalid email or password. Please verify your credentials or use the Quick Test login.');
    }
  };

  // Register Head Handler with Strict Criteria
  const handleRegisterHeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    // Criteria 1: Age over 25
    if (typeof headAge !== 'number' || headAge < 25) {
      setRegisterError('Eligibility Requirement: The Head of Family must be at least 25 years old.');
      return;
    }

    // Criteria 2: National ID possessed
    if (!nationalId.trim() || nationalId.trim().length < 5) {
      setRegisterError('Eligibility Requirement: A valid National ID / Government verification number is required.');
      return;
    }

    // Criteria 3: Has children (representing a lineage branch)
    if (!hasChildren || (typeof childrenCount === 'number' && childrenCount < 1)) {
      setRegisterError('Eligibility Requirement: To register as a Family Head Admin, you must represent a family branch with children.');
      return;
    }

    if (!headName.trim() || !headEmail.trim() || !headPassword.trim()) {
      setRegisterError('Please fill in all required name, email, and password fields.');
      return;
    }

    onRegisterFamilyHead({
      name: headName.trim(),
      email: headEmail.trim().toLowerCase(),
      password: headPassword,
      age: headAge,
      nationalIdNumber: nationalId.trim().toUpperCase(),
      hasChildren: true,
      childrenCount: Number(childrenCount) || 1,
      familyName: familyNameInput.trim() || `${headName.trim()}'s Lineage`,
      familyRole,
    });
  };

  const handleSuperAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSuperAdminError(null);
    const success = onLoginWithCredentials(superAdminEmail.trim(), superAdminPass);
    if (!success) {
      setSuperAdminError('Super Admin credentials invalid.');
    }
  };

  const adminMember = existingMembers.find((m) => m.isAdmin || m.isSuperAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Branding */}
      <header className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
            🌳
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
              <span>Kinfolk Lineage</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Multi-Generational Hub
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Private generational lineage, milestone celebrations & heartfelt conversations
            </p>
          </div>
        </div>

        {/* Quick Test Drive Button for Instant User Evaluation */}
        {adminMember && (
          <button
            onClick={() => onLoginMember(adminMember.id)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/25 transition-all active:scale-95"
            title="Instantly enter as Family Head Admin (Mary) to test features"
          >
            <span>⚡ Quick Enter as {adminMember.name} (Admin)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12 flex-1 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Hero: Lineage Architecture & Purpose */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pure Family Space • Zero Clutter • Zero Ads</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Connecting Lineages from the Oldest Generation to the Youngest.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            A private family realm dedicated to deep, meaningful connection. Celebrate upcoming weddings, organize milestone birthdays, preserve generational wisdom, and keep the lineage united.
          </p>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm font-bold">
                💍
              </div>
              <h3 className="text-xs font-bold text-white">Milestone Celebrations</h3>
              <p className="text-[11px] text-slate-400">
                Weddings, graduations, and anniversaries. Everyone stays updated and helps coordinate.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                🛡️
              </div>
              <h3 className="text-xs font-bold text-white">Verified Family Heads</h3>
              <p className="text-[11px] text-slate-400">
                Lineage branches registered by verified parents & elders (Age 25+, National ID).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                👑
              </div>
              <h3 className="text-xs font-bold text-white">Super Admin Governance</h3>
              <p className="text-[11px] text-slate-400">
                Oversees all lineage branches with the authority to audit and remove rogue admins.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold">
                🟢
              </div>
              <h3 className="text-xs font-bold text-white">Live Presence</h3>
              <p className="text-[11px] text-slate-400">
                Crystal-clear online & offline indicators so you know who is currently in the living room.
              </p>
            </div>
          </div>
        </div>

        {/* Right Portal Card: Auth Modes */}
        <div className="w-full lg:w-[460px] bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-slate-950/80 p-1 mb-6 border border-white/10">
            <button
              onClick={() => {
                setActiveTab('signin');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'signin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Member Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register_head');
                setRegisterError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register_head'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Family Head
            </button>
            <button
              onClick={() => {
                setActiveTab('superadmin');
                setSuperAdminError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'superadmin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Super Admin Lineage Oversight"
            >
              <Crown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TAB 1: Member Sign In */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Sign In to Family Lineage</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your credentials provided by your Family Head
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="kibondoqueenmary2022@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Enter Family Hearth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Instant Fill For Testing */}
              <div className="pt-3 border-t border-white/10 text-center">
                <p className="text-[11px] text-slate-400 mb-2">Testing credentials:</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('kibondoqueenmary2022@gmail.com');
                    setLoginPassword('admin');
                  }}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400 text-xs font-mono transition-colors"
                >
                  Fill Mary (Admin): kibondoqueenmary2022@gmail.com / admin
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Register Family Head (Age 25+, National ID, Has Children) */}
          {activeTab === 'register_head' && (
            <form onSubmit={handleRegisterHeadSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Register as Family Head Admin</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Establishes a new lineage branch. Strict verification criteria apply.
                </p>
              </div>

              {registerError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* Requirement Checklist Badges */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-1 text-[11px]">
                <p className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                  Family Head Eligibility Criteria:
                </p>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${typeof headAge === 'number' && headAge >= 25 ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>Age 25+ (Current: {headAge || 0} yrs)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${nationalId.trim().length >= 5 ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>National ID / Official Citizen Verification</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasChildren ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>Has children & represents lineage branch</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mary Kibondo"
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Your Age (Must be 25+) *
                  </label>
                  <input
                    type="number"
                    min={25}
                    max={120}
                    required
                    value={headAge}
                    onChange={(e) => setHeadAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  National ID / Government Verification Number *
                </label>
                <div className="relative">
                  <IdCard className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. NAT-ID-948102-K"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="mary@kinfolk.family"
                    value={headEmail}
                    onChange={(e) => setHeadEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Admin Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={headPassword}
                    onChange={(e) => setHeadPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Children & Lineage confirmation */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasChildren}
                    onChange={(e) => setHasChildren(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-white font-medium">
                    I have children & represent a family branch
                  </span>
                </label>

                {hasChildren && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        Number of Children
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1 text-xs bg-slate-950 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        Your Family Role
                      </label>
                      <select
                        value={familyRole}
                        onChange={(e) => setFamilyRole(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-slate-950 border border-white/10 rounded-lg text-white"
                      >
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Grandmother">Grandmother</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Family Elder">Family Elder</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Family Branch Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Central Household Lineage"
                  value={familyNameInput}
                  onChange={(e) => setFamilyNameInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Verify & Register as Family Head</span>
              </button>
            </form>
          )}

          {/* TAB 3: Super Admin Governance Portal */}
          {activeTab === 'superadmin' && (
            <form onSubmit={handleSuperAdminSignIn} className="space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Super Admin Governance</h3>
                  <p className="text-xs text-slate-400">
                    Oversees all lineage branches and maintains integrity
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                Super Admins possess root governance over the entire platform, with the authority to audit conduct and <strong>remove any family admin who violates trust or makes mistakes</strong>.
              </div>

              {superAdminError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{superAdminError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Super Admin Email
                </label>
                <input
                  type="email"
                  value={superAdminEmail}
                  onChange={(e) => setSuperAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Super Admin Password
                </label>
                <input
                  type="password"
                  value={superAdminPass}
                  onChange={(e) => setSuperAdminPass(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-white/10 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Enter Super Admin Portal</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/10 text-center text-xs text-slate-500">
        Kinfolk Expansive Lineage Hub • Connecting generations with dignity, privacy, and shared celebration.
      </footer>
    </div>
  );
};
