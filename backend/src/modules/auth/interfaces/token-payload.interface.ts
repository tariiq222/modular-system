import { Role } from '../../rbac/entities/role.entity';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}
