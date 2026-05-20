import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { Subtopic } from '../../test-taking/types';
import type { AdminDomain, AdminTopic } from '../types';

export function useAdminTaxonomy() {
  return useQuery({
    queryKey: ['admin-taxonomy'],
    queryFn: async (): Promise<AdminDomain[]> => {
      const domainSnapshot = await getDocs(query(collection(db, 'domains'), orderBy('order', 'asc')));

      const domains = await Promise.all(
        domainSnapshot.docs.map(async (domainDocument) => {
          const domainData = domainDocument.data() as Omit<AdminDomain, 'id' | 'topics'>;
          const topicSnapshot = await getDocs(
            query(collection(db, 'domains', domainDocument.id, 'topics'), orderBy('order', 'asc')),
          );

          const topics = await Promise.all(
            topicSnapshot.docs.map(async (topicDocument) => {
              const topicData = topicDocument.data() as Omit<AdminTopic, 'id' | 'subtopics'>;
              const subtopicSnapshot = await getDocs(
                query(
                  collection(db, 'domains', domainDocument.id, 'topics', topicDocument.id, 'subtopics'),
                  orderBy('order', 'asc'),
                ),
              );

              const subtopics: Subtopic[] = subtopicSnapshot.docs.map((subtopicDocument) => {
                const subtopicData = subtopicDocument.data() as Omit<Subtopic, 'id'>;

                return {
                  id: subtopicDocument.id,
                  name: subtopicData.name,
                  description: subtopicData.description,
                  order: subtopicData.order,
                  active: subtopicData.active,
                  createdAt: subtopicData.createdAt,
                  updatedAt: subtopicData.updatedAt,
                };
              });

              return {
                id: topicDocument.id,
                name: topicData.name,
                description: topicData.description,
                order: topicData.order,
                active: topicData.active,
                createdAt: topicData.createdAt,
                updatedAt: topicData.updatedAt,
                subtopics,
              };
            }),
          );

          return {
            id: domainDocument.id,
            name: domainData.name,
            description: domainData.description,
            icon: domainData.icon,
            active: domainData.active,
            order: domainData.order,
            createdAt: domainData.createdAt,
            updatedAt: domainData.updatedAt,
            topics,
          };
        }),
      );

      return domains;
    },
  });
}
