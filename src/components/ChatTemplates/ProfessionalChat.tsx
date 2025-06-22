import React from "react";
import { ChatTemplate } from "./ChatTemplate";

interface ProfessionalChatProps {
  botId: string;
  apiUrl?: string;
  apiKey?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  theme?: "light" | "dark";
}

export const ProfessionalChat = (props: ProfessionalChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="professional"
      className="animate-in slide-in-from-right-4 duration-300"
    />
  );
};
