import { describe, it, expect } from 'vitest';
import {
  filterInterviews,
  getCompanyLogoUrl,
  getCompanyInitial,
} from '@/utils/kanbanUtils';
import type { Interview } from '@/hooks/useJobApplications';

const make = (over: Partial<Interview>): Interview =>
  ({
    id: '1',
    position: 'Frontend Developer',
    company: 'Acme Corp',
    status: 'applied',
    ...over,
  }) as Interview;

describe('filterInterviews', () => {
  const interviews = [
    make({ id: '1', position: 'Frontend Developer', company: 'Acme', status: 'applied' }),
    make({ id: '2', position: 'Backend Engineer', company: 'Globex', status: 'interview' }),
    make({ id: '3', position: 'Data Analyst', company: 'Acme', status: 'rejected' }),
  ];

  it('matches on position or company, case-insensitively', () => {
    expect(filterInterviews(interviews, 'acme', 'all')).toHaveLength(2);
    expect(filterInterviews(interviews, 'BACKEND', 'all')).toHaveLength(1);
  });

  it('filters by status and combines with search', () => {
    expect(filterInterviews(interviews, '', 'interview')).toHaveLength(1);
    expect(filterInterviews(interviews, 'acme', 'rejected')).toHaveLength(1);
    expect(filterInterviews(interviews, 'acme', 'interview')).toHaveLength(0);
  });

  it('returns everything when search is empty and status is "all"', () => {
    expect(filterInterviews(interviews, '', 'all')).toHaveLength(3);
  });
});

describe('company helpers', () => {
  it('builds a clearbit logo url from a normalized company name', () => {
    expect(getCompanyLogoUrl('Acme Corp')).toBe('https://logo.clearbit.com/acmecorp.com');
  });

  it('returns the uppercased first initial', () => {
    expect(getCompanyInitial('globex')).toBe('G');
  });
});
