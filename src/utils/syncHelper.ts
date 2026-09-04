import LZString from 'lz-string';
import jsQR from 'jsqr';
import { 
  UserProfile, 
  Subject, 
  Chapter,
  Exercise,
  PlannerPaceConfig, 
  DailyActivityLog, 
  ExamTarget,
  QuestionStatus,
  DifficultyLevel,
  QuestionSources,
  PhysicsDetails,
  ChemistryDetails,
  BiologyDetails,
  EnglishProseDetails,
  EnglishPoemDetails
} from '../types/planner';
import { getInitialExamsForYear } from '../data/initialExams';

export interface CompactChapterDelta {
  cov?: boolean;
  rev?: number;
  we?: number; // workedExamplesCompleted
  qs?: Partial<QuestionSources>;
  pd?: Partial<PhysicsDetails>;
  cd?: Partial<ChemistryDetails>;
  bd?: Partial<BiologyDetails>;
  epd?: Partial<EnglishProseDetails>;
  em?: Partial<EnglishPoemDetails>;
}

export interface CompactExerciseDelta {
  name: string;
  comp: number;
  diff?: number;
  rew?: number;
  qs?: Record<string, { s: QuestionStatus; d: DifficultyLevel; r: boolean }>;
}

export interface CompactSyncDelta {
  v: number; // version 4
  p: UserProfile;
  c: PlannerPaceConfig;
  l?: DailyActivityLog[];
  // Delta for exams
  ce?: ExamTarget[]; // Custom added exams
  de?: string[];     // Disabled exam IDs
  re?: string[];     // Registered exam IDs
  e?: ExamTarget[];  // Legacy full exam fallback if present
  // Delta map of chapters
  ch: Record<string, CompactChapterDelta>;
  // Delta map of exercises: exerciseId / ch::exName -> CompactExerciseDelta
  ex: Record<string, CompactExerciseDelta>;
}

// Helper to determine whether a chapter actually has any user progress
export function hasRealChapterProgress(ch: Chapter): boolean {
  if (ch.syllabusCovered) return true;
  if (ch.revisionCount && ch.revisionCount > 0) return true;
  if (ch.workedExamplesCompleted && ch.workedExamplesCompleted > 0) return true;

  if (ch.questionSources) {
    for (const src of Object.values(ch.questionSources)) {
      if (src && typeof src === 'object' && src.completed > 0) return true;
    }
  }

  const pd = ch.physicsDetails;
  if (pd) {
    if ((pd.numericalQuestions?.completed ?? 0) > 0) return true;
    if ((pd.conceptualQuestions?.completed ?? 0) > 0) return true;
    if ((pd.derivationQuestions?.completed ?? 0) > 0) return true;
    if ((pd.difficultCount ?? 0) > 0) return true;
    if ((pd.revisionRequiredCount ?? 0) > 0) return true;
    if ((pd.pyqsCompleted ?? 0) > 0) return true;
    if ((pd.guideCompleted ?? 0) > 0) return true;
    if ((pd.tuitionCompleted ?? 0) > 0) return true;
  }

  const cd = ch.chemistryDetails;
  if (cd) {
    if ((cd.numericalProblems?.completed ?? 0) > 0) return true;
    if ((cd.reactionBasedQuestions?.completed ?? 0) > 0) return true;
    if ((cd.theoryConceptQuestions?.completed ?? 0) > 0) return true;
    if ((cd.memorisationQuestions?.completed ?? 0) > 0) return true;
    if ((cd.difficultCount ?? 0) > 0) return true;
    if ((cd.revisionRequiredCount ?? 0) > 0) return true;
  }

  const bd = ch.biologyDetails;
  if (bd) {
    if ((bd.diagrams?.completed ?? 0) > 0) return true;
    if ((bd.terminology?.completed ?? 0) > 0) return true;
    if ((bd.caseBasedAssertion?.completed ?? 0) > 0) return true;
    if ((bd.difficultCount ?? 0) > 0) return true;
    if ((bd.revisionRequiredCount ?? 0) > 0) return true;
    if ((bd.pyqsCompleted ?? 0) > 0) return true;
    if ((bd.guideCompleted ?? 0) > 0) return true;
    if ((bd.tuitionCompleted ?? 0) > 0) return true;
  }

  const epd = ch.englishProseDetails;
  if (epd) {
    if (epd.firstReading || epd.secondReading) return true;
    if (epd.storyUnderstood && epd.storyUnderstood !== 'Not Started') return true;
    if ((epd.revisionCount ?? 0) > 0) return true;
    if ((epd.textbookQuestions?.completed ?? 0) > 0) return true;
    if ((epd.tuitionQuestions?.completed ?? 0) > 0) return true;
    if ((epd.guideQuestions?.completed ?? 0) > 0) return true;
    if ((epd.pyqs?.completed ?? 0) > 0) return true;
    if (epd.difficultWords && epd.difficultWords.length > 0) return true;
    if (epd.charactersStudied || epd.themesStudied || epd.importantEvents || epd.messageTheme) return true;
  }

  const em = ch.englishPoemDetails;
  if (em) {
    if (em.poemReading) return true;
    if ((em.revisionCount ?? 0) > 0) return true;
    if ((em.textbookQuestions?.completed ?? 0) > 0) return true;
    if ((em.pyqs?.completed ?? 0) > 0) return true;
    if (em.stanzaMeanings || em.centralIdea || em.themes || em.poeticDevices || em.ownInterpretation) return true;
  }

  return false;
}

