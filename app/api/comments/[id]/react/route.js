import { db } from '@lib/firebaseAdmin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req, { params }) {
  try {
    const { commentId, type } = await req.json()
    const { id: animeSlug } = params
    const { searchParams } = new URL(req.url)
    const episodeId = searchParams.get('ep')
    const formattedId = animeSlug && episodeId ? `${animeSlug}?ep=${episodeId}` : animeSlug

    const cookieStore = cookies()
    const uid = cookieStore.get('uid')?.value

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['like', 'dislike'].includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    // Try thread-level comment first, then check replies
    let commentRef = db.collection('comments').doc(formattedId).collection('threads').doc(commentId)
    let commentSnap = await commentRef.get()

    // If not found at thread level, search in replies subcollections
    if (!commentSnap.exists) {
      const threadsSnap = await db.collection('comments').doc(formattedId).collection('threads').get()
      for (const threadDoc of threadsSnap.docs) {
        const replyRef = threadDoc.ref.collection('replies').doc(commentId)
        const replySnap = await replyRef.get()
        if (replySnap.exists) {
          commentRef = replyRef
          commentSnap = replySnap
          break
        }
      }
    }

    if (!commentSnap.exists) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const comment = commentSnap.data()

    const likes = new Set(comment.likes || [])
    const dislikes = new Set(comment.dislikes || [])

    likes.delete(uid)
    dislikes.delete(uid)

    if (type === 'like') likes.add(uid)
    else dislikes.add(uid)

    await commentRef.update({
      likes: Array.from(likes),
      dislikes: Array.from(dislikes),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[COMMENT_REACT_ERROR]', err)
    return NextResponse.json(
      { error: err.message || 'Failed to update reaction' },
      { status: 500 }
    )
  }
}
