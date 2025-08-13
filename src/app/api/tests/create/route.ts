import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface CreateTestPayload {
    name: string;
    description: string; // Naya field
    durationInMinutes: number;
    questionIds: number[];
}

export async function POST(request: Request) {
    const client = await pool.connect();

    try {
        const { name, description, durationInMinutes, questionIds }: CreateTestPayload = await request.json();

        // --- Validation ---
        if (!name || !description || !durationInMinutes || !Array.isArray(questionIds) || questionIds.length === 0) {
            return NextResponse.json({ error: 'Invalid payload. Name, description, duration, and questions are required.' }, { status: 400 });
        }

        // --- Transaction shuru karein ---
        await client.query('BEGIN');

        // 1. 'tests' table mein data daalein
        const insertTestQuery = `
            INSERT INTO tests (name, description, duration_minutes) 
            VALUES ($1, $2, $3) 
            RETURNING test_id;
        `;
        const testResult = await client.query(insertTestQuery, [name, description, durationInMinutes]);
        const newTestId = testResult.rows[0].test_id;

        // 2. 'test_questions' junction table mein data daalein
        const valueStrings = questionIds.map((_, index) => `($1, $${index + 2})`).join(', ');
        const insertJunctionQuery = `
            INSERT INTO test_questions (test_id, question_id) 
            VALUES ${valueStrings};
        `;
        await client.query(insertJunctionQuery, [newTestId, ...questionIds]);

        // --- Transaction commit karein ---
        await client.query('COMMIT');
        
        return NextResponse.json({
            message: `Successfully created test "${name}" with ${questionIds.length} questions.`,
            testId: newTestId
        }, { status: 201 });

    } catch (error: unknown) {
        await client.query('ROLLBACK');
        console.error('Test Creation Error:', error);
        const errorMessage = error instanceof Error ? `Database Error: ${error.message}` : 'Failed to create test.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });

    } finally {
        client.release();
    }
}