// app/questPage/leaderboard/page.tsx
'use client'

import { useState } from 'react'

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  quests_completed: number;
}

export default function LeaderboardPage() {
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, username: "QuestMaster", points: 2500, quests_completed: 25 },
    { rank: 2, username: "SocialPro", points: 2200, quests_completed: 22 },
    { rank: 3, username: "QuestHunter", points: 2000, quests_completed: 20 },
    // Add more entries as needed
  ])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quests Completed
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <tr key={entry.rank} className={entry.rank <= 3 ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full ${
                    entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'text-gray-900'
                  }`}>
                    #{entry.rank}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.points.toLocaleString()} pts
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.quests_completed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}