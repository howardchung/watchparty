import EventEmitter from 'eventemitter3';
import { BaseClient } from './base';
//import { Member } from './types';
import { EVENT } from './events';

import {
  DisconnectPayload,
  //SignalProvidePayload,
  //MemberListPayload,
  //MemberDisconnectPayload,
  //MemberPayload,
  ControlPayload,
  ControlTargetPayload,
  //ChatPayload,
  //EmotePayload,
  ControlClipboardPayload,
  ScreenConfigurationsPayload,
  ScreenResolutionPayload,
  //AdminPayload,
  //AdminTargetPayload,
} from './messages';

export class NekoClient extends BaseClient implements EventEmitter<any> {
  login(url: string, password: string, displayname: string) {
    this.connect(url, password, displayname);
  }

  logout() {
    this.disconnect();
  }

  /////////////////////////////
  // Internal Events
  /////////////////////////////
  protected [EVENT.CONNECTING]() {
  }

  protected [EVENT.CONNECTED]() {

  }

  protected [EVENT.DISCONNECTED](reason?: Error) {
    console.error(reason);
  }

  protected [EVENT.TRACK](event: RTCTrackEvent) {
    const { track, streams } = event;
    console.log(track, streams);
    // TODO set up the stream
    const video = document.getElementById('leftVideo') as HTMLVideoElement;
    video!.srcObject = streams[0];
    // this.$accessor.video.addTrack([track, streams[0]]);
    // this.$accessor.video.setStream(0);
  }

  protected [EVENT.DATA](data: any) {
    console.log(data);
  }

  /////////////////////////////
  // System Events
  /////////////////////////////
  protected [EVENT.SYSTEM.DISCONNECT]({ message }: DisconnectPayload) {
    this.onDisconnected(new Error(message));
  }

  /////////////////////////////
  // Control Events
  /////////////////////////////
  protected [EVENT.CONTROL.LOCKED]({ id }: ControlPayload) {
    //this.$accessor.remote.setHost(id);
    // const member = this.member(id);
    // if (!member) {
    //   return;
    // }

    if (this.id === id) {
      // this.$vue.$notify({
      //   group: 'neko',
      //   type: 'info',
      //   title: this.$vue.$t('notifications.controls_taken', {
      //     name: this.$vue.$t('you'),
      //   }) as string,
      //   duration: 5000,
      //   speed: 1000,
      // });
    }

    // this.$accessor.chat.newMessage({
    //   id: member.id,
    //   content: this.$vue.$t('notifications.controls_taken', {
    //     name: '',
    //   }) as string,
    //   type: 'event',
    //   created: new Date(),
    // });
  }

  protected [EVENT.CONTROL.RELEASE]({ id }: ControlPayload) {
    //this.$accessor.remote.reset();
    // const member = this.member(id);
    // if (!member) {
    //   return;
    // }

    if (this.id === id) {
    }

    // this.$accessor.chat.newMessage({
    //   id: member.id,
    //   content: this.$vue.$t('notifications.controls_released', {
    //     name: '',
    //   }) as string,
    //   type: 'event',
    //   created: new Date(),
    // });
  }

  protected [EVENT.CONTROL.REQUEST]({ id }: ControlPayload) {
    console.log(id);
    // const member = this.member(id);
    // if (!member) {
    //   return;
    // }
  }

  protected [EVENT.CONTROL.REQUESTING]({ id }: ControlPayload) {
    // const member = this.member(id);
    // if (!member || member.ignored) {
    //   return;
    // }
  }

  protected [EVENT.CONTROL.GIVE]({ id, target }: ControlTargetPayload) {
    // const member = this.member(target);
    // if (!member) {
    //   return;
    // }

    //this.$accessor.remote.setHost(member);
  }

  protected [EVENT.CONTROL.CLIPBOARD]({ text }: ControlClipboardPayload) {
    // console.log(text);
    //this.$accessor.remote.setClipboard(text);
  }

  /////////////////////////////
  // Screen Events
  /////////////////////////////
  protected [EVENT.SCREEN.CONFIGURATIONS]({
    configurations,
  }: ScreenConfigurationsPayload) {
    console.log(configurations);
    //this.$accessor.video.setConfigurations(configurations);
  }

  protected [EVENT.SCREEN.RESOLUTION]({
    id,
    width,
    height,
    rate,
  }: ScreenResolutionPayload) {
    console.log(id, width, height, rate);
    //this.$accessor.video.setResolution({ width, height, rate });

    if (!id) {
      return;
    }

    //const member = this.member(id);
    // if (!member || member.ignored) {
    //   return;
    // }
  }
}