// Generate an ultra-compact delta payload (<800 bytes) compressed with LZString
export function createSyncPayload(
  profile: UserProfile,
  subjects: Subject[],
  paceConfig: PlannerPaceConfig,
  activityLogs: DailyActivityLog[],
  exams: ExamTarget[]
): string {
  const safeProfile = profile || {
    id: 'profile-user-default',
    name: 'Student',
    examYear: '2027',
    targetExamDate: '2027-02-15',
    fieldGoal: 'CBSE Class 12 Boards (95%+)',
    fieldGoals: ['CBSE Class 12 Boards (95%+)'],
    stream: 'PCMB',
    selectedSubjects: ['mathematics', 'physics', 'chemistry', 'biology', 'english_prose', 'english_poetry', 'english_vistas'],
    createdAt: '2026-09-01T00:00:00.000Z',
  };
  const safeSubjects = subjects || [];
  const safeLogs = activityLogs || [];
  const safeExams = exams || [];

  const chDelta: CompactSyncDelta['ch'] = {};
  const exDelta: CompactSyncDelta['ex'] = {};

  safeSubjects.forEach(sub => {
    if (!sub || !sub.units) return;
    sub.units.forEach(unit => {
      if (!unit || !unit.chapters) return;
      unit.chapters.forEach(ch => {
        if (!ch) return;

        // Only include chapter in delta if user made REAL progress
        if (hasRealChapterProgress(ch)) {
          const chItem: CompactChapterDelta = {};
          if (ch.syllabusCovered) chItem.cov = true;
          if (ch.revisionCount && ch.revisionCount > 0) chItem.rev = ch.revisionCount;
          if (ch.workedExamplesCompleted && ch.workedExamplesCompleted > 0) chItem.we = ch.workedExamplesCompleted;

          if (ch.questionSources) {
            const qsDelta: Partial<QuestionSources> = {};
            let hasQs = false;
            for (const [key, val] of Object.entries(ch.questionSources)) {
              if (val && typeof val === 'object' && val.completed > 0) {
                (qsDelta as any)[key] = { completed: val.completed };
                hasQs = true;
              }
            }
            if (hasQs) chItem.qs = qsDelta;
          }

          if (ch.physicsDetails) {
            const pd = ch.physicsDetails;
            const pdDelta: any = {};
            let hasPd = false;
            if ((pd.numericalQuestions?.completed ?? 0) > 0) { pdDelta.numericalQuestions = { completed: pd.numericalQuestions.completed }; hasPd = true; }
            if ((pd.conceptualQuestions?.completed ?? 0) > 0) { pdDelta.conceptualQuestions = { completed: pd.conceptualQuestions.completed }; hasPd = true; }
            if ((pd.derivationQuestions?.completed ?? 0) > 0) { pdDelta.derivationQuestions = { completed: pd.derivationQuestions.completed }; hasPd = true; }
            if ((pd.difficultCount ?? 0) > 0) { pdDelta.difficultCount = pd.difficultCount; hasPd = true; }
            if ((pd.revisionRequiredCount ?? 0) > 0) { pdDelta.revisionRequiredCount = pd.revisionRequiredCount; hasPd = true; }
            if ((pd.pyqsCompleted ?? 0) > 0) { pdDelta.pyqsCompleted = pd.pyqsCompleted; hasPd = true; }
            if ((pd.guideCompleted ?? 0) > 0) { pdDelta.guideCompleted = pd.guideCompleted; hasPd = true; }
            if ((pd.tuitionCompleted ?? 0) > 0) { pdDelta.tuitionCompleted = pd.tuitionCompleted; hasPd = true; }
            if (hasPd) chItem.pd = pdDelta;
          }

          if (ch.chemistryDetails) {
            const cd = ch.chemistryDetails;
            const cdDelta: any = {};
            let hasCd = false;
            if ((cd.numericalProblems?.completed ?? 0) > 0) { cdDelta.numericalProblems = { completed: cd.numericalProblems.completed }; hasCd = true; }
            if ((cd.reactionBasedQuestions?.completed ?? 0) > 0) { cdDelta.reactionBasedQuestions = { completed: cd.reactionBasedQuestions.completed }; hasCd = true; }
            if ((cd.theoryConceptQuestions?.completed ?? 0) > 0) { cdDelta.theoryConceptQuestions = { completed: cd.theoryConceptQuestions.completed }; hasCd = true; }
            if ((cd.memorisationQuestions?.completed ?? 0) > 0) { cdDelta.memorisationQuestions = { completed: cd.memorisationQuestions.completed }; hasCd = true; }
            if ((cd.difficultCount ?? 0) > 0) { cdDelta.difficultCount = cd.difficultCount; hasCd = true; }
            if ((cd.revisionRequiredCount ?? 0) > 0) { cdDelta.revisionRequiredCount = cd.revisionRequiredCount; hasCd = true; }
            if (hasCd) chItem.cd = cdDelta;
          }

          if (ch.biologyDetails) {
            const bd = ch.biologyDetails;
            const bdDelta: any = {};
            let hasBd = false;
            if ((bd.diagrams?.completed ?? 0) > 0) { bdDelta.diagrams = { completed: bd.diagrams.completed }; hasBd = true; }
            if ((bd.terminology?.completed ?? 0) > 0) { bdDelta.terminology = { completed: bd.terminology.completed }; hasBd = true; }
            if ((bd.caseBasedAssertion?.completed ?? 0) > 0) { bdDelta.caseBasedAssertion = { completed: bd.caseBasedAssertion.completed }; hasBd = true; }
            if ((bd.difficultCount ?? 0) > 0) { bdDelta.difficultCount = bd.difficultCount; hasBd = true; }
            if ((bd.revisionRequiredCount ?? 0) > 0) { bdDelta.revisionRequiredCount = bd.revisionRequiredCount; hasBd = true; }
            if ((bd.pyqsCompleted ?? 0) > 0) { bdDelta.pyqsCompleted = bd.pyqsCompleted; hasBd = true; }
            if ((bd.guideCompleted ?? 0) > 0) { bdDelta.guideCompleted = bd.guideCompleted; hasBd = true; }
            if ((bd.tuitionCompleted ?? 0) > 0) { bdDelta.tuitionCompleted = bd.tuitionCompleted; hasBd = true; }
            if (hasBd) chItem.bd = bdDelta;
          }

          if (ch.englishProseDetails) {
            const epd = ch.englishProseDetails;
            const epdDelta: any = {};
            let hasEpd = false;
            if (epd.firstReading) { epdDelta.firstReading = true; hasEpd = true; }
            if (epd.secondReading) { epdDelta.secondReading = true; hasEpd = true; }
            if (epd.storyUnderstood && epd.storyUnderstood !== 'Not Started') { epdDelta.storyUnderstood = epd.storyUnderstood; hasEpd = true; }
            if ((epd.revisionCount ?? 0) > 0) { epdDelta.revisionCount = epd.revisionCount; hasEpd = true; }
            if ((epd.textbookQuestions?.completed ?? 0) > 0) { epdDelta.textbookQuestions = { completed: epd.textbookQuestions.completed }; hasEpd = true; }
            if ((epd.tuitionQuestions?.completed ?? 0) > 0) { epdDelta.tuitionQuestions = { completed: epd.tuitionQuestions.completed }; hasEpd = true; }
            if ((epd.guideQuestions?.completed ?? 0) > 0) { epdDelta.guideQuestions = { completed: epd.guideQuestions.completed }; hasEpd = true; }
            if ((epd.pyqs?.completed ?? 0) > 0) { epdDelta.pyqs = { completed: epd.pyqs.completed }; hasEpd = true; }
            if (epd.difficultWords && epd.difficultWords.length > 0) { epdDelta.difficultWords = epd.difficultWords; hasEpd = true; }
            if (epd.charactersStudied) { epdDelta.charactersStudied = epd.charactersStudied; hasEpd = true; }
            if (epd.themesStudied) { epdDelta.themesStudied = epd.themesStudied; hasEpd = true; }
            if (epd.importantEvents) { epdDelta.importantEvents = epd.importantEvents; hasEpd = true; }
            if (epd.messageTheme) { epdDelta.messageTheme = epd.messageTheme; hasEpd = true; }
            if (hasEpd) chItem.epd = epdDelta;
          }

          if (ch.englishPoemDetails) {
            const em = ch.englishPoemDetails;
            const emDelta: any = {};
            let hasEm = false;
            if (em.poemReading) { emDelta.poemReading = true; hasEm = true; }
            if ((em.revisionCount ?? 0) > 0) { emDelta.revisionCount = em.revisionCount; hasEm = true; }
            if ((em.textbookQuestions?.completed ?? 0) > 0) { emDelta.textbookQuestions = { completed: em.textbookQuestions.completed }; hasEm = true; }
            if ((em.pyqs?.completed ?? 0) > 0) { emDelta.pyqs = { completed: em.pyqs.completed }; hasEm = true; }
            if (em.stanzaMeanings) { emDelta.stanzaMeanings = em.stanzaMeanings; hasEm = true; }
            if (em.centralIdea) { emDelta.centralIdea = em.centralIdea; hasEm = true; }
            if (em.themes) { emDelta.themes = em.themes; hasEm = true; }
            if (em.poeticDevices) { emDelta.poeticDevices = em.poeticDevices; hasEm = true; }
            if (em.ownInterpretation) { emDelta.ownInterpretation = em.ownInterpretation; hasEm = true; }
            if (hasEm) chItem.em = emDelta;
          }

          chDelta[ch.id] = chItem;
        }

        // Exercises
        if (ch.exercises && Array.isArray(ch.exercises)) {
          ch.exercises.forEach((ex, exIdx) => {
            if (!ex) return;
            const hasModifiedQuestions = ex.questions && ex.questions.some(q => 
              q.status !== 'Not Started' || q.difficulty !== 'Medium' || q.needsRevision
            );

            if (ex.completedQuestions > 0 || ex.difficultQuestions > 0 || ex.reworkQuestions > 0 || hasModifiedQuestions) {
              const qMap: Record<string, { s?: QuestionStatus; d?: DifficultyLevel; r?: boolean }> = {};
              if (ex.questions && Array.isArray(ex.questions)) {
                ex.questions.forEach((q, qIdx) => {
                  if (q.status !== 'Not Started' || q.difficulty !== 'Medium' || q.needsRevision) {
                    qMap[`q${qIdx}`] = {
                      ...(q.status !== 'Not Started' ? { s: q.status } : {}),
                      ...(q.difficulty !== 'Medium' ? { d: q.difficulty } : {}),
                      ...(q.needsRevision ? { r: true } : {}),
                    };
                  }
                });
              }

              const exItem: CompactExerciseDelta = {
                name: ex.name,
                comp: ex.completedQuestions || 0,
                ...(ex.difficultQuestions > 0 ? { diff: ex.difficultQuestions } : {}),
                ...(ex.reworkQuestions > 0 ? { rew: ex.reworkQuestions } : {}),
                ...(Object.keys(qMap).length > 0 ? { qs: qMap as any } : {}),
              };

              // Canonical single key for ultra-compact payload
              exDelta[`${ch.id}:${ex.name}`] = exItem;
            }
          });
        }
      });
    });
  });

  // Distinguish custom exams from default standard ones
  const standardExamIds = [
    'exam-cbse-boards', 
    'exam-cbse-practicals', 
    'exam-preboard-1', 
    'exam-preboard-2', 
    'exam-jee-session-1', 
    'exam-jee-session-2', 
    'exam-neet-ug', 
    'exam-cuet-ug', 
    'exam-bitsat'
  ];

  const customExams = safeExams.filter(e => 
    e && (
      e.id?.startsWith('custom-') || 
      e.category === 'Other' || 
      !standardExamIds.includes(e.id)
    )
  );

  const disabledExamIds = safeExams.filter(e => e && !e.enabled).map(e => e.id);
  const registeredExamIds = safeExams.filter(e => e && e.registered).map(e => e.id);

  // Keep last 14 activity logs for compact size
  const recentLogs = safeLogs.slice(-14);

  const delta: CompactSyncDelta = {
    v: 4,
    p: safeProfile,
    c: paceConfig,
    l: recentLogs,
    ce: customExams.length > 0 ? customExams : undefined,
    de: disabledExamIds.length > 0 ? disabledExamIds : undefined,
    re: registeredExamIds.length > 0 ? registeredExamIds : undefined,
    ch: chDelta,
    ex: exDelta,
  };

  const jsonStr = JSON.stringify(delta);
  return LZString.compressToEncodedURIComponent(jsonStr);
}

