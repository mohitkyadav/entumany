import clsx from 'clsx';
import {XCircleIcon} from 'lucide-react';
import React, {FunctionComponent} from 'react';
import ReactDOM from 'react-dom';

import style from './Modal.module.scss';

export interface ModalProps {
  isShown?: boolean;
  hide?: () => void;
  children?: React.ReactNode;
  headerText?: string;
  className?: string;
}

export const Modal: FunctionComponent<ModalProps> = ({
  className = '',
  isShown = false,
  hide,
  children,
  headerText = '',
}) => {
  const modal = (
    <React.Fragment>
      <div className={style.ModalBackdrop} />
      <div className={clsx(style.Modal, className)}>
        <div className={style.Modal__StyledModal}>
          <div className={style.Modal__Header}>
            <div className={style.Modal__HeaderText}>{headerText}</div>
            <button className={style.Modal__CloseButton} onClick={hide}>
              <XCircleIcon size={28} />
            </button>
          </div>
          <div className={style.Modal__Content}>{children}</div>
        </div>
      </div>
    </React.Fragment>
  );

  return isShown ? ReactDOM.createPortal(modal, document.body) : null;
};
