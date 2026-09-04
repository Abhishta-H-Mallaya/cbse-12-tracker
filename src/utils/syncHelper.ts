import { 
  UserProfile, 
  Subject, 
  PlannerPaceConfig, 
  DailyActivityLog, 
  ExamTarget,
  QuestionStatus,
  DifficultyLevel
} from '../types/planner';

export interface CompactSyncDelta {
  v: number; // version
  p: UserProfile;
  c: PlannerPaceConfig;
  l: DailyActivityLog[];
  e: ExamTarget[];
  // Delta map of chapters
  ch: Record<string, { cov?: boolean; rev?: number }>;
  // Delta map of exercises: exerciseId -> { comp: number, diff?: number, rew?: number, qs?: Record<string, { s: QuestionStatus; d: DifficultyLevel; r: boolean }> }
  ex: Record<string, {
    comp: number;
    diff?: number;
    rew?: number;
    qs?: Record<string, { s: QuestionStatus; d: DifficultyLevel; r: boolean }>;
  }>;
}

// Generate a lightweight delta payload (under 2KB) that fits easily in a camera-scannable QR code
export function createSyncPayload(
  profile: UserProfile,
  subjects: Subject[],
  paceConfig: PlannerPaceConfig,
  activityLogs: DailyActivityLog[],
  exams: ExamTarget[]
): string {
  const chDelta: CompactSyncDelta['ch'] = {};
  const exDelta: CompactSyncDelta['ex'] = {};

  subjects.forEach(sub => {
    sub.units.forEach(unit => {
      unit.chapters.forEach(ch => {
        if (ch.syllabusCovered || (ch.revisionCount && ch.revisionCount > 0)) {
          chDelta[ch.id] = {
            ...(ch.syllabusCovered ? { cov: true } : {}),
            ...(ch.revisionCount > 0 ? { rev: ch.revisionCount } : {}),
          };
        }

        ch.exercises.forEach(ex => {
          const hasModifiedQuestions = ex.questions && ex.questions.some(q => 
            q.status !== 'Not Started' || q.difficulty !== 'Medium' || q.needsRevision
          );

          if (ex.completedQuestions > 0 || hasModifiedQuestions) {
            const qMap: Record<string, { s: QuestionStatus; d: DifficultyLevel; r: boolean }> = {};
            if (ex.questions) {
              ex.questions.forEach(q => {
                if (q.status !== 'Not Started' || q.difficulty !== 'Medium' || q.needsRevision) {
                  qMap[q.id] = { s: q.status, d: q.difficulty, r: q.needsRevision };
                }
              });
            }

            exDelta[ex.id] = {
              comp: ex.completedQuestions,
              ...(ex.difficultQuestions > 0 ? { diff: ex.difficultQuestions } : {}),
              ...(ex.reworkQuestions > 0 ? { rew: ex.reworkQuestions } : {}),
              ...(Object.keys(qMap).length > 0 ? { qs: qMap } : {}),
            };
          }
        });
      });
    });
  });

  const delta: CompactSyncDelta = {
    v: 2,
    p: profile,
    c: paceConfig,
    l: activityLogs,
    e: exams,
    ch: chDelta,
    ex: exDelta,
  };

  const jsonStr = JSON.stringify(delta);
  // Base64 encode for URL hash
  return btoa(unescape(encodeURIComponent(jsonStr)));
}

// Decode and parse payload from URL hash
export function decodeSyncPayload(encoded: string): CompactSyncDelta | null {
  try {
    const jsonStr = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.p && parsed.p.name) {
      return parsed as CompactSyncDelta;
    }
  } catch (e) {
    console.error('Failed to decode sync payload:', e);
  }
  return null;
}

// Apply delta to subject list
export function applySyncDeltaToSubjects(subjects: Subject[], delta: CompactSyncDelta): Subject[] {
  return subjects.map(sub => ({
    ...sub,
    units: sub.units.map(unit => ({
      ...unit,
      chapters: unit.chapters.map(ch => {
        const chD = delta.ch[ch.id];
        const updatedChapter = chD ? {
          ...ch,
          syllabusCovered: chD.cov ?? ch.syllabusCovered,
          revisionCount: chD.rev ?? ch.revisionCount,
        } : ch;

        return {
          ...updatedChapter,
          exercises: updatedChapter.exercises.map(ex => {
            const exD = delta.ex[ex.id];
            if (!exD) return ex;

            const updatedQuestions = ex.questions.map(q => {
              const qD = exD.qs?.[q.id];
              if (!qD) return q;
              return {
                ...q,
                status: qD.s ?? q.status,
                difficulty: qD.d ?? q.difficulty,
                needsRevision: qD.r ?? q.needsRevision,
              };
            });

            return {
              ...ex,
              completedQuestions: exD.comp ?? ex.completedQuestions,
              difficultQuestions: exD.diff ?? ex.difficultQuestions,
              reworkQuestions: exD.rew ?? ex.reworkQuestions,
              questions: updatedQuestions,
            };
          }),
        };
      }),
    })),
  }));
}
