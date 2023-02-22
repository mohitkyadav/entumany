import React, {createContext} from 'react';

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import resources from '../i18n/resource.json';
import {Language} from 'types/db';
import {EntumanyDB} from 'services/db.service';

const AppContext = createContext<{
  availableLanguages: Language[];
  lng: Language;
  switchLanguage: (lng: Language) => void;
}>({
  availableLanguages: [],
  lng: Language.ENGLISH,
  switchLanguage: () => {},
});

const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const availableLanguages = Object.keys(resources) as Language[];
  const dbInstance = EntumanyDB.getInstance();

  const [lng, setLng] = React.useState(dbInstance.appOptions.appLanguage);

  i18n.use(initReactI18next).init({
    fallbackLng: Language.ENGLISH,
    interpolation: {
      escapeValue: false,
    },
    lng,
    resources,
  });

  const switchLanguage = (l: Language) => {
    dbInstance.updateAppLanguage(l);
    setLng(l);
  };

  return (
    <AppContext.Provider
      value={{
        availableLanguages,
        lng,
        switchLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => React.useContext(AppContext);

export default AppProvider;