// Resilient decode function that handles all browser URL encoding variations
export function decodeSyncPayload(encoded: string): CompactSyncDelta | null {
  if (!encoded || typeof encoded !== 'string') return null;
  const clean = encoded.trim();

  // Try multiple permutations to handle how different mobile browsers decode hash fragments
  const candidates = [
    clean,
    clean.replace(/ /g, '+'),
    (() => { try { return decodeURIComponent(clean); } catch { return clean; } })(),
    (() => { try { return decodeURIComponent(clean).replace(/ /g, '+'); } catch { return clean; } })(),
    (() => { try { return encodeURIComponent(clean); } catch { return clean; } })(),
  ];

  for (const cand of candidates) {
    // 1. Try LZString URL Component
    try {
      const decomp = LZString.decompressFromEncodedURIComponent(cand);
      if (decomp) {
        const parsed = JSON.parse(decomp);
        if (parsed && parsed.p && parsed.p.name) return parsed as CompactSyncDelta;
      }
    } catch {}

    // 2. Try LZString Base64
    try {
      const decomp = LZString.decompressFromBase64(cand);
      if (decomp) {
        const parsed = JSON.parse(decomp);
        if (parsed && parsed.p && parsed.p.name) return parsed as CompactSyncDelta;
      }
    } catch {}

    // 3. Try legacy atob base64
    try {
      const jsonStr = decodeURIComponent(escape(atob(cand)));
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.p && parsed.p.name) return parsed as CompactSyncDelta;
    } catch {}

    // 4. Try direct JSON
    try {
      const parsed = JSON.parse(cand);
      if (parsed && parsed.p && parsed.p.name) return parsed as CompactSyncDelta;
    } catch {}
  }

  return null;
}

