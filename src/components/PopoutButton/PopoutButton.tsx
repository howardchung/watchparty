import React, { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { Chat } from "../Chat/Chat";
import io, {Socket} from "socket.io-client";
import {serverPath, getOrCreateClientId, getSavedPasswords, getOrCreateSessionId, createUuid } from "../../utils/utils";


const clientId = getOrCreateClientId();

export const PopupButton = () => {
    const handlePopup = () => {
        const roomId = window.location.pathname.split("/watch/")[1];
        const windowFeatures = "width=400, height=700"
        window.open("/popup/" + roomId, "popup", windowFeatures);
    }
    return (
      <ActionIcon
        size="36px"
        color="green"
        title="Popout chat"
        onClick={handlePopup}
      >
        <IconExternalLink/>
      </ActionIcon>  
    );
};

export const PopupChat = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const roomPath = "/" + roomId;
    const clientId = getOrCreateClientId(); 

    const [socket, setSocket] = useState<Socket | null>(null);
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [nameMap, setNameMap] = useState<StringDict>({});
    const [pictureMap, setPictureMap] = useState<StringDict>({});
    const [scrollTimestamp, setScrollTimestamp] = useState(0);
    const [owner, setOwner] = useState<string | undefined>(undefined);
    const chatRef = useRef<Chat>(null);

    useEffect(() => {
      // Connects to the room
      const connect = async () => {
        const password = getSavedPasswords()[roomPath] ?? "";
        const response = await fetch(serverPath + "/resolveShard" + roomPath);
        const shard = Number(await response.text()) || "";

        const s = io(serverPath + roomPath, {
          transports: ["websocket"],
          query: { clientId, password, shard, roomId },
          auth: { sessionId: getOrCreateSessionId() }, // required by server middleware
        });

        s.on("connect", () => console.log("connected"));
        s.on("connect_error", (err) => console.error("connect_error", err.message));

        s.on("chatinit", (data: ChatMessage[]) => {
          setChat(data);
          setScrollTimestamp(Date.now());
        });
        s.on("REC:chat", (data: ChatMessage) => {
        setChat((prev) => {
          const next = [...prev, data];
          if (next.length > 100) next.shift();
            return next;
          });
          setScrollTimestamp(Date.now());
        });
        s.on("REC:nameMap", (data: StringDict) => setNameMap(data));
        s.on("REC:pictureMap", (data: StringDict) => setPictureMap(data));
        s.on("REC:getRoomState", (data: any) => setOwner(data?.owner));
        s.on("REC:addReaction", (data: Reaction) => {
          setChat((prev) => {
            const updated = [...prev];
            const msgIndex = updated.findIndex(
              (m) => m.id === data.msgId && m.timestamp === data.msgTimestamp
            );
            if (msgIndex === -1) return updated;
            const msg = updated[msgIndex];
            msg.reactions = msg.reactions || {};
            msg.reactions[data.value] = msg.reactions[data.value] || [];
            msg.reactions[data.value].push(data.user);
            // scroll down if reaction added to last message
            if (msgIndex === updated.length - 1 && chatRef.current?.state.isNearBottom) {
              chatRef.current?.scrollToBottom();
            }
            return updated;
          });
        });
        s.on("REC:removeReaction", (data: Reaction) =>  {
          setChat((prev) => {
            const updated = [...prev];
            const msg = updated.find(
              (m) => m.id === data.msgId && m.timestamp === data.msgTimestamp
            );
            if (!msg || !msg.reactions?.[data.value]) return updated;
            msg.reactions[data.value] = msg.reactions[data.value].filter(
              (id) => id !== data.user
            );
            return updated;
          });
        });

        setSocket(s);
        return s;
      };
      let s: Socket;
      connect().then((sock) => { s = sock; });
      return () => { s?.disconnect(); };
    }, [roomPath]);

    if (!socket) return null; 
    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Chat
                chat={chat}
                nameMap={nameMap}
                pictureMap={pictureMap}
                socket={socket}
                scrollTimestamp={scrollTimestamp}
                getMediaDisplayName={(input) => input ?? ""}
                owner={owner}
                ref={chatRef}
            />
        </div>
    );
};