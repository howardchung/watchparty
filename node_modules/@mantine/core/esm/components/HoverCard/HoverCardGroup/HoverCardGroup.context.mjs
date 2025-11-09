'use client';
import { createContext, useContext } from 'react';

const HoverCardGroupContext = createContext(false);
const HoverCardGroupProvider = HoverCardGroupContext.Provider;
const useHoverCardGroupContext = () => useContext(HoverCardGroupContext);

export { HoverCardGroupProvider, useHoverCardGroupContext };
//# sourceMappingURL=HoverCardGroup.context.mjs.map
