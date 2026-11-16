import React, { useContext, useRef } from "react";
import { createRoom } from "../TopBar/TopBar";
import { Loader } from "../UI/UI";
import { MetadataContext } from "../../MetadataContext";

export const Create = () => {
  const { user } = useContext(MetadataContext);
  const buttonEl = useRef<HTMLButtonElement>(null);
  setTimeout(() => {
    buttonEl?.current?.click();
  }, 1000);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Loader />
      <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
        Creating room...
      </div>
      <button
        style={{ display: "none" }}
        ref={buttonEl}
        onClick={() => {
          createRoom(
            user,
            false,
            new URLSearchParams(window.location.search).get("video") ??
              undefined,
          );
        }}
      />
    </div>
  );
};
