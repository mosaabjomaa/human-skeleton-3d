import { useState } from "react";
import { useTranslation } from "react-i18next";
import { bones, boneGroups } from "../data/bones";
import { useAppStore } from "../store/useAppStore";
import { SearchBar } from "./SearchBar";
import { Icon } from "./Icon";
const normalized = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064b-\u065f]/g, "")
    .replace(/[أإآ]/g, "ا");
export function Sidebar() {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const query = useAppStore((s) => s.query);
  const region = useAppStore((s) => s.region);
  const group = useAppStore((s) => s.group);
  const selected = useAppStore((s) => s.selectedId);
  const open = useAppStore((s) => s.sidebarOpen);
  const [expanded, setExpanded] = useState<string | null>("skull");
  const filtered = bones.filter(
    (b) =>
      (region === "all" || b.region === region) &&
      (group === "all" || b.group === group) &&
      (!query ||
        normalized(`${b.name.en} ${b.name.ar} ${b.latinName} ${b.id}`).includes(
          normalized(query),
        )),
  );
  return (
    <>
      <button
        className={`library-scrim ${open ? "shown" : ""}`}
        aria-label={t("close")}
        tabIndex={open ? 0 : -1}
        onClick={() => useAppStore.getState().toggle("sidebarOpen")}
      />
      <aside
        className={`library ${open ? "library-open" : ""}`}
        aria-label={t("sidebarLabel")}
      >
        <div className="library-heading">
          <span className="eyebrow">{t("inventory")}</span>
          <span className="library-total">206</span>
          <button
            className="mobile-only icon-button"
            onClick={() => useAppStore.getState().toggle("sidebarOpen")}
            aria-label={t("close")}
          >
            <Icon name="close" />
          </button>
        </div>
        <SearchBar />
        <div className="region-tabs" role="group" aria-label={t("allGroups")}>
          {(["all", "axial", "appendicular"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={region === value}
              onClick={() => useAppStore.getState().setRegion(value)}
            >
              {t(value)}
            </button>
          ))}
        </div>
        <label className="group-select">
          <span>{t("allGroups")}</span>
          <select
            value={group}
            onChange={(event) =>
              useAppStore
                .getState()
                .setGroup(event.target.value as typeof group)
            }
          >
            <option value="all">{t("allGroups")}</option>
            {boneGroups.map((value) => (
              <option key={value} value={value}>
                {t(`groups.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <div className="library-results">
          <span>{t("browse")}</span>
          <span>{t("results", { count: filtered.length })}</span>
        </div>
        <div className="bone-tree">
          {boneGroups.map((key) => {
            const list = filtered.filter((b) => b.group === key);
            if (!list.length) return null;
            const isOpen = !!query || expanded === key || group === key;
            return (
              <div className="bone-group" key={key}>
                <button
                  className="bone-group-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(expanded === key ? null : key)}
                >
                  <Icon name="chevron" className={isOpen ? "expanded" : ""} />
                  <span>{t(`groups.${key}`)}</span>
                  <small>{list.length}</small>
                </button>
                {isOpen && (
                  <div className="bone-group-list">
                    {list.map((bone) => (
                      <button
                        key={bone.id}
                        className={
                          bone.id === selected
                            ? "bone-list-item selected"
                            : "bone-list-item"
                        }
                        onClick={() =>
                          useAppStore.getState().selectBone(bone.id)
                        }
                        aria-pressed={bone.id === selected}
                      >
                        <span>{bone.name[language]}</span>
                        <small>
                          {bone.side === "left"
                            ? "L"
                            : bone.side === "right"
                              ? "R"
                              : "•"}
                        </small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {!filtered.length && (
            <p className="empty-results">{t("noResults")}</p>
          )}
        </div>
        <div className="library-note">
          <span className="status-dot" />
          {t("modelVerified")}
          <small>{t("counts")}</small>
        </div>
      </aside>
    </>
  );
}
