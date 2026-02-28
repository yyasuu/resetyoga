'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  instructorId: string
  instructorName: string
  instructorEmail: string
}

export function ApproveInstructorButton({ instructorId, instructorName, instructorEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/approve-instructor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructorId, instructorName, instructorEmail }),
    })

    if (!res.ok) {
      toast.error('Failed to approve instructor')
    } else {
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
