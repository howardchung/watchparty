import React, {
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
  PropsWithChildren,
  useCallback,
} from 'react';
import { DraggableData, Rnd, RndResizeCallback } from 'react-rnd';
import { Icon, Label } from 'semantic-ui-react';
import { getCurrentSettings, updateSettings } from '../Settings/LocalSettings';
import { Chat, ChatProps } from './Chat';
import classes from './DraggableChat.module.css';

interface DraggableChatProps extends ChatProps {
  id: string;
  enabled: boolean;
  renderVideo: (isDraggableChangingDimensions: boolean) => JSX.Element;
}

export const DraggableChat = (props: PropsWithChildren<DraggableChatProps>) => {
  const [draggablePositionX, setDraggablePositionX] = useState(100);
  const [draggablePositionY, setDraggablePositionY] = useState(100);
  const [draggableHeight, setDraggableHeight] = useState('500px');
  const [draggableWidth, setDraggableWidth] = useState('320px');
  const [isChangingDimensions, setIsChangingDimensions] = useState(false);

  const { children, id, enabled, renderVideo, ...chatProps } = props;

  const dimensionsRef = useCallback((node: Rnd) => {
    if (node !== null) {
      const { x, y } = getCurrentSettings().chatDraggablePosition || {};
      if (x !== undefined && y !== undefined) {
        setDraggablePositionX(x);
        setDraggablePositionY(y);
      }
      const { width, height } = getCurrentSettings().chatDraggableSize || {};
      if (width !== undefined && height !== undefined) {
        setDraggableWidth(width);
        setDraggableHeight(height);
      }
    }
  }, []);

  const handleDragStop = (e: SyntheticEvent, data: DraggableData) => {
    setIsChangingDimensions(false);
    const { x, y } = data;
    setDraggablePositionX(x);
    setDraggablePositionY(y);
    updateSettings(
      JSON.stringify({
        ...getCurrentSettings(),
        chatDraggablePosition: { x, y },
      })
    );
  };

  const handleResizeStop: RndResizeCallback = (
    e,
    dir,
    refToElement,
    delta,
    position
  ) => {
    setIsChangingDimensions(false);
    const { width, height } = refToElement.style;
    setDraggableWidth(width);
    setDraggableHeight(height);
    setDraggablePositionX(position.x);
    setDraggablePositionY(position.y);
    updateSettings(
      JSON.stringify({
        ...getCurrentSettings(),
        chatDraggableSize: { width, height },
      })
    );
  };

  return (
    <div
      id={'fullScreenContainer ' + id}
      style={{
        width: '100%',
        height: '100%',
        display: props.hide ? 'none' : 'block',
      }}
    >
      {enabled && (
        <Rnd
          position={{ x: draggablePositionX, y: draggablePositionY }}
          size={{ height: draggableHeight, width: draggableWidth }}
          ref={dimensionsRef}
          onDragStart={() => setIsChangingDimensions(true)}
          onDragStop={handleDragStop as any}
          onResizeStart={() => setIsChangingDimensions(true)}
          onResizeStop={handleResizeStop as any}
          dragHandleClassName={classes.dragCorner}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 5,
            position: 'absolute',
            zIndex: 10000,
          }}
          minWidth={320}
          minHeight={200}
        >
          <div
            className="dragContainer"
            style={{ width: '100%', height: '100%', padding: 10 }}
          >
            <Label color={'grey'} corner="right" className={classes.dragCorner}>
              <Icon name="move" style={{ cursor: 'move' }} />
            </Label>
            <Chat
              {...chatProps}
              outerContainerStyle={{ height: '100%' }}
              isDraggable
            />
          </div>
        </Rnd>
      )}
      {renderVideo(isChangingDimensions)}
    </div>
  );
};
