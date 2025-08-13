import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// --- Type Definition ---
interface QuestionPayload {
  question_text: string;
  code_snippet: string | null;
  explanation: string;
  options: object;
  correct_answers: string[];
  topics: string[];
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  question_type: 'MCQ' | 'MSQ' | 'Fill in the blank';
  language: string;
}

// --- Main POST Handler for Bulk Insert ---
export async function POST(request: Request) {
  try {
    const questions: QuestionPayload[] = await request.json();

    // --- Validation ---
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Request body must be a non-empty array of question objects.' }, { status: 400 });
    }

    // --- Data Preparation & Query Construction for Bulk Insert ---
    // This approach constructs a single INSERT statement with multiple VALUES clauses.
    // It's more direct and avoids the complexities and potential driver issues with unnest.

    // FIX: Replaced `any[]` with a specific union type to resolve the ESLint error.
    const values: (string | string[] | object | null)[] = [];
    const valueStrings: string[] = [];
    let placeholderIndex = 1;

    for (const q of questions) {
      // Create a placeholder group for each question, e.g., ($1, $2, $3, ...)
      const placeholders = [];
      for (let i = 0; i < 9; i++) { // 9 columns to insert
        placeholders.push(`$${placeholderIndex++}`);
      }
      valueStrings.push(`(${placeholders.join(', ')})`);

      // Add the actual values for this question to the flat values array.
      // The driver will correctly handle mapping JS arrays to PG text[] arrays.
      values.push(
        q.question_text,
        q.code_snippet || null,
        q.explanation,
        q.options, // Send as a JS object, the driver will stringify for jsonb
        q.correct_answers, // Send as a JS array for text[]
        q.topics,          // Send as a JS array for text[]
        q.language,
        q.difficulty,
        q.question_type
      );
    }

    // --- Final SQL Query ---
    const insertQuery = `
      INSERT INTO question_pro(
        question_text, 
        code_snippet, 
        explanation, 
        options, 
        correct_answers, 
        topics, 
        language, 
        difficulty, 
        question_type
      ) VALUES ${valueStrings.join(', ')}
      RETURNING question_id;
    `;

    // Execute the single, powerful query
    const result = await pool.query(insertQuery, values);

    // Return a success response
    return NextResponse.json({
        message: `Successfully added ${result.rowCount} questions!`,
        questionIds: result.rows.map(row => row.question_id)
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Database Error:', error);

    const errorMessage = error instanceof Error ? `Database Error: ${error.message}` : 'Failed to insert questions into the database.';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}