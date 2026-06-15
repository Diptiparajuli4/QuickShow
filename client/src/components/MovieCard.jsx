import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'
import { Star } from 'lucide-react'

const MovieCard = ({ movie }) => {

    const navigate = useNavigate()

    return (
        <div className='flex flex-col bg-gray-800 rounded-2xl overflow-hidden
        hover:-translate-y-1 transition duration-300 w-full shadow-lg'>

            <img
                src={
                    movie.poster_path
                        ? movie.poster_path.startsWith("http")
                            ? movie.poster_path
                            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/fallback.jpg"
                }
                alt={movie.title}
                className="w-full h-64 object-fill"
            />

            <div className='p-4 flex flex-col flex-grow'>
                <h3 className='text-lg font-semibold text-white truncate'>
                    {movie.title}
                </h3>

                <p className='text-sm text-gray-400 mt-2'>
                    {new Date(movie.release_date).getFullYear()}
                    {" • "}
                    {movie.genres?.slice(0, 2).map(
                        genre => genre.name
                    ).join(" | ")}
                    {" • "}
                    {timeFormat(movie.runtime)}
                </p>

                <div className='flex items-center justify-between mt-4'>
                    <button
                        onClick={() => {
                            navigate(`/movies/${movie._id}`)
                            window.scrollTo(0, 0)
                        }}
                        className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull
                        transition rounded-full font-medium cursor-pointer'
                    >
                        Buy Tickets
                    </button>

                    <p className='flex items-center gap-1 text-sm text-gray-300'>
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        {movie.vote_average?.toFixed(1)}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default MovieCard