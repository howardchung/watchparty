import React, {
  SyntheticEvent,
  useState,
  PropsWithChildren,
  useCallback,
} from 'react';
import { DraggableData, Rnd, RndResizeCallback } from 'react-rnd';
import { Icon, Label } from 'semantic-ui-react';
import { getCurrentSettings, updateSettings } from '../Settings/LocalSettings';
import classes from './DraggableChat.module.css';

const MIN_EXPANDED_HEIGHT = '500px';
const MIN_EXPANDED_WIDTH = '320px';
const DEFAULT_X_POSITION = 100;
const DEFAULT_Y_POSITION = 100;
const COLLAPSED_HEIGHT = '50px';
const COLLAPSED_WIDTH = '320px';

interface DraggableChatProps {
  id: string;
  enabled: boolean;
  hide: boolean;
  version: number;
  rightBar: (
    rightBarContainerStyle: object,
    showNameInput: boolean
  ) => JSX.Element;
  renderVideo: (isDraggableChangingDimensions: boolean) => JSX.Element;
}

export const DraggableChat = (props: PropsWithChildren<DraggableChatProps>) => {
  const [draggablePositionX, setDraggablePositionX] =
    useState(DEFAULT_X_POSITION);
  const [draggablePositionY, setDraggablePositionY] =
    useState(DEFAULT_Y_POSITION);
  const [draggableHeight, setDraggableHeight] = useState(MIN_EXPANDED_HEIGHT);
  const [draggableWidth, setDraggableWidth] = useState(MIN_EXPANDED_WIDTH);
  const [draggableCollapsed, setDraggableCollapsed] = useState(false);
  const [isChangingDimensions, setIsChangingDimensions] = useState(false);

  const { id, enabled, renderVideo, version, rightBar } = props;

  const dimensionsRef = useCallback(
    (node: Rnd) => {
      if (node !== null) {
        const { x, y } = getCurrentSettings().chatDraggablePosition ?? {};
        setDraggablePositionX(x ?? DEFAULT_X_POSITION);
        setDraggablePositionY(y ?? DEFAULT_Y_POSITION);

        const collapsed = getCurrentSettings().chatDraggableCollapsed ?? false;
        setDraggableCollapsed(collapsed);

        if (collapsed) {
          setDraggableWidth(COLLAPSED_WIDTH);
          setDraggableHeight(COLLAPSED_HEIGHT);
        } else {
          const { width, height } =
            getCurrentSettings().chatDraggableSize ?? {};
          setDraggableWidth(width ?? MIN_EXPANDED_WIDTH);
          setDraggableHeight(height ?? MIN_EXPANDED_HEIGHT);
        }
      }
    },
    [version]
  );

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

  const handleOnCollapse = () => {
    const collapsed = !draggableCollapsed;
    if (collapsed) {
      setDraggableHeight(COLLAPSED_HEIGHT);
      setDraggableWidth(COLLAPSED_WIDTH);
    } else {
      const { width, height } = getCurrentSettings().chatDraggableSize ?? {};
      setDraggableWidth(width ?? MIN_EXPANDED_WIDTH);
      setDraggableHeight(height ?? MIN_EXPANDED_HEIGHT);
    }
    setDraggableCollapsed(collapsed);
    updateSettings(
      JSON.stringify({
        ...getCurrentSettings(),
        chatDraggableCollapsed: collapsed,
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
            overflow: draggableCollapsed ? 'hidden' : 'visible',
          }}
          minWidth={draggableCollapsed ? undefined : MIN_EXPANDED_WIDTH}
          minHeight={draggableCollapsed ? undefined : MIN_EXPANDED_HEIGHT}
        >
          <div
            className="dragContainer"
            style={{
              width: '100%',
              height: '100%',
              padding: 10,
              overflow: 'scroll',
            }}
          >
            <Label color={'grey'} corner="right" className={classes.dragCorner}>
              <Icon name="move" style={{ cursor: 'move' }} />
            </Label>
            <Label
              size="tiny"
              color={draggableCollapsed ? 'green' : 'orange'}
              corner="left"
              className={classes.collapseCorner}
              onClick={handleOnCollapse}
              style={{ opacity: draggableCollapsed ? 0.5 : 0.2 }}
            >
              <Icon
                name={draggableCollapsed ? 'chevron down' : 'chevron up'}
                style={{ cursor: 'pointer' }}
              />
            </Label>
            {!draggableCollapsed &&
              rightBar({ height: '100%', paddingTop: '20px' }, false)}
          </div>
        </Rnd>
      )}
      {renderVideo(isChangingDimensions)}
    </div>
  );
};
