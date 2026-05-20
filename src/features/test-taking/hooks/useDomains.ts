import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { Domain } from '../types';

const domainConverter = (id: string, data: Omit<Domain, 'id'>): Domain => ({
  id,
  name: data.name,
  description: data.description,
  icon: data.icon,
  active: data.active,
  order: data.order,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const domainsQuery = query(collection(db, 'domains'), where('active', '==', true));
      const snapshot = await getDocs(domainsQuery);

      return snapshot.docs
        .map((document) => domainConverter(document.id, document.data() as Omit<Domain, 'id'>))
        .sort((first, second) => first.order - second.order);
    },
  });
}
