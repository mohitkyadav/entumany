import {ArrowLeft} from 'lucide-react';
import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';

import {Button} from '../FormElements';

export interface BackButtonProps {
  /** Where to navigate; defaults to the dashboard. */
  to?: string;
  /** Custom handler; when set, overrides route navigation. */
  onClick?: () => void;
  className?: string;
}

/**
 * The app-wide "leave this page" affordance: an outlined arrow button placed
 * top-left, as established by the Settings and Word list pages.
 */
export const BackButton: FC<BackButtonProps> = ({to = '/', onClick, className}) => {
  const navigate = useNavigate();

  return (
    <Button
      leftIcon={<ArrowLeft size={16} />}
      variant="outlined"
      className={className}
      onClick={onClick ?? (() => navigate(to))}
    />
  );
};

export default BackButton;
