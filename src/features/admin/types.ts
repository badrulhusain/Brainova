import type { Domain, Subtopic, Topic } from '../test-taking/types';

export interface AdminTopic extends Topic {
  subtopics: Subtopic[];
}

export interface AdminDomain extends Domain {
  topics: AdminTopic[];
}
