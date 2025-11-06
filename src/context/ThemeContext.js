import React, {createContext, useContext, useState, useEffect} from 'react';
import * as Font from 'expo-font';

const ThemeCtx = createContext({ dark:true, toggle:()=>{}, fontReady:false });
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({children}) {
  const [dark, setDark] = useState(true);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        Vazir: require('../assets/fonts/Vazir.ttf'), // فایل فونت را داخل src/assets/fonts بگذار
      });
      setFontReady(true);
    })();
  }, []);

  return (
    <ThemeCtx.Provider value={{ dark, toggle:()=>setDark(v=>!v), fontReady }}>
      {children}
    </ThemeCtx.Provider>
  );
}
