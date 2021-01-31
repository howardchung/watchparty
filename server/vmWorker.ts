import { createVMManagers } from './vm/utils';

const vmManagers = createVMManagers();
vmManagers.standard?.runBackgroundJobs();
vmManagers.large?.runBackgroundJobs();
