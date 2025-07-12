import React, {FC} from 'react';

import style from './WordListHeader.module.scss';
import {useTranslation} from 'react-i18next';
import {Button} from 'components';
import {ArrowLeft, Pen} from 'lucide-react';
import {ROUTES} from 'utils/constants';
import {useNavigate} from 'react-router-dom';

export interface WordListHeaderProps {
  isEditMode: boolean;
  setIsEditMode: any;
}

export const WordListHeader: FC<WordListHeaderProps> = ({isEditMode, setIsEditMode}) => {
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
    </div>
  );
};
