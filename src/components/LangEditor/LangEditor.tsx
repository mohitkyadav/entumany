import clsx from 'clsx';
import {useAppContext} from 'contexts/App.context';
import React, {FC, useState, useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Language} from 'types/db';

import style from './LangEditor.module.scss';

interface LangEditorProps {
  language: Language;
  onChange: (value: string) => void;
  onLanguageChange: (value: Language) => void;
  className?: string;
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

interface SuggestionListProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  visible: boolean;
  selectedIndex: number;
}

const SuggestionList = React.forwardRef<HTMLDivElement, SuggestionListProps>(
  ({suggestions, onSelectSuggestion, visible, selectedIndex}, ref) => {
    if (!visible || suggestions.length === 0) return null;

    return (
      <div ref={ref} className={style.LangEditor__suggestions}>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={clsx(style.LangEditor__suggestion, {
              [style.LangEditor__suggestionSelected]: index === selectedIndex,
            })}
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </div>
        ))}
      </div>
    );
  },
);

SuggestionList.displayName = 'SuggestionList';

export const LangEditor: FC<LangEditorProps> = ({className, language, onChange, onLanguageChange, value}) => {
  const {availableLanguages, dbInstance} = useAppContext();
  const {i18n, t} = useTranslation();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tPlaceHolder = availableLanguages.includes(language) ? i18n.getFixedT(language)('enterText') : t('enterText');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce suggestions to avoid showing them for every keystroke
    debounceTimeoutRef.current = setTimeout(() => {
      const wordSuggestions = dbInstance.getWordSuggestions(newValue, language);
      setSuggestions(wordSuggestions);
      setShowSuggestions(wordSuggestions.length > 0);
      setSelectedIndex(-1); // Reset selection when suggestions change
    }, 300); // 300ms delay
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);

    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    onLanguageChange(newLanguage);
    // Clear suggestions when language changes
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={clsx(style.LangEditor, className)}>
      <LanguageDropDown defaultValue={language} onChange={handleLanguageChange} />
      <div className={style.LangEditor__inputContainer}>
        <textarea
          ref={textareaRef}
          className={style.LangEditor__textarea}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={tPlaceHolder}
          value={value}
          rows={5}
          lang={language}
        />
        <SuggestionList
          ref={suggestionsRef}
          suggestions={suggestions}
          onSelectSuggestion={handleSuggestionSelect}
          visible={showSuggestions}
          selectedIndex={selectedIndex}
        />
      </div>
    </div>
  );
};
