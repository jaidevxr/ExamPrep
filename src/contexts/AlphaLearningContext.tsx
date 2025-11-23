import { createContext, useContext, useState, ReactNode } from "react";

interface AlphaLearningSession {
  duration: number; // in minutes
  subjectId: string;
  startTime: number;
  isMusicEnabled: boolean;
}

interface AlphaLearningContextType {
  isActive: boolean;
  session: AlphaLearningSession | null;
  startSession: (session: AlphaLearningSession) => void;
  endSession: () => void;
}

const AlphaLearningContext = createContext<AlphaLearningContextType | undefined>(undefined);

export const useAlphaLearning = () => {
  const context = useContext(AlphaLearningContext);
  if (!context) {
    throw new Error("useAlphaLearning must be used within AlphaLearningProvider");
  }
  return context;
};

export const AlphaLearningProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [session, setSession] = useState<AlphaLearningSession | null>(null);

  const startSession = (newSession: AlphaLearningSession) => {
    setSession(newSession);
    setIsActive(true);
  };

  const endSession = () => {
    setSession(null);
    setIsActive(false);
  };

  return (
    <AlphaLearningContext.Provider value={{ isActive, session, startSession, endSession }}>
      {children}
    </AlphaLearningContext.Provider>
  );
};
