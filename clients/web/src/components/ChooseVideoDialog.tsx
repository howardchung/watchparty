import { logHandledException } from '../data/sessionLog';
import { useState } from "react";
import { FolderOpen, Link2 } from "lucide-react";
import { Button, Dialog, TextField } from "./Material";
import { t } from "../i18n";
import "./local-media.css";
export function ChooseVideoDialog(p: {
  open: boolean;
  busy: boolean;
  close(): void;
  file(): void;
  stream(url: string): Promise<void>;
}) {
  const [url, setUrl] = useState(""),
    [mode, setMode] = useState<"choice" | "url">("choice");
  return (
    <Dialog
      open={p.open}
      title={t(mode === "choice" ? "Choose video" : "Stream from a URL")}
      onClose={() => {
        p.close();
        setMode("choice");
      }}
      actions={
        mode === "url" ? (
          <>
            <Button
              variant="text"
              disabled={p.busy}
              onClick={() => setMode("choice")}
            >
              {t("Back")}
            </Button>
            <Button
              disabled={p.busy || !/^https:\/\/[^\s]+$/i.test(url.trim())}
              onClick={() =>
                void p
                  .stream(url.trim())
                  .then(() => {
                    p.close();
                    setMode("choice");
                    setUrl("");
                  })
                  .catch(error => logHandledException('player.source.select', error))
              }
            >
              {t("Start stream")}
            </Button>
          </>
        ) : null
      }
    >
      {mode === "choice" ? (
        <div className="media-source-tiles">
          <Button
            variant="tonal"
            disabled={p.busy}
            icon={<FolderOpen size={36} />}
            onClick={p.file}
          >
            {t("Local file")}
          </Button>
          <Button
            variant="tonal"
            disabled={p.busy}
            icon={<Link2 size={36} />}
            onClick={() => setMode("url")}
          >
            {t("Stream URL")}
          </Button>
        </div>
      ) : (
        <TextField
          label={t("Direct video URL")}
          value={url}
          onChange={setUrl}
          inputMode="url"
          disabled={p.busy}
        />
      )}
    </Dialog>
  );
}