// Extract and decode sync delta from any user input (full URL, hash, or raw code)
export function parseAnySyncInput(input: string): CompactSyncDelta | null {
  if (!input) return null;
  let code = input.trim();

  // Check if it's a URL containing #sync=, ?sync=, or &sync=
  if (code.includes('#sync=')) {
    code = code.split('#sync=')[1];
  } else if (code.includes('?sync=')) {
    code = code.split('?sync=')[1];
  } else if (code.includes('&sync=')) {
    code = code.split('&sync=')[1];
  }

  // Remove any trailing parameters or hashes if present
  code = code.split('&')[0];
  code = code.split('#')[0];

  return decodeSyncPayload(code);
}

// Hydrate exams for a received sync
export function hydrateExamsFromSync(delta: CompactSyncDelta, currentExams: ExamTarget[]): ExamTarget[] {
  if (delta.e && Array.isArray(delta.e) && delta.e.length > 0) {
    return delta.e;
  }

  const examYear = delta.p.examYear || '2027';
  const baseExams = getInitialExamsForYear(examYear);

  const disabledSet = new Set(delta.de || []);
  const registeredSet = new Set(delta.re || []);

  const merged = baseExams.map(ex => ({
    ...ex,
    enabled: !disabledSet.has(ex.id),
    registered: registeredSet.has(ex.id) || ex.registered,
  }));

  if (delta.ce && Array.isArray(delta.ce)) {
    delta.ce.forEach(customEx => {
      if (!merged.some(m => m.id === customEx.id)) {
        merged.push(customEx);
      }
    });
  }

  return merged;
}

