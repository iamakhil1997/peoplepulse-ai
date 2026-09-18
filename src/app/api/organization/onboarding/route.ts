// PEOPLEPULSE AI — Organization Onboarding & CSV Import API

import { NextResponse } from 'next/server';
import { OrganizationService } from '@/lib/services/organization-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || '00000000-0000-0000-0000-000000000001';
    const sample = searchParams.get('sample');

    if (sample === 'csv') {
      const csv = OrganizationService.generateSampleCSV();
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="peoplepulse_employee_template.csv"',
        },
      });
    }

    const org = await OrganizationService.getOrganization(orgId);
    const departments = await OrganizationService.getDepartments(orgId);
    const employees = await OrganizationService.getEmployeeRoster(orgId);

    return NextResponse.json({
      success: true,
      data: { org, departments, employees },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { organizationId = '00000000-0000-0000-0000-000000000001', csvContent, action, departmentName } = body;

    if (action === 'create_department' && departmentName) {
      const dept = await OrganizationService.createDepartment(organizationId, departmentName);
      return NextResponse.json({ success: true, data: dept });
    }

    if (csvContent) {
      const result = await OrganizationService.importEmployeesFromCSV(organizationId, csvContent);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'No valid action or CSV content provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
