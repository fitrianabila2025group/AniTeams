'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Cookies from 'js-cookie'
import Link from 'next/link'

export default function CommentSection({ id }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [user, setUser] = useState(null)

  const fetchUser = async () => {
    const uid = Cookies.get('uid')
    if (!uid) return

    try {
      const res = await fetch('/api/user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.user)
      }
    } catch (err) {
      // User fetch failed silently
    }
  }

  const fetchComments = async () => {
    const res = await fetch(`/api/comments/${id}`)
    const data = await res.json()
    if (data.success) {
      setComments(data.comments)
    }
  }

  const postComment = async (event) => {
    if (!text.trim()) return
    setLoading(true)
    await fetch(`/api/comments/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    setText('')
    await fetchComments()
    setLoading(false)
  }

  const postReply = async (parentId) => {
    if (!replyText.trim()) return
    await fetch(`/api/comments/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: replyText, parentId }),
    })
    setReplyText('')
    setReplyingTo(null)
    await fetchComments()
  }

  const handleReact = async (cid, type) => {
    await fetch(`/api/comments/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId: cid, type }),
    })
    await fetchComments()
  }

  useEffect(() => {
    fetchUser()
    fetchComments()
  }, [])

  return (
    <div className="space-y-6 mt-8 text-white">
      <h3 className="text-lg font-semibold">Comments</h3>

      {/* Comment input or login prompt */}
      {user ? (
        <div className="relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') postComment(event)
            }}
            placeholder="Add a comment..."
            className="w-full bg-transparent border-0 border-b-2 border-purple-500 focus:outline-none focus:ring-0 text-white placeholder-gray-400 py-2"
          />
          <button
            onClick={postComment}
            disabled={!text.trim() || loading}
            className="absolute right-0 top-0 text-sm text-purple-400 hover:text-purple-300 disabled:opacity-40"
          >
            Post
          </button>
        </div>
      ) : (
        <div className="border border-zinc-700 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            You must be{' '}
            <Link href="/login" className="text-purple-400 hover:underline">logged in</Link>
            {' '}to post a comment.
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        {comments.map((c) => {
          return (
            <div key={c.id} className="flex gap-3 items-start">
              <img
                src={c.profilePic || 'https://pic.re/image'}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full object-cover"
                onError={(e) => {
                  console.warn('Comment profile image error for', c.username)
                  e.target.src = 'https://pic.re/image'
                }}
              />

              <div className="flex-1">
                <div className="text-sm font-semibold">{c.username}</div>
                <div className="text-sm text-gray-300 mb-1">{c.text}</div>

                <div className="flex gap-4 text-xs text-gray-400">
                  <motion.button
                    whileTap={{ scale: 1.2 }}
                    onClick={() => handleReact(c.id, 'like')}
                    className="hover:text-purple-400"
                  >
                    👍 ({c.likes?.length || 0})
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 1.2 }}
                    onClick={() => handleReact(c.id, 'dislike')}
                    className="hover:text-purple-400"
                  >
                    👎 ({c.dislikes?.length || 0})
                  </motion.button>
                  {user && (
                    <button
                      onClick={() =>
                        setReplyingTo((prev) => (prev === c.id ? null : c.id))
                      }
                      className="hover:text-purple-400"
                    >
                      Reply
                    </button>
                  )}
                </div>

                {/* Reply input */}
                {replyingTo === c.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full bg-transparent border-0 border-b border-purple-400 focus:outline-none text-sm py-1"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-gray-400 text-xs hover:text-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => postReply(c.id)}
                        className="text-purple-400 text-xs hover:text-purple-300"
                      >
                        Reply
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Replies */}
                <div className="mt-4 space-y-4 ml-10">
                  {c.replies?.map((r) => {
                    return (
                      <div key={r.id} className="flex gap-3 items-start">
                        <img
                          src={r.profilePic || 'https://pic.re/image'}
                          alt="Reply Profile"
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            console.warn('Reply profile image error for', r.username)
                            e.target.src = 'https://pic.re/image'
                          }}
                        />

                        <div className="flex-1">
                          <div className="text-sm font-semibold">{r.username}</div>
                          <div className="text-sm text-gray-300 mb-1">{r.text}</div>

                          <div className="flex gap-4 text-xs text-gray-400">
                            <motion.button
                              whileTap={{ scale: 1.2 }}
                              onClick={() => handleReact(r.id, 'like')}
                              className="hover:text-purple-400"
                            >
                              👍 ({r.likes?.length || 0})
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 1.2 }}
                              onClick={() => handleReact(r.id, 'dislike')}
                              className="hover:text-purple-400"
                            >
                              👎 ({r.dislikes?.length || 0})
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
