/** Mirrors the JSON shapes returned by esthetics-backend. */

/** The panel has one role — everyone who can sign in has full access. */
export type AdminRole = "ADMINISTRATOR";
export type AdminStatus = "INVITED" | "ACTIVE" | "DISABLED";
export type QuestionStatus = "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";
export type FeaturedStatus = "DRAFT" | "READY" | "LIVE";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt?: string | null;
};

export type Theme = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
};

export type QuestionRow = {
  id: string;
  quizDate: string;
  slot: number;
  isBonus: boolean;
  theme: { id: string; key: string; label: string };
  prompt: string;
  status: QuestionStatus;
  hasDeepDive: boolean;
  updatedAt: string;
};

export type QuestionDetail = QuestionRow & {
  themeId: string;
  options: string[];
  correctIndex: number;
  displayTag: string;
  whyThisMatters: string;
  chairLabel: string;
  chairText: string;
  deepDiveText: string;
  sourceLabel: string;
  sourceUrl: string;
  goDeeperUrl: string;
  internalNotes: string;
};

export type Featured = {
  id: string;
  quizDate: string;
  title: string;
  bodyText: string;
  buttonLabel: string;
  linkUrl: string;
  imageUrl: string;
  shownAfter: string;
  status: FeaturedStatus;
};

export type Dashboard = {
  date: string;
  timezone: string;
  stats: {
    playedToday: number;
    totalMembers: number;
    acedToday: number;
    answersToday: number;
    longestStreak: number;
    longestStreakMember: string | null;
  };
  todaysQuestions: Array<{
    id: string;
    slot: number;
    isBonus: boolean;
    theme: { key: string; label: string };
    prompt: string;
    answered: number;
    correctPct: number;
    status: QuestionStatus;
  }>;
  needsAttention: Array<{
    date: string;
    severity: "empty" | "incomplete";
    filled: number;
    required: number;
    missingSlots: number[];
    hasDraft: boolean;
  }>;
  scheduledAhead: Array<{
    date: string;
    questionCount: number;
    hasBonus: boolean;
    isComplete: boolean;
  }>;
};

export type ScheduleWeek = {
  weekStart: string;
  weekEnd: string;
  timezone: string;
  questionsPerDay: number;
  week: Array<{
    date: string;
    slots: Array<{
      slot: number;
      state: "filled" | "empty";
      questionId: string | null;
      themeLabel: string | null;
      status: QuestionStatus | null;
    }>;
    bonus: {
      questionId: string;
      themeLabel: string;
      status: QuestionStatus;
    } | null;
    filledCount: number;
    isComplete: boolean;
  }>;
  featured: Featured[];
};

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  currentStreak: number;
  longestStreak: number;
  daysPlayed: number;
  accuracy: number;
  lastPlayedDate: string | null;
};

export type MemberDetail = {
  member: MemberRow & {
    circleUid: string;
    longestStreakEnd: string | null;
    firstPlayedDate: string | null;
  };
  communityAccuracy: number;
  recentAnswers: Array<{
    id: string;
    quizDate: string;
    slot: number;
    isBonus: boolean;
    themeLabel: string;
    prompt: string;
    correct: boolean;
    streakAtPlay: number;
  }>;
  byTheme: Array<{
    key: string;
    label: string;
    answered: number;
    correct: number;
    pct: number;
  }>;
};

export type Statistics = {
  date: string;
  stats: {
    membersPlayed: number;
    acedIt: number;
    answersRecorded: number;
    completionPct: number;
  };
  questions: Array<{
    id: string;
    slot: number;
    isBonus: boolean;
    themeLabel: string;
    prompt: string;
    answered: number;
    correctPct: number;
  }>;
  communityAverage: Array<{
    key: string;
    label: string;
    answered: number;
    pct: number;
  }>;
};

export type Settings = {
  id: string;
  timezone: string;
  questionsPerDay: number;
  bonusEnabled: boolean;
  joinUrl: string;
  defaultGoDeeperUrl: string;
  referralUrl: string;
  quizEmbedUrl: string;
};
