import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

type TestIdParams = {
  params: Promise<{ testId: string }>;
};

// POST - Add questions to a test
export async function POST(request: NextRequest, context: TestIdParams) {
  const { testId } = await context.params;

  try {
    const { questionIds } = await request.json();

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: 'questionIds must be a non-empty array.' },
        { status: 400 }
      );
    }

    const valueStrings = questionIds
      .map((_, index) => `($1, $${index + 2})`)
      .join(', ');

    const query = `
      INSERT INTO test_questions (test_id, question_id)
      VALUES ${valueStrings}
      ON CONFLICT (test_id, question_id) DO NOTHING;
    `;

    await pool.query(query, [testId, ...questionIds]);
    return NextResponse.json({ message: 'Questions added successfully.' }, { status: 201 });
  } catch (error) {
    console.error(`Error adding questions to test ${testId}:`, error);
    return NextResponse.json({ error: 'Failed to add questions.' }, { status: 500 });
  }
}

// DELETE - Remove a question from a test
export async function DELETE(request: NextRequest, context: TestIdParams) {
  const { testId } = await context.params;

  try {
    const { questionId } = await request.json();
    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId is required.' },
        { status: 400 }
      );
    }

    const query = 'DELETE FROM test_questions WHERE test_id = $1 AND question_id = $2';
    await pool.query(query, [testId, questionId]);

    return NextResponse.json({ message: 'Question removed successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error removing question from test ${testId}:`, error);
    return NextResponse.json({ error: 'Failed to remove question.' }, { status: 500 });
  }
}
