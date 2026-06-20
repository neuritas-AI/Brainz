"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, Plus, Settings, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';

import { useChatStore } from '@/store/chat-store';
import { MODEL_PROVIDERS, getModelProvider } from '@/lib/model-providers';
import { postChatMessage } from '@/services/api';
import { useLocale, useTranslations } from '@/lib/i18n';
import CreditsProgressBar from '@/components/shared/CreditsProgressBar';
import ChatWindow from '@/components/chat/ChatWindow';

const PROJECT_COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-sky-600/90',
  red: 'bg-rose-600/90',
  green: 'bg-emerald-600/90',
  yellow: 'bg-amber-600/90',
  purple: 'bg-violet-600/90',
  orange: 'bg-orange-600/90',
};

export default function ChatShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newProjectMode, setNewProjectMode] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('blue');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectInstructions, setNewProjectInstructions] = useState('');
  const [activeModels, setActiveModels] = useState<typeof MODEL_PROVIDERS>(MODEL_PROVIDERS);

  const { data: session } = useSession();
  const { locale, setLocale } = useLocale();
  const t = useTranslations();
  const user = session?.user as { email?: string | null; role?: string; plan?: string } | undefined;
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'chat@neuritas-ai.com';
  const {
    conversations,
    projects,
    selectedConversationId,
    selectedProjectId,
    createConversation,
    selectConversation,
    addMessage,
    setLoading,
    input,
    setInput,
    clearConversation,
    selectProject,
    setProjects,
    setConversations,
    setConversationModel,
  } = useChatStore();

  useEffect(() => {
    async function loadInitialData() {
      const [modelsRes, projectsRes, conversationsRes] = await Promise.all([
        fetch('/api/models'),
        fetch('/api/projects'),
        fetch('/api/conversations'),
      ]);

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setActiveModels(modelsData.models || MODEL_PROVIDERS);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }

      if (conversationsRes.ok) {
        const conversationsData = await conversationsRes.json();
        setConversations(conversationsData.conversations || []);
      }
    }

    loadInitialData().catch(() => {
      setActiveModels(MODEL_PROVIDERS);
    });
  }, [setConversations, setProjects]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length === 0) {
      createConversation();
    }
  }, [conversations.length, selectedConversationId, createConversation]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0],
    [conversations, selectedConversationId]
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const selectedModel = selectedConversation
    ? activeModels.find((provider) => provider.key === selectedConversation.modelKey) ?? getModelProvider(selectedConversation.modelKey)
    : MODEL_PROVIDERS[0];

  const regenerateLastResponse = async () => {
    if (!selectedConversation) return;
    const lastUser = [...selectedConversation.messages].reverse().find((message) => message.role === 'user');
    if (!lastUser) return;

    setLoading(true);
    try {
      const response = await postChatMessage(lastUser.content, selectedConversation.modelKey, selectedConversation.projectId);
      addMessage(selectedConversation.id, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        createdAt: Date.now(),
      });
    } catch {
      toast.error('Unable to regenerate the response.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text) return;

    let conversation = selectedConversation;
    if (!conversation) {
      conversation = createConversation();
    }

    setInput('');
    setLoading(true);
    addMessage(conversation.id, {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    });

    try {
      const data = await postChatMessage(text, conversation.modelKey, conversation.projectId, conversation.id);
      addMessage(conversation.id, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        createdAt: Date.now(),
      });
      toast.success('Response received');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Unable to reach the AI backend. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-hero-radial text-brand-text">
      <div className="mx-auto flex min-h-screen max-w-[1440px] gap-5 px-4 py-5 lg:px-6">
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 320 : 88 }}
          className="hidden lg:flex shrink-0 flex-col rounded-[32px] border border-white/10 bg-slate-950/80 p-4 shadow-panel backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-blue via-brand-purple to-brand-cyan text-white shadow-glow">
                <Sparkles size={20} />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">{t.brandName}</p>
                  <p className="text-sm font-semibold text-brand-text">{t.workspace}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSidebarOpen((prev) => !prev)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-brand-muted transition hover:text-brand-text">
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
          </div>

          <button
            onClick={() => createConversation()}
            className="mt-5 flex items-center justify-center gap-2 rounded-3xl border border-brand-blue/40 bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 px-4 py-3 text-sm font-semibold text-brand-text shadow-glow transition hover:scale-[1.01]"
          >
            <Plus size={16} />
            {sidebarOpen ? t.newChat : ''}
          </button>

          <div className="mt-6">
            <CreditsProgressBar />
          </div>

          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            {sidebarOpen && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-brand-muted">
                    <span>{t.projects}</span>
                    <button onClick={() => setNewProjectMode((prev) => !prev)} className="text-brand-blue transition hover:text-brand-purple">+ {t.add}</button>
                  </div>
                  {newProjectMode ? (
                    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-soft">
                      <label className="block text-sm text-brand-muted">
                        {t.projectName}
                        <input
                          value={newProjectName}
                          onChange={(event) => setNewProjectName(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-brand-text outline-none"
                          placeholder={t.projectPlaceholder}
                        />
                      </label>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <label className="block text-sm text-brand-muted">
                          {t.color}
                          <select
                            value={newProjectColor}
                            onChange={(event) => setNewProjectColor(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-brand-text outline-none"
                          >
                            <option value="red">Red</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                          </select>
                        </label>
                        <div />
                      </div>
                      <label className="mt-4 block text-sm text-brand-muted">
                        {t.description}
                        <textarea
                          value={newProjectDescription}
                          onChange={(event) => setNewProjectDescription(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-brand-text outline-none"
                          placeholder={t.descriptionPlaceholder}
                          rows={2}
                        />
                      </label>
                      <label className="mt-4 block text-sm text-brand-muted">
                        {t.instructions}
                        <textarea
                          value={newProjectInstructions}
                          onChange={(event) => setNewProjectInstructions(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-brand-text outline-none"
                          placeholder={t.instructionsPlaceholder}
                          rows={2}
                        />
                      </label>
                      <button
                        onClick={async () => {
                          if (!newProjectName.trim()) {
                            toast.error(t.projectNameRequired);
                            return;
                          }

                          try {
                            const response = await fetch('/api/projects', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: newProjectName.trim(),
                                color: newProjectColor,
                                description: newProjectDescription.trim() || '',
                                instructions: newProjectInstructions.trim() || undefined,
                              }),
                            });

                            const data = await response.json().catch(() => ({}));
                            if (!response.ok) {
                              throw new Error(data.error || t.unableCreateProject);
                            }

                            setProjects([data.project, ...projects]);
                            selectProject(data.project.id);
                            setNewProjectMode(false);
                            setNewProjectName('');
                            setNewProjectDescription('');
                            setNewProjectInstructions('');
                            toast.success(t.projectCreated);
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : t.unableCreateProject);
                          }
                        }}
                        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-3 text-sm font-semibold text-white"
                      >
                        {t.createProject}
                      </button>
                    </div>
                  ) : null}
                </div>

                {projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => selectProject(project.id)}
                        className={cn('w-full rounded-3xl border px-4 py-3 text-left text-sm transition', project.id === selectedProjectId ? 'border-brand-blue/60 bg-white/10' : 'border-white/10 bg-white/5 hover:border-brand-blue/60 hover:bg-white/10')}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${PROJECT_COLOR_CLASSES[project.color] ?? PROJECT_COLOR_CLASSES.blue}`} />
                          <span className="font-medium text-brand-text">{project.name}</span>
                        </div>
                        {project.description ? <p className="mt-2 text-xs text-brand-muted">{project.description}</p> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Link href="/profile" className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-brand-muted transition hover:text-brand-text">
              <User size={18} />
              {sidebarOpen ? t.profile : ''}
            </Link>
            {isAdmin ? (
              <Link href="/settings" className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-brand-muted transition hover:text-brand-text">
                <Settings size={18} />
                {sidebarOpen ? t.settings : ''}
              </Link>
            ) : null}
            {sidebarOpen && <p className="text-xs text-brand-muted">{t.poweredBy}</p>}
          </div>
        </motion.aside>

        <section className="flex min-h-[calc(100vh-2.5rem)] flex-1 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 shadow-panel backdrop-blur-xl">
          <header className="border-b border-white/10 bg-slate-950/80 px-4 py-5 backdrop-blur-xl lg:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-blue via-brand-purple to-brand-cyan text-white shadow-glow">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">{t.brandName}</p>
                    <h1 className="text-2xl font-semibold text-brand-text">{t.welcomeTitle}</h1>
                  </div>
                </div>
                <p className="max-w-2xl text-sm text-brand-muted">{t.welcomeDescription}</p>
                {selectedProject ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-brand-text">
                    <span className={cn('h-2.5 w-2.5 rounded-full', PROJECT_COLOR_CLASSES[selectedProject.color] ?? PROJECT_COLOR_CLASSES.blue)} />
                    <span>{selectedProject.name}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm text-brand-text">
                  <select
                    value={locale}
                    onChange={(event) => setLocale(event.target.value as 'en' | 'nl')}
                    className="rounded-full bg-slate-950 text-sm text-brand-text outline-none"
                  >
                    <option className="bg-slate-950 text-brand-text" value="en">English</option>
                    <option className="bg-slate-950 text-brand-text" value="nl">Nederlands</option>
                  </select>
                </div>
                <div className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm text-brand-text">
                  <select
                    value={selectedConversation?.modelKey ?? 'brainz_local'}
                    onChange={(event) => {
                      const modelKey = event.target.value as any;
                      if (selectedConversation) {
                        setConversationModel(selectedConversation.id, modelKey);
                      }
                    }}
                    className="rounded-full bg-slate-950 text-sm text-brand-text outline-none"
                  >
                    {activeModels.map((provider) => (
                      <option className="bg-slate-950 text-brand-text" key={provider.key} value={provider.key}>{provider.displayName}</option>
                    ))}
                  </select>
                </div>
                <Link href="/profile" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue via-brand-purple to-brand-cyan text-white shadow-glow" title={session?.user?.email || 'Profile'}>
                  <User size={18} />
                </Link>
              </div>
            </div>
          </header>

          <ChatWindow onSend={sendMessage} onRegenerate={regenerateLastResponse} onClear={() => selectedConversation && clearConversation(selectedConversation.id)} />
        </section>
      </div>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} className="fixed inset-y-4 left-4 z-50 flex w-72 flex-col rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-glow backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="text-brand-purple" size={18} />Brainz</div>
              <button onClick={() => setSidebarOpen(false)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-brand-muted">✕</button>
            </div>
            <button onClick={() => createConversation()} className="mt-4 flex items-center gap-2 rounded-2xl border border-brand-blue/50 bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 p-3 text-sm font-semibold text-brand-text"> <Plus size={16} /> {t.newChat} </button>
            <div className="mt-6 flex-1 space-y-2 overflow-y-auto">
            {conversations.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  selectConversation(item.id);
                  setSidebarOpen(false);
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left"
              >
                <div className="text-sm font-medium text-brand-text">{item.title}</div>
                <div className="text-xs text-brand-muted">{item.messages.length} messages</div>
              </button>
            ))}
          </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </main>
  );
}

function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}
