import { useEffect } from "react";

let lockCount = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";
let previousHtmlOverflow = "";

export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked || typeof window === "undefined") return undefined;

    const { body, documentElement } = document;

    if (lockCount === 0) {
      previousBodyOverflow = body.style.overflow;
      previousBodyPaddingRight = body.style.paddingRight;
      previousHtmlOverflow = documentElement.style.overflow;

      const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        body.style.overflow = previousBodyOverflow;
        body.style.paddingRight = previousBodyPaddingRight;
        documentElement.style.overflow = previousHtmlOverflow;
      }
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
