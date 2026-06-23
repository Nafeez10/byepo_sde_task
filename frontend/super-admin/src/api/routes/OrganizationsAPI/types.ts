export interface CreateOrganizationPayload {
  name: string;
  adminEmail: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}
