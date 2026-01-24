export interface AccessControlService {
  isPremium(): boolean;
  hasPermission(permission: string): boolean;
  getUserRole(): string;
  canAccessFeature(feature: string): boolean;
}
