import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { isStale } from './state/editorReducer';
import { STAGE_ORDER, STAGE_LABEL } from './types';

type StepStatus = 'done' | 'current' | 'stale' | 'todo';

const CIRCLE: Record<StepStatus, string> = {
  done: 'bg-emerald-500 text-white border-emerald-500',
  current: 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100',
  stale: 'bg-rose-500 text-white border-rose-500',
  todo: 'bg-white text-zinc-400 border-zinc-300',
};

const LABEL: Record<StepStatus, string> = {
  done: 'text-emerald-700',
  current: 'text-blue-700 font-semibold',
  stale: 'text-rose-600 font-medium',
  todo: 'text-zinc-400',
};

export function Stepper() {
  const { state, dispatch } = useEditor();
  const stale = isStale(state);
  const currentIdx = STAGE_ORDER.indexOf(state.stage);
  const reachedIdx = STAGE_ORDER.indexOf(state.maxStageReached);
  const analyzedIdx = STAGE_ORDER.indexOf('analyzed');

  const statusOf = (i: number): StepStatus => {
    if (i === currentIdx) return 'current';
    if (stale && i >= analyzedIdx && i <= reachedIdx) return 'stale';
    if (i <= reachedIdx) return 'done';
    return 'todo';
  };

  return (
    <div className="flex items-center justify-center gap-0 px-4 py-2.5">
      {STAGE_ORDER.map((s, i) => {
        const st = statusOf(i);
        const reachable = i <= reachedIdx;
        return (
          <React.Fragment key={s}>
            {i > 0 && (
              <span
                className={`h-0.5 w-8 md:w-12 ${
                  i <= reachedIdx && !(stale && i > analyzedIdx) ? 'bg-emerald-300'
                    : stale && i > analyzedIdx && i <= reachedIdx ? 'bg-rose-300'
                      : 'bg-zinc-200'
                }`}
              />
            )}
            <button
              disabled={!reachable}
              onClick={() => dispatch({ type: 'GO_TO_STAGE', to: s })}
              className={`flex items-center gap-2 ${reachable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              title={STAGE_LABEL[s]}
            >
              <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold transition-all ${CIRCLE[st]}`}>
                {st === 'done' ? <Check className="w-4 h-4" />
                  : st === 'stale' ? <AlertTriangle className="w-3.5 h-3.5" />
                    : i + 1}
              </span>
              <span className={`hidden md:block text-xs whitespace-nowrap ${LABEL[st]}`}>{STAGE_LABEL[s]}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
