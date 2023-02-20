import React, {createContext} from 'react';

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import resources from '../i18n/resource.json';
import {Language} from 'types/db';

const AppContext = createContext({
  lng: Language.ENGLISH,
  setLng: (lng: Language) => {
    console.log('setLng', lng);
  },
});

const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const [lng, setLng] = React.useState(Language.ENGLISH);
  i18n.use(initReactI18next).init({
    fallbackLng: Language.ENGLISH,
    interpolation: {
      escapeValue: false,
    },
    lng,
    resources,
  });
  return (
    <AppContext.Provider
      value={{
        lng,
        setLng,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => React.useContext(AppContext);

export default AppProvider;
