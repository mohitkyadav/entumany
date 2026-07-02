import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';

import {Button} from '../FormElements';
import {Modal} from '../Modal/Modal';
import style from './ConfirmModal.module.scss';

export interface ConfirmModalProps {
  isShown: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** App-styled replacement for `window.confirm` for destructive actions. */
export const ConfirmModal: FC<ConfirmModalProps> = ({isShown, title, message, onConfirm, onCancel}) => {
  const {t} = useTranslation();

  return (
    <Modal className="animation-slide-up" isShown={isShown} hide={onCancel} headerText={title}>
      <div className={style.ConfirmModal}>
        <p className={style.ConfirmModal__message}>{message}</p>
        <div className={style.ConfirmModal__actions}>
          <Button variant="outlined" onClick={onCancel}>
            {t('cancelBtn')}
          </Button>
          <Button color="danger" onClick={onConfirm} autoFocus>
            {t('confirmBtn')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
