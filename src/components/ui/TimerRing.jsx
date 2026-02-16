import { useEffect, useState } from 'react'

export default function TimerRing({ seconds, maxSeconds = 30, size = 48, strokeWidth = 3, urgent = false }) {
    const [progress, setProgress] = useState(seconds / maxSeconds)

    useEffect(() => {
        setProgress(Math.max(0, seconds / maxSeconds))
    }, [seconds, maxSeconds])

    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - progress)

    const color = urgent || seconds <= 5
        ? '#ef4444'
        : seconds <= 10
            ? '#f59e0b'
            : '#10b981'

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
            />
        </svg>
    )
}
