import config from './config';
import { createVMManagers } from './vm/utils';

const vmManagers = createVMManagers(config.VM_MANAGER_ID);
vmManagers.standard?.runBackgroundJobs();
vmManagers.large?.runBackgroundJobs();
vmManagers.US?.runBackgroundJobs();
