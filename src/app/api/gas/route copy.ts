// import { NextRequest, NextResponse } from 'next/server';

// const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxlvP4m_u9njP07uizQ42BiurLLFpLrKt0QXmJxOMPG2I4M8QqfclsUSwNecD3t_9WXBg/exec';

// // GET リクエストの処理
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const path = searchParams.get('path');
//     const id = searchParams.get('id');
//     const status = searchParams.get('status');
    
//     if (!path) {
//       return NextResponse.json({ 
//         success: false, 
//         error: 'Path parameter is required' 
//       }, { status: 400 });
//     }

//     // クエリパラメータを構築
//     const queryParams = new URLSearchParams({ path });
//     if (id) queryParams.append('id', id);
//     if (status) queryParams.append('status', status);

//     const gasUrl = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
    
//     console.log('GET Request to GAS:', gasUrl);

//     const response = await fetch(gasUrl, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Google Apps Script request failed: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
    
//     // レスポンスが文字列の場合はJSONとしてパース（GASの場合によくある）
//     const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
//     return NextResponse.json(parsedData);

//   } catch (error) {
//     console.error('GET API Route Error:', error);
//     return NextResponse.json({
//       success: false,
//       error: 'Internal Server Error',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 });
//   }
// }

// // POST リクエストの処理
// export async function POST(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const path = searchParams.get('path');
//     const id = searchParams.get('id');
    
//     if (!path) {
//       return NextResponse.json({ 
//         success: false, 
//         error: 'Path parameter is required' 
//       }, { status: 400 });
//     }

//     // リクエストボディを取得
//     const body = await request.json();

//     // クエリパラメータを構築
//     const queryParams = new URLSearchParams({ path });
//     if (id) queryParams.append('id', id);

//     const gasUrl = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
    
//     console.log('POST Request to GAS:', gasUrl, 'Body:', body);

//     const response = await fetch(gasUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(`Google Apps Script request failed: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
    
//     // レスポンスが文字列の場合はJSONとしてパース
//     const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
//     return NextResponse.json(parsedData);

//   } catch (error) {
//     console.error('POST API Route Error:', error);
//     return NextResponse.json({
//       success: false,
//       error: 'Internal Server Error',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 });
//   }
// }

// // PUT リクエストの処理
// export async function PUT(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const path = searchParams.get('path');
//     const id = searchParams.get('id');
    
//     if (!path) {
//       return NextResponse.json({ 
//         success: false, 
//         error: 'Path parameter is required' 
//       }, { status: 400 });
//     }

//     // リクエストボディを取得
//     const body = await request.json();

//     // クエリパラメータを構築
//     const queryParams = new URLSearchParams({ path, method: 'PUT' });
//     if (id) queryParams.append('id', id);

//     const gasUrl = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
    
//     console.log('PUT Request to GAS:', gasUrl, 'Body:', body);

//     const response = await fetch(gasUrl, {
//       method: 'POST', // GASではPOSTを使用
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(`Google Apps Script request failed: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
    
//     // レスポンスが文字列の場合はJSONとしてパース
//     const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
//     return NextResponse.json(parsedData);

//   } catch (error) {
//     console.error('PUT API Route Error:', error);
//     return NextResponse.json({
//       success: false,
//       error: 'Internal Server Error',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 });
//   }
// }

// // DELETE リクエストの処理
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const path = searchParams.get('path');
//     const id = searchParams.get('id');
    
//     if (!path) {
//       return NextResponse.json({ 
//         success: false, 
//         error: 'Path parameter is required' 
//       }, { status: 400 });
//     }

//     // クエリパラメータを構築
//     const queryParams = new URLSearchParams({ path, method: 'DELETE' });
//     if (id) queryParams.append('id', id);

//     const gasUrl = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
    
//     console.log('DELETE Request to GAS:', gasUrl);

//     const response = await fetch(gasUrl, {
//       method: 'POST', // GASではPOSTを使用
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({}),
//     });

//     if (!response.ok) {
//       throw new Error(`Google Apps Script request failed: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
    
//     // レスポンスが文字列の場合はJSONとしてパース
//     const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
//     return NextResponse.json(parsedData);

//   } catch (error) {
//     console.error('DELETE API Route Error:', error);
//     return NextResponse.json({
//       success: false,
//       error: 'Internal Server Error',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 });
//   }
// }