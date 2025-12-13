import React from "react";
import {
  Modal,
  Button,
  Radio,
  Switch,
  Title,
  TextInput,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { Socket } from "socket.io-client";
import { openFileSelector, serverPath } from "../../utils/utils";
import config from "../../config";
import { MetadataContext } from "../../MetadataContext";
import { IconSearch, IconUpload, IconX } from "@tabler/icons-react";

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
          // Fetch title from the data endpoint
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
    const files = await openFileSelector(".srt");
    if (!files) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.addEventListener("load", async (event) => {
      const subData = event.target?.result;
      // Upload to server
      const resp = await fetch(serverPath + "/subtitle", {
        method: "POST",
        body: subData,
        headers: { "Content-Type": "text/plain" },
      });
      // Once URL obtained, make those the room subtitles
      const json = await resp.json();
      this.props.socket.emit(
        "CMD:subtitle",
        serverPath + "/subtitle/" + json.hash,
      );
    });
    reader.readAsText(file);
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
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Switch
            checked={this.props.getSubtitleMode() === "showing"}
            label="Toggle subtitles for myself"
            onClick={() => {
              this.props.setSubtitleMode();
            }}
          />
          <Divider my="lg" />
          <Title order={6}>Room subtitles</Title>
          <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
            <TextInput
              placeholder="Subtitle URL"
              value={this.props.roomSubtitle}
              disabled={!this.props.haveLock()}
              onChange={(e) =>
                this.props.socket.emit("CMD:subtitle", e.target.value)
              }
              rightSection={
                <ActionIcon
                  color="red"
                  disabled={!this.props.haveLock()}
                  onClick={() => {
                    this.props.socket.emit("CMD:subtitle", "");
                  }}
                >
                  <IconX />
                </ActionIcon>
              }
            />
            <Button
              color="violet"
              onClick={() => this.uploadSubtitle()}
              disabled={!this.props.haveLock()}
              leftSection={<IconUpload />}
            >
              Upload (.srt)
            </Button>
            <Divider my="lg" />
            <Title order={6}>OpenSubtitles</Title>
            <TextInput
              value={this.state.titleQuery}
              onChange={(e) => this.setState({ titleQuery: e.target.value })}
              disabled={!this.props.haveLock()}
              rightSectionWidth={230}
              rightSection={
                <div style={{ display: "flex", gap: "4px" }}>
                  <Button
                    loading={this.state.loading}
                    color="green"
                    disabled={!this.props.haveLock()}
                    onClick={async () => {
                      this.setState({ loading: true });
                      const resp = await fetch(
                        serverPath +
                          "/searchSubtitles?title=" +
                          this.state.titleQuery,
                      );
                      const json = await resp.json();
                      this.setState({ searchResults: json });
                      this.setState({ loading: false });
                    }}
                    leftSection={<IconSearch />}
                  >
                    By title
                  </Button>
                  <Button
                    loading={this.state.loading}
                    color="blue"
                    disabled={!this.props.haveLock()}
                    onClick={async () => {
                      this.setState({ loading: true });
                      const resp = await fetch(
                        serverPath +
                          "/searchSubtitles?url=" +
                          this.props.roomMedia,
                      );
                      const json = await resp.json();
                      this.setState({ searchResults: json });
                      this.setState({ loading: false });
                    }}
                    leftSection={<IconSearch />}
                  >
                    By hash
                  </Button>
                </div>
              }
            ></TextInput>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {this.state.searchResults.map(
                (result: {
                  id: string;
                  type: string;
                  attributes: Record<string, any>;
                }) => (
                  <div key={result.id}>
                    <Radio
                      disabled={!this.props.haveLock()}
                      label={result.attributes.release}
                      name="radioGroup"
                      value={result.attributes.files[0]?.file_id}
                      checked={this.props.roomSubtitle?.includes(
                        encodeURIComponent(
                          result.attributes.files[0]?.file_name,
                        ),
                      )}
                      onChange={async (e) => {
                        const resp = await fetch(
                          serverPath +
                            "/downloadSubtitles?file_id=" +
                            e.target.value,
                        );
                        const data = await resp.json();
                        this.props.socket.emit("CMD:subtitle", data.link);
                      }}
                    />
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
