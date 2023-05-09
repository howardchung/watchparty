import * as React from 'react';
import { DropdownProps, Modal, Transition } from 'semantic-ui-react';
import YtBox from '../YtScreen/YtBox';
import { ComboBox } from '../ComboBox/ComboBox';
import { Separator } from '../App/App';
import { SearchBox } from '../YtScreen/SearchBox';
import {
  getYouTubeLive,
  getYouTubeTrendings,
  getYouTubeVideos,
} from '../../utils';
import useEffect from 'react';
import YtScreenIcon from '../../assets/icons/yt.svg';
export interface IYtScreenProps {
  setMedia: (e: any, data: DropdownProps) => void;
  playlistAdd: (e: any, data: DropdownProps) => void;
  playlistMove: (index: number, toIndex: number) => void;
  playlistDelete: (index: number) => void;
  currentMedia: string;
  getMediaDisplayName: Function;
  launchMultiSelect: Function;
  mediaPath: string | undefined;
  streamPath: string | undefined;
  disabled?: boolean;
  playlist: PlaylistVideo[];
  toggleIsUploadPress: Function;
  isHome: boolean;
  toggleHome: Function;
  clipboard: string | undefined;
  loadYouTube: Function;
  isCollapsed: boolean;
  toggleCollapse: Function;
  isShowTheatreTopbar: boolean;
  toggleShowTopbar: Function;
  gotoHomeScreen: Function;
}
export type TabsType = 'trending' | 'live' | 'movie' | 'game';
export function YtScreen(props: IYtScreenProps) {
  const [videoItems, setVideoItems] = React.useState<any>([]);
  const [tab, setTab] = React.useState<TabsType>('trending');
  const [intro, setIntro] = React.useState<boolean>(true);
  // console.log('videoItems: ', videoItems);
  const getTrending = async () => {
    let items = await getYouTubeTrendings();
    setVideoItems(items);
  };
  const getLive = async () => {
    let items = await getYouTubeLive();
    setVideoItems(items);
  };
  const getYtVideos = async (param: 'movie' | 'game') => {
    let items = await getYouTubeVideos(param);
    setVideoItems(items);
  };
  React.useEffect(() => {
    switch (tab) {
      case 'trending':
        getTrending();
        break;
      case 'live':
        getLive();
        break;
      case 'game':
        getYtVideos(tab);
        break;
      case 'movie':
        getYtVideos(tab);
        break;
      default:
        break;
    }
  }, [tab]);
  React.useEffect(() => {
    setTimeout(() => {
      console.log('Showing Screen');
      setIntro(false);
    }, 1000);
  }, []);
  return (
    <>
      {!intro ? (
        <section className="yt-screen bg-[#1E1E1E]  p-0  m-0  w-full min-h-screen overflow-y-hidden z-0">
          <main className="">
            <SearchBox
              setVideoItems={setVideoItems}
              gotoHomeScreen={props.gotoHomeScreen}
              isShowTheatreTopbar={props.isShowTheatreTopbar}
              toggleShowTopbar={props.toggleShowTopbar}
              isCollapsed={props.isCollapsed}
              toggleCollapse={props.toggleCollapse}
              loadYouTube={props.loadYouTube}
              clipboard={props.clipboard}
              isHome={props.isHome}
              toggleIsUploadPress={props.toggleIsUploadPress}
              setMedia={props.setMedia}
              playlistAdd={props.playlistAdd}
              playlistDelete={props.playlistDelete}
              playlistMove={props.playlistMove}
              currentMedia={props.currentMedia}
              getMediaDisplayName={props.getMediaDisplayName}
              launchMultiSelect={props.launchMultiSelect}
              streamPath={props.streamPath}
              mediaPath={props.mediaPath}
              disabled={!props.disabled}
              playlist={props.playlist}
              toggleHome={props.toggleHome}
            />
            <YtBox
              toggleHome={props.toggleHome}
              setMedia={props.setMedia}
              playlistAdd={props.playlistAdd}
              tab={tab}
              setTab={setTab}
              videoItems={videoItems}
            />
          </main>
        </section>
      ) : (
        <main className="w-full h-screen bg-[#D20001] overflow-hidden flex items-center justify-center">
          <div>
            <img src={YtScreenIcon} alt="loading" className="h-32" />
          </div>
        </main>
      )}
    </>
  );
}
