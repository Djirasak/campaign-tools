"use client";

import { Fragment } from "react";
import styles from "../checkout.module.css";
import { cx } from "../../../lib/utils";

type Props = {
  step: number;
  completedSteps: Set<number>;
  onGoToStep: (n: number) => void;
};

const STEP_LABELS = ["Information", "Shipping", "Payment"];

export default function StepsNav({ step, completedSteps, onGoToStep }: Props) {
  return (
    <div className={styles.stepsBar}>
      {([1, 2, 3] as const).map((s, i) => {
        const isDone = completedSteps.has(s) && step !== s;
        const isActive = step === s;
        return (
          <Fragment key={s}>
            <button
              className={cx(styles.stepBtn, isActive && styles.active, isDone && styles.done)}
              onClick={() => onGoToStep(s)}
            >
              <span className={cx(styles.stepNum, isActive && styles.active, isDone && styles.done)}>
                {isDone ? (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  s
                )}
              </span>
              <span className={styles.stepLabel}>{STEP_LABELS[s - 1]}</span>
            </button>
            {i < 2 && <div className={styles.stepArrow} />}
          </Fragment>
        );
      })}
    </div>
  );
}
