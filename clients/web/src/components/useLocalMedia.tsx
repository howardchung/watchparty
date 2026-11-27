import { logHandledException } from '../data/sessionLog';
import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import type { StreamDto } from "../data/contracts";
import type { StreamStatus } from "../types";

/** Device-only media handles. Only a basename ever reaches startSource. */
export function useLocalMedia(o: {
  roomId: string;
  stream?: StreamDto;
  owner: boolean;
  startSource(name: string): Promise<StreamDto>;
  notify(message: string): void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<{
    room: string;
    session: string;
    file: File;
    url: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [readySession, setReadySession] = useState("");
  const version = useRef(0);
  const replacing = useRef(false);
  const room = useRef(o.roomId);
  room.current = o.roomId;
  const current =
    selection?.room === o.roomId &&
    selection.session === o.stream?.sessionId &&
    o.stream?.state === "ACTIVE" &&
    o.stream.sourceKind === "LOCAL_FILE"
      ? selection
      : null;
  useEffect(
    () => () => {
      if (selection) URL.revokeObjectURL(selection.url);
    },
    [selection],
  );
  useEffect(() => {
    version.current++;
    setSelection(null);
    setBusy(false);
    setReadySession("");
  }, [o.roomId]);
  useEffect(() => {
    setReadySession("");
    if (!current && !busy) setSelection(null);
  }, [o.stream?.sessionId, o.stream?.state]);
  const choose = () => {
    replacing.current = false;
    if (!busy) input.current?.click();
  };
  const replaceFile = () => {
    replacing.current = true;
    if (!busy) input.current?.click();
  };
  const select = async (file?: File) => {
    if (!file) return;
    const token = ++version.current,
      targetRoom = o.roomId;
    setBusy(true);
    setReadySession("");
    try {
      const stream =
        o.owner &&
        (replacing.current ||
          !!current ||
          o.stream?.sourceKind !== "LOCAL_FILE" ||
          o.stream?.state !== "ACTIVE")
          ? await o.startSource(file.name)
          : o.stream;
      if (!stream || version.current !== token || room.current !== targetRoom)
        return;
      setSelection({
        room: targetRoom,
        session: stream.sessionId,
        file,
        url: URL.createObjectURL(file),
      });
    } catch (error) {
      logHandledException('player.source.open', error);
      o.notify(t("Could not open this file. Choose it again."));
    } finally {
      if (version.current === token) setBusy(false);
    }
  };
  return {
    file: current?.file,
    url: current?.url ?? "",
    name: current?.file.name ?? "",
    busy,
    choose,
    replaceFile,
    readySession,
    onState(status: StreamStatus) {
      if (current && ["playing", "paused"].includes(status)) {
        setBusy(false);
        setReadySession(current.session);
      }
    },
    clear() {
      version.current++;
      setSelection(null);
      setBusy(false);
      setReadySession("");
    },
    input: (
      <input
        ref={input}
        hidden
        type="file"
        accept="video/*,.mkv,.avi,.mov,.webm"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void select(file);
        }}
      />
    ),
  };
}
