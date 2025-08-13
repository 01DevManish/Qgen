import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const language = searchParams.get('language');
    const difficulty = searchParams.get('difficulty');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (!language) {
        return NextResponse.json({ error: 'Language parameter is required.' }, { status: 400 });
    }

    try {
        let query = `
            SELECT question_id, question_text, language, difficulty
            FROM question_pro WHERE language = $1
        `;
        
        const queryParams: (string | number)[] = [language];
        let paramIndex = 2;

        if (difficulty && difficulty !== 'Any') {
            query += ` AND difficulty = $${paramIndex++}`;
            queryParams.push(difficulty);
        }
        
        query += ` ORDER BY RANDOM() LIMIT $${paramIndex++}`;
        queryParams.push(limit);

        const result = await pool.query(query, queryParams);

        return NextResponse.json(result.rows, { status: 200 });

    } catch (error: unknown) {
        console.error('API Find Error:', error);
        const errorMessage = error instanceof Error ? `Database Error: ${error.message}` : 'Failed to fetch questions.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
