'use client';

import { useEffect, useState } from 'react';

export type Locale = 'en' | 'nl';
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'brainz_locale';

const TRANSLATIONS = {
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
    activeModel: 'Active model',
    currentChat: 'Current chat',
    regenerateResponse: 'Regenerate response',
    clearChat: 'Clear chat',
    noProjectHint: 'No project selected. Choose a project to tie this chat to a workflow.',
    projectPlaceholder: 'AI productivity workflow',
    descriptionPlaceholder: 'Everything around marketing and client workflows.',
    instructionsPlaceholder: 'Use this project context for all chats.',
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
    activeModel: 'Actief model',
    currentChat: 'Huidige chat',
    regenerateResponse: 'Antwoord vernieuwen',
    clearChat: 'Chat leegmaken',
    noProjectHint: 'Geen project geselecteerd. Kies een project om deze chat aan een workflow te koppelen.',
    projectPlaceholder: 'AI-productiviteitsworkflow',
    descriptionPlaceholder: 'Alles rond marketing en klantwerkstromen.',
    instructionsPlaceholder: 'Gebruik deze projectcontext voor alle chats.',
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
  },
} as const;

export type Translations = typeof TRANSLATIONS[typeof DEFAULT_LOCALE];
export type TranslationKey = keyof Translations;

export function getTranslation(locale: Locale, key: TranslationKey) {
  return TRANSLATIONS[locale][key] ?? TRANSLATIONS[DEFAULT_LOCALE][key];
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved === 'nl' || saved === 'en') {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  return { locale, setLocale };
}

export function useTranslations() {
  const { locale } = useLocale();
  return TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
}
