import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import { useRole } from '../../components/ui/RoleBasedRouter';
import AccessibilityNavWrapper from '../../components/ui/AccessibilityNavWrapper';
import NotificationBadgeSystem from '../../components/ui/NotificationBadgeSystem';
import Icon from '../../components/AppIcon';
import axiosClient from '../../api/axiosClient';

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
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosClient.get('/api/gamification/progress').catch(() => ({ data: null }));
        setProgressData(data);
      } catch (e) {
        setProgressData(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const apiStreak = progressData?.streak?.currentStreak ?? 0;
  const apiLongest = progressData?.streak?.longestStreak ?? 0;
  const streakFromCalendar = (() => {
    const cal = progressData?.streakCalendar ?? {};
    const dates = Object.keys(cal).filter(d => cal[d] === 'complete').sort();
    if (dates.length === 0) return { current: 0, longest: 0 };
    const oneDay = 86400000;
    let longest = 1;
    let run = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]).getTime();
      const curr = new Date(dates[i]).getTime();
      run = curr - prev <= oneDay + 1 ? run + 1 : 1;
      longest = Math.max(longest, run);
    }
    const mostRecent = dates[dates.length - 1];
    const today = new Date().toISOString().slice(0, 10);
    const current = (mostRecent >= today || new Date(mostRecent).toDateString() === new Date().toDateString())
      ? run
      : 0;
    return { current, longest };
  })();
  const currentStreak = Math.max(apiStreak, streakFromCalendar.current);
  const longestStreak = Math.max(apiLongest, streakFromCalendar.longest);
  const achievements = progressData?.recentAchievements ?? [];
  const streakData = progressData?.streakCalendar ?? {};

  const badges = progressData?.badges ?? [];
  const earnedBadges = badges.filter(b => b.isEarned).map(b => ({ id: b.id, progress: 100 }));
  const recentEarnings = progressData?.recentEarnings ?? [];
  const availableRewards = progressData?.availableRewards ?? [];
  const challenges = progressData?.challenges ?? [];
  const activeChallenges = [];
  const weeklyData = progressData?.weeklyChartData ?? [];
  const totalPoints = progressData?.points ?? 0;
  const earnedBadgesCount = progressData?.earnedBadgesCount ?? 0;
  const newAchievementsCount = progressData?.newAchievementsCount ?? 0;

  const streakChartData = (() => {
    const cal = progressData?.streakCalendar ?? {};
    const dates = Object.keys(cal).filter(d => cal[d] === 'complete').sort();
    if (dates.length === 0) return [];
    const result = [];
    let streak = 0;
    const oneDay = 24 * 60 * 60 * 1000;
    for (let i = 0; i < dates.length; i++) {
      const prev = i > 0 ? new Date(dates[i - 1]).getTime() : 0;
      const curr = new Date(dates[i]).getTime();
      if (i === 0 || curr - prev > oneDay + 1) streak = 1;
      else streak++;
      const d = new Date(dates[i]);
      result.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), streak });
    }
    return result.slice(-14);
  })();

  const categoryData = progressData?.categoryData ?? [];

  const userActivity = {
    streakDays: currentStreak,
    completionRate: weeklyData.length > 0
      ? weeklyData.reduce((s, d) => s + (d.completed || 0), 0) / Math.max(1, weeklyData.reduce((s, d) => s + (d.total || 1), 0))
      : 0,
    recentActivity: currentStreak >= 3 ? 'high' : totalPoints > 0 ? 'normal' : 'low',
    newBadge: newAchievementsCount > 0,
    weeklyUpdate: false
  };

  // Event handlers
  const handleAchievementClick = (achievement) => {
    console.log('Achievement clicked:', achievement.title);
  };

  const fetchProgress = async () => {
    try {
      const { data } = await axiosClient.get('/api/gamification/progress');
      setProgressData(data);
    } catch (e) {
      setProgressData(null);
    }
  };

  const handleRedeemReward = async (reward) => {
    const { data } = await axiosClient.post('/api/gamification/rewards/redeem', {
      rewardId: reward.id,
      rewardTitle: reward.title,
      cost: reward.cost
    });
    await fetchProgress();
    return data;
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

  const handleViewBadge = () => {
    const target = Array.from(document.querySelectorAll('.badge-collection-section')).find(el => el.offsetParent !== null);
    target?.scrollIntoView({ behavior: 'smooth' });
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
                recentAchievement={achievements[0] || null}
                preferences={{}}
                onDismissMessage={handleDismissMessage}
                onShareAchievement={handleShareAchievement}
                onViewBadge={handleViewBadge}
              />
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-6">
              {/* Points Overview */}
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon name="Star" size={32} className="text-primary" />
                  <span className="text-3xl font-bold text-primary">{totalPoints.toLocaleString()}</span>
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
                      achievement={{ ...achievement, difficulty: achievement.difficulty || 'medium' }}
                      isEarned={achievement.isEarned ?? !!achievement.earnedDate}
                      progress={100}
                      onClick={() => handleAchievementClick(achievement)}
                    />
                  ))}
                </div>
              </div>

              {/* Streak Calendar */}
              <StreakCalendar
                streakData={streakData}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
              />

              {/* Badge Showcase */}
              <div className="badge-collection-section">
                <BadgeShowcase
                  badges={badges}
                  earnedBadges={earnedBadges}
                />
              </div>

              {/* Points System */}
              <PointsSystem
                currentPoints={totalPoints}
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
                currentStreak={currentStreak}
                totalPoints={totalPoints}
              />
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="col-span-4 space-y-6">
                  {/* Points System */}
                  <PointsSystem
                    currentPoints={totalPoints}
                    recentEarnings={recentEarnings}
                    availableRewards={availableRewards}
                    onRedeemReward={handleRedeemReward}
                  />

                  {/* Streak Calendar */}
                  <StreakCalendar
                    streakData={streakData}
                    currentStreak={currentStreak}
                    longestStreak={longestStreak}
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
                          achievement={{ ...achievement, difficulty: achievement.difficulty || 'medium' }}
                          isEarned={achievement.isEarned ?? !!achievement.earnedDate}
                          progress={100}
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
                  <div className="badge-collection-section">
                    <BadgeShowcase
                      badges={badges}
                      earnedBadges={earnedBadges}
                    />
                  </div>

                  {/* Progress Charts */}
                  <ProgressCharts
                    weeklyData={weeklyData}
                    monthlyData={[]}
                    categoryData={categoryData}
                    streakData={streakChartData}
                    currentStreak={currentStreak}
                    totalPoints={totalPoints}
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