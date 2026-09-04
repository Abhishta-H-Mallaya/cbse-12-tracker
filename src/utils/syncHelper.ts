import LZString from 'lz-string';
import jsQR from 'jsqr';
import { 
  UserProfile, 
  Subject, 
  PlannerPaceConfig, 
  DailyActivityLog, 
  ExamTarget,
  QuestionStatus,
  DifficultyLevel
} from '../types/planner';
import { getInitialExamsForYear } from '../data/initialExams';

export interface CompactSyncDelta {
  v: number; // version 3
  p: UserProfile;
  c: PlannerPaceConfig;
  l?: DailyActivityLog[];
  // Delta for exams
  ce?: ExamTarget[]; // Custom added exams
  de?: string[];     // Disabled exam IDs
  re?: string[];     // Registered exam IDs
  e?: ExamTarget[];  // Legacy full exam fallback if present
  // Delta map of chapters
  ch: Record<string, { cov?: boolean; rev?: number }>;
  // Delta map of exercises: exerciseId / ch::exName -> { name?, comp: number, diff?, rew?, qs? }
  ex: Record<string, {
    name?: string;
    comp: number;
    diff?: number;
    rew?: number;
    qs?: Record<string, { s: QuestionStatus; d: DifficultyLevel; r: boolean }>;
  }>;
}

// Generate an ultra-compact delta payload (<800 bytes) compressed with LZString
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

            const exItem = {
              name: ex.name,
              comp: ex.completedQuestions,
              ...(ex.difficultQuestions > 0 ? { diff: ex.difficultQuestions } : {}),
              ...(ex.reworkQuestions > 0 ? { rew: ex.reworkQuestions } : {}),
              ...(Object.keys(qMap).length > 0 ? { qs: qMap } : {}),
            };

            // Save under multiple keys so ANY receiving device matches it 100%:
            // 1. By ex.id
            exDelta[ex.id] = exItem;
            // 2. By composite chapter + exercise name
            exDelta[`${ch.id}::${ex.name}`] = exItem;
          }
        });
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

  const customExams = exams.filter(e => 
    e.id.startsWith('custom-') || 
    e.category === 'Other' || 
    !standardExamIds.includes(e.id)
  );

  const disabledExamIds = exams.filter(e => !e.enabled).map(e => e.id);
  const registeredExamIds = exams.filter(e => e.registered).map(e => e.id);

  // Keep last 14 activity logs for compact size
  const recentLogs = (activityLogs || []).slice(-14);

  const delta: CompactSyncDelta = {
    v: 3,
    p: profile,
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

// Apply delta to subject list with composite key matching
export function applySyncDeltaToSubjects(subjects: Subject[], delta: CompactSyncDelta): Subject[] {
  return subjects.map(sub => ({
    ...sub,
    units: sub.units.map(unit => ({
      ...unit,
      chapters: unit.chapters.map(ch => {
        const chD = delta.ch ? delta.ch[ch.id] : undefined;
        const updatedChapter = chD ? {
          ...ch,
          syllabusCovered: chD.cov ?? ch.syllabusCovered,
          revisionCount: chD.rev ?? ch.revisionCount,
        } : ch;

        return {
          ...updatedChapter,
          exercises: updatedChapter.exercises.map(ex => {
            // Find matching exercise in delta:
            // 1. By chapter + exercise name composite key (100% resilient across devices)
            let exD = delta.ex ? delta.ex[`${ch.id}::${ex.name}`] : undefined;
            // 2. By exercise ID
            if (!exD && delta.ex) exD = delta.ex[ex.id];
            // 3. By exercise name ending
            if (!exD && delta.ex) {
              const match = Object.entries(delta.ex).find(([key, val]) => 
                key.endsWith(`::${ex.name}`) || (val as any).name === ex.name
              );
              if (match) exD = match[1];
            }

            if (!exD) return ex;

            const updatedQuestions = ex.questions.map(q => {
              const qD = exD?.qs?.[q.id];
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
