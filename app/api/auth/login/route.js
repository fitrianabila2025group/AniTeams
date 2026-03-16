import { NextResponse } from 'next/server'
import { auth } from '../../../lib/firebaseAdmin'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Verify credentials using Firebase REST API
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      const errorMsg =
        data.error?.message === 'INVALID_LOGIN_CREDENTIALS'
          ? 'Invalid email or password'
          : data.error?.message || 'Login failed'
      return NextResponse.json({ message: errorMsg }, { status: 401 })
    }

    return NextResponse.json({ success: true, uid: data.localId }, { status: 200 })
  } catch (err) {
    console.error('[LOGIN_ERROR]', err)
    return NextResponse.json({ message: err.message || 'Login failed' }, { status: 400 })
  }
}
