import config from './config';
import { getBgVMManagers } from './vm/utils';

const vmManagers = getBgVMManagers();

vmManagers.standard?.runBackgroundJobs();
vmManagers.large?.runBackgroundJobs();
vmManagers.US?.runBackgroundJobs();
