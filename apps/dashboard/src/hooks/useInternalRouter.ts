import { isSysAdminPanel } from '@/lib/isSysAdminPanel';
import { useRouter } from 'next/navigation';

export const useInternalRouter = () => {
  // eslint-disable-next-line no-restricted-syntax
  const router = useRouter();

  const handlePush: typeof router.push = (href, options) => {
    isSysAdminPanel().then((isAdmin) => {
      // Only add /admin prefix if href starts with / but NOT with /admin
      if (href.startsWith('/') && !href.startsWith('/admin')) {
        router.push(`${isAdmin ? '/admin' : ''}${href}`, options);
        return;
      }

      router.push(href, options);
    });
  };

  const handleReplace: typeof router.replace = (href, options) => {
    isSysAdminPanel().then((isAdmin) => {
      // Only add /admin prefix if href starts with / but NOT with /admin
      if (href.startsWith('/') && !href.startsWith('/admin')) {
        router.replace(`${isAdmin ? '/admin' : ''}${href}`, options);
        return;
      }

      router.replace(href, options);
    });
  };

  return {
    ...router,
    push: handlePush,
    replace: handleReplace,
  };
};
