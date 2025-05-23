import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourcePolicy } from '../entities/resource-policy.entity';
import { RoleService } from './role.service';
import { ResourceType } from '../entities/permission.entity';
import { CreatePolicyDto } from '../dtos/create-policy.dto';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(ResourcePolicy)
    private readonly policyRepository: Repository<ResourcePolicy>,
    private readonly roleService: RoleService,
  ) {}

  /**
   * u0625u0646u0634u0627u0621 u0633u064au0627u0633u0629 u062cu062fu064au062fu0629
   */
  async create(createPolicyDto: CreatePolicyDto): Promise<ResourcePolicy> {
    // u0627u0644u062au062du0642u0642 u0645u0646 u0648u062cu0648u062f u0627u0644u062fu0648u0631
    await this.roleService.findOne(createPolicyDto.roleId);

    // u0625u0646u0634u0627u0621 u0633u064au0627u0633u0629 u062cu062fu064au062fu0629
    const policy = this.policyRepository.create(createPolicyDto);
    return this.policyRepository.save(policy);
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062cu0645u064au0639 u0627u0644u0633u064au0627u0633u0627u062a
   */
  async findAll(): Promise<ResourcePolicy[]> {
    return this.policyRepository.find({
      relations: ['role'],
    });
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0633u064au0627u0633u0629 u0645u062du062fu062fu0629 u0628u0627u0644u0645u0639u0631u0641
   */
  async findOne(id: string): Promise<ResourcePolicy> {
    const policy = await this.policyRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!policy) {
      throw new NotFoundException('u0627u0644u0633u064au0627u0633u0629 u063au064au0631 u0645u0648u062cu0648u062fu0629');
    }

    return policy;
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0633u064au0627u0633u0627u062a u0644u062fu0648u0631 u0645u062du062fu062f
   */
  async findByRoleId(roleId: string): Promise<ResourcePolicy[]> {
    return this.policyRepository.find({
      where: { roleId },
    });
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0633u064au0627u0633u0627u062a u0644u0645u0648u0631u062f u0645u062du062fu062f
   */
  async findByResource(resource: ResourceType): Promise<ResourcePolicy[]> {
    return this.policyRepository.find({
      where: { resource },
      relations: ['role'],
    });
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0633u064au0627u0633u0627u062a u0644u0645u0639u0631u0641 u0645u0648u0631u062f u0645u062du062fu062f
   */
  async findByResourceId(resourceId: string): Promise<ResourcePolicy[]> {
    return this.policyRepository.find({
      where: { resourceId },
      relations: ['role'],
    });
  }

  /**
   * u062au062du062fu064au062b u0633u064au0627u0633u0629
   */
  async update(id: string, updatePolicyDto: Partial<CreatePolicyDto>): Promise<ResourcePolicy> {
    const policy = await this.findOne(id);

    // u062au062du062fu064au062b u0627u0644u062du0642u0648u0644 u0627u0644u0645u0642u062fu0645u0629
    if (updatePolicyDto.resource) policy.resource = updatePolicyDto.resource;
    if (updatePolicyDto.resourceId !== undefined) policy.resourceId = updatePolicyDto.resourceId;
    if (updatePolicyDto.attributeName !== undefined) policy.attributeName = updatePolicyDto.attributeName;
    if (updatePolicyDto.attributeValue !== undefined) policy.attributeValue = updatePolicyDto.attributeValue;
    if (updatePolicyDto.condition !== undefined) policy.condition = updatePolicyDto.condition;

    return this.policyRepository.save(policy);
  }

  /**
   * u062du0630u0641 u0633u064au0627u0633u0629
   */
  async remove(id: string): Promise<boolean> {
    const policy = await this.findOne(id);
    const result = await this.policyRepository.remove(policy);
    return !!result;
  }

  /**
   * u0627u0644u062au062du0642u0642 u0645u0646 u0635u0644u0627u062du064au0629 u0648u0635u0648u0644 u0625u0644u0649 u0645u0648u0631u062f u0645u062du062fu062f
   */
  async checkAccess(
    roleIds: string[],
    resource: ResourceType,
    resourceId?: string,
    attributes?: Record<string, any>,
  ): Promise<boolean> {
    // u0625u0630u0627 u0644u0645 u062au0648u062cu062f u0633u064au0627u0633u0627u062au060c u0646u0633u0645u062d u0628u0627u0644u0648u0635u0648u0644 u0627u0641u062au0631u0627u0636u064au064bu0627
    if (!roleIds || roleIds.length === 0) {
      return false;
    }

    // u0627u0644u0628u062du062b u0639u0646 u0627u0644u0633u064au0627u0633u0627u062a u0627u0644u0645u0631u062au0628u0637u0629 u0628u0627u0644u0623u062fu0648u0627u0631 u0648u0627u0644u0645u0648u0631u062f
    const policies = await this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.roleId IN (:...roleIds)', { roleIds })
      .andWhere('policy.resource = :resource', { resource })
      .andWhere(
        resourceId
          ? '(policy.resourceId IS NULL OR policy.resourceId = :resourceId)'
          : 'policy.resourceId IS NULL',
        resourceId ? { resourceId } : {}
      )
      .getMany();

    // u0625u0630u0627 u0644u0645 u062au0648u062cu062f u0633u064au0627u0633u0627u062au060c u0646u0633u0645u062d u0628u0627u0644u0648u0635u0648u0644 u0627u0641u062au0631u0627u0636u064au064bu0627
    if (policies.length === 0) {
      return true;
    }

    // u0627u0644u062au062du0642u0642 u0645u0646 u0627u0644u0633u064au0627u0633u0627u062a u0627u0644u062au064a u0644u0647u0627 u0633u0645u0627u062a
    if (attributes) {
      const attributePolicies = policies.filter(
        (policy) => policy.attributeName && policy.attributeValue
      );

      // u0625u0630u0627 u0643u0627u0646u062a u0647u0646u0627u0643 u0633u064au0627u0633u0627u062a u0633u0645u0627u062au060c u0646u062au062du0642u0642 u0645u0646u0647u0627
      if (attributePolicies.length > 0) {
        for (const policy of attributePolicies) {
          const attributeValue = attributes[policy.attributeName];
          
          // u0625u0630u0627 u0643u0627u0646u062a u0642u064au0645u0629 u0627u0644u0633u0645u0629 u062au0637u0627u0628u0642 u0627u0644u0634u0631u0637 u0648u0627u0644u0634u0631u0637 u0645u0633u0645u0648u062d
          if (attributeValue === policy.attributeValue && policy.condition === true) {
            return true;
          }
          
          // u0625u0630u0627 u0643u0627u0646u062a u0642u064au0645u0629 u0627u0644u0633u0645u0629 u062au0637u0627u0628u0642 u0627u0644u0634u0631u0637 u0648u0644u0643u0646 u0627u0644u0634u0631u0637 u0645u0645u0646u0648u0639
          if (attributeValue === policy.attributeValue && policy.condition === false) {
            return false;
          }
        }
      }
    }

    // u0627u0644u062au062du0642u0642 u0645u0646 u0627u0644u0633u064au0627u0633u0627u062a u0627u0644u0639u0627u0645u0629 (u0628u062fu0648u0646 u0633u0645u0627u062a)
    const generalPolicies = policies.filter(
      (policy) => !policy.attributeName && !policy.attributeValue
    );

    if (generalPolicies.length > 0) {
      // u0625u0630u0627 u0643u0627u0646u062a u0647u0646u0627u0643 u0633u064au0627u0633u0629 u0645u0645u0646u0648u0639u0629u060c u0646u0645u0646u0639 u0627u0644u0648u0635u0648u0644
      if (generalPolicies.some(policy => policy.condition === false)) {
        return false;
      }
      
      // u0625u0630u0627 u0643u0627u0646u062a u0647u0646u0627u0643 u0633u064au0627u0633u0629 u0645u0633u0645u0648u062du0629u060c u0646u0633u0645u062d u0628u0627u0644u0648u0635u0648u0644
      if (generalPolicies.some(policy => policy.condition === true)) {
        return true;
      }
    }

    // u0627u0641u062au0631u0627u0636u064au064bu0627 u0646u0633u0645u062d u0628u0627u0644u0648u0635u0648u0644 u0625u0630u0627 u0644u0645 u062au0643u0646 u0647u0646u0627u0643 u0633u064au0627u0633u0627u062a u0645u062du062fu062fu0629
    return true;
  }
}