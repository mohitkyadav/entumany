import React, {FC, ComponentPropsWithoutRef} from 'react';
import clsx from 'clsx';

import {getCustomClassNames} from 'utils/components';
import './Button.scss';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  className?: string;
  color?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  type?: 'button' | 'reset' | 'submit';
  variant?: 'contained' | 'link' | 'outlined';
  children?: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({
  children,
  color = 'primary',
  className,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'contained',
}) => {
  return (
    <button
      className={clsx('Button', `Button--${variant}`, `Button--${color}`, className, {
        'Button--disabled': disabled,
        ...getCustomClassNames(className, `--${variant}`, true),
        ...getCustomClassNames(className, `--${color}`, true),
        ...getCustomClassNames(className, '--disabled', disabled),
        ...getCustomClassNames('Button', `--${color}--disabled`, disabled),
      })}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};
