import React, {FC} from 'react';
import {WordListItem} from 'types/db';
import {LanguageNames} from 'utils/constants';

import style from './WordListContent.module.scss';
import {Button} from 'components';
import {Pen, Trash2} from 'lucide-react';

export interface WordListContentProps {
  words: WordListItem[][];
  isEditMode: boolean;
}

export const WordListContent: FC<WordListContentProps> = ({words, isEditMode}) => {
  return (
    <div className={style['word-list-content']}>
      {words.map((saneEntry) => (
        <div key={saneEntry[0].word} className={style['word-list-content__entry']}>
          {isEditMode && (
            <>
              <Button leftIcon={<Trash2 size={16} />} onClick={() => alert('delete')} variant="outlined" />
              <Button leftIcon={<Pen size={16} />} onClick={() => alert('delete')} variant="outlined" />
            </>
          )}
          <div className={style['word-list-content__entry__word__wrapper']}>
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
