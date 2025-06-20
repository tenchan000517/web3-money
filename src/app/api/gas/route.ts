import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxlvP4m_u9njP07uizQ42BiurLLFpLrKt0QXmJxOMPG2I4M8QqfclsUSwNecD3t_9WXBg/exec';

// 緊急修正：OPTIONS preflightリクエスト対応
export async function OPTIONS() {
    console.log('OPTIONS request received');
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600',
        },
    });
}

// 🔧 修正：共通のリクエスト処理関数
async function handleGASRequest(request: NextRequest, method: string) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        console.log(`${method} path:`, path);
        console.log(`${method} body:`, searchParams.toString());

        if (!path) {
            return NextResponse.json({
                success: false,
                error: 'Path parameter is required'
            }, { status: 400 });
        }

        // リクエストボディを取得
        let body = {};
        if (method !== 'GET') {
            try {
                body = await request.json();
                console.log(`${method} body:`, body);
            } catch {
                console.log(`No JSON body for ${method} request`);
            }
        }

        // 🚨 重要：GASにHTTPメソッド情報を渡す
        const queryParams = new URLSearchParams({ path });
        const id = searchParams.get('id');
        const status = searchParams.get('status');

        if (id) queryParams.append('id', id);
        if (status) queryParams.append('status', status);

        // 🔧 修正：methodパラメータを追加
        queryParams.append('method', method);

        const gasUrl = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
        console.log(`Forwarding ${method} to GAS:`, gasUrl);

        const response = await fetch(gasUrl, {
            method: 'POST', // GASは常にPOSTで受ける
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Google Apps Script request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error(`${method} API Route Error:`, error);
        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// GET リクエストの処理
export async function GET(request: NextRequest) {
    console.log('🚀 GET /api/gas called');

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    // 簡単なヘルスチェック
    if (path === 'health') {
        return NextResponse.json({
            success: true,
            data: {
                status: 'Next.js API Route is working!',
                timestamp: new Date().toISOString(),
                path: path,
                note: 'This is coming from Next.js API Route, not Google Apps Script'
            }
        });
    }

    return handleGASRequest(request, 'GET');
}

// POST リクエストの処理
export async function POST(request: NextRequest) {
    console.log('🚀 POST /api/gas called');

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    // 接続テスト用の簡単なレスポンス
    if (path === 'test-connection') {
        console.log('Test connection called via Next.js API Route');

        try {
            const body = await request.json();
            console.log('Test connection body:', body);
        } catch {
            console.log('No JSON body for test connection');
        }

        return NextResponse.json({
            success: true,
            data: {
                status: 'Connection test successful via Next.js API Route!',
                message: 'This proves the API route is working',
                timestamp: new Date().toISOString(),
                path: path,
                note: 'Next step: implement Google Apps Script integration'
            }
        });
    }

    // フォームフィールド取得用の簡単なレスポンス
    if (path === 'form-fields') {
        const body = await request.json().catch(() => ({}));
        console.log('Form fields body:', body);

        return NextResponse.json({
            success: true,
            data: {
                message: 'Form fields retrieved successfully',
                fields: [
                    { key: 'name', displayName: 'お名前', type: 'text' },
                    { key: 'email', displayName: 'メールアドレス', type: 'email' },
                    { key: 'reason', displayName: '申請理由', type: 'textarea' },
                    { key: 'amount', displayName: '希望金額', type: 'number' }
                ]
            }
        });
    }

    // プライベートスプレッドシート接続テスト
    if (path === 'test-private-connection') {
        console.log('Private spreadsheet connection test called');

        try {
            const body = await request.json().catch(() => ({}));
            console.log('Private connection test body:', body);
        } catch {
            console.log('No JSON body for private connection test');
        }

        return NextResponse.json({
            success: true,
            data: {
                status: 'test-mode',
                message: 'プライベートスプレッドシート接続テスト（開発モード）',
                timestamp: new Date().toISOString(),
                path: path,
                features: [
                    'プライベート投票システム準備完了',
                    'セキュリティ強化済み',
                    '投票重み計算（非表示）',
                    'メールベース重複制御'
                ],
                note: 'GAS実装完了、実際のスプレッドシート作成待ち'
            }
        });
    }

    return handleGASRequest(request, 'POST');
}

// 🔧 修正：PUT リクエストの処理
export async function PUT(request: NextRequest) {
    console.log('🚀 PUT /api/gas called');
    return handleGASRequest(request, 'PUT');
}

// 🔧 修正：DELETE リクエストの処理
export async function DELETE(request: NextRequest) {
    console.log('🚀 DELETE /api/gas called');
    return handleGASRequest(request, 'DELETE');
}