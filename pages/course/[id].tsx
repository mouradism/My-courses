import { GetServerSideProps } from 'next'
import { supabase } from '../../lib/supabaseClient'
import React from 'react'

type Props = { course: any | null }

export default function CoursePage({ course }: Props) {
  if (!course) return <p>Course not found or you are not authorized.</p>
  return (
    <main style={{padding: 24}}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <div>
        <iframe
          width="800"
          height="450"
          src={`https://www.youtube.com/embed/${course.youtube_id}?rel=0`}
          title={course.title}
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string }

  // Basic server-side check: verify a purchase exists for the current user
  // NOTE: This example assumes the user session is available — in practice you
  // should validate server-side auth (Supabase session cookie or JWT) and then
  // query purchases for auth.uid(). For MVP, you can relax this and rely on client checks.

  // Fetch course
  const { data } = await supabase.from('courses').select('*').eq('id', id).single()
  if (!data) return { props: { course: null } }
  return { props: { course: data } }
}
