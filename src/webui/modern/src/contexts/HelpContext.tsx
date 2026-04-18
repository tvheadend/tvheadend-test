import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HelpContextType {
  showHelp: (pageName: string) => void;
  showClassHelp: (className: string) => void;
  isHelpOpen: boolean;
  helpPageName?: string;
  closeHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

interface HelpProviderProps {
  children: ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpPageName, setHelpPageName] = useState<string>();

  const showHelp = (pageName: string) => {
    setHelpPageName(pageName);
    setIsHelpOpen(true);
  };

  const showClassHelp = (className: string) => {
    setHelpPageName(`class/${className}`);
    setIsHelpOpen(true);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
    setHelpPageName(undefined);
  };

  const value: HelpContextType = {
    showHelp,
    showClassHelp,
    isHelpOpen,
    helpPageName,
    closeHelp,
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
};