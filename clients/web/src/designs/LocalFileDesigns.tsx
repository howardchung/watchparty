import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, FileVideo, FolderOpen, Link2, X } from "lucide-react";
import { Avatar } from "../components/Avatar";
import {
  Button,
  Dialog,
  LoadingIndicator,
  Snackbar,
  StatusCard,
  TextField,
} from "../components/Material";
import { PartyScreen } from "../screens/PartyScreen";
import { defaultIdentity, makePreviewParty } from "../previewStates";
import { setLanguage, useLanguage } from "../i18n";
import { useThemePalette } from "../theme";
import type { StreamStatus } from "../types";
import "../components/group-sync.css";
import "./sync-designs.css";
import "./local-file-designs.css";

type Response = "pending" | "ready" | "declined" | "failed";
type Phase = "empty" | "request" | "preparing" | "countdown" | "playing";
const movie = "The Secret Life of Walter Mitty (2013).mp4";
const people = [
  ...makePreviewParty("owner", defaultIdentity).participants,
  { id: "mira", name: "Mira", avatarId: "mint" as const },
];
const initialResponses: Record<string, Response> = {
  ellis: "pending",
  jo: "pending",
  mira: "pending",
};

export default function LocalFileDesigns() {
  const fa = useLanguage() === "fa";
  const c = (en: string, pe: string) => (fa ? pe : en);
  const q = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<"light" | "dark">(
    q.get("theme") === "light" ? "light" : "dark",
  );
  const [large, setLarge] = useState(q.get("scale") === "large");
  const [owner, setOwner] = useState(q.get("role") !== "viewer");
  const [phase, setPhase] = useState<Phase>(
    q.get("role") === "viewer" ? "request" : "empty",
  );
  const [filename, setFilename] = useState(
    q.get("role") === "viewer" ? movie : "",
  );
  const [ownFile, setOwnFile] = useState("");
  const [responses, setResponses] = useState(initialResponses);
  const [open, setOpen] = useState(q.get("role") === "viewer");
  const [changeOpen, setChangeOpen] = useState(
    q.get("dialog") === "choose-video",
  );
  const [changeMode, setChangeMode] = useState<"choice" | "stream">("choice");
  const [streamUrl, setStreamUrl] = useState("");
  const [reading, setReading] = useState(false);
  const [selection, setSelection] = useState(movie);
  const [offline, setOffline] = useState(false);
  const [count, setCount] = useState(3);
  const [status, setStatus] = useState<StreamStatus>("paused");
  const [position, setPosition] = useState(0);
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const beforeSync = useRef<{ status: StreamStatus; position: number } | null>(
    null,
  );
  function failSync() {
    const previous = beforeSync.current ?? { status, position };
    setStatus(previous.status);
    setPosition(previous.position);
    setPhase(filename ? "playing" : "empty");
    setOpen(false);
    beforeSync.current = null;
    setNotice(
      c(
        "Couldn’t sync. Back to where you were.",
        "هماهنگ نشد. برگشتیم به حالت قبلی.",
      ),
    );
  }
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useThemePalette(theme === "dark");
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textScale = large ? "large" : "standard";
    return () => {
      delete document.documentElement.dataset.textScale;
    };
  }, [theme, large]);
  useEffect(() => {
    if (!reading) return;
    const timer = window.setTimeout(() => {
      setReading(false);
      setChangeOpen(false);
      setOpen(true);
      setPhase("request");
      if (owner) {
        beforeSync.current = null;
        setFilename(selection);
        setStatus("paused");
        setPosition(0);
        setResponses(initialResponses);
        setOwnFile("");
      } else {
        setOwnFile(selection);
        setResponses((r) => ({ ...r, ellis: "ready" }));
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [reading, owner, selection]);
  useEffect(() => {
    if (phase !== "preparing") return;
    const timer = window.setTimeout(() => {
      setCount(3);
      setPhase("countdown");
      setOpen(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = window.setTimeout(() => {
      if (count > 0) setCount(count - 1);
      else {
        setPhase("playing");
        setStatus("playing");
        beforeSync.current = null;
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [phase, count]);
  useEffect(() => {
    if (offline && (phase === "preparing" || phase === "countdown")) {
      failSync();
    }
  }, [offline, phase]);
  const ready = Object.values(responses).filter((v) => v === "ready").length;
  const selfResponse = responses.ellis;
  const playable =
    !!filename && (owner || (!!ownFile && selfResponse !== "declined"));
  const locked = phase !== "playing";
  const reset = () => {
    beforeSync.current = null;
    setPhase("empty");
    setFilename("");
    setOwnFile("");
    setOpen(false);
    setStatus("paused");
    setPosition(0);
    setResponses(initialResponses);
    setChangeOpen(false);
    setStreamUrl("");
  };
  const pick = () => {
    if (!offline && !reading) input.current?.click();
  };
  const changeSource = () => {
    if (!owner) {
      pick();
      return;
    }
    setChangeMode("choice");
    setChangeOpen(true);
  };
  const start = () => {
    if (!offline && ready > 0) {
      beforeSync.current = { status, position };
      setPhase("preparing");
      setOpen(true);
      setStatus("paused");
    }
  };
  const skip = () => {
    setResponses((r) => ({ ...r, ellis: "declined" }));
    setOwnFile("");
    setOpen(false);
  };
  const label = (r: Response) =>
    r === "ready"
      ? c("Ready", "آماده است")
      : r === "declined"
        ? c("Not watching", "فیلم نمی‌بینه")
        : r === "failed"
          ? c("Couldn’t sync", "هماهنگ نشد")
          : c("Choosing a file…", "داره فایل رو انتخاب می‌کنه…");
  const party = {
    ...makePreviewParty("owner", defaultIdentity),
    role: owner ? ("owner" as const) : ("participant" as const),
    ownerName: c("Ice Queen", "ملکه یخی"),
    participants: people.map((p) => ({
      ...p,
      isSelf: owner ? p.id === "self" : p.id === "ellis",
      isOwner: p.id === "self",
    })),
  };
  const fileCard = (
    <div className="local-file-card">
      <FileVideo aria-hidden="true" size={28} />
      <div>
        <span>{c("File to choose", "فایلی که انتخاب می‌کنیم")}</span>
        <strong>
          <bdi>{filename}</bdi>
        </strong>
      </div>
    </div>
  );
  const emptyMedia = (
    <section className="local-file-empty">
      <FolderOpen size={48} aria-hidden="true" />
      <h1>
        {phase === "empty"
          ? c("What are we watching?", "چی ببینیم؟")
          : selfResponse === "declined"
            ? c("You’re sitting this one out", "این یکی رو نمی‌بینی")
            : c("Choose your copy", "فایل خودت رو انتخاب کن")}
      </h1>
      {filename && fileCard}
      <p>
        {phase === "empty"
          ? c(
              "A video link or a file on your device.",
              "لینک فیلم یا یه فایل از دستگاهت.",
            )
          : c(
              "No file, no video. You can still hang out in voice.",
              "بدون فایل، فیلمی نمی‌بینی. میتونی توی گفت‌وگو بمونی.",
            )}
      </p>
      {(owner || filename) && (
        <Button
          icon={<FolderOpen size={18} />}
          disabled={offline}
          onClick={pick}
        >
          {c("Choose file", "انتخاب فایل")}
        </Button>
      )}
      {phase === "empty" && owner && (
        <Button
          variant="text"
          onClick={() => location.assign("?preview=owner-empty")}
        >
          {c("Use a video link", "استفاده از لینک فیلم")}
        </Button>
      )}
    </section>
  );
  const requestActions = (
    <div className="group-sync-actions">
      {owner ? (
        <>
          <Button variant="text" disabled={offline} onClick={reset}>
            {c("Cancel request", "لغو درخواست")}
          </Button>
          <Button disabled={offline || ready === 0} onClick={start}>
            {c("Start with", "شروع با")} {ready}
          </Button>
        </>
      ) : selfResponse === "ready" ? (
        <>
          <span className="group-sync-waiting" role="status">
            <span className="group-sync-waiting__spinner" aria-hidden="true" />
            {c("Waiting for the owner…", "منتظر تصمیم میزبان…")}
          </span>
          <Button variant="outlined" disabled={offline} onClick={skip}>
            {c("Sit this one out", "این یکی رو نمی‌بینم")}
          </Button>
        </>
      ) : (
        <>
          <Button variant="text" disabled={offline} onClick={skip}>
            {c("Skip · no video", "نمیام · بدون فیلم")}
          </Button>
          <Button disabled={offline} onClick={pick}>
            {c("Choose file", "انتخاب فایل")}
          </Button>
        </>
      )}
    </div>
  );
  return (
    <div className="sync-designs local-file-designs">
      <div className="sync-preview-bar">
        <strong>
          {c("Local files · Design preview", "فایل محلی · پیش‌نمایش طرح")}
        </strong>
        <div>
          <label>
            {c("View as", "نمایش برای")}{" "}
            <select
              aria-label="Preview role"
              value={owner ? "owner" : "viewer"}
              onChange={(e) => {
                setOwner(e.target.value === "owner");
                setOpen(false);
                if (!filename) {
                  setFilename(movie);
                  setPhase("request");
                }
              }}
            >
              <option value="owner">{c("Owner", "میزبان")}</option>
              <option value="viewer">
                {c("Viewer · Ellis", "تماشاگر · الیس")}
              </option>
            </select>
          </label>
          <Button
            variant="text"
            onClick={() => setLanguage(fa ? "English" : "فارسی")}
          >
            {fa ? "English" : "فارسی"}
          </Button>
          <Button
            variant="text"
            aria-pressed={large}
            onClick={() => setLarge(!large)}
          >
            Aa+
          </Button>
          <Button
            variant="tonal"
            onClick={() => {
              setChangeMode("choice");
              setChangeOpen(true);
            }}
          >
            {c("Preview Choose video", "نمایش انتخاب فیلم")}
          </Button>
          <Button variant="text" onClick={reset}>
            {c("Reset", "از اول")}
          </Button>
        </div>
      </div>
      <PartyScreen
        party={party}
        theme={theme}
        streamStatus={phase === "empty" && owner ? "empty" : status}
        aborting={false}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onStartStream={() => location.assign("?preview=player-playing")}
        onSetStreamStatus={setStatus}
        onAbort={async () => reset()}
        onLeave={reset}
        onNotify={setNotice}
        localFilePreview={{
          media:
            phase === "empty" && owner
              ? undefined
              : !playable
                ? emptyMedia
                : undefined,
          entryTitle: c("Bring in a video", "یه فیلم انتخاب کن"),
          entryAction: (
            <Button
              fullWidth
              icon={<FolderOpen size={19} aria-hidden="true" />}
              disabled={offline}
              onClick={pick}
            >
              {c("Choose file", "انتخاب فایل")}
            </Button>
          ),
          source: filename ? (
            <section className="source-row">
              <FileVideo aria-hidden="true" />
              <div>
                <span>{c("Your local file", "فایل روی دستگاهت")}</span>
                <strong>
                  <bdi>
                    {owner
                      ? filename
                      : ownFile || c("None selected", "انتخاب نشده")}
                  </bdi>
                </strong>
              </div>
              <Button
                variant="text"
                disabled={
                  offline || phase === "preparing" || phase === "countdown"
                }
                onClick={changeSource}
              >
                {c("Change", "تغییر")}
              </Button>
            </section>
          ) : null,
          actions:
            owner && filename ? (
              <Button
                variant="danger"
                disabled={
                  phase === "preparing" || phase === "countdown" || offline
                }
                onClick={reset}
              >
                {c("End for everyone", "پایان برای همه")}
              </Button>
            ) : null,
        }}
        syncPreview={{
          locked,
          position,
          onPositionChange: setPosition,
          overlay:
            phase === "countdown" ? (
              <div className="group-sync-countdown" role="status">
                <strong>{count || c("Action", "حرکت")}</strong>
              </div>
            ) : locked ? (
              <div className="local-file-player-state">
                {phase === "preparing"
                  ? c("Getting everyone ready…", "داریم آماده می‌شیم…")
                  : c("Paused for you", "برای تو متوقفه")}
              </div>
            ) : undefined,
          band: (
            <div className="local-file-band">
              {offline && (
                <StatusCard title={c("You’re offline", "اتصال قطع شده")}>
                  {c(
                    "Reconnect to send requests or sync.",
                    "برای درخواست و هماهنگی دوباره وصل شو.",
                  )}
                </StatusCard>
              )}
              {filename && (
                <div className="sync-entry">
                  <div>
                    <strong>
                      {phase === "playing"
                        ? status === "playing"
                          ? c("Playing for you", "برای تو در حال پخشه")
                          : c("Paused for you", "برای تو متوقفه")
                        : owner
                          ? `${ready}/3 ${c("ready", "آماده")}`
                          : label(selfResponse)}
                    </strong>
                    <span>
                      <bdi>{filename}</bdi>
                    </span>
                  </div>
                  <Button
                    variant="tonal"
                    disabled={offline || phase === "countdown"}
                    onClick={() => setOpen(true)}
                  >
                    {phase === "playing"
                      ? c("Sync together", "هماهنگی با هم")
                      : c("View file request", "نمایش درخواست فایل")}
                  </Button>
                </div>
              )}
            </div>
          ),
        }}
      />
      <details className="sync-simulator" open>
        <summary>
          {c(
            "Preview controls · fake participants",
            "کنترل پیش‌نمایش · افراد آزمایشی",
          )}
        </summary>
        <div>
          {people
            .filter((p) => p.id !== "self")
            .map((p) => (
              <label key={p.id}>
                <bdi>{p.name}</bdi>
                <select
                  aria-label={`${p.name} response`}
                  disabled={
                    phase === "empty" ||
                    phase === "preparing" ||
                    phase === "countdown"
                  }
                  value={responses[p.id]}
                  onChange={(e) => {
                    const response = e.target.value as Response;
                    setResponses((r) => ({ ...r, [p.id]: response }));
                    if (p.id === "ellis")
                      setOwnFile(response === "ready" ? filename : "");
                  }}
                >
                  <option value="pending">
                    {c("Choosing", "در حال انتخاب")}
                  </option>
                  <option value="ready">{c("Ready", "آماده")}</option>
                  <option value="declined">{c("Declined", "رد کرده")}</option>
                  <option value="failed">
                    {c("Sync failed", "خطای هماهنگی")}
                  </option>
                </select>
              </label>
            ))}
          <Button
            variant="outlined"
            aria-pressed={offline}
            onClick={() => setOffline(!offline)}
          >
            {offline
              ? c("Reconnect", "اتصال دوباره")
              : c("Go offline", "قطع اتصال")}
          </Button>
          <Button
            variant="outlined"
            disabled={!filename || !playable}
            onClick={failSync}
          >
            {c("Simulate sync failure", "نمایش خطای هماهنگی")}
          </Button>
          {!owner && filename && (
            <Button
              disabled={
                offline ||
                selfResponse !== "ready" ||
                phase === "preparing" ||
                phase === "countdown"
              }
              onClick={start}
            >
              {c("Simulate owner starting", "شروع آزمایشی توسط میزبان")}
            </Button>
          )}
          <span>
            {c(
              "No uploads. File names only; matching is never checked. Playback is simulated.",
              "آپلودی نداریم. فقط اسم فایل؛ یکسان بودنش چک نمی‌شه. پخش آزمایشیه.",
            )}
          </span>
        </div>
      </details>
      <Dialog
        className="group-sync-dialog"
        open={open && !reading}
        title={
          owner
            ? c("Who’s ready to watch?", "کی آماده‌ست ببینیم؟")
            : c("Let’s watch a file", "بیا یه فایل ببینیم")
        }
        onClose={() => setOpen(false)}
        actions={phase === "preparing" ? null : requestActions}
      >
        {!owner && (
          <div className="group-sync-inviter">
            <FolderOpen aria-hidden="true" />
            <strong>
              {party.ownerName} {c("picked a file", "یه فایل انتخاب کرده")}
            </strong>
          </div>
        )}
        {fileCard}
        {phase === "preparing" ? (
          <LoadingIndicator
            expressive
            label={c("Getting everyone ready", "داریم همه رو آماده می‌کنیم")}
          />
        ) : (
          <>
            <div className="group-sync-time local-file-target">
              <span>{c("Meet at", "قرارمون در")}</span>
              <strong dir="ltr">
                {Math.floor(position / 60)}:
                {String(position % 60).padStart(2, "0")}
              </strong>
            </div>
            {owner ? (
              <div className="group-sync-roster">
                {people
                  .filter((p) => p.id !== "self")
                  .map((p) => (
                    <div
                      key={p.id}
                      className={`group-sync-person group-sync-person--${responses[p.id] === "ready" ? "accepted" : responses[p.id] === "declined" || responses[p.id] === "failed" ? "declined" : "pending"}`}
                    >
                      <Avatar
                        avatarId={p.avatarId}
                        label={p.name}
                        size="small"
                      />
                      <div>
                        <strong>
                          <bdi>{p.name}</bdi>
                        </strong>
                        <span>{label(responses[p.id])}</span>
                      </div>
                      {responses[p.id] === "ready" ? (
                        <Check aria-hidden="true" size={18} />
                      ) : responses[p.id] !== "pending" ? (
                        <X aria-hidden="true" size={18} />
                      ) : (
                        <span
                          className="group-sync-waiting__spinner"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p>
                {ownFile && selfResponse === "ready" ? (
                  <bdi>{ownFile}</bdi>
                ) : (
                  c(
                    "Choose a copy on your device. Nothing gets uploaded.",
                    "نسخه‌ی روی دستگاهت رو انتخاب کن. چیزی آپلود نمی‌شه.",
                  )
                )}
              </p>
            )}
            {offline && (
              <StatusCard title={c("You’re offline", "اتصال قطع شده")}>
                {c("Reconnect to continue.", "برای ادامه دوباره وصل شو.")}
              </StatusCard>
            )}
            {owner && (
              <Button
                className="local-file-demo-replies"
                variant="text"
                disabled={offline}
                onClick={() => {
                  setResponses({
                    ellis: "ready",
                    jo: "pending",
                    mira: "declined",
                  });
                  setOwnFile(filename);
                }}
              >
                {c("Preview: show mixed replies", "پیش‌نمایش: پاسخ‌های مختلف")}
              </Button>
            )}
            {owner && Object.values(responses).some((r) => r !== "ready") && (
              <p className="local-file-consequence">
                {c(
                  "Only ready viewers will watch. Everyone else stays without video.",
                  "فقط افراد آماده فیلم می‌بینن. بقیه بدون فیلم توی دورهمی می‌مونن.",
                )}
              </p>
            )}
          </>
        )}
      </Dialog>
      <input
        ref={input}
        type="file"
        accept="video/*,.mkv,.avi,.mov"
        hidden
        onChange={(event) => {
          const name = event.target.files?.[0]?.name;
          event.target.value = "";
          if (!name) return;
          setSelection(name);
          setOpen(false);
          setChangeOpen(false);
          setReading(true);
        }}
      />
      <Dialog
        open={reading}
        title={c("Opening file…", "در حال باز کردن فایل…")}
        onClose={() => {}}
        actions={null}
      >
        <LoadingIndicator
          expressive
          label={c("Getting your file ready", "داریم فایلت رو آماده می‌کنیم")}
        />
      </Dialog>
      <Dialog
        className="local-file-picker"
        open={changeOpen}
        title={
          changeMode === "choice"
            ? c("Choose video", "انتخاب فیلم")
            : c("Stream from a URL", "پخش از لینک")
        }
        onClose={() => setChangeOpen(false)}
        actions={
          changeMode === "stream" ? (
            <>
              <Button variant="text" onClick={() => setChangeMode("choice")}>
                {c("Back", "برگشت")}
              </Button>
              <Button
                disabled={
                  offline || !/^https?:\/\/[^\s]+$/i.test(streamUrl.trim())
                }
                onClick={() => location.assign("?preview=player-playing")}
              >
                {c("Start stream", "شروع فیلم")}
              </Button>
            </>
          ) : null
        }
      >
        {changeMode === "choice" ? (
          <div className="local-file-options video-source-options video-source-options--tiles">
            <Button
              variant="tonal"
              icon={<FolderOpen size={36} aria-hidden="true" />}
              disabled={offline}
              onClick={pick}
            >
              {c("Local file", "فایل محلی")}
            </Button>
            <Button
              variant="tonal"
              icon={<Link2 size={36} aria-hidden="true" />}
              disabled={offline}
              onClick={() => setChangeMode("stream")}
            >
              {c("Stream URL", "لینک فیلم")}
            </Button>
          </div>
        ) : (
          <TextField
            label={c("Direct video URL", "نشانی مستقیم ویدیو")}
            value={streamUrl}
            onChange={setStreamUrl}
            inputMode="url"
            placeholder="https://media.example.org/film.mp4"
            disabled={offline}
          />
        )}
      </Dialog>
      <Snackbar message={notice} onDismiss={() => setNotice("")} />
    </div>
  );
}
