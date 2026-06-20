'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

export type Locale = 'en' | 'nl';
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'brainz_locale';

export const TRANSLATIONS = {
  en: {
    brandName: 'Brainz',
    workspace: 'AI workspace',
    newChat: 'New Chat',
    projects: 'Projects',
    add: 'Add',
    projectName: 'Project name',
    color: 'Color',
    description: 'Description',
    instructions: 'Instructions',
    createProject: 'Create project',
    projectNameRequired: 'Please add a project name.',
    projectCreated: 'Project created successfully.',
    unableCreateProject: 'Unable to create project.',
    unassignedChats: 'Unassigned chats',
    profile: 'Profile',
    settings: 'Settings',
    poweredBy: 'Powered by Neuritas-AI',
    enterpriseAssistant: 'Enterprise AI assistant',
    welcomeTitle: 'Your enterprise AI assistant',
    welcomeDescription: 'Ask Brainz anything and get fast, clear answers.',
    suggestion1: 'How can AI improve my business?',
    suggestion2: 'Create a sales strategy',
    suggestion3: 'Generate a marketing plan',
    suggestion4: 'Analyze business opportunities',
    askPlaceholder: 'Ask Brainz anything...',
    sendMessage: 'Send message',
    thinking: 'Brainz is thinking...',
    copiedMessage: 'Message copied',
    shiftEnterHint: 'Shift + Enter for newline',
    conversationLabel: 'Conversation',
    regenerateResponse: 'Regenerate response',
    clearChat: 'Clear chat',
    creditsRemaining: 'Credits remaining',
    creditsLeft: 'credits left',
    languageSettings: 'Language settings',
    selectLanguage: 'Select language',
    profilePageTitle: 'Your profile',
    profilePageDescription: 'You can update your profile information here.',
    profileDetails: 'Profile details',
    uploadPhoto: 'Upload profile photo',
    displayName: 'Display name',
    newPassword: 'New password',
    saveProfile: 'Save profile',
    saving: 'Saving…',
    profileUpdated: 'Profile updated successfully.',
    unableUpdateProfile: 'Unable to update profile.',
    settingsPageTitle: 'Brainz Settings',
    settingsPageDescription: 'Manage Brainz users, subscriptions, credits, and model settings from this admin area.',
    adminFooter: 'Brainz is developed and maintained by Neuritas-AI.',
    noProjectHint: 'No project selected. Choose a project to tie this chat to a workflow.',
    projectPlaceholder: 'AI productivity workflow',
    descriptionPlaceholder: 'Everything around marketing and client workflows.',
    instructionsPlaceholder: 'Use this project context for all chats.',
  },
  nl: {
    brandName: 'Brainz',
    workspace: 'AI-werkruimte',
    newChat: 'Nieuwe chat',
    projects: 'Projecten',
    add: 'Toevoegen',
    projectName: 'Projectnaam',
    color: 'Kleur',
    description: 'Beschrijving',
    instructions: 'Instructies',
    createProject: 'Project maken',
    projectNameRequired: 'Voeg een projectnaam toe.',
    projectCreated: 'Project succesvol aangemaakt.',
    unableCreateProject: 'Kan project niet maken.',
    unassignedChats: 'Niet-toegewezen chats',
    profile: 'Profiel',
    settings: 'Instellingen',
    poweredBy: 'Aangedreven door Neuritas-AI',
    enterpriseAssistant: 'Enterprise AI assistent',
    welcomeTitle: 'Je enterprise AI assistent',
    welcomeDescription: 'Vraag Brainz alles en krijg snel heldere antwoorden.',
    suggestion1: 'Hoe kan AI mijn bedrijf verbeteren?',
    suggestion2: 'Maak een salesstrategie',
    suggestion3: 'Genereer een marketingplan',
    suggestion4: 'Analyseer zakelijke kansen',
    askPlaceholder: 'Vraag Brainz iets...',
    sendMessage: 'Verzenden',
    thinking: 'Brainz denkt na...',
    copiedMessage: 'Bericht gekopieerd',
    shiftEnterHint: 'Shift + Enter voor nieuwe regel',
    conversationLabel: 'Conversatie',
    regenerateResponse: 'Antwoord vernieuwen',
    clearChat: 'Chat leegmaken',
    creditsRemaining: 'Resterende credits',
    creditsLeft: 'credits resterend',
    languageSettings: 'Taalinstellingen',
    selectLanguage: 'Selecteer taal',
    profilePageTitle: 'Je profiel',
    profilePageDescription: 'Je kunt hier je profielgegevens bijwerken.',
    profileDetails: 'Profielgegevens',
    uploadPhoto: 'Profielfoto uploaden',
    displayName: 'Weergavenaam',
    newPassword: 'Nieuw wachtwoord',
    saveProfile: 'Profiel opslaan',
    saving: 'Opslaan…',
    profileUpdated: 'Profiel succesvol bijgewerkt.',
    unableUpdateProfile: 'Kan profiel niet bijwerken.',
    settingsPageTitle: 'Brainz instellingen',
    settingsPageDescription: 'Beheer Brainz-gebruikers, abonnementen, credits en modelinstellingen vanuit dit beheerdersgedeelte.',
    adminFooter: 'Brainz wordt ontwikkeld en onderhouden door Neuritas-AI.',
    noProjectHint: 'Geen project geselecteerd. Kies een project om deze chat aan een workflow te koppelen.',
    projectPlaceholder: 'AI-productiviteitsworkflow',
    descriptionPlaceholder: 'Alles rond marketing en klantwerkstromen.',
    instructionsPlaceholder: 'Gebruik deze projectcontext voor alle chats.',
  },
} as const;

export type Translations = typeof TRANSLATIONS[Locale];
export type TranslationKey = keyof Translations;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: TRANSLATIONS[DEFAULT_LOCALE],
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (savedLocale === 'en' || savedLocale === 'nl') {
      setLocaleState(savedLocale);
      return;
    }

    const sessionLocale = session?.user?.locale;
    if (sessionLocale === 'en' || sessionLocale === 'nl') {
      setLocaleState(sessionLocale);
    }
  }, [session]);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = async (nextLocale: Locale) => {
    setLocaleState(nextLocale);

    if (session?.user) {
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: nextLocale }),
        });
      } catch {
        // fallback to local storage only
      }
    }
  };

  const value = useMemo(
    () => ({ locale, setLocale, t: TRANSLATIONS[locale] }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useLocale() {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}

export function useTranslations() {
  const { t } = useI18n();
  return t;
}
