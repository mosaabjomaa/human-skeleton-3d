import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { Icon } from "./Icon";
export function LanguageSwitcher() {
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  return (
    <button
      className="language-button"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      aria-label={t("language")}
    >
      <Icon name="globe" />
      <span>{language === "en" ? "العربية" : "EN"}</span>
    </button>
  );
}
