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

export const GlassDockChat = (props: Props) => {
  return (
    <ChatTemplate
      {...props}
      template="glassdock"
      className="animate-in slide-in-from-bottom-4 duration-300"
    />
  );
};

