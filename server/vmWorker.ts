import { getBgVMManagers } from './vm/utils';

const vmManagers = getBgVMManagers();

Object.values(vmManagers).forEach((manager) => {
  manager?.runBackgroundJobs();
});
