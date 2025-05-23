import { SetMetadata } from '@nestjs/common';
import { ActionType, ResourceType } from '../entities/permission.entity';

export const PERMISSIONS_KEY = 'permissions';

/**
 * u0632u062eu0631u0641u0629 u0644u062du0645u0627u064au0629 u0645u0633u0627u0631 u0628u0635u0644u0627u062du064au0627u062a u0645u062du062fu062fu0629
 * @param permissions u0642u0627u0626u0645u0629 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0645u0637u0644u0648u0628u0629 u0644u0644u0648u0635u0648u0644
 */
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * u0632u062eu0631u0641u0629 u0644u062du0645u0627u064au0629 u0645u0633u0627u0631 u0628u0639u0645u0644u064au0629 u0648u0645u0648u0631u062f u0645u062du062fu062fu064au0646
 * @param action u0646u0648u0639 u0627u0644u0639u0645u0644u064au0629 (u0642u0631u0627u0621u0629u060c u0643u062au0627u0628u0629u060c u0625u0644u062e)
 * @param resource u0646u0648u0639 u0627u0644u0645u0648u0631u062f (u0645u0633u062au062eu062fu0645u060c u0645u0644u0641 u0634u062eu0635u064au060c u0625u0644u062e)
 */
export const RequireAction = (action: ActionType, resource: ResourceType) => {
  const permissionName = `${action}:${resource}`;
  return SetMetadata(PERMISSIONS_KEY, [permissionName]);
};

/**
 * u0632u062eu0631u0641u0629 u0644u062du0645u0627u064au0629 u0645u0633u0627u0631 u0628u0639u062fu0629 u0639u0645u0644u064au0627u062a u0644u0646u0641u0633 u0627u0644u0645u0648u0631u062f
 * @param actions u0642u0627u0626u0645u0629 u0627u0644u0639u0645u0644u064au0627u062a
 * @param resource u0646u0648u0639 u0627u0644u0645u0648u0631u062f
 */
export const RequireActions = (actions: ActionType[], resource: ResourceType) => {
  const permissions = actions.map(action => `${action}:${resource}`);
  return SetMetadata(PERMISSIONS_KEY, permissions);
};

/**
 * u0632u062eu0631u0641u0629 u0644u062du0645u0627u064au0629 u0645u0633u0627u0631 u0628u0639u0645u0644u064au0629 u0625u062fu0627u0631u0629 u0643u0627u0645u0644u0629 u0644u0645u0648u0631u062f
 * @param resource u0646u0648u0639 u0627u0644u0645u0648u0631u062f
 */
export const RequireManage = (resource: ResourceType) => {
  return RequireAction(ActionType.MANAGE, resource);
};