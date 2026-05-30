'use client';

import { useState, useMemo, useCallback } from 'react';

export interface Project {
  id: string;
  title: string;
  location: string;
  manager: string;
  managerRole: string;
  reviewer: string;
  progress: string;
  budget: number;
  expenses: number;
  deadline: string;
  category: string;
  duration: string;
  status: string;
}

export interface ProjectFilterState {
  category: string;
  duration: string;
  status: string;
  search: string;
}

export function useProjectFilters(projects: Project[]) {
  const [filters, setFilters] = useState<ProjectFilterState>({
    category: 'all',
    duration: 'all',
    status: 'all',
    search: '',
  });

  const setCategory = useCallback(
    (category: string) => setFilters((prev) => ({ ...prev, category })),
    []
  );

  const setDuration = useCallback(
    (duration: string) => setFilters((prev) => ({ ...prev, duration })),
    []
  );

  const setStatus = useCallback(
    (status: string) => setFilters((prev) => ({ ...prev, status })),
    []
  );

  const setSearch = useCallback(
    (search: string) => setFilters((prev) => ({ ...prev, search })),
    []
  );

  const resetFilters = useCallback(
    () =>
      setFilters({ category: 'all', duration: 'all', status: 'all', search: '' }),
    []
  );

  const activeProjects = useMemo(() => {
    return projects.filter((project) => {
      if (filters.category !== 'all' && project.category !== filters.category) {
        return false;
      }
      if (filters.duration !== 'all' && project.duration !== filters.duration) {
        return false;
      }
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack =
          `${project.title} ${project.location} ${project.manager} ${project.category} ${project.status}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [projects, filters]);

  return {
    filters,
    setCategory,
    setDuration,
    setStatus,
    setSearch,
    resetFilters,
    activeProjects,
    isEmpty: activeProjects.length === 0,
    hasActiveFilters:
      filters.category !== 'all' ||
      filters.duration !== 'all' ||
      filters.status !== 'all' ||
      filters.search !== '',
  };
}
