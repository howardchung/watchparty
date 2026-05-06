import React, { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import {serverPath, getOrCreateClientId, getSavedPasswords, getOrCreateSessionId, createUuid } from "../../utils/utils";


const clientId = getOrCreateClientId();

export const PopupButton = () => {
    const handlePopup = () => {
        const roomId = window.location.pathname.split("/watch/")[1];
        const windowFeatures = "width=400, height=700"
        window.open("/watch/" + roomId + "?popup=true", "popup", windowFeatures);
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