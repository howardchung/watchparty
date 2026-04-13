import React, { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { Chat } from "../Chat/Chat";
import io, {Socket} from "socket.io-client";
import {serverPath, getOrCreateClientId, getSavedPasswords } from "../../utils/utils";


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

    const [socket, setSocket] = useState<Socket | null>(null);
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [nameMap, setNameMap] = useState<StringDict>({});
    const [pictureMap, setPictureMap] = useState<StringDict>({});
    const [scrollTimestamp, setScrollTimestamp] = useState(0);
    const [owner, setOwner] = useState<string | undefined>(undefined);
    const chatRef = useRef<Chat>(null);

    useEffect(() => {
        const password = getSavedPasswords()[roomPath] ?? "";
        const s = io(serverPath + roomPath, {
        transports: ["websocket"],
        query: {clientId, password, roomId },
        });

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

    setSocket(s);
    return () => { s.disconnect(); };
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