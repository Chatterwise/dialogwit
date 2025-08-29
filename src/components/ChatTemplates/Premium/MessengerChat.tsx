import React from "react";
import { ChatTemplate } from "../ChatTemplate";

interface Props {
  botId: string;
  apiUrl?: string;
  apiKey?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  theme?: "light" | "dark";
}

export const MessengerChat = (props: Props) => {
  return (
    <ChatTemplate
      {...props}
      template="messenger"
      className="animate-in fade-in duration-300"
    />
  );
};

