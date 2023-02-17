import clsx from 'clsx';
import React, {FC} from 'react';
import {Language} from 'types/db';

import style from './LangEditor.module.scss';

interface LangEditorProps {
  language: Language;
  onChange: (value: string) => void;
  onLanguageChange: (value: Language) => void;
  className?: string;
  placeholder?: string;
  value?: string;
}

interface LanguageDropDownProps {
  defaultValue: Language;
  onChange: (value: Language) => void;
}

const LanguageDropDown: FC<LanguageDropDownProps> = ({defaultValue, onChange}) => {
  return (
    <select name="langs" id="langs" value={defaultValue} onChange={(e) => onChange(e.target.value as Language)}>
      {Object.entries(Language).map(([key, value]) => (
        <option key={value} value={value}>
          {key}
        </option>
      ))}
    </select>
  );
};

export const LangEditor: FC<LangEditorProps> = ({
  className,
  language,
  onChange,
  onLanguageChange,
  placeholder = 'Enter text...',
  value,
}) => {
  return (
    <div className={clsx(style.LangEditor, className)}>
      <LanguageDropDown defaultValue={language} onChange={onLanguageChange} />
      <textarea
        className={style.LangEditor__textarea}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        value={value}
        rows={5}
        lang={language}
      />
    </div>
  );
};
