import { Chapter, Exercise, Subject, PlannerPaceConfig, DailyActivityLog } from '../types/planner';

// Helper for formatting "Not entered" or number
export function formatCount(count: number | null | undefined): string {
  if (count === null || count === undefined) {
    return 'Not entered';
  }
  return count.toLocaleString();
}

// Calculate exercise completion percentage
export function getExerciseCompletionPercent(exercise: Exercise): number | null {
  if (exercise.totalQuestions === null || exercise.totalQuestions <= 0) return null;
  return Math.min(100, Math.round((exercise.completedQuestions / exercise.totalQuestions) * 100));
}

// Calculate chapter total textbook questions across exercises
export function getChapterTextbookQuestionsTotal(chapter: Chapter): number | null {
  let hasAnyEntered = false;
  let total = 0;

  // Check exercises first
  for (const ex of chapter.exercises) {
    if (ex.totalQuestions !== null) {
      hasAnyEntered = true;
      total += ex.totalQuestions;
    }
  }

  // If no exercise questions entered, check textbook question source
  if (!hasAnyEntered && chapter.questionSources.textbook.total !== null) {
    return chapter.questionSources.textbook.total;
  }

  return hasAnyEntered ? total : (chapter.questionSources.textbook.total ?? null);
}

// Calculate chapter completed textbook questions
export function getChapterTextbookQuestionsCompleted(chapter: Chapter): number {
  let hasAnyEntered = false;
  let completed = 0;

  for (const ex of chapter.exercises) {
    if (ex.totalQuestions !== null || ex.completedQuestions > 0) {
      hasAnyEntered = true;
      completed += ex.completedQuestions;
    }
  }

  if (!hasAnyEntered) {
    return chapter.questionSources.textbook.completed;
  }

  return completed;
}

// Calculate chapter question completion percentage
export function getChapterCompletionPercent(chapter: Chapter): number | null {
  const total = getChapterTextbookQuestionsTotal(chapter);
  const completed = getChapterTextbookQuestionsCompleted(chapter);
  if (total === null || total <= 0) return null;
  return Math.min(100, Math.round((completed / total) * 100));
}

// Calculate chapter total questions across ALL 7 sources
export function getChapterAllSourcesTotal(chapter: Chapter): number | null {
  let hasAny = false;
  let sum = 0;
  
  // Textbook questions
  const tbTotal = getChapterTextbookQuestionsTotal(chapter);
  if (tbTotal !== null) {
    hasAny = true;
    sum += tbTotal;
  }

  // Other sources
  const sources = [
    chapter.questionSources.examples.total,
    chapter.questionSources.tuition.total,
    chapter.questionSources.guide.total,
    chapter.questionSources.pyqs.total,
    chapter.questionSources.samplePapers.total,
    chapter.questionSources.mockTests.total,
  ];

  for (const s of sources) {
    if (s !== null) {
      hasAny = true;
      sum += s;
    }
  }

  return hasAny ? sum : null;
}

// Calculate chapter completed questions across ALL 7 sources
export function getChapterAllSourcesCompleted(chapter: Chapter): number {
  let sum = getChapterTextbookQuestionsCompleted(chapter);
  sum += chapter.questionSources.examples.completed;
  sum += chapter.questionSources.tuition.completed;
  sum += chapter.questionSources.guide.completed;
  sum += chapter.questionSources.pyqs.completed;
  sum += chapter.questionSources.samplePapers.completed;
  sum += chapter.questionSources.mockTests.completed;
  return sum;
}

// Unit level calculations
export function getUnitTextbookStats(chapters: Chapter[]) {
  let total: number | null = null;
  let completed = 0;

  for (const ch of chapters) {
    const chTotal = getChapterTextbookQuestionsTotal(ch);
    if (chTotal !== null) {
      total = (total ?? 0) + chTotal;
    }
    completed += getChapterTextbookQuestionsCompleted(ch);
  }

  const percent = total && total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : null;
  return { total, completed, remaining: total !== null ? Math.max(0, total - completed) : null, percent };
}

