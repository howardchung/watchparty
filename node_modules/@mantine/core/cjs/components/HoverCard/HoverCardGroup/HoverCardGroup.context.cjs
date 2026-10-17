'use client';
'use strict';

var React = require('react');

const HoverCardGroupContext = React.createContext(false);
const HoverCardGroupProvider = HoverCardGroupContext.Provider;
const useHoverCardGroupContext = () => React.useContext(HoverCardGroupContext);

exports.HoverCardGroupProvider = HoverCardGroupProvider;
exports.useHoverCardGroupContext = useHoverCardGroupContext;
//# sourceMappingURL=HoverCardGroup.context.cjs.map
