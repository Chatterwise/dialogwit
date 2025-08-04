import React from "react";
import { EnterpriseChatTemplate } from "./utils/EnterpriseChatTemplate";

export const EnterpriseChat = (
  props: React.ComponentProps<typeof EnterpriseChatTemplate>
) => (
  <EnterpriseChatTemplate
    {...props}
    className="animate-in fade-in duration-300"
  />
);