// Subject level calculations
export function getSubjectStats(subject: Subject) {
  const allChapters = subject.units.flatMap(u => u.chapters);
  let totalQuestions: number | null = null;
  let completedQuestions = 0;
  let totalWorkedExamples: number | null = null;
  let completedWorkedExamples = 0;
  let totalExercises = 0;
  let completedExercises = 0;
  let difficultQuestionsCount = 0;
  let reworkQuestionsCount = 0;
  let pyqsCompleted = 0;

  for (const ch of allChapters) {
    const chTotal = getChapterTextbookQuestionsTotal(ch);
    if (chTotal !== null) {
      totalQuestions = (totalQuestions ?? 0) + chTotal;
    }
    completedQuestions += getChapterTextbookQuestionsCompleted(ch);

    if (ch.workedExamplesCount !== null) {
      totalWorkedExamples = (totalWorkedExamples ?? 0) + ch.workedExamplesCount;
    }
    completedWorkedExamples += ch.workedExamplesCompleted;

    for (const ex of ch.exercises) {
      totalExercises++;
      if (ex.totalQuestions !== null && ex.completedQuestions >= ex.totalQuestions && ex.totalQuestions > 0) {
        completedExercises++;
      }
      difficultQuestionsCount += ex.difficultQuestions;
      reworkQuestionsCount += ex.reworkQuestions;
    }

    if (ch.physicsDetails) {
      difficultQuestionsCount += ch.physicsDetails.difficultCount;
      reworkQuestionsCount += ch.physicsDetails.revisionRequiredCount;
      pyqsCompleted += ch.physicsDetails.pyqsCompleted;
    }

    if (ch.chemistryDetails) {
      difficultQuestionsCount += ch.chemistryDetails.difficultCount;
      reworkQuestionsCount += ch.chemistryDetails.revisionRequiredCount;
    }

    if (ch.biologyDetails) {
      difficultQuestionsCount += ch.biologyDetails.difficultCount;
      reworkQuestionsCount += ch.biologyDetails.revisionRequiredCount;
      pyqsCompleted += ch.biologyDetails.pyqsCompleted;
    }

    pyqsCompleted += ch.questionSources.pyqs.completed;
  }

  const remainingQuestions = totalQuestions !== null ? Math.max(0, totalQuestions - completedQuestions) : null;
  const questionPercent = totalQuestions && totalQuestions > 0 
    ? Math.min(100, Math.round((completedQuestions / totalQuestions) * 100)) 
    : null;

  return {
    totalChapters: allChapters.length,
    coveredChapters: allChapters.filter(c => c.syllabusCovered).length,
    totalQuestions,
    completedQuestions,
    remainingQuestions,
    questionPercent,
    totalWorkedExamples,
    completedWorkedExamples,
    remainingExamples: totalWorkedExamples !== null ? Math.max(0, totalWorkedExamples - completedWorkedExamples) : null,
    totalExercises,
    completedExercises,
    remainingExercises: totalExercises - completedExercises,
    difficultQuestionsCount,
    reworkQuestionsCount,
    pyqsCompleted,
  };
}

// 4 Core Pillars Calculation
export function getCorePillars(subjects: Subject[], paceConfig: PlannerPaceConfig) {
  const allChapters = subjects.flatMap(s => s.units.flatMap(u => u.chapters));
  
  // 1. Syllabus Completion: % of chapters marked syllabus covered
  const syllabusPercent = allChapters.length > 0 
    ? Math.round((allChapters.filter(c => c.syllabusCovered).length / allChapters.length) * 100)
    : 0;

  // 2. Textbook Completion: Completed exercises / Total exercises
  let totalExercises = 0;
  let completedExercises = 0;
  for (const ch of allChapters) {
    for (const ex of ch.exercises) {
      totalExercises++;
      if (ex.totalQuestions !== null && ex.completedQuestions >= ex.totalQuestions && ex.totalQuestions > 0) {
        completedExercises++;
      }
    }
  }
  const textbookPercent = totalExercises > 0
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;

  // 3. Question Practice: Across all questions entered
  let practiceTotal = 0;
  let practiceCompleted = 0;
  for (const ch of allChapters) {
    const tot = getChapterAllSourcesTotal(ch);
    if (tot !== null) practiceTotal += tot;
    practiceCompleted += getChapterAllSourcesCompleted(ch);
  }
  const questionPracticePercent = practiceTotal > 0
    ? Math.min(100, Math.round((practiceCompleted / practiceTotal) * 100))
    : 0;

  // 4. Revision Completion: Chapters with revisionCount >= 1
  const revisedChapters = allChapters.filter(c => c.revisionCount >= 1).length;
  const revisionPercent = allChapters.length > 0
    ? Math.round((revisedChapters / allChapters.length) * 100)
    : 0;

  // Optional Weighted Progress (only if user explicitly enabled it)
  const weightedOverallProgress = paceConfig.enableWeightedOverallProgress
    ? Math.round((syllabusPercent * 0.25) + (textbookPercent * 0.30) + (questionPracticePercent * 0.35) + (revisionPercent * 0.10))
    : null;

  return {
    syllabusPercent,
    textbookPercent,
    questionPracticePercent,
    revisionPercent,
    weightedOverallProgress,
    totalChapters: allChapters.length,
    coveredChapters: allChapters.filter(c => c.syllabusCovered).length,
    revisedChapters,
    totalExercises,
    completedExercises,
    practiceTotal,
    practiceCompleted,
    remainingPractice: Math.max(0, practiceTotal - practiceCompleted)
  };
}

