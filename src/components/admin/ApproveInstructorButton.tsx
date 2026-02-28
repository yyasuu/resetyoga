'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'

interface Props {
  instructorId: string
  instructorName: string
  instructorEmail: string
}

export function ApproveInstructorButton({ instructorId, instructorName, instructorEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState(false)
  const router = useRouter()

  if (approved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-sm">
        <CheckCircle className="h-4 w-4" />
        Approved
      </span>
    )
  }

  const handleApprove = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/approve-instructor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructorId, instructorName, instructorEmail }),
    })

    if (!res.ok) {
      toast.error('Failed to approve instructor')
      setLoading(false)
    } else {
      setApproved(true)   // hide button immediately — prevents double-click
      toast.success(`${instructorName} approved! Approval email sent.`)
      router.refresh()    // reload server component to move card to Approved list
    }
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
