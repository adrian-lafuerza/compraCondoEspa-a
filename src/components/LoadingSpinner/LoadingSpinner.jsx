import React from 'react'

const LoadingSpinner = ({ size = 'medium', color = 'blue' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
        xlarge: 'w-16 h-16'
    }

    const colorClasses = {
        blue: 'border-blue-500',
        gray: 'border-gray-500',
        white: 'border-white',
        black: 'border-black'
    }

    return (
        <div className="flex items-center justify-center">
            <div 
                className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    )
}

export default LoadingSpinner