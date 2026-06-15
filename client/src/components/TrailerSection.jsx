import React, { useState } from 'react'
import { dummyTrailers } from '../assets/assets'
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from 'lucide-react'
import ReactPlayer from "react-player";

const TrailerSection = () => {

    const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 pt-2 pb-12 overflow-hidden'>

            <h2 className='text-gray-300 font-medium text-lg text-center mb-4'>
                Trailers
            </h2>

            {/* Main Video Player */}
            <div className='relative max-w-[960px] mx-auto'>
                <BlurCircle top='-100px' right='-100px' />

                <div className='overflow-hidden rounded-xl shadow-lg'>
                   <ReactPlayer
                        url="https://www.youtube.com/watch?v=WpW36ldAqnM"
                        controls
                        width="100%"
                        height="440px"
                    />
                </div>
            </div>

            {/* Trailer List */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 max-w-[960px] mx-auto'>

                {dummyTrailers.map((trailer, index) => (

                    <div
                        key={index}
                        onClick={() => setCurrentTrailer(trailer)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden transition duration-300 hover:-translate-y-1
                        ${
                            currentTrailer.videoUrl === trailer.videoUrl
                                ? 'ring-2 ring-primary'
                                : ''
                        }`}
                    >
                        <img
                            src={trailer.image}
                            alt='Trailer'
                            className='w-full h-40 md:h-52 object-cover brightness-75'
                        />

                        <PlayCircleIcon
                            className='absolute top-1/2 left-1/2 w-10 h-10 md:w-12 md:h-12
                            transform -translate-x-1/2 -translate-y-1/2'
                        />
                    </div>

                ))}

            </div>

        </div>
    )
}

export default TrailerSection