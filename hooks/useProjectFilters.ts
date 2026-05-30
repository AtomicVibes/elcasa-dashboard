'use client';

import { useState, useMemo } from 'react';

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
}

export function useProjectFilters(projects: Project[]) {
  const [filters, setFilters] = useState<ProjectFilterState>({
    category: 'all',
    duration: 'all',
    status: 'all',
  });

  const setCategory = (category: string) =>
    setFilters((prev) => ({ ...prev, category }));

  const setDuration = (duration: string) =>
    setFilters((prev) => ({ ...prev, duration }));

  const setStatus = (status: string) =>
    setFilters((prev) => ({ ...prev, status }));

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
      return true;
    });
  }, [projects, filters]);

  return {
    filters,
    setCategory,
    setDuration,
    setStatus,
    activeProjects,
    isEmpty: activeProjects.length === 0,
  };
}
