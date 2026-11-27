import { createRoot } from 'react-dom/client';
import { GroupSyncDialog } from '../../src/components/GroupSyncDialog';
import type { SyncParticipant } from '../../src/data/groupSync';
import '../../src/styles.css';

const compact = new URLSearchParams(location.search).get('compact') === '1';
document.documentElement.dataset.theme = compact ? 'dark' : 'light';
document.documentElement.dir = compact ? 'rtl' : 'ltr';
document.documentElement.style.fontSize = compact ? '24px' : '16px';
const root = createRoot(document.getElementById('root')!);
const noop = () => {};
const fixture = window as unknown as { renderSync(responses?: SyncParticipant['response'][], connected?: boolean, busy?: boolean): void; committed: boolean };
fixture.renderSync = (responses = ['PENDING', 'PENDING'], connected = true, busy = false) => root.render(<GroupSyncDialog
  open owner ownerName="Nika" selfId="owner" positionMs={0} members={[]} busy={busy} connected={connected}
  state={{requestId:'attempt',streamSessionId:'stream',streamRevision:1,ownerMembershipId:'owner',targetPositionMs:1000,createdAtMs:0,revision:1,phase:'INVITING',
    participants:[{membershipId:'owner',response:'ACCEPTED',ready:false},...responses.map((response,i)=>({membershipId:'viewer'+i,response,ready:false}))]}}
  close={noop} ask={noop} respond={noop} cancel={noop} commit={() => {fixture.committed = true;}}
/>);
fixture.renderSync();
