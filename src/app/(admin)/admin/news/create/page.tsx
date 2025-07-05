"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import NewsEditor from '../../_components/Editor2'
const DynamicEditor = dynamic(
  () => import('../../_components/Editor'),
  { ssr: false }
)
const Page =  () => {
  return (
    <div className='w-full min-h-screen bg-background'>
      <DynamicEditor/>
      {/* <NewsEditor /> */}
    </div>
  )
}

export default Page