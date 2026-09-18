// PEOPLEPULSE AI — Organization & Employee Onboarding Service

import { mockDb } from '../store/mock-db';
import { Department, EmployeeProfile, User } from '../types/database';
import Papa from 'papaparse';

export interface EmployeeCSVRow {
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  job_title: string;
  hire_date?: string;
  role?: string;
}

export const OrganizationService = {
  async getOrganization(organizationId: string) {
    const db = mockDb.getState();
    return db.organizations.find((o) => o.id === organizationId);
  },

  async getDepartments(organizationId: string) {
    const db = mockDb.getState();
    return db.departments.filter((d) => d.organization_id === organizationId);
  },

  async createDepartment(organizationId: string, name: string, code?: string) {
    const db = mockDb.getState();
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      organization_id: organizationId,
      name,
      code: code || name.substring(0, 3).toUpperCase(),
      parent_department_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.departments.push(newDept);
    return newDept;
  },

  async getEmployeeRoster(organizationId: string) {
    const db = mockDb.getState();
    return db.employeeProfiles
      .filter((p) => p.organization_id === organizationId)
      .map((p) => {
        const user = db.users.find((u) => u.id === p.user_id);
        const dept = db.departments.find((d) => d.id === p.department_id);
        return {
          ...p,
          email: user?.email || '',
          role_name: user?.role_name || 'Employee',
          department: dept,
        };
      });
  },

  async importEmployeesFromCSV(organizationId: string, csvContent: string) {
    const db = mockDb.getState();
    const parsed = Papa.parse<EmployeeCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return {
        success: false,
        importedCount: 0,
        errors: parsed.errors.map((e) => `Row ${e.row}: ${e.message}`),
      };
    }

    let count = 0;
    for (const row of parsed.data) {
      if (!row.email || !row.first_name || !row.last_name) continue;

      // Find or create department
      let dept = db.departments.find(
        (d) => d.organization_id === organizationId && d.name.toLowerCase() === (row.department || 'General').toLowerCase()
      );
      if (!dept) {
        dept = {
          id: `dept-${Date.now()}-${count}`,
          organization_id: organizationId,
          name: row.department || 'General',
          code: (row.department || 'GEN').substring(0, 3).toUpperCase(),
          parent_department_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        db.departments.push(dept);
      }

      // Check if user exists
      let user = db.users.find((u) => u.organization_id === organizationId && u.email.toLowerCase() === row.email.toLowerCase());
      if (!user) {
        user = {
          id: `usr-${Date.now()}-${count}`,
          organization_id: organizationId,
          email: row.email.toLowerCase(),
          role_name: (row.role as any) || 'Employee',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        db.users.push(user);
      }

      // Profile
      const existingProfile = db.employeeProfiles.find((p) => p.user_id === user!.id);
      if (!existingProfile) {
        db.employeeProfiles.push({
          id: `prof-${Date.now()}-${count}`,
          organization_id: organizationId,
          user_id: user.id,
          first_name: row.first_name,
          last_name: row.last_name,
          job_title: row.job_title || 'Team Member',
          department_id: dept.id,
          hire_date: row.hire_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        count++;
      }
    }

    return {
      success: true,
      importedCount: count,
      errors: [],
    };
  },

  generateSampleCSV(): string {
    return `first_name,last_name,email,department,job_title,hire_date,role
Alex,Morgan,alex.morgan@northstar.demo,People & HR,Head of People & Culture,2023-01-15,HR_Admin
Sarah,Chen,sarah.chen@northstar.demo,People & HR,Senior People Partner,2023-06-01,HR
Marcus,Vance,marcus.vance@northstar.demo,Engineering,Senior Backend Engineer,2023-09-18,Employee
Elena,Rostova,elena.rostova@northstar.demo,Operations,Operations Lead,2022-11-05,Employee
Priya,Patel,priya.patel@northstar.demo,Customer Support,Support Specialist,2024-02-01,Employee
Jordan,Lee,jordan.lee@northstar.demo,Sales,Account Executive,2023-04-12,Employee
Lucas,Mendoza,lucas.mendoza@northstar.demo,Finance,Senior Financial Analyst,2023-08-01,Employee`;
  },
};
