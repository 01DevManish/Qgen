import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/db'; // Adjust path as needed

// A single route.ts file can handle multiple HTTP methods.

/**
 * Handles GET requests to fetch all questions from the database.
 */
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM question_pro');
    // Ensure the key matches what the client component expects
    return NextResponse.json({ success: true, questions: result.rows });
  } catch (error) {
    console.error('Database error:', error);

    // Check if the error is an instance of Error
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // Handle unknown errors gracefully
    return NextResponse.json(
      { success: false, error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update a question in the database.
 * The request body should contain the updated question data.
 */
export async function PUT(request: Request) {
  try {
    const { id, question_text, code_snippet, explanation, options, correct_answers, topics, difficulty, question_type, language } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Question ID is required for updating.' }, { status: 400 });
    }

    const query = `
      UPDATE question_pro 
      SET 
        question_text = $2, 
        code_snippet = $3, 
        explanation = $4, 
        options = $5, 
        correct_answers = $6, 
        topics = $7, 
        difficulty = $8, 
        question_type = $9, 
        language = $10
      WHERE id = $1
      RETURNING *;
    `;
    const values = [id, question_text, code_snippet, explanation, JSON.stringify(options), correct_answers, topics, difficulty, question_type, language];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Question not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, question: result.rows[0] });

  } catch (error) {
    console.error('Database error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove a question from the database by its ID.
 * The ID is expected as a URL search parameter, e.g., /api/questions?id=123.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Question ID is required.' }, { status: 400 });
    }

    const result = await pool.query('DELETE FROM question_pro WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Question not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Question with ID ${id} deleted.` });

  } catch (error) {
    console.error('Database error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
