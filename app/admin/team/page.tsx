"use client";

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { MessageSquare, X, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import CommunicationModal from '@/components/CommunicationModal';



const initialMockTeam = [
  {
    id: 1,
    name: 'Luca Rossi',
    email: 'luca@elcasa.com',
    role: 'Super User',
    projects: ['Ristrutturazione Via Roma 12', 'Via Torino 4'],
    progress: 82,
  },
  {
    id: 2,
    name: 'Giulia Bianchi',
    email: 'giulia@elcasa.com',
    role: 'Project Manager',
    projects: ['Via Torino 4'],
    progress: 54,
  },
  {
    id: 3,
    name: 'Marco Verdi',
    email: 'marco@elcasa.com',
    role: 'User',
    projects: ['Ristrutturazione Via Roma 12'],
    progress: 23,
  },
];

export default function TeamManagementPage() {
  const { t } = useLanguage();
  const [team, setTeam] = useState(initialMockTeam);

  const [expandedMemberId, setExpandedMemberId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [commModalTarget, setCommModalTarget] = useState<{ name: string; id: number } | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [constructionFunction, setConstructionFunction] = useState('Project Manager');
  const [permissionRole, setPermissionRole] = useState('View Only');
  const [avatarColor, setAvatarColor] = useState('[#FFB800]');
  const [featurePermissions, setFeaturePermissions] = useState({
    submitPhotos: false,
    addNotes: false,
    uploadInvoices: false,
    uploadBlueprints: false,
  });

  type PermissionKey = 'submitPhotos' | 'addNotes' | 'uploadInvoices' | 'uploadBlueprints';

  const handlePermissionToggle = (key: PermissionKey) => {

    setFeaturePermissions((prev) => ({

      ...prev,
      [key]: !prev[key],
    }));
  };

  const isFormValid = () => {
    return (
      fullName.trim() !== '' &&
      email.trim() !== '' &&
      phone.trim() !== '' &&
      constructionFunction !== '' &&
      permissionRole !== ''
    );
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    const profileData = {
      fullName,
      email,
      phone,
      constructionFunction,
      permissionRole,
      avatarColor,
      featurePermissions,
    };

    console.log('New Team Member Profile:', profileData);

    const newMember = {
      id: team.length + 1,
      name: fullName,
      email,
      role: permissionRole === 'Super User' ? 'Super User' : 'Project Manager',
      projects: [],
      progress: 0,
    };

    setTeam([...team, newMember]);

    setFullName('');
    setEmail('');
    setPhone('');
    setConstructionFunction('Project Manager');
    setPermissionRole('View Only');
    setAvatarColor('[#FFB800]');
    setFeaturePermissions({
      submitPhotos: false,
      addNotes: false,
      uploadInvoices: false,
      uploadBlueprints: false,
    });
    setIsModalOpen(false);
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 4000);
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setConstructionFunction('Project Manager');
    setPermissionRole('View Only');
    setAvatarColor('[#FFB800]');
    setFeaturePermissions({
      submitPhotos: false,
      addNotes: false,
      uploadInvoices: false,
      uploadBlueprints: false,
    });
    setIsModalOpen(false);
    setShowCancelConfirm(false);
  };

  const keepFormOpen = () => {
    setShowCancelConfirm(false);
  };

  const formIsValid = isFormValid();

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#131313] dark:text-white">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen bg-white dark:bg-[#131313] p-6 pt-20 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">

            <h1 className="mt-3 text-4xl font-black tracking-tight">Team Management</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-[#8e8e8e]">
              {t('teamDescriptionText')}
            </p>

          </header>

          <div className="flex items-center justify-between mb-6">
            <div />
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#FFB800] text-neutral-950 font-bold px-4 py-2.5 rounded-xl shadow-md hover:brightness-95 transition-all"
            >
              + Create Member Profile
            </button>
          </div>

          <section className="bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="grid grid-cols-1 gap-4">
              {team.map((m) => (
                <div
                  key={m.id}
                  className="relative bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-200"
                >
                  {/* Left column: always visible (mobile + desktop) */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-[#1c1b1b] flex items-center justify-center text-xl font-bold text-[#FFB800]">
                      {m.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{m.name}</p>
                      <p className="text-xs text-zinc-600 dark:text-[#8e8e8e]">{m.email}</p>

                      <div className="mt-2">
                        {m.role === 'Super User' && (
                          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Super User
                          </span>
                        )}
                        {m.role === 'Project Manager' && (
                          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20">
                            Project Manager
                          </span>
                        )}
                        {m.role === 'User' && (
                          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-neutral-800/10 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                            User
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile trigger element */}
                  <div className="absolute right-4 top-5 lg:hidden flex items-center gap-2">
                    <button
                      onClick={() => setExpandedMemberId(expandedMemberId === m.id ? null : m.id)}
                      aria-label={expandedMemberId === m.id ? 'Collapse member details' : 'Expand member details'}
                      className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800/40 transition"
                    >
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-600 dark:text-[#8e8e8e] transition-transform duration-200 ${expandedMemberId === m.id ? 'rotate-180 text-[#FFB800]' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Collapsible accordion drawer (mobile hides by default, desktop always open) */}
                  <div
                    onClick={() => setExpandedMemberId(expandedMemberId === m.id ? null : m.id)}
                    className={`mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4 lg:mt-0 lg:pt-0 lg:border-none lg:flex lg:items-center lg:gap-8 lg:space-y-0 ${expandedMemberId === m.id ? 'block' : 'hidden lg:flex'}`}
                  >
                    {/* Assigned Projects + Progress */}
                    <div className="flex-1">
                      <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                        <span className="text-xs text-zinc-600 dark:text-[#8e8e8e]">Assigned Projects: </span>
                        <span className="ml-2 inline-flex gap-2 flex-wrap">
                          {m.projects.length > 0 ? (
                            m.projects.map((p, idx) => (
                              <Link
                                key={idx}
                                href="/admin/cases"
                                className="text-sm text-zinc-800 dark:text-zinc-200 break-words line-clamp-2 max-w-full underline underline-offset-2"
                              >
                                {p}
                              </Link>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-600 dark:text-[#8e8e8e] italic">None assigned</span>
                          )}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div className="h-2 bg-emerald-500" style={{ width: `${m.progress}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-[#8e8e8e]">
                          {m.progress}% {t('completedLabel')}
                        </p>

                      </div>
                    </div>

                    {/* Message action */}
                    <div className="flex items-center">
                      <button
                        onClick={() => setCommModalTarget({ name: m.name, id: m.id })}
                        className="w-full lg:w-auto bg-[#FFB800]/10 hover:bg-[#FFB800] text-[#FFB800] hover:text-neutral-950 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 border border-[#FFB800]/20"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ──────────────── Centered Modal: Member Profile ──────────────── */}
      {isModalOpen && (
        <>
          <div
            onClick={handleCancelClick}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-50 pointer-events-none">
            <div className="relative w-full max-w-lg bg-zinc-50 dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col shadow-2xl shadow-black max-h-[90vh] pointer-events-auto">

              {/* ─── Modal Header ─── */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">New Member</h2>
                <button
                  onClick={handleCancelClick}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800/40 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-zinc-600 dark:text-[#8e8e8e] hover:text-zinc-900 dark:hover:text-white" />
                </button>
              </div>

              {/* ─── Scrollable Form Body ─── */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                <div className="space-y-4">
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] uppercase block">Contact Information</label>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-2 block">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Marco Rossi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-2 block">Email Address</label>
                    <input
                      type="email"
                      placeholder="marco@elcasa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-2 block">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+39 123 456 7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] uppercase block">Professional Role</label>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-2 block">Construction Field Function</label>
                    <select
                      value={constructionFunction}
                      onChange={(e) => setConstructionFunction(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all appearance-none cursor-pointer"
                    >
                      <option>Project Manager</option>
                      <option>Supplier</option>
                      <option>Architect</option>
                      <option>Engineer</option>
                      <option>Technician</option>
                      <option>Secretary</option>
                      <option>Project Coordinator</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] uppercase block">System Access & Permissions</label>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] mb-2 block">System Permission Role</label>
                    <select
                      value={permissionRole}
                      onChange={(e) => setPermissionRole(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all appearance-none cursor-pointer"
                    >
                      <option>Super User</option>
                      <option>Modify Assigned Projects</option>
                      <option>View Only</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] uppercase block mb-3">Granular Feature Permissions</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handlePermissionToggle('submitPhotos')}
                        className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                          featurePermissions.submitPhotos
                            ? 'border-[#FFB800]/40 bg-[#FFB800]/5 text-[#FFB800]'
                            : 'border-zinc-200 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={featurePermissions.submitPhotos}
                          onChange={() => handlePermissionToggle('submitPhotos')}
                          className="w-4 h-4 rounded accent-[#FFB800] cursor-pointer"
                        />
                        <span className="text-sm font-medium">Submit Project Photos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermissionToggle('addNotes')}
                        className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                          featurePermissions.addNotes
                            ? 'border-[#FFB800]/40 bg-[#FFB800]/5 text-[#FFB800]'
                            : 'border-zinc-200 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={featurePermissions.addNotes}
                          onChange={() => handlePermissionToggle('addNotes')}
                          className="w-4 h-4 rounded accent-[#FFB800] cursor-pointer"
                        />
                        <span className="text-sm font-medium">Add Progress Notes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermissionToggle('uploadInvoices')}
                        className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                          featurePermissions.uploadInvoices
                            ? 'border-[#FFB800]/40 bg-[#FFB800]/5 text-[#FFB800]'
                            : 'border-zinc-200 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={featurePermissions.uploadInvoices}
                          onChange={() => handlePermissionToggle('uploadInvoices')}
                          className="w-4 h-4 rounded accent-[#FFB800] cursor-pointer"
                        />
                        <span className="text-sm font-medium">Upload Invoices (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermissionToggle('uploadBlueprints')}
                        className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                          featurePermissions.uploadBlueprints
                            ? 'border-[#FFB800]/40 bg-[#FFB800]/5 text-[#FFB800]'
                            : 'border-zinc-200 bg-zinc-50 dark:bg-[#1c1b1b] text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={featurePermissions.uploadBlueprints}
                          onChange={() => handlePermissionToggle('uploadBlueprints')}
                          className="w-4 h-4 rounded accent-[#FFB800] cursor-pointer"
                        />
                        <span className="text-sm font-medium">Upload Blueprints (CAD)</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* ─── Fixed Footer Action Bar ─── */}
              <div className="px-4 pt-4 pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] flex items-center justify-end gap-3 rounded-b-2xl mt-auto shrink-0">
                <button
                  onClick={handleCancelClick}
                  className="bg-[#B71C1C] text-[#212121] dark:text-[#FFEBEE] hover:opacity-90 transition-colors duration-200 border border-zinc-300 dark:border-zinc-700 px-5 py-3 rounded-xl text-sm font-semibold shrink-0"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formIsValid}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
                    formIsValid
                      ? 'bg-[#FFB800] text-neutral-950 hover:bg-[#E5A600] active:scale-[0.98] cursor-pointer'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-[#8e8e8e] cursor-not-allowed'
                  }`}
                >
                  Confirm Member
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ──────────────── Cancel Confirmation Dialog ──────────────── */}
      {showCancelConfirm && (
        <>
          <div
            onClick={keepFormOpen}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 sm:p-6"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[60] pointer-events-none">
            <div className="relative w-full max-w-md bg-zinc-50 dark:bg-[#1c1b1b] border border-red-900/40 rounded-2xl flex flex-col shadow-2xl shadow-black pointer-events-auto">

              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Confirm Cancellation</h3>
              </div>

              <div className="px-6 py-5">
                <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  Do you confirm you really need to cancel the creation of this new member?
                </p>
              </div>

              <div className="px-6 pb-6 flex items-center justify-end gap-3">
                <button
                  onClick={keepFormOpen}
                  className="bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                >
                  No, Keep it
                </button>
                <button
                  onClick={confirmCancel}
                  className="bg-[#B71C1C] text-[#212121] dark:text-[#FFEBEE] hover:opacity-90 transition-colors duration-200 border border-zinc-300 dark:border-zinc-700 px-5 py-3 rounded-xl text-sm font-semibold"
                >
                  Yes, Cancel it
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ──────────────── Success Notification Banner ──────────────── */}
      {showSuccessNotification && (
        <>
          <div
            onClick={() => setShowSuccessNotification(false)}
            className="fixed inset-0 bg-black/50 z-[55] flex items-center justify-center p-4 sm:p-6"
          />
          <div className="fixed inset-0 flex items-center justify-center px-4 sm:px-6 z-[55] pointer-events-none">
            <div className="relative w-full max-w-sm bg-emerald-900/90 border border-emerald-600/50 rounded-2xl flex items-start gap-4 px-6 py-5 shadow-2xl shadow-black pointer-events-auto">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-emerald-100">Success</h4>
                <p className="mt-1 text-sm text-emerald-200/80 leading-relaxed">
                  Success: Member profile created!
                </p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="p-1 hover:bg-emerald-800/50 rounded-lg transition shrink-0"
              >
                <X className="w-4 h-4 text-emerald-300/70 hover:text-emerald-100" />
              </button>
            </div>
          </div>
        </>
      )}

      <CommunicationModal
        open={commModalTarget !== null}
        onClose={() => setCommModalTarget(null)}
        recipientName={commModalTarget?.name ?? ''}
        recipientId={commModalTarget?.id}
      />

    </div>
  );
}
