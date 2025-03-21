import React, {FC, useEffect} from 'react';

import {Button, LangEditor, PageTitle} from 'components';
import {useBeforeunload} from 'hooks';
import {EntumanyDB} from 'services/db.service';
import {Language, WordEntry} from 'types/db';

import {ArrowLeft, InfoIcon, Save} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';
import {Tooltip} from 'react-tooltip';
import {ROUTES} from 'utils/constants';
import style from './EditorPage.module.scss';
import {useTranslation} from 'react-i18next';

const SAVE_BUTTON_ID = 'save-button';

const EditorPage: FC = () => {
  const db = EntumanyDB.getInstance();
  const navigate = useNavigate();
  const {t} = useTranslation();

  useBeforeunload((event) => {
    event.preventDefault();
    db.saveToLocalStorage();
  });

  useEffect(() => {
    return () => db.saveToLocalStorage();
  }, [db]);

  const [sourceState, setSourceState] = React.useState<WordEntry>({
    language: db.appOptions.primaryLanguage,
    word: '',
  });

  const [destState, setDestState] = React.useState<WordEntry>({
    language: db.appOptions.secondaryLanguage,
    word: '',
  });

  const resetInputs = () => {
    setSourceState((prevState) => {
      return {
        ...prevState,
        word: '',
      };
    });
    setDestState((prevState) => {
      return {
        ...prevState,
        word: '',
      };
    });
  };

  const onSourceEditorChange = (word: string) => {
    setSourceState({
      ...sourceState,
      word,
    });
  };

  const onDestEditorChange = (word: string) => {
    setDestState({
      ...destState,
      word,
    });
  };

  const getRandomLanguageNotInUse = (inUseLang: Language): Language => {
    const languages = Object.values(Language).filter((lang) => lang !== inUseLang);
    const randomIndex = Math.floor(Math.random() * languages.length);
    const randomLang = languages[randomIndex];
    return randomLang;
  };

  const onSourceLangChange = (language: Language) => {
    db.updateLanguage('primaryLanguage', language);
    setSourceState({
      ...sourceState,
      language,
    });
    if (language === destState.language) {
      const newLang = getRandomLanguageNotInUse(language);
      onDestLangChange(newLang);
    }
  };

  const onDestLangChange = (language: Language) => {
    db.updateLanguage('secondaryLanguage', language);
    setDestState({
      ...destState,
      language,
    });
    if (language === sourceState.language) {
      const newLang = getRandomLanguageNotInUse(language);
      onSourceLangChange(newLang);
    }
  };

  const handleOnSaveClick = () => {
    console.log(sourceState, destState);
    db.addWords(sourceState, destState);
    resetInputs();
    toast(t('savedToastText'), {
      icon: '✅',
      position: 'bottom-center',
    });
  };

  const allowSave =
    sourceState.word.length > 0 && destState.word.length > 0 && destState.language !== sourceState.language;

  return (
    <div className="page animation-slide-down">
      <PageTitle title="Editor" />

      <div className={style.EditorPage}>
        <div className={style.EditorPage__helper}>
          <InfoIcon size={24} />
          <p className="fs-20">{t('saveTranslationsNote')}</p>
        </div>
        <LangEditor
          key="sourceLangEditor"
          language={sourceState.language}
          onChange={onSourceEditorChange}
          onLanguageChange={onSourceLangChange}
          value={sourceState.word}
        />
        <LangEditor
          key="destLangEditor"
          language={destState.language}
          onChange={onDestEditorChange}
          onLanguageChange={onDestLangChange}
          value={destState.word}
        />
        <div className={style['EditorPage__buttons-container']}>
          <Button
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => {
              navigate(ROUTES.DASHBOARD);
            }}
            color="secondary"
            className="fs-16"
          >
            <p>{t('goBackButton')}</p>
          </Button>
          <Button id={SAVE_BUTTON_ID} className="fs-16" disabled={!allowSave} onClick={handleOnSaveClick}>
            <Save size={16} />
            <p>{t('saveTranslationBtn')}</p>
          </Button>
        </div>
      </div>
      {!allowSave && (
        <Tooltip anchorId={SAVE_BUTTON_ID} content="Hey! YOU, yes you! please enter some text to save" place="top" />
      )}
    </div>
  );
};

export default EditorPage;
