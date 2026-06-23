export interface CreateFlagPayload {
  key: string;
  isEnabled: boolean;
}

export interface UpdateFlagPayload {
  key?: string;
  isEnabled?: boolean;
}

export interface FeatureFlag {
  id: string;
  key: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