// Target calculation for Study Pace Planner (Rule 10)
export function calculateStudyPace(
  totalRemainingQuestions: number,
  totalRemainingExercises: number,
  totalRemainingChapters: number,
  totalRemainingExamples: number,
  targetDateStr: string,
  config: PlannerPaceConfig
) {
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const diffWeeks = Math.max(1, Math.ceil(diffDays / 7));

  const autoDailyQuestions = Math.ceil(totalRemainingQuestions / diffDays);
  const autoWeeklyExercises = Math.ceil(totalRemainingExercises / diffWeeks);
  const autoWeeklyChapters = Math.ceil(totalRemainingChapters / diffWeeks);
  const autoDailyExamples = Math.ceil(totalRemainingExamples / diffDays);
  const autoWeeklyPYQs = Math.ceil((totalRemainingQuestions * 0.15) / diffWeeks);

  return {
    diffDays,
    diffWeeks,
    dailyQuestions: config.manualDailyQuestionTarget ?? autoDailyQuestions,
    isManualDailyQuestions: config.manualDailyQuestionTarget !== null,
    weeklyExercises: config.manualWeeklyExerciseTarget ?? autoWeeklyExercises,
    isManualWeeklyExercises: config.manualWeeklyExerciseTarget !== null,
    weeklyChapters: config.manualWeeklyChapterTarget ?? autoWeeklyChapters,
    isManualWeeklyChapters: config.manualWeeklyChapterTarget !== null,
    dailyExamples: config.manualDailyExampleTarget ?? autoDailyExamples,
    isManualDailyExamples: config.manualDailyExampleTarget !== null,
    weeklyPYQs: config.manualWeeklyPYQTarget ?? autoWeeklyPYQs,
    isManualWeeklyPYQs: config.manualWeeklyPYQTarget !== null,
  };
}

// Activity logs calculation (Today & This Week)
export function getRecentActivity(activityLogs: DailyActivityLog[]) {
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let todaySolved = 0;
  let thisWeekSolved = 0;

  for (const log of activityLogs) {
    if (log.date === todayStr) {
      todaySolved += log.questionsSolved;
    }
    if (log.date >= oneWeekAgo && log.date <= todayStr) {
      thisWeekSolved += log.questionsSolved;
    }
  }

  return { todaySolved, thisWeekSolved };
}

// Strategic Alerts (Rule 9)
export function getStrategicAlerts(subjects: Subject[]) {
  const allChapters = subjects.flatMap(s => s.units.flatMap(u => u.chapters));

  let chapterMostRemaining: { chapter: Chapter; remaining: number } | null = null;
  let chapterLowestPractice: { chapter: Chapter; percent: number } | null = null;
  let totalPendingExercises = 0;
  let totalPendingExamples = 0;

  for (const ch of allChapters) {
    const total = getChapterTextbookQuestionsTotal(ch);
    const completed = getChapterTextbookQuestionsCompleted(ch);
    if (total !== null) {
      const remaining = Math.max(0, total - completed);
      if (!chapterMostRemaining || remaining > chapterMostRemaining.remaining) {
        chapterMostRemaining = { chapter: ch, remaining };
      }

      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      if (!chapterLowestPractice || percent < chapterLowestPractice.percent) {
        chapterLowestPractice = { chapter: ch, percent };
      }
    }

    if (ch.workedExamplesCount !== null) {
      totalPendingExamples += Math.max(0, ch.workedExamplesCount - ch.workedExamplesCompleted);
    }

    for (const ex of ch.exercises) {
      if (ex.totalQuestions !== null && ex.completedQuestions < ex.totalQuestions) {
        totalPendingExercises++;
      }
    }
  }

  return {
    chapterMostRemaining,
    chapterLowestPractice,
    totalPendingExercises,
    totalPendingExamples
  };
}