// Scan an image file or blob (e.g. screenshot or photo) for a QR code using jsQR
export async function scanImageForQr(file: Blob | File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const attemptScan = (targetWidth: number, targetHeight: number): string | null => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          return code ? code.data : null;
        };

        // 1. Try original resolution
        let result = attemptScan(img.naturalWidth, img.naturalHeight);
        if (result) return resolve(result);

        // 2. If high resolution photo (>1000px), downsample to 900px
        if (img.naturalWidth > 1000 || img.naturalHeight > 1000) {
          const maxDim = 900;
          const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
          result = attemptScan(Math.round(img.naturalWidth * scale), Math.round(img.naturalHeight * scale));
          if (result) return resolve(result);
        }

        // 3. Try downsample to 600px
        const scale600 = Math.min(600 / img.naturalWidth, 600 / img.naturalHeight);
        result = attemptScan(Math.round(img.naturalWidth * scale600), Math.round(img.naturalHeight * scale600));
        resolve(result);
      };
      img.onerror = () => resolve(null);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// Play pleasant confirmation audio chime on successful scan using Web Audio API
export function playScanSuccessBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    // Melodic 2-tone chime (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {}
}

// Apply delta to subject list with full multi-subject support (Math, Physics, Chem, Bio, English)
export function applySyncDeltaToSubjects(subjects: Subject[], delta: CompactSyncDelta): Subject[] {
  return subjects.map(sub => ({
    ...sub,
    units: sub.units.map(unit => ({
      ...unit,
      chapters: unit.chapters.map(ch => {
        const chD = delta.ch ? delta.ch[ch.id] : undefined;

        // Restore chapter details across all subjects
        const updatedChapter: Chapter = {
          ...ch,
          syllabusCovered: chD?.cov !== undefined ? chD.cov : ch.syllabusCovered,
          revisionCount: chD?.rev !== undefined ? chD.rev : ch.revisionCount,
          workedExamplesCompleted: chD?.we !== undefined ? chD.we : ch.workedExamplesCompleted,
          questionSources: chD?.qs && ch.questionSources ? {
            ...ch.questionSources,
            ...Object.fromEntries(
              Object.entries(chD.qs).map(([k, v]) => [
                k,
                { ...(ch.questionSources as any)[k], ...v }
              ])
            )
          } : ch.questionSources,
          physicsDetails: chD?.pd && ch.physicsDetails ? {
            ...ch.physicsDetails,
            ...chD.pd,
            numericalQuestions: chD.pd.numericalQuestions ? { ...ch.physicsDetails.numericalQuestions, ...chD.pd.numericalQuestions } : ch.physicsDetails.numericalQuestions,
            conceptualQuestions: chD.pd.conceptualQuestions ? { ...ch.physicsDetails.conceptualQuestions, ...chD.pd.conceptualQuestions } : ch.physicsDetails.conceptualQuestions,
            derivationQuestions: chD.pd.derivationQuestions ? { ...ch.physicsDetails.derivationQuestions, ...chD.pd.derivationQuestions } : ch.physicsDetails.derivationQuestions,
          } : ch.physicsDetails,
          chemistryDetails: chD?.cd && ch.chemistryDetails ? {
            ...ch.chemistryDetails,
            ...chD.cd,
            numericalProblems: chD.cd.numericalProblems ? { ...ch.chemistryDetails.numericalProblems, ...chD.cd.numericalProblems } : ch.chemistryDetails.numericalProblems,
            reactionBasedQuestions: chD.cd.reactionBasedQuestions ? { ...ch.chemistryDetails.reactionBasedQuestions, ...chD.cd.reactionBasedQuestions } : ch.chemistryDetails.reactionBasedQuestions,
            theoryConceptQuestions: chD.cd.theoryConceptQuestions ? { ...ch.chemistryDetails.theoryConceptQuestions, ...chD.cd.theoryConceptQuestions } : ch.chemistryDetails.theoryConceptQuestions,
            memorisationQuestions: chD.cd.memorisationQuestions ? { ...ch.chemistryDetails.memorisationQuestions, ...chD.cd.memorisationQuestions } : ch.chemistryDetails.memorisationQuestions,
          } : ch.chemistryDetails,
          biologyDetails: chD?.bd && ch.biologyDetails ? {
            ...ch.biologyDetails,
            ...chD.bd,
            diagrams: chD.bd.diagrams ? { ...ch.biologyDetails.diagrams, ...chD.bd.diagrams } : ch.biologyDetails.diagrams,
            terminology: chD.bd.terminology ? { ...ch.biologyDetails.terminology, ...chD.bd.terminology } : ch.biologyDetails.terminology,
            caseBasedAssertion: chD.bd.caseBasedAssertion ? { ...ch.biologyDetails.caseBasedAssertion, ...chD.bd.caseBasedAssertion } : ch.biologyDetails.caseBasedAssertion,
          } : ch.biologyDetails,
          englishProseDetails: chD?.epd && ch.englishProseDetails ? {
            ...ch.englishProseDetails,
            ...chD.epd,
            textbookQuestions: chD.epd.textbookQuestions ? { ...ch.englishProseDetails.textbookQuestions, ...chD.epd.textbookQuestions } : ch.englishProseDetails.textbookQuestions,
            tuitionQuestions: chD.epd.tuitionQuestions ? { ...ch.englishProseDetails.tuitionQuestions, ...chD.epd.tuitionQuestions } : ch.englishProseDetails.tuitionQuestions,
            guideQuestions: chD.epd.guideQuestions ? { ...ch.englishProseDetails.guideQuestions, ...chD.epd.guideQuestions } : ch.englishProseDetails.guideQuestions,
            pyqs: chD.epd.pyqs ? { ...ch.englishProseDetails.pyqs, ...chD.epd.pyqs } : ch.englishProseDetails.pyqs,
          } : ch.englishProseDetails,
          englishPoemDetails: chD?.em && ch.englishPoemDetails ? {
            ...ch.englishPoemDetails,
            ...chD.em,
            textbookQuestions: chD.em.textbookQuestions ? { ...ch.englishPoemDetails.textbookQuestions, ...chD.em.textbookQuestions } : ch.englishPoemDetails.textbookQuestions,
            pyqs: chD.em.pyqs ? { ...ch.englishPoemDetails.pyqs, ...chD.em.pyqs } : ch.englishPoemDetails.pyqs,
          } : ch.englishPoemDetails,
          exercises: (ch.exercises || []).map((ex, exIdx) => {
            // Find matching exercise in delta across all key formats:
            let exD = delta.ex ? (
              delta.ex[`${ch.id}:${ex.name}`] || 
              delta.ex[`${ch.id}::${ex.name}`] || 
              delta.ex[`${ch.id}:${exIdx}`] || 
              delta.ex[`${ch.id}::idx_${exIdx}`] || 
              delta.ex[ex.id]
            ) : undefined;

            if (!exD && delta.ex) {
              const match = Object.entries(delta.ex).find(([key, val]) => 
                key.endsWith(`:${ex.name}`) || key.endsWith(`::${ex.name}`) || val.name === ex.name
              );
              if (match) exD = match[1];
            }

            if (!exD) return ex;

            // Update individual question items
            const updatedQuestions = (ex.questions || []).map((q, qIdx) => {
              const qD = exD?.qs ? (
                exD.qs[`q${qIdx}`] ||
                exD.qs[q.id] || 
                exD.qs[q.questionNumber] || 
                exD.qs[`idx_${qIdx}`]
              ) : undefined;

              if (!qD) {
                // If question wasn't individually mapped but exercise completed count includes it
                if (exD && exD.comp > qIdx && q.status === 'Not Started') {
                  return { ...q, status: 'Solved' as QuestionStatus };
                }
                return q;
              }
              return {
                ...q,
                status: qD.s ?? q.status,
                difficulty: qD.d ?? q.difficulty,
                needsRevision: qD.r ?? q.needsRevision,
              };
            });

            return {
              ...ex,
              completedQuestions: exD.comp !== undefined ? exD.comp : ex.completedQuestions,
              difficultQuestions: exD.diff !== undefined ? exD.diff : ex.difficultQuestions,
              reworkQuestions: exD.rew !== undefined ? exD.rew : ex.reworkQuestions,
              questions: updatedQuestions,
            };
          }),
        };

        return updatedChapter;
      }),
    })),
  }));
}
