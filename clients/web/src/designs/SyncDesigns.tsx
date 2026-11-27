import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Check,
  Columns2,
  Layers,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Button, Dialog, LoadingIndicator, Snackbar } from "../components/Material";
import { PartyScreen } from "../screens/PartyScreen";
import { defaultIdentity, makePreviewParty } from "../previewStates";
import faCopy from "../fa.json";
import { t, setLanguage, useLanguage } from "../i18n";
import { useThemePalette } from "../theme";
import type { StreamStatus } from "../types";
import "./sync-designs.css";
type Phase =
  | "idle"
  | "compose"
  | "inviting"
  | "preparing"
  | "countdown"
  | "done"
  | "failed";
type Response = "pending" | "accepted" | "declined" | "withdrawn";
const concepts = [
  {
    id: "inline",
    icon: Layers,
    title: ["Together, right here", "همین‌جا، با هم"],
    body: [
      "An unfolding panel beneath the movie. Everything stays in context.",
      "پنلی زیر فیلم؛ همه‌چیز همین‌جا در دسترس است.",
    ],
  },
  {
    id: "side",
    icon: Columns2,
    title: ["A place for everyone", "جایی برای همه"],
    body: [
      "A dedicated panel for the group. The movie stays in view.",
      "پنلی برای هماهنگی دوستان، کنار فیلم.",
    ],
  },
  {
    id: "sheet",
    icon: Sparkles,
    title: ["One shared moment", "یک لحظه، با هم"],
    body: [
      "A focused invitation. Gather, prepare, and roll.",
      "یک دعوت ساده؛ جمع شویم و با هم شروع کنیم.",
    ],
  },
] as const;
const people = [
  { name: "Skeleton Detective", avatar: "sunny" },
  { name: "Captain Octopus", avatar: "berry" },
  { name: "Wolf Barista", avatar: "orbit" },
] as const;
export default function SyncDesigns() {
  const q = new URLSearchParams(location.search),
    fa = useLanguage() === "fa";
  const c = (en: string, pe: string) => (fa ? (faCopy as Record<string, string>)[en] ?? pe : t(en));
  const [variant, setVariant] = useState(q.get("variant") || "sheet");
  const [owner, setOwner] = useState(q.get("role") !== "viewer");
  const [theme, setTheme] = useState<"light" | "dark">(
    q.get("theme") === "dark" ? "dark" : "light",
  );
  const [large, setLarge] = useState(q.get("scale") === "large");
  const [phase, setPhase] = useState<Phase>(
    q.get("scene") === "inviting"
      ? "inviting"
      : q.get("scene") === "compose"
        ? "compose"
        : "idle",
  );
  const [responses, setResponses] = useState<Response[]>([
    "pending",
    "pending",
    "pending",
  ]);
  const [members, setMembers] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0),
    [count, setCount] = useState(3);
  const [open, setOpen] = useState(
      q.get("scene") === "inviting" || q.get("scene") === "compose",
    ),
    [scenario, setScenario] = useState("normal");
  const [notice, setNotice] = useState(""),
    [status, setStatus] = useState<StreamStatus>(
      q.get("scene") === "inviting" && q.get("role") !== "viewer"
        ? "paused"
        : "playing",
    );
  const [position, setPosition] = useState(1122);
  const [target, setTarget] = useState(1122);
  const previousPlayback = useRef<StreamStatus>("playing");
  const acceptancePosition = useRef(1122);
  const excludedViewer = useRef(false);
  const displayTarget = phase === "compose" ? position : target;
  const targetLabel = `${Math.floor(displayTarget / 60)}:${String(displayTarget % 60).padStart(2, "0")}`;
  useThemePalette(theme === "dark");
  const party = makePreviewParty(
    owner ? "owner" : "participant",
    defaultIdentity,
  );
  party.title = "Friday night screening";
  party.ownerName = "Ice Queen";
  party.participants = [
    {
      id: "owner",
      name: "Ice Queen",
      avatarId: "comet",
      isOwner: true,
      isSelf: owner,
    },
    ...people.map((p, i) => ({
      id: p.name,
      name: p.name,
      avatarId: p.avatar,
      isSelf: !owner && i === 0,
      isMuted: true,
    })),
  ];
  const concept = concepts.find((x) => x.id === variant) || concepts[0];
  const committed = phase === "preparing" || phase === "countdown";
  const included = owner || members.includes(0);
  const locked =
    (phase === "inviting" && (owner || responses[0] === "accepted")) ||
    (committed && included);
  const active = phase === "inviting" || committed;
  useEffect(() => {
    if (status !== "playing" || locked) return;
    const timer = setInterval(
      () => setPosition((value) => Math.min(value + 1, 6138)),
      1000,
    );
    return () => clearInterval(timer);
  }, [status, locked, owner]);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dir = fa || q.get("dir") === "rtl" ? "rtl" : "ltr";
    const before = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = large ? "20px" : "16px";
    return () => {
      document.documentElement.style.fontSize = before;
    };
  }, [theme, large, fa]);
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set("variant", variant);
    url.searchParams.set("role", owner ? "owner" : "viewer");
    history.replaceState(null, "", url);
  }, [variant, owner]);
  useEffect(() => {
    if (phase !== "inviting" || !owner || scenario !== "normal") return;
    const timers = [1600, 3200, 5200].map((delay, i) =>
      setTimeout(
        () =>
          setResponses((r) =>
            r.map((v, j) =>
              j === i ? (i === 1 ? "declined" : "accepted") : v,
            ),
          ),
        delay,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, owner, scenario]);
  useEffect(() => {
    if (phase !== "preparing") return;
    const startedAt = Date.now();
    const duration = scenario === "normal" ? 3000 : 8000;
    const timer = setInterval(() => {
      const age = Date.now() - startedAt;
      setElapsed(Math.floor(age / 1000));
      if (age < duration) return;
      clearInterval(timer);
      if (scenario === "failure") {
        setPhase("failed");
        if (included) setStatus("paused");
        setOpen(true);
      } else {
        if (scenario === "slow") {
          excludedViewer.current = members.length > 0;
          setMembers((m) => m.slice(0, -1));
          if (!owner && members.at(-1) === 0) {
            setStatus("paused");
            setNotice(
              c(
                "You were excluded after connection loss. Resume locally or catch up after the group starts.",
                "پس از قطع ارتباط از هماهنگی کنار گذاشته شدی. میتونی فیلم رو ادامه بدی یا بعدا هماهنگ بشی.",
              ),
            );
          }
        }
        setPhase("countdown");
        setCount(3);
        setOpen(false);
      }
    }, 250);
    return () => clearInterval(timer);
    // Membership and readiness scenario are frozen at the commit boundary.
  }, [phase, scenario, owner]);
  useEffect(() => {
    if (phase !== "countdown") return;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const age = Date.now() - startedAt;
      setCount(Math.max(0, 3 - Math.floor(age / 1000)));
      if (age < 4000) return;
      clearInterval(timer);
      setPhase("done");
      if (included) {
        setPosition(target);
        setStatus("playing");
      }
    }, 100);
    return () => clearInterval(timer);
  }, [phase, included]);
  useEffect(() => {
    if (phase === "done" && owner && excludedViewer.current) {
      setNotice(c(
        "Started with ready viewers. The disconnected viewer can catch up later.",
        "با اونایی که آماده بودن شروع کردیم. کسی که قطع شد میتونه بعدا هماهنگ بشه.",
      ));
    }
  }, [phase, owner]);
  function reset() {
    setNotice("");
    setPhase("idle");
    setResponses(["pending", "pending", "pending"]);
    setMembers([]);
    setOpen(false);
    setStatus("playing");
    setElapsed(0);
    setPosition(1122);
  }
  function invite() {
    setPhase("inviting");
    setResponses(["pending", "pending", "pending"]);
    setOpen(true);
    if (owner) {
      previousPlayback.current = status;
      setTarget(position);
      setStatus("paused");
    }
  }
  function respond(value: Response) {
    setResponses((r) => r.map((v, i) => (i === 0 ? value : v)));
    if (value === "accepted") {
      previousPlayback.current = status;
      acceptancePosition.current = position;
    }
    if (value === "withdrawn") {
      setPosition(acceptancePosition.current);
      setStatus("playing");
      setOpen(false);
      return;
    }
    setStatus(value === "accepted" ? "paused" : status);
  }
  function commit() {
    excludedViewer.current = false;
    if (owner || responses[0] === "accepted") setPosition(target);
    setMembers(responses.flatMap((v, i) => (v === "accepted" ? [i] : [])));
    setElapsed(0);
    setPhase("preparing");
  }
  function cancel() {
    const restore =
      owner || responses[0] === "accepted" ? previousPlayback.current : status;
    const restorePosition = position;
    reset();
    setStatus(restore);
    setPosition(restorePosition);
    setNotice(
      c(
        "Request cancelled. Everyone keeps their own playback.",
        "میزبان بیخیال شد، هرکس فیلم خودشو ادامه میده.",
      ),
    );
  }
  const labels: Record<Response, string> = {
    pending: c("No response · watching", "بی‌پاسخ · در حال تماشا"),
    accepted: c("Accepted · paused", "پذیرفت · متوقف"),
    declined: c("Declined · watching", "نپذیرفت · در حال تماشا"),
    withdrawn: c("Withdrew · watching", "انصراف داد · در حال تماشا"),
  };
  const title =
    phase === "compose"
      ? c("Sync together", "هماهنگ شیم")
      : phase === "inviting"
        ? owner
          ? c("Who's joining?", "کی همراه می‌شه؟")
          : c("Ice Queen saved you a moment", `${party.ownerName} ازت خواسته باهم ببینید`)
        : phase === "preparing"
          ? c("Getting everyone ready", "آماده می‌شویم")
          : phase === "failed"
            ? c("We couldn’t start together", "شروع هماهنگ ممکن نشد")
            : c("Back to the movie", "برگردیم به فیلم");
  const panel = (
    <section
      className={`sync-panel sync-panel--${variant}`}
      aria-label={c("Group synchronization", "هماهنگی گروهی")}
    >
      {phase !== "compose" && (
        <header>
          <span className="sync-emblem">
            <RefreshCw size={24} />
          </span>
          <div>
            <span className="eyebrow">
              {(owner || phase !== "inviting") && c("WATCH TOGETHER", "با هم ببینیم")}
            </span>
            <h2>{title}</h2>
          </div>
        </header>
      )}
      <div className="sync-target">
        <span>{c("Meet at", "قرار ما در")}</span>
        <strong dir="ltr">{targetLabel}</strong>
        {phase === "compose" && <small>{c("Live with your playback", "هم‌زمان با پخش فیلمت")}</small>}
      </div>
      {phase !== "compose" && phase !== "preparing" && !(phase === "inviting" && (owner || fa)) && (
        <p>
          {phase === "inviting"
            ? responses[0] === "accepted"
              ? c(
                  "You’re in. You can withdraw any time before Ice Queen starts.",
                  "",
                )
              : c(
                  "Accept to pause your movie and join Ice Queen. Until the owner starts, you can change your mind.",
                  "",
                )
            : phase === "failed"
                ? c(
                    "The owner’s player is unavailable. Sync ended automatically. Your movie stays paused; resume when ready.",
                    "پخش‌کننده میزبان قطع شد و هماهنگی متوقف شد. هر وقت خواستی فیلمت رو ادامه بده.",
                  )
                : c(
                    "Your local controls are yours again.",
                    "کنترل فیلم دوباره دست خودته.",
                  )}
        </p>
      )}
      {phase === "inviting" && (
        <div className="sync-roster">
          {people.map((p, i) => (
            <div
              className={`sync-person ${responses[i] === "accepted" ? "is-accepted" : responses[i] === "declined" ? "is-declined" : ""}`}
              key={p.name}
            >
              <Avatar avatarId={p.avatar} label={p.name} size="small" />
              <div>
                <strong>{!owner && i === 0 ? c("You", "تو") : p.name}</strong>
                <span>{!owner && i === 0 && responses[i] === "pending" ? c("You haven’t replied", "هنوز جواب ندادی") : labels[responses[i]]}</span>
              </div>
              {responses[i] === "accepted" && <Check size={18} aria-hidden="true" />}
              {responses[i] === "declined" && <X size={18} aria-hidden="true" />}
            </div>
          ))}
        </div>
      )}
      {phase === "preparing" && (
        <div className="sync-preparation" role="status">
          <LoadingIndicator expressive label={c("Getting everyone ready", "آماده می‌شویم")} />
        </div>
      )}
      <footer>
        {phase === "compose" ? (
          <Button onClick={invite} icon={<Users size={18} />}>
            {c("Ask for sync", "درخواست هماهنگی")}
          </Button>
        ) : phase === "inviting" ? (
          owner ? (
            <>
              <Button variant="text" onClick={cancel}>
                {c("Cancel request", "لغو درخواست")}
              </Button>
              <Button onClick={commit} icon={<Play size={18} />}>
                {c(
                  `Start with ${1 + responses.filter((v) => v === "accepted").length}`,
                  `شروع با ${1 + responses.filter((v) => v === "accepted").length} نفر`,
                )}
              </Button>
            </>
          ) : responses[0] === "accepted" ? (
            <Button variant="outlined" onClick={() => respond("withdrawn")}>
              {c("Withdraw & keep watching", "انصراف و ادامه تماشا")}
            </Button>
          ) : (
            <>
              <Button
                variant="text"
                onClick={() => {
                  respond("declined");
                  setOpen(false);
                }}
              >
                {c("Keep watching", "نمیام")}
              </Button>
              <Button
                onClick={() => respond("accepted")}
                icon={<Check size={18} />}
              >
                {c("Accept & pause", "پذیرش و توقف فیلم")}
              </Button>
            </>
          )
        ) : phase === "failed" ? (
          <Button onClick={reset}>
            {c("Return to playback", "بازگشت به فیلم")}
          </Button>
        ) : phase === "done" ? (
          <Button variant="text" onClick={reset}>
            {c("Done", "تمام")}
          </Button>
        ) : null}
      </footer>
    </section>
  );
  const showPanel = phase !== "idle" && phase !== "countdown";
  const band = (
    <div className="sync-entry">
      <div>
        <strong>
          {locked
            ? c("Paused for sync", "توقف برای هماهنگی")
            : status === "paused"
              ? c("Paused for you", "برای تو متوقف است")
              : c("Playing for you", "فیلمت در حال پخش است")}
        </strong>
      </div>
      <Button
        variant="tonal"
        icon={active ? <Users size={18} /> : <RefreshCw size={18} />}
        onClick={
          active
            ? () => {
                setOpen(true);
                if (variant !== "sheet")
                  document
                    .querySelector(".sync-panel")
                    ?.scrollIntoView({ block: "nearest" });
              }
            : owner
              ? () => {
                  if (variant === "sheet") {
                    setPhase("compose");
                    setOpen(true);
                  } else invite();
                }
              : () => {
                  setPosition(1122);
                  setStatus("playing");
                  setNotice(
                    c(
                      "Caught up to Ice Queen. Nobody else was interrupted.",
                      "با Ice Queen هماهنگ شدی",
                    ),
                  );
                }
        }
      >
        {active
          ? c("View sync", "نمایش هماهنگی")
          : owner
            ? c("Sync together", "هماهنگ شیم")
            : c("Catch up to owner", "هماهنگی با میزبان")}
      </Button>
    </div>
  );
  const overlay =
    phase === "countdown" && included ? (
      <div className="sync-countdown" role="status" aria-live="assertive">
        <strong key={count}>{count || c("Action", "حرکت")}</strong>
      </div>
    ) : locked ? (
      <div className="sync-player-pause">
        <Pause size={16} />
        {phase === "inviting"
          ? c("Paused · gathering the group", "توقف · منتظر دوستان")
          : c("Paused · preparing playback", "توقف · آماده‌سازی")}
      </div>
    ) : undefined;
  return (
    <div className={`sync-designs sync-designs--${variant}`}>
      <div className="sync-preview-bar">
        <strong>{c("watchparty / Sync studies", "watchparty / طرح‌های هماهنگی")}</strong>
        <div>
          <label>
            {c("Viewing as", "نقش")}{" "}
            <select
              aria-label="Preview role"
              value={owner ? "owner" : "viewer"}
              onChange={(e) => {
                reset();
                setOwner(e.target.value === "owner");
              }}
            >
              <option value="owner">{c("Owner", "میزبان")}</option>
              <option value="viewer">{c("Viewer", "بیننده")}</option>
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
            onClick={() => setLarge(!large)}
            aria-pressed={large}
          >
            Aa+
          </Button>
          <Button variant="text" onClick={reset}>
            {c("Reset", "بازنشانی")}
          </Button>
        </div>
      </div>
      <nav className="sync-concepts" aria-label="Design variations">
        {concepts.map((x, i) => (
          <button
            key={x.id}
            aria-pressed={variant === x.id}
            onClick={() => {
              setVariant(x.id);
              setOpen(true);
            }}
          >
            <x.icon size={22} />
            <span>
              <small>0{i + 1}</small>
              {x.title[fa ? 1 : 0]}
            </span>
          </button>
        ))}
      </nav>
      <div className="sync-direction">
        <div>
          <span className="eyebrow">
            {c(
              "WATCH TOGETHER / THREE DIRECTIONS",
              "با هم ببینیم / سه پیشنهاد",
            )}
          </span>
          <h1>{concept.title[fa ? 1 : 0]}</h1>
          <p>{concept.body[fa ? 1 : 0]}</p>
        </div>
        <span className="sync-role-pill">
          {owner
            ? c("Owner experience", "تجربه میزبان")
            : c("Viewer experience", "تجربه بیننده")}
        </span>
      </div>
      <PartyScreen
        party={party}
        streamStatus={locked ? "paused" : status}
        theme={theme}
        aborting={false}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onStartStream={() => setStatus("playing")}
        onSetStreamStatus={setStatus}
        onAbort={async () => reset()}
        onLeave={() =>
          setNotice(
            c(
              "Switch roles above to explore another experience.",
              "برای تجربه دیگر، نقش را از بالا تغییر بده.",
            ),
          )
        }
        onNotify={setNotice}
        syncPreview={{
          locked,
          position,
          onPositionChange: setPosition,
          overlay,
          band: (
            <>
              {band}
              {variant === "inline" && showPanel && panel}
            </>
          ),
          aside: variant === "side" && showPanel ? panel : undefined,
        }}
      />
      {variant === "sheet" && (
        <Dialog
          actions={null}
          open={open && showPanel}
          title={
            phase === "compose"
              ? c("Sync together", "هماهنگ شیم")
              : c("Watch together", !owner && phase === "inviting" ? "درخواست هماهنگی" : "با هم ببینیم")
          }
          onClose={() => setOpen(false)}
          className="sync-focus-dialog"
        >
          {panel}
        </Dialog>
      )}
      <details className="sync-simulator">
        <summary>{c("Try the interaction", "امتحان تجربه")}</summary>
        <div>
          <span>
            {c(
              "Local prototype · simulated participants",
              "پیش‌نمایش محلی · افراد شبیه‌سازی‌شده",
            )}
          </span>
          <label>
            {c("Connection scenario", "وضعیت ارتباط")}
            <select
              aria-label="Connection scenario"
              disabled={active}
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            >
              <option value="normal">{c("Everyone ready", "همه آماده")}</option>
              <option value="slow">
                {c("One viewer disconnects", "قطع ارتباط یک بیننده")}
              </option>
              <option value="failure">
                {c("Owner player fails", "خطای پخش‌کننده میزبان")}
              </option>
            </select>
          </label>
          {!owner && !active && (
            <Button onClick={invite}>
              {c("Receive owner invitation", "دریافت دعوت میزبان")}
            </Button>
          )}
          {phase === "inviting" &&
            owner &&
            people.map((p, i) => (
              <label key={p.name}>
                {p.name}
                <select
                  aria-label={`${p.name} response`}
                  value={responses[i]}
                  onChange={(e) =>
                    setResponses((r) =>
                      r.map((v, j) =>
                        j === i ? (e.target.value as Response) : v,
                      ),
                    )
                  }
                >
                  {Object.entries(labels).map(([v, label]) => (
                    <option value={v} key={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          {phase === "inviting" && !owner && (
            <>
              <Button variant="outlined" onClick={commit}>
                {c("Owner starts now", "میزبان شروع می‌کند")}
              </Button>
              <Button variant="text" onClick={cancel}>
                {c("Owner cancels request", "میزبان درخواست را لغو می‌کند")}
              </Button>
            </>
          )}
        </div>
      </details>
      <Snackbar message={notice} onDismiss={() => setNotice("")} />
    </div>
  );
}
