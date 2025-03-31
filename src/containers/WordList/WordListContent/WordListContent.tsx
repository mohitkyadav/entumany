import React, {FC} from 'react';
import {Pen, Trash2} from 'lucide-react';

import {Button} from 'components';
import {WordListItem} from 'types/db';
import {LanguageNames} from 'utils/constants';
import {EntumanyDB} from 'services/db.service';

import style from './WordListContent.module.scss';
import clsx from 'clsx';

export interface WordListContentProps {
  words: WordListItem[][];
  isEditMode: boolean;
}

export const WordListContent: FC<WordListContentProps> = ({words, isEditMode}) => {
  const db = EntumanyDB.getInstance();

  const handleEdit = (id: string) => {
    console.log('edit', id);
  };

  const handleDelete = (id: string) => {
    db.deleteWordEntryWithIndex(id);
  };

  return (
    <div className={style['word-list-content']}>
      {words.map((saneEntry) => (
        <div key={saneEntry[0].word} className={style['word-list-content__entry']}>
          {isEditMode && (
            <div className={clsx(style['word-list-content__entry__actions'], 'animation-slide-right')}>
              <Button
                leftIcon={<Trash2 size={16} />}
                onClick={() => handleDelete(saneEntry[0].id)}
                variant="outlined"
              />
              <Button leftIcon={<Pen size={16} />} onClick={() => handleEdit(saneEntry[0].id)} variant="outlined" />
            </div>
          )}
          <div
            className={clsx(style['word-list-content__entry__word__wrapper'], {
              'animation-slide-left-wo-op': !isEditMode,
              'animation-slide-right': isEditMode,
            })}
          >
            {saneEntry.map(({id, lang, word}) => (
              <div key={`${id}-${lang}`} className={style['word-list-content__entry__word']}>
                <span title={LanguageNames[lang]} className={style['word-list-content__entry__word__lang']}>
                  {LanguageNames[lang]}
                </span>
                <p className={style['word-list-content__entry__word__text']}>{word}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
