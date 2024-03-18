import EventEmitter from 'eventemitter3';

import { BaseClient } from './base';
//import { Member } from './types';
import { EVENT } from './events';
import {
  ControlClipboardPayload,
  ControlPayload,
  ControlTargetPayload,
  ScreenConfigurationsPayload,
  ScreenResolutionPayload,
  SystemMessagePayload,
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
  protected [EVENT.RECONNECTING]() {}
  protected [EVENT.CONNECTING]() {}

  protected [EVENT.CONNECTED]() {
    this.emit(EVENT.CONNECTED);
  }

  protected [EVENT.DISCONNECTED](reason?: Error) {
    console.warn(reason);
    this.emit(EVENT.DISCONNECTED);
  }

  protected [EVENT.TRACK](event: RTCTrackEvent) {
    const { track, streams } = event;
    this.emit(EVENT.TRACK, track, streams[0]);
  }

  protected [EVENT.DATA](data: any) {
    console.log('[DATA]', data);
  }

  /////////////////////////////
  // System Events
  /////////////////////////////
  protected [EVENT.SYSTEM.DISCONNECT]({ message }: SystemMessagePayload) {
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
  }

  protected [EVENT.CONTROL.RELEASE]({ id }: ControlPayload) {
    //this.$accessor.remote.reset();
    // const member = this.member(id);
    // if (!member) {
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
    this.emit(EVENT.CONTROL.CLIPBOARD, text);
  }

  /////////////////////////////
  // Screen Events
  /////////////////////////////
  protected [EVENT.SCREEN.CONFIGURATIONS]({
    configurations,
  }: ScreenConfigurationsPayload) {
    // console.log('[CONFIGURATIONS]', configurations);
    //this.$accessor.video.setConfigurations(configurations);
  }

  protected [EVENT.SCREEN.RESOLUTION]({
    id,
    width,
    height,
    rate,
    quality,
  }: ScreenResolutionPayload) {
    this.emit(EVENT.SCREEN.RESOLUTION, { width, height, rate, quality });
  }
}

export { default as VBrowser } from './VBrowser';
