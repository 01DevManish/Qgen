import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

type TestIdParams = {
  params: Promise<{ testId: string }>;
};

// GET - Fetch a single test with questions
export async function GET(request: NextRequest, { params }: TestIdParams) {
  const { testId } = await params;

  try {
    const id = parseInt(testId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid test ID. Must be a number.' }, { status: 400 });
    }

    const testQuery = 'SELECT * FROM tests WHERE test_id = $1';
    const testResult = await pool.query(testQuery, [id]);

    if (testResult.rows.length === 0) {
      return NextResponse.json({ error: `Test with ID ${id} not found.` }, { status: 404 });
    }

    const questionsQuery = `
      SELECT q.question_id, q.question_text, q.difficulty, q.language
      FROM question_pro q
      JOIN test_questions tq ON q.question_id = tq.question_id
      WHERE tq.test_id = $1;
    `;
    const questionsResult = await pool.query(questionsQuery, [id]);

    return NextResponse.json(
      { ...testResult.rows[0], questions: questionsResult.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Backend Error on GET /api/tests/${testId}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Update test details
export async function PUT(request: NextRequest, { params }: TestIdParams) {
  const { testId } = await params;

  try {
    const { name, description, duration_minutes } = await request.json();
    const id = parseInt(testId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid test ID.' }, { status: 400 });
    }
    if (!name || !description || !duration_minutes) {
      return NextResponse.json(
        { error: 'Name, description, and duration are required.' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE tests
      SET name = $1, description = $2, duration_minutes = $3
      WHERE test_id = $4
      RETURNING *;
    `;
    const result = await pool.query(query, [name, description, duration_minutes, id]);
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error(`Backend Error on PUT /api/tests/${testId}:`, error);
    return NextResponse.json({ error: 'Failed to update test.' }, { status: 500 });
  }
}

// DELETE - Remove a test
export async function DELETE(request: NextRequest, { params }: TestIdParams) {
  const { testId } = await params;

  try {
    const id = parseInt(testId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid test ID.' }, { status: 400 });
    }

    await pool.query('DELETE FROM tests WHERE test_id = $1', [id]);
    return NextResponse.json({ message: 'Test deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Backend Error on DELETE /api/tests/${testId}:`, error);
    return NextResponse.json({ error: 'Failed to delete test.' }, { status: 500 });
  }
}
