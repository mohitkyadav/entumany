import React, {FC, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-hot-toast';
import {ArrowLeft, Copy, Download, Trash2, Upload} from 'lucide-react';

import {Button, PageTitle} from 'components';
import {useAppContext} from 'contexts/App.context';
import {Language} from 'types/db';
import {LanguageFlags, LanguageNames, ROUTES} from 'utils/constants';
import {backupFileName, clearAllData, restoreBackup, serializeBackup} from 'services/backup.service';

import style from './Settings.module.scss';

const ALL_LANGUAGES = Object.values(Language);

const Settings: FC = () => {
  const {availableLanguages, dbInstance, lng, switchLanguage} = useAppContext();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [primaryLang, setPrimaryLang] = useState(dbInstance.appOptions.primaryLanguage);
  const [secondaryLang, setSecondaryLang] = useState(dbInstance.appOptions.secondaryLanguage);

  const totalWords = Object.keys(dbInstance.database).length;

  const firstLanguageOtherThan = (lang: Language): Language =>
    ALL_LANGUAGES.find((candidate) => candidate !== lang) ?? Language.ENGLISH;

  const handlePrimaryChange = (lang: Language) => {
    setPrimaryLang(lang);
    dbInstance.updateLanguage('primaryLanguage', lang);
    if (lang === secondaryLang) {
      const next = firstLanguageOtherThan(lang);
      setSecondaryLang(next);
      dbInstance.updateLanguage('secondaryLanguage', next);
    }
  };

  const handleSecondaryChange = (lang: Language) => {
    setSecondaryLang(lang);
    dbInstance.updateLanguage('secondaryLanguage', lang);
    if (lang === primaryLang) {
      const next = firstLanguageOtherThan(lang);
      setPrimaryLang(next);
      dbInstance.updateLanguage('primaryLanguage', next);
    }
  };

  const handleExport = () => {
    const url = URL.createObjectURL(new Blob([serializeBackup()], {type: 'application/json'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = backupFileName();
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast(t('exportSuccessToast'), {icon: '💾', position: 'bottom-center'});
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(serializeBackup());
      toast(t('copySuccessToast'), {icon: '📋', position: 'bottom-center'});
    } catch {
      toast(t('copyErrorToast'), {icon: '⚠️', position: 'bottom-center'});
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-importing the same file later
    if (!file) return;

    try {
      restoreBackup(await file.text());
      toast(t('importSuccessToast'), {icon: '✅', position: 'bottom-center'});
      // Reload so the in-memory DB and trainer state re-read the restored data.
      setTimeout(() => window.location.reload(), 700);
    } catch {
      toast(t('importErrorToast'), {icon: '⚠️', position: 'bottom-center'});
    }
  };

  const handleClear = () => {
    if (!window.confirm(t('settingsClearConfirm') || 'This permanently deletes all your data. Continue?')) return;
    clearAllData();
    window.location.reload();
  };

  return (
    <div className="page animation-slide-down">
      <PageTitle title={t('settingsTitle')} />

      <div className={style.Settings}>
        <div className={style.Settings__header}>
          <Button leftIcon={<ArrowLeft size={16} />} variant="outlined" onClick={() => navigate(ROUTES.DASHBOARD)} />
          <h1 className={style.Settings__title}>{t('settingsTitle')}</h1>
        </div>

        <section className={style.Settings__section}>
          <h2 className={style.Settings__sectionTitle}>{t('settingsAppLangLabel')}</h2>
          <p className={style.Settings__help}>{t('settingsAppLangHelp')}</p>
          <select
            className={style.Settings__select}
            value={lng}
            onChange={(e) => switchLanguage(e.target.value as Language)}
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {LanguageFlags[lang]} {LanguageNames[lang]}
              </option>
            ))}
          </select>
        </section>

        <section className={style.Settings__section}>
          <h2 className={style.Settings__sectionTitle}>{t('settingsDefaultLangsLabel')}</h2>
          <p className={style.Settings__help}>{t('settingsDefaultLangsHelp')}</p>
          <div className={style.Settings__langPair}>
            <label className={style.Settings__field}>
              <span className={style.Settings__fieldLabel}>{t('settingsPrimaryLang')}</span>
              <select
                className={style.Settings__select}
                value={primaryLang}
                onChange={(e) => handlePrimaryChange(e.target.value as Language)}
              >
                {ALL_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {LanguageFlags[lang]} {LanguageNames[lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className={style.Settings__field}>
              <span className={style.Settings__fieldLabel}>{t('settingsSecondaryLang')}</span>
              <select
                className={style.Settings__select}
                value={secondaryLang}
                onChange={(e) => handleSecondaryChange(e.target.value as Language)}
              >
                {ALL_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {LanguageFlags[lang]} {LanguageNames[lang]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={style.Settings__section}>
          <h2 className={style.Settings__sectionTitle}>{t('settingsDataTitle')}</h2>
          <p className={style.Settings__help}>{t('settingsDataNote')}</p>
          <p className={style.Settings__count}>
            {totalWords} {t('multilangWords')}
          </p>
          <div className={style.Settings__actions}>
            <Button leftIcon={<Download size={16} />} onClick={handleExport}>
              {t('settingsExport')}
            </Button>
            <Button leftIcon={<Copy size={16} />} variant="outlined" onClick={handleCopy}>
              {t('settingsCopy')}
            </Button>
            <Button leftIcon={<Upload size={16} />} variant="outlined" onClick={handleImportClick}>
              {t('settingsImport')}
            </Button>
          </div>
          <div className={style.Settings__danger}>
            <Button leftIcon={<Trash2 size={16} />} color="danger" variant="outlined" onClick={handleClear}>
              {t('settingsClear')}
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} hidden />
        </section>
      </div>
    </div>
  );
};

export default Settings;
