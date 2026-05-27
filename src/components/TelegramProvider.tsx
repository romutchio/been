"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type TelegramWebApp = {
  initData: string;
  initDataUnsafe: {
    start_param?: string;
    user?: { id: number; username?: string };
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  themeParams: Record<string, string | undefined>;
  colorScheme: "light" | "dark";
  openLink: (url: string) => void;
  BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void };
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

type TelegramContextValue = {
  isTelegram: boolean;
  isReady: boolean;
  initData: string;
  startParam: string | null;
  webApp: TelegramWebApp | null;
  openExternal: (url: string) => void;
};

const TelegramContext = createContext<TelegramContextValue>({
  isTelegram: false,
  isReady: false,
  initData: "",
  startParam: null,
  webApp: null,
  openExternal: (url) => window.open(url, "_blank", "noopener"),
});

export function useTelegram() {
  return useContext(TelegramContext);
}

function applyTheme(webApp: TelegramWebApp) {
  const tp = webApp.themeParams;
  const root = document.documentElement;
  if (tp.bg_color) root.style.setProperty("--tg-bg", tp.bg_color);
  if (tp.text_color) root.style.setProperty("--tg-text", tp.text_color);
  if (tp.button_color) root.style.setProperty("--tg-button", tp.button_color);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  const init = useCallback(() => {
    const wa = window.Telegram?.WebApp;
    if (!wa?.initData) return;

    wa.ready();
    wa.expand();
    applyTheme(wa);
    setWebApp(wa);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initData) init();
  }, [init]);

  const isTelegram = isReady && !!webApp?.initData;

  const openExternal = useCallback(
    (url: string) => {
      if (webApp) webApp.openLink(url);
      else window.open(url, "_blank", "noopener");
    },
    [webApp],
  );

  const value = useMemo(
    () => ({
      isTelegram,
      isReady,
      initData: webApp?.initData ?? "",
      startParam: webApp?.initDataUnsafe?.start_param ?? null,
      webApp,
      openExternal,
    }),
    [isTelegram, isReady, webApp, openExternal],
  );

  return (
    <TelegramContext.Provider value={value}>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={init}
      />
      {children}
    </TelegramContext.Provider>
  );
}
