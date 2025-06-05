// import { NextRequest, NextResponse } from 'next/server';

// const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxlvP4m_u9njP07uizQ42BiurLLFpLrKt0QXmJxOMPG2I4M8QqfclsUSwNecD3t_9WXBg/exec';

// // 緊急修正：OPTIONS preflightリクエスト対応
// export async function OPTIONS() {
//   console.log('OPTIONS request received');
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       'Access-Control-Max-Age': '3600',
//     },
//   });
// }

// // GET リクエストの処理
// export async function GET(request: NextRequest) {
//   console.log('🚀 GET /api/gas called');
  
//   try {
//     const { searchParams } = new URL(request.url);
//     const path = searchParams.get('path');
    
//     console.log('GET path:', path);
    
//     if (!path) {
//       return NextResponse.json({ 
//         success: false, 
//         error: 'Path parameter is required' 
//       }, { status: 400 });
//     }

//     // 簡単なヘルスチェック
//     if (path === 'health') {
//       return NextResponse.json({
//         success: true,
//         data: {
//           status: 'Next.js API Route is working!',
//           timestamp: new Date().toISOString(),
//           path: path,
//           note: 'This is coming from Next.js API Route, not Google Apps Script'
//         }
//       });
//     }

//     // その他のパスの場合はGoogle Apps Scriptに転送
//     const queryParams = new URLSearchParams({ path });
//     const id = searchParams.get('id');
//     const status = searchParams.get('status');
//     if (id) queryParams.append('id', id);
//     if (status) queryParams.append('status', status);

//     const gasUrl = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
//     console.log('Forwarding to GAS:', gasUrl);

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
//   console.log('🚀 POST /api/gas called');
  
//   try {
//     const { searchParams } = new URL(request.url);
//     const path = searchParams.get('path');
    
//     console.log('POST path:', path);
    
//     if (!path) {
//       return NextResponse.json({ 
//         success: false, 
//         error: 'Path parameter is required' 
//       }, { status: 400 });
//     }

//     // 接続テスト用の簡単なレスポンス
//     if (path === 'test-connection') {
//       console.log('Test connection called via Next.js API Route');
      
//       try {
//         const body = await request.json();
//         console.log('Test connection body:', body);
//       } catch (e) {
//         console.log('No JSON body for test connection');
//       }
      
//       return NextResponse.json({
//         success: true,
//         data: {
//           status: 'Connection test successful via Next.js API Route!',
//           message: 'This proves the API route is working',
//           timestamp: new Date().toISOString(),
//           path: path,
//           note: 'Next step: implement Google Apps Script integration'
//         }
//       });
//     }

//     // フォームフィールド取得用の簡単なレスポンス
//     if (path === 'form-fields') {
//       console.log('Form fields called via Next.js API Route');
      
//       try {
//         const body = await request.json();
//         console.log('Form fields body:', body);
//       } catch (e) {
//         console.log('No JSON body for form fields');
//       }
      
//       return NextResponse.json({
//         success: true,
//         data: {
//           message: 'Form fields retrieved successfully',
//           fields: [
//             { key: 'name', displayName: 'お名前', type: 'text' },
//             { key: 'email', displayName: 'メールアドレス', type: 'email' },
//             { key: 'reason', displayName: '申請理由', type: 'textarea' },
//             { key: 'amount', displayName: '希望金額', type: 'number' }
//           ]
//         }
//       });
//     }

//     // その他のPOSTリクエストはGoogle Apps Scriptに転送
//     const body = await request.json().catch(() => ({}));
//     console.log('POST body:', body);

//     const queryParams = new URLSearchParams({ path });
//     const id = searchParams.get('id');
//     if (id) queryParams.append('id', id);

//     const gasUrl = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
//     console.log('Forwarding POST to GAS:', gasUrl);

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
//   console.log('🚀 PUT /api/gas called');
//   return POST(request); // POSTと同じ処理
// }

// // DELETE リクエストの処理
// export async function DELETE(request: NextRequest) {
//   console.log('🚀 DELETE /api/gas called');
//   return POST(request); // POSTと同じ処理
// }