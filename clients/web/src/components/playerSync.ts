export interface PlayerSyncInfo { positionMs:number; durationMs:number; playing:boolean; paused:boolean; seeking:boolean; ready:boolean; localFileOpened?:boolean; error:boolean; bufferedUntilMs:number; seekable:boolean }
export interface PlayerSyncBridge {
  sessionId:string;
  info():PlayerSyncInfo;
  pause():Promise<void>;
  play():Promise<void>;
  seek(positionMs:number):void;
  prepare?(positionMs:number):Promise<void>;
}
export function readyForSync(info:PlayerSyncInfo,target:number) {
  const required=Math.min(2000,Math.max(0,info.durationMs-target));
  return Number.isFinite(info.durationMs)&&info.durationMs>0&&info.paused&&!info.seeking&&!info.error&&info.ready&&info.seekable&&Math.abs(info.positionMs-target)<500&&info.bufferedUntilMs>=target+required;
}
