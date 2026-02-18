import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import { useRole } from '../../components/ui/RoleBasedRouter';
import AccessibilityNavWrapper from '../../components/ui/AccessibilityNavWrapper';
import NotificationBadgeSystem from '../../components/ui/NotificationBadgeSystem';
import Icon from '../../components/AppIcon';

// Import all components
import AchievementCard from './components/AchievementCard';
import StreakCalendar from './components/StreakCalendar';
import BadgeShowcase from './components/BadgeShowcase';
import PointsSystem from './components/PointsSystem';
import MotivationalMessages from './components/MotivationalMessages';
import ChallengeCards from './components/ChallengeCards';
import ProgressCharts from './components/ProgressCharts';

const GamificationHub = () => {
  const { userRole } = useRole();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
    setIsLoading(false);
  }, []);

  // Mock data for achievements
  const achievements = [
    {
      id: 'first_week',
      title: "First Week Champion",
      description: "Complete all daily routines for your first week",
      icon: 'Trophy',
      points: 100,
      difficulty: 'easy',
      earnedDate: "March 15, 2024",
      isNew: false
    },
    {
      id: 'streak_master',
      title: "Streak Master",
      description: "Maintain a 30-day completion streak",
      icon: 'Flame',
      points: 500,
      difficulty: 'hard',
      earnedDate: null,
      isNew: true
    },
    {
      id: 'early_bird',
      title: "Early Bird",
      description: "Complete morning routine before 8 AM for 7 days",
      icon: 'Sunrise',
      points: 200,
      difficulty: 'medium',
      earnedDate: "March 20, 2024",
      isNew: false
    },
    {
      id: 'consistency_king',
      title: "Consistency King",
      description: "Complete at least 80% of tasks for 14 days straight",
      icon: 'Target',
      points: 300,
      difficulty: 'medium',
      earnedDate: null,
      isNew: false
    }
  ];

  // Mock data for streak calendar
  const streakData = {
    '2024-03-01': 'complete',
    '2024-03-02': 'complete',
    '2024-03-03': 'partial',
    '2024-03-04': 'complete',
    '2024-03-05': 'missed',
    '2024-03-06': 'complete',
    '2024-03-07': 'complete',
    '2024-03-08': 'complete',
    '2024-03-09': 'complete',
    '2024-03-10': 'partial',
    '2024-03-11': 'complete',
    '2024-03-12': 'complete',
    '2024-03-13': 'complete',
    '2024-03-14': 'complete',
    '2024-03-15': 'complete'
  };

  // Mock data for badges
  const badges = [
    {
      id: 'morning_warrior',
      title: "Morning Warrior",
      description: "Complete morning routine 10 times",
      icon: 'Sun',
      category: 'streak',
      points: 150,
      requirements: [
        "Complete morning routine before 9 AM",
        "Do this for 10 different days",
        "Maintain consistency for at least 2 weeks"
      ],
      isNew: false
    },
    {
      id: 'task_crusher',
      title: "Task Crusher",
      description: "Complete 100 tasks total",
      icon: 'CheckCircle',
      category: 'completion',
      points: 250,
      requirements: [
        "Complete any type of task",
        "Reach 100 total completions",
        "Tasks must be from your personal routines"
      ],
      isNew: true
    },
    {
      id: 'social_butterfly',
      title: "Social Butterfly",
      description: "Share 5 achievements with caregivers",
      icon: 'Share2',
      category: 'special',
      points: 100,
      requirements: [
        "Share achievements through the app",
        "Must be shared with registered caregivers",
        "Include a personal message with each share"
      ],
      isNew: false
    },
    {
      id: 'milestone_master',
      title: "Milestone Master",
      description: "Reach 1000 total points",
      icon: 'Star',
      category: 'milestone',
      points: 500,
      requirements: [
        "Accumulate 1000 points from various activities",
        "Points from tasks, streaks, and bonuses count",
        "Must be earned within 90 days"
      ],
      isNew: false
    }
  ];

  const earnedBadges = [
    { id: 'morning_warrior', progress: 100 },
    { id: 'task_crusher', progress: 75 },
    { id: 'social_butterfly', progress: 60 }
  ];

  // Mock data for points system
  const recentEarnings = [
    {
      activity: "Morning Routine Completed",
      description: "Completed all morning tasks on time",
      points: 25,
      icon: 'CheckCircle',
      timestamp: "2 hours ago"
    },
    {
      activity: "7-Day Streak Bonus",
      description: "Maintained routine for a full week",
      points: 100,
      icon: 'Flame',
      timestamp: "1 day ago"
    },
    {
      activity: "Task Completion",
      description: "Finished evening meditation session",
      points: 15,
      icon: 'Brain',
      timestamp: "3 hours ago"
    },
    {
      activity: "Badge Earned",
      description: "Unlocked \'Early Bird\' achievement",
      points: 200,
      icon: 'Award',
      timestamp: "2 days ago"
    },
    {
      activity: "Challenge Participation",
      description: "Joined \'Mindful March\' challenge",
      points: 50,
      icon: 'Target',
      timestamp: "3 days ago"
    }
  ];

  const availableRewards = [
    {
      id: 'custom_theme',
      title: "Custom Theme",
      description: "Unlock a personalized color theme for your dashboard",
      icon: 'Palette',
      cost: 200,
      availability: 'permanent'
    },
    {
      id: 'extra_reminders',
      title: "Extra Reminders",
      description: "Get additional reminder notifications for important tasks",
      icon: 'Bell',
      cost: 150,
      availability: 'permanent'
    },
    {
      id: 'progress_report',
      title: "Detailed Progress Report",
      description: "Receive a comprehensive weekly progress analysis",
      icon: 'FileText',
      cost: 300,
      availability: 'limited'
    },
    {
      id: 'virtual_celebration',
      title: "Virtual Celebration",
      description: "Unlock special animations and sounds for achievements",
      icon: 'Sparkles',
      cost: 100,
      availability: 'permanent'
    }
  ];

  // Mock data for challenges
  const challenges = [
    {
      id: 'mindful_march',
      title: "Mindful March",
      description: "Complete meditation or mindfulness tasks every day this month",
      icon: 'Brain',
      difficulty: 'medium',
      duration: "30 days",
      reward: 500,
      participants: 127,
      requirements: [
        "Complete at least one mindfulness task daily",
        "Tasks must be at least 5 minutes long",
        "Track your mood before and after each session"
      ],
      isNew: false
    },
    {
      id: 'morning_momentum',
      title: "Morning Momentum",
      description: "Start your day strong with consistent morning routines",
      icon: 'Sunrise',
      difficulty: 'easy',
      duration: "14 days",
      reward: 200,
      participants: 89,
      requirements: [
        "Complete morning routine before 9 AM",
        "Include at least 3 different activities",
        "No more than 2 missed days allowed"
      ],
      isNew: true
    },
    {
      id: 'consistency_champion',
      title: "Consistency Champion",
      description: "Maintain 90% completion rate for all your routines",
      icon: 'Target',
      difficulty: 'hard',
      duration: "21 days",
      reward: 750,
      participants: 45,
      requirements: [
        "Achieve 90% or higher completion rate",
        "Apply to all active routines",
        "No breaks longer than 1 day allowed"
      ],
      isNew: false
    }
  ];

  const activeChallenges = [
    { id: 'mindful_march', progress: 65 },
    { id: 'morning_momentum', progress: 85 }
  ];

  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', completed: 8, total: 10 },
    { day: 'Tue', completed: 9, total: 10 },
    { day: 'Wed', completed: 7, total: 10 },
    { day: 'Thu', completed: 10, total: 10 },
    { day: 'Fri', completed: 8, total: 10 },
    { day: 'Sat', completed: 6, total: 8 },
    { day: 'Sun', completed: 5, total: 8 }
  ];

  const streakChartData = [
    { date: 'Mar 1', streak: 1 },
    { date: 'Mar 2', streak: 2 },
    { date: 'Mar 3', streak: 3 },
    { date: 'Mar 4', streak: 4 },
    { date: 'Mar 5', streak: 0 },
    { date: 'Mar 6', streak: 1 },
    { date: 'Mar 7', streak: 2 },
    { date: 'Mar 8', streak: 3 },
    { date: 'Mar 9', streak: 4 },
    { date: 'Mar 10', streak: 5 },
    { date: 'Mar 11', streak: 6 },
    { date: 'Mar 12', streak: 7 },
    { date: 'Mar 13', streak: 8 },
    { date: 'Mar 14', streak: 9 },
    { date: 'Mar 15', streak: 10 }
  ];

  const categoryData = [
    { name: 'Morning Routine', value: 35 },
    { name: 'Exercise', value: 25 },
    { name: 'Mindfulness', value: 20 },
    { name: 'Evening Routine', value: 15 },
    { name: 'Learning', value: 5 }
  ];

  // User activity for motivational messages
  const userActivity = {
    streakDays: 10,
    completionRate: 0.85,
    recentActivity: 'high',
    newBadge: false,
    weeklyUpdate: false
  };

  // Event handlers
  const handleAchievementClick = (achievement) => {
    console.log('Achievement clicked:', achievement.title);
  };

  const handleRedeemReward = (reward) => {
    console.log('Redeeming reward:', reward.title);
    // Mock reward redemption logic
  };

  const handleJoinChallenge = (challengeId) => {
    console.log('Joining challenge:', challengeId);
    // Mock challenge join logic
  };

  const handleLeaveChallenge = (challengeId) => {
    console.log('Leaving challenge:', challengeId);
    // Mock challenge leave logic
  };

  const handleDismissMessage = (messageId) => {
    console.log('Dismissing message:', messageId);
  };

  const handleShareAchievement = (message) => {
    console.log('Sharing achievement:', message.title);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <AccessibilityNavWrapper>
      <NotificationBadgeSystem>
        <div className="min-h-screen bg-background">
          <Helmet>
            <title>Gamification Hub - NestifyND</title>
            <meta name="description" content="Track your progress, earn achievements, and stay motivated with NestifyND's gamification features designed for neurodivergent users." />
            <meta name="keywords" content="gamification, achievements, progress tracking, neurodivergent, routine management" />
          </Helmet>

          <Header />
          <TabNavigation />

          <main id="main-content" className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Trophy" size={24} className="text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    Gamification Hub
                  </h1>
                  <p className="text-text-secondary">
                    Track your progress and celebrate your achievements
                  </p>
                </div>
              </div>
            </div>

            {/* Motivational Messages */}
            <div className="mb-6">
              <MotivationalMessages
                userActivity={userActivity}
                preferences={{}}
                onDismissMessage={handleDismissMessage}
                onShareAchievement={handleShareAchievement}
              />
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-6">
              {/* Points Overview */}
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon name="Star" size={32} className="text-primary" />
                  <span className="text-3xl font-bold text-primary">1,247</span>
                </div>
                <p className="text-text-secondary">Total Points Earned</p>
              </div>

              {/* Recent Achievements */}
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Recent Achievements
                </h2>
                <div className="space-y-3">
                  {achievements.slice(0, 3).map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isEarned={achievement.earnedDate !== null}
                      progress={achievement.earnedDate ? 100 : Math.random() * 80}
                      onClick={() => handleAchievementClick(achievement)}
                    />
                  ))}
                </div>
              </div>

              {/* Streak Calendar */}
              <StreakCalendar
                streakData={streakData}
                currentStreak={10}
                longestStreak={15}
              />

              {/* Badge Showcase */}
              <BadgeShowcase
                badges={badges}
                earnedBadges={earnedBadges}
              />

              {/* Points System */}
              <PointsSystem
                currentPoints={1247}
                recentEarnings={recentEarnings}
                availableRewards={availableRewards}
                onRedeemReward={handleRedeemReward}
              />

              {/* Challenge Cards */}
              <ChallengeCards
                challenges={challenges}
                activeChallenges={activeChallenges}
                onJoinChallenge={handleJoinChallenge}
                onLeaveChallenge={handleLeaveChallenge}
              />

              {/* Progress Charts */}
              <ProgressCharts
                weeklyData={weeklyData}
                monthlyData={[]}
                categoryData={categoryData}
                streakData={streakChartData}
              />
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="col-span-4 space-y-6">
                  {/* Points System */}
                  <PointsSystem
                    currentPoints={1247}
                    recentEarnings={recentEarnings}
                    availableRewards={availableRewards}
                    onRedeemReward={handleRedeemReward}
                  />

                  {/* Streak Calendar */}
                  <StreakCalendar
                    streakData={streakData}
                    currentStreak={10}
                    longestStreak={15}
                  />
                </div>

                {/* Center Column */}
                <div className="col-span-5 space-y-6">
                  {/* Achievements Grid */}
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary mb-4">
                      Recent Achievements
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {achievements.map(achievement => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          isEarned={achievement.earnedDate !== null}
                          progress={achievement.earnedDate ? 100 : Math.random() * 80}
                          onClick={() => handleAchievementClick(achievement)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Challenge Cards */}
                  <ChallengeCards
                    challenges={challenges}
                    activeChallenges={activeChallenges}
                    onJoinChallenge={handleJoinChallenge}
                    onLeaveChallenge={handleLeaveChallenge}
                  />
                </div>

                {/* Right Column */}
                <div className="col-span-3 space-y-6">
                  {/* Badge Showcase */}
                  <BadgeShowcase
                    badges={badges}
                    earnedBadges={earnedBadges}
                  />

                  {/* Progress Charts */}
                  <ProgressCharts
                    weeklyData={weeklyData}
                    monthlyData={[]}
                    categoryData={categoryData}
                    streakData={streakChartData}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </NotificationBadgeSystem>
    </AccessibilityNavWrapper>
  );
};

export default GamificationHub;