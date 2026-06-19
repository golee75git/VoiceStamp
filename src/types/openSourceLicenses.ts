export type OpenSourceLicenseEntry = {
  id: string;
  name: string;
  version: string;
  license: string;
  copyright: string;
  licenseText: string;
  source: 'npm' | 'android' | string;
  repository?: string;
};

export type OpenSourceReviewEntry = {
  id: string;
  name: string;
  version: string;
  license: string;
  source: string;
  reasons: string[];
  note?: string;
  selectedLicense?: string;
  reviewStatus?: 'confirmed' | 'pending';
  conclusion?: string;
};

export type OpenSourceLicenseReviewSummary = {
  document: string;
  reviewedAt: string;
  scope: string;
  conclusion: string;
  disclaimer: string;
};

export type OpenSourceLicensesDocument = {
  generatedAt: string;
  app: string;
  sources: string[];
  counts: {
    npm: number;
    android: number;
    total: number;
    reviewRequired: number;
  };
  licenseReviewSummary?: OpenSourceLicenseReviewSummary;
  reviewRequired: OpenSourceReviewEntry[];
  libraries: OpenSourceLicenseEntry[];
};
