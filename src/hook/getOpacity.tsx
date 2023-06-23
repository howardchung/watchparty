import React from 'react';

const GetOpacity = (isPlaying: boolean) => {
  const [opacity, setOpacity] = React.useState<number>(1);
  const [intervalId, setIntervalId] = React.useState<
    NodeJS.Timeout | undefined
  >(undefined);

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setOpacity((prevOpacity) => (prevOpacity === 1 ? 0.5 : 1));
      }, 1000);
      setIntervalId(interval);
      console.log('calling ...');
    } else {
      console.log('discard calling ...');
      clearInterval(intervalId);
      setOpacity(1);
      setIntervalId(undefined);
    }

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return { opacity };
};

export default GetOpacity;
