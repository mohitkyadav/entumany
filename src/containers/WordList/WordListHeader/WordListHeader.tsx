import React from 'react';

import style from './WordListHeader.module.scss';
import {useTranslation} from 'react-i18next';

export const WordListHeader = () => {
  const {t} = useTranslation();
  return <div className={style['word-list-header']}>{t('yourDict')}</div>;
};
