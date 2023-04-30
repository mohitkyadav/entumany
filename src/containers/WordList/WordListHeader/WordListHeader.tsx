import React from 'react';

import style from './WordListHeader.module.scss';
import {useTranslation} from 'react-i18next';
import {Button} from 'components';
import {ArrowLeft} from 'lucide-react';
import {ROUTES} from 'utils/constants';
import {useNavigate} from 'react-router-dom';

export const WordListHeader = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={style['word-list-header']}>
      <Button
        leftIcon={<ArrowLeft size={16} />}
        onClick={() => {
          navigate(ROUTES.DASHBOARD);
        }}
        variant="outlined"
      />
      <p className={style['word-list-header__text']}>{t('yourDict')}</p>
    </div>
  );
};
