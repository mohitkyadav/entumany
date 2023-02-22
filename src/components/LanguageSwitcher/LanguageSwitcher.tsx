import React from 'react';

import {useAppContext} from 'contexts/App.context';
import {Language} from 'types/db';
import style from './LanguageSwitcher.module.scss';
import {LanguageFlags} from 'utils/constants';

export const LanguageSwitcher = () => {
  const {availableLanguages, lng, switchLanguage} = useAppContext();
  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchLanguage(e.target.value as Language);
  };

  return (
    <div className={style.LanguageSwitcher}>
      <select name="app-lang" id="app-lang" value={lng} onChange={handleLangChange}>
        {availableLanguages.map((k) => (
          <option key={k} value={k}>
            {LanguageFlags[k]} {k.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};
