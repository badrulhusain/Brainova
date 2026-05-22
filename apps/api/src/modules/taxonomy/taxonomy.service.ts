import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DomainModelName,
  serialize,
  serializeMany,
  SubtopicModelName,
  TopicModelName,
  type Domain,
  type MongoModel,
  type Subtopic,
  type Topic,
} from '../../database/mongo.schemas';
import type { CreateDomainDto } from './dto/create-domain.dto';
import type { CreateTopicDto } from './dto/create-topic.dto';
import type { CreateSubtopicDto } from './dto/create-subtopic.dto';

export type TopicWithSubtopics = Topic & { subtopics: Subtopic[] };

@Injectable()
export class TaxonomyService {
  constructor(
    @InjectModel(DomainModelName)
    private readonly domainModel: MongoModel<Domain>,
    @InjectModel(TopicModelName)
    private readonly topicModel: MongoModel<Topic>,
    @InjectModel(SubtopicModelName)
    private readonly subtopicModel: MongoModel<Subtopic>,
  ) {}

  async findAllDomains(): Promise<Domain[]> {
    const domains = await this.domainModel.find({ active: true }).sort({ order: 1 });
    return serializeMany<Domain>(domains);
  }

  async createDomain(dto: CreateDomainDto): Promise<Domain> {
    return serialize<Domain>(await this.domainModel.create(dto));
  }

  async findTopicsByDomain(domainId: string): Promise<TopicWithSubtopics[]> {
    const domain = await this.domainModel.exists({ _id: domainId });
    if (!domain) throw new NotFoundException('Domain not found');

    const topics = serializeMany<Topic>(
      await this.topicModel.find({ domainId, active: true }).sort({ order: 1 }),
    );
    const topicIds = topics.map((topic) => topic.id);
    const subtopics = serializeMany<Subtopic>(
      await this.subtopicModel
        .find({ topicId: { $in: topicIds }, active: true })
        .sort({ order: 1 }),
    );
    const byTopic = new Map<string, Subtopic[]>();
    for (const subtopic of subtopics) {
      byTopic.set(subtopic.topicId, [...(byTopic.get(subtopic.topicId) ?? []), subtopic]);
    }

    return topics.map((topic) => ({
      ...topic,
      subtopics: byTopic.get(topic.id) ?? [],
    }));
  }

  async createTopic(domainId: string, dto: CreateTopicDto): Promise<Topic> {
    const domain = await this.domainModel.exists({ _id: domainId });
    if (!domain) throw new NotFoundException('Domain not found');

    return serialize<Topic>(await this.topicModel.create({ ...dto, domainId }));
  }

  async createSubtopic(
    domainId: string,
    topicId: string,
    dto: CreateSubtopicDto,
  ): Promise<Subtopic> {
    const topic = await this.topicModel.exists({ _id: topicId, domainId });
    if (!topic) throw new NotFoundException('Topic not found in this domain');

    return serialize<Subtopic>(await this.subtopicModel.create({ ...dto, topicId }));
  }
}
