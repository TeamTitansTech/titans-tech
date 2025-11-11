import { getCookie } from './cookies';

export const isSysAdminPanel = async () => {
  return (await getCookie('is_sys_panel')) === 'true';
};
