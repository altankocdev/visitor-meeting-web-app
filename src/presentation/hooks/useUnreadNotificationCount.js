import { useCallback, useEffect, useState } from "react";
import { notificationRepository } from "../../infrastructure/repositories/notificationRepository";

export const NOTIFICATIONS_UPDATED_EVENT = "meetly:notifications-updated";

const resolveCount = (response) => {
  const value = response?.unreadCount ?? response?.count ?? response;
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
};

export function useUnreadNotificationCount(companyId) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!companyId) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationRepository.getUnreadCount(companyId);
      setUnreadCount(resolveCount(response));
    } catch {
      // A notification badge must not prevent the navigation from rendering.
    }
  }, [companyId]);

  useEffect(() => {
    refresh();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const intervalId = window.setInterval(refresh, 30_000);

    window.addEventListener("focus", refresh);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh]);

  return unreadCount;
}
