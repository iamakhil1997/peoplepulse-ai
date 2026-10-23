import { NextResponse } from 'next/server';
import { getSession, isHRRole } from './get-session';

const HR_MANAGEMENT_ROLES = new Set(['HR', 'HR_Admin', 'Org_Admin', 'Super_Admin']);

/**
 * This deployment only has file-backed demo storage. Until durable tenant-scoped
 * storage is implemented, APIs must not process non-demo company records.
 */
export async function requireDemoApiSession(options: { hrOnly?: boolean; managerOnly?: boolean; writeDisabled?: boolean } = {}) {
  if (options.writeDisabled) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: 'Data entry is disabled in this shared demo. Use synthetic sample data only.' },
        { status: 503 }
      ),
    };
  }

  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }),
    };
  }

  if (!session.isDemo) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: 'Company data features are unavailable until secure database storage is configured.' },
        { status: 503 }
      ),
    };
  }

  if (options.hrOnly && !isHRRole(session.roleName)) {
    return {
      session: null,
      response: NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 }),
    };
  }

  if (options.managerOnly && !HR_MANAGEMENT_ROLES.has(session.roleName)) {
    return {
      session: null,
      response: NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 }),
    };
  }

  return { session, response: null };
}
