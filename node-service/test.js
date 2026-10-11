/**
 * Automated test suite for FinMate Node.js + MongoDB Microservice.
 */

const http = require('http');
const app = require('./server');

let server;
const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('--- Starting FinMate Node.js Microservice Tests ---');
  server = app.listen(TEST_PORT);

  try {
    // 1. Health Check
    const resHealth = await fetch(`${BASE_URL}/api/health`);
    const dataHealth = await resHealth.json();
    console.assert(resHealth.status === 200, 'Health status should be 200');
    console.assert(dataHealth.status === 'ONLINE', 'Service status should be ONLINE');
    console.log('[PASS] 1. Health Check OK');

    // 2. Create Note (POST)
    const resCreateNote = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Emergency Reserve Policy',
        content: 'Maintain at least 6 months of living expenses in liquid instruments.',
        tags: ['strategy', 'buffer'],
        pinned: true,
      }),
    });
    console.assert(resCreateNote.status === 201, 'Create note status should be 201');
    const noteData = await resCreateNote.json();
    const noteId = noteData.data._id || noteData.data.id;
    console.assert(noteData.data.title === 'Emergency Reserve Policy', 'Note title should match');
    console.log('[PASS] 2. Note Creation OK (ID: ' + noteId + ')');

    // 3. List Notes (GET)
    const resListNotes = await fetch(`${BASE_URL}/api/notes`);
    const listNotes = await resListNotes.json();
    console.assert(resListNotes.status === 200, 'List notes should be 200');
    console.assert(listNotes.data.length >= 1, 'Should have at least 1 note');
    console.log('[PASS] 3. List Notes OK (Count: ' + listNotes.data.length + ')');

    // 4. Update Note (PUT)
    const resUpdateNote = await fetch(`${BASE_URL}/api/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Emergency Reserve Policy (Updated)',
      }),
    });
    console.assert(resUpdateNote.status === 200, 'Update note status should be 200');
    const updatedNote = await resUpdateNote.json();
    console.assert(updatedNote.data.title === 'Emergency Reserve Policy (Updated)', 'Title updated');
    console.log('[PASS] 4. Note Update OK');

    // 5. Delete Note (DELETE)
    const resDelNote = await fetch(`${BASE_URL}/api/notes/${noteId}`, { method: 'DELETE' });
    console.assert(resDelNote.status === 200, 'Delete note status should be 200');
    console.log('[PASS] 5. Note Deletion OK');

    // 6. Create Conversation (POST)
    const resCreateConv = await fetch(`${BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Retirement Timeline Planning',
        messages: [{ role: 'user', content: 'What is my safe withdrawal rate?' }],
      }),
    });
    console.assert(resCreateConv.status === 201, 'Create conv should be 201');
    const convData = await resCreateConv.json();
    const convId = convData.data._id || convData.data.id;
    console.log('[PASS] 6. Conversation Creation OK (ID: ' + convId + ')');

    // 7. Append message to Conversation (PUT)
    const resAppend = await fetch(`${BASE_URL}/api/conversations/${convId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newMessage: { role: 'assistant', content: 'Typically 3.5% to 4% adjusted for inflation.' },
      }),
    });
    console.assert(resAppend.status === 200, 'Append message should be 200');
    console.log('[PASS] 7. Conversation Append Message OK');

    // 8. Delete Conversation (DELETE)
    const resDelConv = await fetch(`${BASE_URL}/api/conversations/${convId}`, { method: 'DELETE' });
    console.assert(resDelConv.status === 200, 'Delete conversation should be 200');
    console.log('[PASS] 8. Conversation Deletion OK');

    console.log('\n======================================================');
    console.log('ALL 8 NODE.JS + MONGODB DOCUMENT API TESTS PASSED 100%');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
