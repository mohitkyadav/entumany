import clsx from 'clsx';
import React, {FC} from 'react';

interface LangEditorProps {
  className?: string;
  language?: string;
}

export const LangEditor: FC<LangEditorProps> = ({className, language}) => {
  return <div className={clsx('LangEditor', className)}>LangEditor : {language}</div>;
};
