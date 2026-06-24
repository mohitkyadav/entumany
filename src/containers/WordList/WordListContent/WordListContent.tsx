import React, {FC, useEffect, useState} from 'react';
import {Check, Pen, Plus, Trash2, X} from 'lucide-react';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {Button} from 'components';
import {Language, WordListItem} from 'types/db';
import {LanguageNames, ROUTES} from 'utils/constants';
import {EntumanyDB} from 'services/db.service';

import style from './WordListContent.module.scss';

export interface WordListContentProps {
  words: WordListItem[][];
  isEditMode: boolean;
  hasWords: boolean;
  refresh: () => void;
}

interface DraftWord {
  lang: Language;
  word: string;
}

export const WordListContent: FC<WordListContentProps> = ({words, isEditMode, hasWords, refresh}) => {
  const db = EntumanyDB.getInstance();
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftWord[]>([]);

  // Leaving edit mode also cancels any in-progress inline edit.
  useEffect(() => {
    if (!isEditMode) setEditingId(null);
  }, [isEditMode]);

  const startEdit = (entry: WordListItem[]) => {
    setEditingId(entry[0].id);
    setDraft(entry.map(({lang, word}) => ({lang, word})));
  };

  const cancelEdit = () => setEditingId(null);

  const changeDraft = (index: number, value: string) => {
    setDraft((prev) => prev.map((d, i) => (i === index ? {...d, word: value} : d)));
  };

  const saveEdit = (id: string) => {
    db.updateWordEntry(
      id,
      draft.map(({lang, word}) => ({language: lang, word})),
    );
    setEditingId(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    db.deleteWordEntryWithIndex(id);
    refresh();
  };

  const isDraftValid = draft.every(({word}) => word.trim().length > 0);

  if (!hasWords) {
    return (
      <div className={style['word-list-content__empty']}>
        <p className={style['word-list-content__empty__text']}>{t('emptyWordList')}</p>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate(ROUTES.EDITOR)}>
          {t('emptyWordListCta')}
        </Button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className={style['word-list-content__empty']}>
        <p className={style['word-list-content__empty__text']}>{t('noSearchResults')}</p>
      </div>
    );
  }

  return (
    <div className={style['word-list-content']}>
      {words.map((saneEntry) => {
        const entryId = saneEntry[0].id;
        const isEditing = isEditMode && editingId === entryId;

        return (
          <div key={entryId} className={style['word-list-content__entry']}>
            {isEditMode && (
              <div className={clsx(style['word-list-content__entry__actions'], 'animation-slide-right')}>
                <Button leftIcon={<Trash2 size={16} />} onClick={() => handleDelete(entryId)} variant="outlined" />
                <Button
                  leftIcon={isEditing ? <X size={16} /> : <Pen size={16} />}
                  onClick={() => (isEditing ? cancelEdit() : startEdit(saneEntry))}
                  variant={isEditing ? 'contained' : 'outlined'}
                />
              </div>
            )}
            <div
              className={clsx(style['word-list-content__entry__word__wrapper'], {
                'animation-slide-left-wo-op': !isEditMode,
                'animation-slide-right': isEditMode,
              })}
            >
              {isEditing
                ? draft.map(({lang, word}, index) => (
                    <div key={`${entryId}-${lang}`} className={style['word-list-content__entry__word']}>
                      <span title={LanguageNames[lang]} className={style['word-list-content__entry__word__lang']}>
                        {LanguageNames[lang]}
                      </span>
                      <input
                        className={style['word-list-content__entry__word__input']}
                        value={word}
                        lang={lang}
                        onChange={(e) => changeDraft(index, e.target.value)}
                        autoFocus={index === 0}
                      />
                    </div>
                  ))
                : saneEntry.map(({id, lang, word}) => (
                    <div key={`${id}-${lang}`} className={style['word-list-content__entry__word']}>
                      <span title={LanguageNames[lang]} className={style['word-list-content__entry__word__lang']}>
                        {LanguageNames[lang]}
                      </span>
                      <p className={style['word-list-content__entry__word__text']}>{word}</p>
                    </div>
                  ))}

              {isEditing && (
                <div className={style['word-list-content__entry__edit-actions']}>
                  <Button
                    leftIcon={<Check size={16} />}
                    color="tertiary"
                    disabled={!isDraftValid}
                    onClick={() => saveEdit(entryId)}
                  >
                    {t('saveBtn')}
                  </Button>
                  <Button variant="outlined" onClick={cancelEdit}>
                    {t('cancelBtn')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
