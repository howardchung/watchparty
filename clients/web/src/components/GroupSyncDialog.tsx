import type { ReactNode } from 'react';
import { Check, RefreshCw, Users, X } from 'lucide-react';
import { t, useLanguage } from '../i18n';
import { Avatar } from './Avatar';
import { Button, Dialog, LoadingIndicator } from './Material';
import { avatarId, type MemberDto } from '../data/contracts';
import type { GroupSyncState } from '../data/groupSync';
import './group-sync.css';
interface Props { localFile?: { fileName:string; selectedName:string; choose():void; loading:boolean }; waitingIndicator?:ReactNode;previewControls?:ReactNode;open:boolean;owner:boolean;ownerName:string;selfId:string;state:GroupSyncState|null;positionMs:number;members:MemberDto[];busy:boolean;connected:boolean;close():void;ask():void;respond(value:'ACCEPTED'|'DECLINED'|'WITHDRAWN'):void;commit():void;cancel():void }
export function GroupSyncDialog(p:Props) {
 const fa=useLanguage()==='fa';const text=(en:string,pe:string)=>fa?pe:t(en);
 const draft=!p.state||!['INVITING','PREPARING','SCHEDULED'].includes(p.state.phase);
 const preparing=p.state?.phase==='PREPARING';const response=p.state?.participants.find(x=>x.membershipId===p.selfId)?.response;
 const acceptedViewerCount=p.state?.participants.filter(x=>x.membershipId!==p.state!.ownerMembershipId&&x.response==='ACCEPTED').length??0;
 const fileRequest=!!p.localFile && (!p.localFile.selectedName || !draft&&p.state?.requestId.startsWith('source-'));
 const title=fileRequest?(p.owner?text('Who’s ready to watch?','کی آماده‌ست ببینیم؟'):text('Let’s watch a file','بیا یه فایل ببینیم')):draft?t('Sync together'):p.owner?text("Who's joining?","کی همراه می‌شه؟"):text('Sync request','درخواست هماهنگی');
 const ms=draft?p.positionMs:p.state!.targetPositionMs;const seconds=Math.max(0,Math.floor(ms/1000));
 return <Dialog className="group-sync-dialog" open={p.open} title={title} onClose={p.close} actions={null}>
  {p.previewControls}
  {p.localFile && <div className="group-sync-time local-file-summary"><span>{t("File to choose")}</span><bdi>{p.localFile.fileName}</bdi>{p.localFile.selectedName && p.localFile.selectedName!==p.localFile.fileName && <small><bdi>{p.localFile.selectedName}</bdi></small>}</div>}
  {!draft&&!p.owner&&<div className="group-sync-inviter"><RefreshCw aria-hidden="true"/><strong><bdi>{p.ownerName}</bdi> {text('wants to watch together','ازت خواسته باهم ببینید')}</strong></div>}
  <div className="group-sync-time"><span>{t('Meet at')}</span><strong dir="ltr">{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</strong></div>
  {preparing?<LoadingIndicator expressive label={t('Getting everyone ready')}/>:!draft&&<div className="group-sync-roster">{p.state!.participants.map(person=>{
    const member=p.members.find(x=>x.membershipId===person.membershipId);if(person.membershipId===p.state!.ownerMembershipId)return null;
    const own=person.membershipId===p.selfId;
    const label=person.response==='ACCEPTED'?(fileRequest?text('Ready','آماده است'):text('Joining','پایه است')):person.response==='DECLINED'?(fileRequest?text('Not watching','فیلم نمی‌بینه'):text('Not joining','نمیاد')):person.response==='WITHDRAWN'?text('Changed their mind','بیخیال شد'):text(own?'You haven’t replied':'Hasn’t replied',own?'هنوز جواب ندادی':'هنوز جواب نداده');
    return <div key={person.membershipId} className={`group-sync-person group-sync-person--${person.response.toLowerCase()}`}><Avatar avatarId={avatarId(member?.avatar||'comet')} label={member?.displayName||''} size="small"/><div><strong><bdi>{own?t('You'):member?.displayName||t('Guest')}</bdi></strong><span>{label}</span></div>{person.response==='ACCEPTED'?<Check aria-hidden="true" size={18}/>:person.response==='DECLINED'?<X aria-hidden="true" size={18}/>:null}</div>;
  })}</div>}
  {!preparing&&<div className="group-sync-actions">{draft&&p.localFile&&!p.localFile.selectedName?<Button disabled={!p.connected||p.localFile.loading} onClick={p.localFile.choose}>{t('Choose file')}</Button>:draft?<Button disabled={p.busy||!p.connected} icon={<Users size={18}/>} onClick={p.ask}>{t('Ask for sync')}</Button>:p.owner?<><Button variant="text" disabled={p.busy||!p.connected} onClick={p.cancel}>{t('Cancel request')}</Button><Button disabled={p.busy||!p.connected||acceptedViewerCount===0} onClick={p.commit}>{text('Start with','شروع با')} {acceptedViewerCount}</Button></>:response==='ACCEPTED'?<>{p.state?.phase==='INVITING'&&(p.waitingIndicator??<span className="group-sync-waiting" role="status"><span className="group-sync-waiting__spinner" aria-hidden="true"/><span>{text('Waiting for the owner…','منتظر تصمیم میزبان…')}</span></span>)}<Button variant="outlined" disabled={p.busy||!p.connected} onClick={()=>p.respond('WITHDRAWN')}>{p.localFile?t('Sit this one out'):t('Withdraw & keep watching')}</Button></>:<><Button variant="text" disabled={p.busy||!p.connected} onClick={()=>p.respond('DECLINED')}>{p.localFile?t('Skip · no video'):text('Not joining','نمیام')}</Button><Button disabled={p.busy||!p.connected||p.localFile?.loading} onClick={()=>p.localFile&&!p.localFile.selectedName?p.localFile.choose():p.respond('ACCEPTED')}>{p.localFile&&!p.localFile.selectedName?t('Choose file'):text('Accept & pause','پذیرش و توقف فیلم')}</Button></>}</div>}
 </Dialog>;
}
