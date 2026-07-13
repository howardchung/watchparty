import React, { FormEvent, useContext, useState } from "react";
import { Button, TextInput } from "@mantine/core";
import {
  IconArrowLeft,
  IconBadgeCc,
  IconLink,
  IconMessageFilled,
  IconPlayerPlayFilled,
  IconRefresh,
} from "@tabler/icons-react";
import { MetadataContext } from "../../MetadataContext";
import { createRoom } from "../TopBar/TopBar";
import { t } from "../../i18n";
import styles from "./Home.module.css";

const features = [
  {
    icon: IconRefresh,
    title: t("featureSync"),
    text: t("featureSyncText"),
    color: "teal",
  },
  {
    icon: IconMessageFilled,
    title: t("featureChat"),
    text: t("featureChatText"),
    color: "coral",
  },
  {
    icon: IconBadgeCc,
    title: t("featureSubtitles"),
    text: t("featureSubtitlesText"),
    color: "amber",
  },
];

const steps = [
  {
    number: "۱",
    title: t("stepRoom"),
    text: t("stepRoomText"),
    icon: "＋",
  },
  {
    number: "۲",
    title: t("stepShare"),
    text: t("stepShareText"),
    icon: "↗",
  },
  {
    number: "۳",
    title: t("stepPlay"),
    text: t("stepPlayText"),
    icon: "▶",
  },
];

export const Home = () => {
  const { user } = useContext(MetadataContext);
  const [source, setSource] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const submitCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsCreating(true);
    try {
      await createRoom(user, false, source.trim());
    } catch (createError) {
      console.error(createError);
      setError("ساخت اتاق انجام نشد. دوباره تلاش کنید.");
      setIsCreating(false);
    }
  };

  const joinRoom = () => {
    const value = window.prompt("لینک اتاق را وارد کنید:");
    if (!value) {
      return;
    }
    try {
      const url = new URL(value, window.location.origin);
      if (!url.pathname.startsWith("/watch/") && !url.pathname.startsWith("/r/")) {
        setError("این لینک، لینک معتبر اتاق نیست.");
        return;
      }
      window.location.assign(url.pathname + url.search);
    } catch {
      setError("این لینک معتبر نیست.");
    }
  };

  return (
    <main className={styles.homePage} dir="rtl">
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.heroTitleRow}>
            <span className={styles.heroPlayMark}>
              <IconPlayerPlayFilled size={18} />
            </span>
            <span className={styles.heroKicker}>تماشای خصوصی، با هم</span>
          </div>
          <h1>{t("homeHeadline")}</h1>
          <p>{t("homeSubhead")}</p>
          <form className={styles.createForm} onSubmit={submitCreate}>
            <TextInput
              aria-label={t("source")}
              className={styles.sourceInput}
              value={source}
              onChange={(event) => setSource(event.currentTarget.value)}
              placeholder={t("sourcePlaceholder")}
              leftSection={<IconLink size={18} />}
              dir="ltr"
            />
            <span className={styles.formHelper}>{t("homeHelper")}</span>
            <div className={styles.heroActions}>
              <Button
                type="submit"
                loading={isCreating}
                className={styles.primaryAction}
                leftSection={<IconPlayerPlayFilled size={18} />}
              >
                {t("createRoom")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={styles.secondaryAction}
                rightSection={<IconArrowLeft size={18} />}
                onClick={joinRoom}
              >
                {t("joinRoom")}
              </Button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
          </form>
        </div>
        <div className={styles.heroPreview}>
          <div className={styles.previewFrame}>
            <img
              src="/watch-room-preview.png"
              alt="پیش‌نمایش اتاق تماشای Watch"
            />
          </div>
        </div>
      </section>

      <section className={styles.featureBand} aria-label="امکانات">
        {features.map(({ icon: FeatureIcon, title, text, color }) => (
          <div className={styles.feature} key={title}>
            <span className={`${styles.featureIcon} ${styles[color]}`}>
              <FeatureIcon size={22} />
            </span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.stepsSection}>
        <h2>{t("howItWorks")}</h2>
        <div className={styles.steps}>
          {steps.map((step) => (
            <article className={styles.step} key={step.number}>
              <div className={styles.stepTop}>
                <span className={styles.stepNumber}>{step.number}</span>
                <span className={styles.stepIcon}>{step.icon}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
