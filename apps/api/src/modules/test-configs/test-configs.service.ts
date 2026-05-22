import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DomainModelName,
  serialize,
  serializeMany,
  TestConfigModelName,
  type Domain,
  type MongoModel,
  type TestConfig,
} from '../../database/mongo.schemas';
import type { CreateTestConfigDto } from './dto/create-test-config.dto';
import type { UpdateTestConfigDto } from './dto/update-test-config.dto';

type TestConfigWithDomain = TestConfig & {
  domain: { id: string; name: string; icon: string };
};

@Injectable()
export class TestConfigsService {
  constructor(
    @InjectModel(TestConfigModelName)
    private readonly configModel: MongoModel<TestConfig>,
    @InjectModel(DomainModelName)
    private readonly domainModel: MongoModel<Domain>,
  ) {}

  async findAll(): Promise<TestConfigWithDomain[]> {
    const configs = serializeMany<TestConfig>(
      await this.configModel.find({ active: true }).sort({ createdAt: -1 }),
    );
    return this.attachDomains(configs);
  }

  async findById(id: string): Promise<TestConfigWithDomain> {
    const config = await this.configModel.findOne({ _id: id, active: true });
    if (!config) throw new NotFoundException('Test configuration not found');
    const [withDomain] = await this.attachDomains([serialize<TestConfig>(config)]);
    return withDomain;
  }

  async create(dto: CreateTestConfigDto, adminId: string): Promise<TestConfigWithDomain> {
    const domain = await this.domainModel.exists({ _id: dto.domainId });
    if (!domain) throw new NotFoundException('Domain not found');

    const config = serialize<TestConfig>(
      await this.configModel.create({ ...dto, createdBy: adminId }),
    );
    const [withDomain] = await this.attachDomains([config]);
    return withDomain;
  }

  async update(id: string, dto: UpdateTestConfigDto): Promise<TestConfigWithDomain> {
    const config = await this.configModel.findByIdAndUpdate(id, dto, { new: true });
    if (!config) throw new NotFoundException('Test configuration not found');
    const [withDomain] = await this.attachDomains([serialize<TestConfig>(config)]);
    return withDomain;
  }

  async remove(id: string): Promise<void> {
    const config = await this.configModel.findByIdAndUpdate(id, { active: false });
    if (!config) throw new NotFoundException('Test configuration not found');
  }

  private async attachDomains(configs: TestConfig[]): Promise<TestConfigWithDomain[]> {
    const domainIds = [...new Set(configs.map((config) => config.domainId))];
    const domains = serializeMany<Domain>(await this.domainModel.find({ _id: { $in: domainIds } }));
    const domainMap = new Map(domains.map((domain) => [domain.id, domain]));

    return configs.map((config) => {
      const domain = domainMap.get(config.domainId);
      return {
        ...config,
        domain: {
          id: domain?.id ?? config.domainId,
          name: domain?.name ?? 'Unknown',
          icon: domain?.icon ?? 'book-open',
        },
      };
    });
  }
}
