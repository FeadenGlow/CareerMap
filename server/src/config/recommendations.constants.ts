import { SKILL_SUFFICIENT_LEVEL } from './development.constants';

export { SKILL_SUFFICIENT_LEVEL };

export const MAX_DEPTH = parseInt(process.env.REC_MAX_DEPTH ?? '7', 10) || 7;
export const MAX_DEPTH_CAP =
  parseInt(process.env.REC_MAX_DEPTH_CAP ?? '10', 10) || 10;
export const K_CANDIDATE_PATHS =
  parseInt(process.env.REC_K_CANDIDATE_PATHS ?? '30', 10) || 30;
export const TOP_N = parseInt(process.env.REC_TOP_N ?? '10', 10) || 10;
export const TOP_N_CAP = parseInt(process.env.REC_TOP_N_CAP ?? '20', 10) || 20;
export const BEAM_SIZE = parseInt(process.env.REC_BEAM_SIZE ?? '30', 10) || 30;
export const MAX_PATHS_GLOBAL =
  parseInt(process.env.REC_MAX_PATHS_GLOBAL ?? '200', 10) || 200;
export const MAX_TARGETS =
  parseInt(process.env.REC_MAX_TARGETS ?? '40', 10) || 40;
export const MAX_CANDIDATES_PER_TARGET =
  parseInt(process.env.REC_MAX_CANDIDATES_PER_TARGET ?? '15', 10) || 15;
export const MAX_UNIQUE_TARGETS_IN_TOP =
  parseInt(process.env.REC_MAX_UNIQUE_TARGETS_IN_TOP ?? '4', 10) || 4;

export const W_REACHABILITY =
  parseFloat(process.env.REC_W_REACHABILITY ?? '0.45') || 0.45;
export const W_TIME = parseFloat(process.env.REC_W_TIME ?? '0.2') || 0.2;
export const W_DIFFICULTY =
  parseFloat(process.env.REC_W_DIFFICULTY ?? '0.2') || 0.2;
export const W_INTEREST =
  parseFloat(process.env.REC_W_INTEREST ?? '0.15') || 0.15;
export const HISTORY_BIAS_CAP = 0.2;

export const BASE_STEP_COST =
  parseFloat(process.env.REC_BASE_STEP_COST ?? '0.5') || 0.5;
export const TIME_COST_ALPHA =
  parseFloat(process.env.REC_TIME_COST_ALPHA ?? '2') || 2;
export const TIME_NORM_WHEN_EQUAL = 0.5;
export const INTEREST_FIT_NEUTRAL = 0.3;

export const HISTORY_RECENT_DAYS = 90;
export const HISTORY_OLD_DAYS = 365 * 3;

export const W_BEAM_LENGTH =
  parseFloat(process.env.REC_W_BEAM_LENGTH ?? '1') || 1;
export const W_BEAM_EDGE_READINESS =
  parseFloat(process.env.REC_W_BEAM_EDGE_READINESS ?? '1') || 1;
export const W_BEAM_INTEREST_HINT =
  parseFloat(process.env.REC_W_BEAM_INTEREST_HINT ?? '0.2') || 0.2;

export type InterestType = 'DEV' | 'MANAGEMENT' | 'DATA';

export const DEPARTMENT_TO_INTEREST: Record<string, InterestType> = {
  Engineering: 'DEV',
  IT: 'DEV',
  Development: 'DEV',
  Management: 'MANAGEMENT',
  Leadership: 'MANAGEMENT',
  Data: 'DATA',
  Analytics: 'DATA',
};
