import React, {FC} from 'react';

import style from './WordListHeader.module.scss';
import {useTranslation} from 'react-i18next';
import {Button} from 'components';
import {ArrowLeft, Pen, Search, X} from 'lucide-react';
import {ROUTES} from 'utils/constants';
import {useNavigate} from 'react-router-dom';

export interface WordListHeaderProps {
  isEditMode: boolean;
  setIsEditMode: (updater: (prev: boolean) => boolean) => void;
  query: string;
  setQuery: (value: string) => void;
  hasWords: boolean;
}

export const WordListHeader: FC<WordListHeaderProps> = ({isEditMode, setIsEditMode, query, setQuery, hasWords}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={style['word-list-header']}>
      <div className={style['word-list-header__actions']}>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => {
            navigate(ROUTES.DASHBOARD);
          }}
          variant="outlined"
        />
        <Button
          leftIcon={<Pen size={16} />}
          onClick={() => setIsEditMode((prev: boolean) => !prev)}
          variant={isEditMode ? 'contained' : 'outlined'}
        />
      </div>
      <p className={style['word-list-header__text']}>{t('yourDict')}</p>
      {hasWords && (
        <div className={style['word-list-header__search']}>
          <Search size={18} className={style['word-list-header__search__icon']} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder') || ''}
            aria-label={t('searchPlaceholder') || 'Search'}
          />
          {query && (
            <button
              type="button"
              className={style['word-list-header__search__clear']}
              onClick={() => setQuery('')}
              aria-label={t('cancelBtn') || 'Clear'}
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
