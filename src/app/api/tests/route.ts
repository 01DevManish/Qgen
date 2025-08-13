import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const query = `
            SELECT 
                t.test_id,
                t.name,
                t.description,
                t.duration_minutes,
                t.created_at,
                COUNT(tq.question_id) AS question_count
            FROM tests t
            LEFT JOIN test_questions tq ON t.test_id = tq.test_id
            GROUP BY t.test_id
            ORDER BY t.created_at DESC;
        `;
        const result = await pool.query(query);
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching all tests:', error);
        return NextResponse.json({ error: 'Failed to fetch tests.' }, { status: 500 });
    }
}
