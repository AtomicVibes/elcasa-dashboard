import type { NextRequest } from 'next/server';

import { Customer } from '@/app/lib/models';

export async function GET(_req: NextRequest) {
  try {
    const customers = await Customer.findAll({
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return Response.json({ customers }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database connectivity error';

    return Response.json(
      {
        error: 'Failed to fetch customers',
        message,
      },
      { status: 500 },
    );
  }
}

