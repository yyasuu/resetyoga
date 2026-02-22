'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Props {
  instructorId: string
  instructorName: string
  instructorEmail: string
}

export function ApproveInstructorButton({ instructorId, instructorName, instructorEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('instructor_profiles')
      .update({ is_approved: true })
      .eq('id', instructorId)

    if (error) {
      toast.error('Failed to approve instructor')
    } else {
      // Send approval email
      await fetch('/api/admin/approve-instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorId, instructorName, instructorEmail }),
      })
      toast.success(`${instructorName} approved!`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
      onClick={handleApprove}
      disabled={loading}
    >
      {loading ? 'Approving...' : 'Approve'}
    </Button>
  )
}
