import clsx from 'clsx';
import React, {FC} from 'react';

import style from './LangEditor.module.scss';

interface LangEditorProps {
  className?: string;
  language?: string;
}

export const LangEditor: FC<LangEditorProps> = ({className, language}) => {
  return (
    <div className={clsx(style.LangEditor, className)}>
      <label htmlFor="langs">Choose a car: {language}</label>
      <select name="langs" id="langs">
        <option value="lang1">Hi</option>
        <option value="lang2">IN</option>
      </select>
      <textarea />
    </div>
  );
};
