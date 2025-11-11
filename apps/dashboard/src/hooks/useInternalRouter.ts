import { isSysAdminPanel } from '@/lib/isSysAdminPanel';
import { useRouter } from 'next/navigation';

export const useInternalRouter = () => {
  // eslint-disable-next-line no-restricted-syntax
  const router = useRouter();

  const handlePush: typeof router.push = (href, options) => {
    isSysAdminPanel().then((isAdmin) => {
      if (href.startsWith('/')) {
        router.push(`${isAdmin ? '/admin' : ''}${href}`, options);
      }

      router.push(href, options);
    });
  };

  const handleReplace: typeof router.replace = (href, options) => {
    isSysAdminPanel().then((isAdmin) => {
      if (href.startsWith('/')) {
        router.replace(`${isAdmin ? '/admin' : ''}${href}`, options);
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
