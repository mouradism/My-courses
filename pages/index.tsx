import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Course = { id: string; title: string; description?: string; price_cents: number }

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('courses').select('*')
      setCourses((data as Course[]) || [])
    }
    load()
  }, [])

  return (
    <main style={{padding: 24}}>
      <h1>My Courses (MVP)</h1>
      <p>
        <Link href="/auth/signup">Sign up</Link> • <Link href="/auth/login">Login</Link>
      </p>
      <section>
        {courses.length === 0 ? (
          <p>No courses yet — add some via Supabase SQL or admin UI.</p>
        ) : (
          <ul>
            {courses.map(c => (
              <li key={c.id}>
                <Link href={`/course/${c.id}`}>{c.title}</Link> — {(c.price_cents/100).toFixed(2)} USD
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
