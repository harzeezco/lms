import ParticlesBackground from '@/components/particles-background';
import React from 'react';

export default function Home() {
  return (
    <div className='bg relative grid place-items-center text-white overflow-hidden h-screen'>
      <ParticlesBackground />
      {/* <div className='mx-auto max-w-3xl text-center'>
        <button type='button'>✦ COHORT II</button>

        <h1 className='my-3 font-mont text-6xl font-normal'>
          Become an Industry-Ready{' '}
          <span className='text-yellow-700'>DevOps</span> Expert
        </h1>

        <p className='mx-auto max-w-xl text-lg'>
          Dive into the dynamic world of cybersecurity with TSR Learning.
          Whether you&apos;re starting out or scaling up, our course is crafted
          to turn you into a skilled professional, ready to tackle today&apos;s
          cyber challenges.
        </p>

        <div className='mt-10'>
          <button className='bg-yellow-700 px-10 py-2' type='button'>
            Join Cohort II
          </button>
        </div>
      </div> */}
    </div>
  );
}
