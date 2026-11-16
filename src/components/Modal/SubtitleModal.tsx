import React from "react";
import {
  Modal,
  Button,
  Switch,
  Title,
  TextInput,
  ActionIcon,
  Divider,
} from "../UI/UI";
import { Socket } from "socket.io-client";
import { openFileSelector, serverPath } from "../../utils/utils";
import { MetadataContext } from "../../MetadataContext";
import {
  IconDownload,
  IconSearch,
  IconUpload,
  IconX,
} from "../Icons/Icons";

export class SubtitleModal extends React.Component<{
  closeModal: () => void;
  roomSubtitle: string | undefined;
  haveLock: () => boolean;
  roomMedia: string;
  socket: Socket;
  getMediaDisplayName: (input: string) => string;
  setSubtitleMode: (mode?: TextTrackMode) => void;
  getSubtitleMode: () => TextTrackMode;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  state = {
    loading: false,
    searchResults: [],
    titleQuery: this.props
      .getMediaDisplayName(this.props.roomMedia)
      .split("/")
      .slice(-1)[0],
  };

  async componentDidMount() {
    if (this.props.roomMedia.includes("/stream?torrent=magnet")) {
      const re = /&fileIndex=(\d+)$/;
      const match = re.exec(this.props.roomMedia);
      if (match) {
        const fileIndex = match[1];
        if (fileIndex) {
          const response = await fetch(
            this.props.roomMedia.replace("/stream", "/data"),
          );
          const data = await response.json();
          this.setState({ titleQuery: data?.files[fileIndex]?.name });
        }
      }
    }
  }

  uploadSubtitle = async () => {
    const files = await openFileSelector(".srt,.vtt");
    if (!files) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.addEventListener("load", async (event) => {
      const subData = event.target?.result;
      const resp = await fetch(serverPath + "/subtitle", {
        method: "POST",
        body: subData,
        headers: { "Content-Type": "text/plain" },
      });
      const json = await resp.json();
      this.props.socket.emit(
        "CMD:subtitle",
        serverPath + "/subtitle/" + json.hash,
      );
    });
    reader.readAsText(file);
  };

  searchSubtitles = async () => {
    if (!this.props.haveLock()) {
      return;
    }
    this.setState({ loading: true });
    const resp = await fetch(
      serverPath + "/searchSubtitles?title=" + this.state.titleQuery,
    );
    const json = await resp.json();
    this.setState({ searchResults: json });
    this.setState({ loading: false });
  };
  render() {
    const { closeModal } = this.props;
    return (
      <Modal
        opened
        onClose={closeModal}
        centered
        title="Subtitles"
        size="50rem"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Switch
            checked={this.props.getSubtitleMode() === "showing"}
            label="Toggle subtitles for myself"
            onClick={() => {
              this.props.setSubtitleMode();
            }}
          />
          <Divider my="lg" />
          <Title order={6}>Room subtitles</Title>
          <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
            <TextInput
              placeholder="Subtitle URL"
              value={this.props.roomSubtitle}
              disabled={!this.props.haveLock()}
              onChange={(e) =>
                this.props.socket.emit("CMD:subtitle", e.target.value)
              }
              rightSection={
                <ActionIcon
                  size="sm"
                  color="red"
                  disabled={!this.props.haveLock()}
                  onClick={() => {
                    this.props.socket.emit("CMD:subtitle", "");
                  }}
                >
                  <IconX size={15} />
                </ActionIcon>
              }
            />
            <Button
              color="violet"
              onClick={() => this.uploadSubtitle()}
              disabled={!this.props.haveLock()}
              leftSection={<IconUpload size={17} />}
            >
              Upload (.srt / .vtt)
            </Button>
            <Divider my="lg" />
            <Title order={6}>OpenSubtitles</Title>
            <TextInput
              value={this.state.titleQuery}
              onChange={(e) => this.setState({ titleQuery: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && this.searchSubtitles()}
              disabled={!this.props.haveLock()}
              rightSectionWidth={95}
              rightSection={
                <Button
                  size="compact-xs"
                  loading={this.state.loading}
                  color="green"
                  disabled={!this.props.haveLock()}
                  onClick={this.searchSubtitles}
                  leftSection={<IconSearch size={13} />}
                >
                  By title
                </Button>
              }
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {this.state.searchResults.map(
                (result: {
                  id: string;
                  type: string;
                  attributes: Record<string, any>;
                }) => (
                  <div
                    key={result.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ActionIcon
                      size="sm"
                      disabled={!this.props.haveLock()}
                      onClick={async () => {
                        const resp = await fetch(
                          serverPath +
                            "/downloadSubtitles?file_id=" +
                            result.attributes.files[0]?.file_id,
                        );
                        const data = await resp.json();
                        this.props.socket.emit(
                          "CMD:subtitle",
                          serverPath + data.link,
                        );
                      }}
                    >
                      <IconDownload size={15} />
                    </ActionIcon>
                    <span>{result.attributes.release}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
