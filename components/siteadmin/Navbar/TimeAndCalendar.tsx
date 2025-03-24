"use client";
import React, { useEffect, useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react';


export default function TimeAndCalendar() {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');



    // Update time every minute
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            );
            setCurrentDate(
                now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })
            );
        };

        updateDateTime(); // Set initial time and date
        const interval = setInterval(updateDateTime, 60000); // Update every minute
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div className="hidden lg:flex items-center justify-center gap-x-4 mx-2">
            <span className="flex items-center space-x-1 text-sm">
                <Clock className="w-5 h-5 " />
                <span className='text-sm'>{currentTime}</span>
            </span>
            <span className="flex items-center space-x-1 text-sm">
                <CalendarDays className="w-5 h-5" />
                <span className='text-sm'>{currentDate}</span>
            </span>
        </div>
    )
}
