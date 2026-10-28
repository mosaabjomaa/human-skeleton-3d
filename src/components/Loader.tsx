import { useProgress } from "@react-three/drei";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
export function Loader() {
  const { active, progress } = useProgress();
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="atlas-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="loader-symbol">✳</div>
          <span className="eyebrow">OSSEO / 01</span>
          <h2>{t("loading")}</h2>
          <p>{t("loadingDetail")}</p>
          <div className="loader-track">
            <motion.i animate={{ width: `${progress}%` }} />
          </div>
          <span>{Math.round(progress)}%</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
