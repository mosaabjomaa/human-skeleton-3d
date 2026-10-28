import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { Icon } from "./Icon";
export function SearchBar() {
  const { t } = useTranslation();
  const query = useAppStore((state) => state.query);
  const setQuery = useAppStore((state) => state.setQuery);
  return (
    <div className="search-shell">
      <Icon name="search" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("search")}
        aria-label={t("search")}
      />
      {query && (
        <button onClick={() => setQuery("")} aria-label={t("clearSearch")}>
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
