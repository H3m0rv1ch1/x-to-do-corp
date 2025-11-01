
import React from 'react';
import { HiFire, HiCheckCircle } from 'react-icons/hi';

interface ProductivityStatsProps {
  totalCompleted: number;
  longestStreak: number;
  currentStreak: number;
}

const StatCard: React.FC<{ icon: React.ReactNode, value: number, label: string, colorClass: string }> = ({ icon, value, label, colorClass }) => (
    <div className="flex-1 p-4 bg-gray-900/50 rounded-xl flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </div>
);

const ProductivityStats: React.FC<ProductivityStatsProps> = ({ totalCompleted, longestStreak, currentStreak }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <StatCard 
                icon={<HiCheckCircle className="w-6 h-6 text-white"/>}
                value={totalCompleted}
                label="Tasks completed"
                colorClass="bg-sky-500/80"
            />
            <StatCard 
                icon={<HiFire className="w-6 h-6 text-white"/>}
                value={currentStreak}
                label="Current streak"
                colorClass="bg-orange-500/80"
            />
            <StatCard 
                icon={<HiFire className="w-6 h-6 text-white"/>}
                value={longestStreak}
                label="Longest streak"
                colorClass="bg-red-500/80"
            />
        </div>
    );
};

export default ProductivityStats;