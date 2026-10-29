import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../firebase';
import { doc, setDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface PresenceContextType {
  onlineUserIds: Set<string>;
  isUserOnline: (userId?: string) => boolean;
  isDeviceOnline: boolean;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    new Set(['user_lucas', 'user_elena', 'user_sarah'])
  );
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Monitor device network connectivity (online / offline)
  useEffect(() => {
    const handleOnline = () => setIsDeviceOnline(true);
    const handleOffline = () => setIsDeviceOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Real-time Connection Status Listener using Cloud Firestore
  useEffect(() => {
    if (!isFirebaseConfigured() || !db) return;

    let unsubscribeSnapshot: (() => void) | null = null;

    try {
      // Listen to real-time presence collection in Firestore
      const presenceCol = collection(db, 'presence');
      unsubscribeSnapshot = onSnapshot(
        presenceCol,
        (snapshot) => {
          const onlineSet = new Set<string>();
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.isOnline === true) {
              onlineSet.add(docSnap.id);
            }
          });
          setOnlineUserIds(onlineSet);
        },
        (error) => {
          console.warn('Firestore presence listener notice:', error);
        }
      );

      // Register current user as online in Firestore
      if (currentUser && isDeviceOnline) {
        const userRef = doc(db, 'presence', currentUser.id);
        setDoc(
          userRef,
          {
            userId: currentUser.id,
            userName: currentUser.name,
            isOnline: true,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {});

        const handleUnload = () => {
          // Attempt best-effort offline status update on disconnect
          setDoc(
            userRef,
            {
              isOnline: false,
              lastSeen: serverTimestamp(),
            },
            { merge: true }
          ).catch(() => {});
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => {
          window.removeEventListener('beforeunload', handleUnload);
          if (unsubscribeSnapshot) unsubscribeSnapshot();
          handleUnload();
        };
      }
    } catch (err) {
      console.warn('Could not initialize Firestore presence listener:', err);
    }

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [currentUser, isDeviceOnline]);

  // 2. Real-time SSE Presence Listener (for full-stack server sync)
  useEffect(() => {
    // Initial fetch of active presence from server
    fetch('/api/presence')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.onlineUserIds)) {
          setOnlineUserIds((prev) => {
            const merged = new Set(prev);
            data.onlineUserIds.forEach((id: string) => merged.add(id));
            return merged;
          });
        }
      })
      .catch(() => {});

    if (!currentUser) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/realtime?userId=${currentUser.id}`);

      eventSource.addEventListener('presence_update', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setOnlineUserIds((prev) => {
            const updated = new Set(prev);
            if (data.isOnline) {
              updated.add(data.userId);
            } else {
              updated.delete(data.userId);
            }
            return updated;
          });
        } catch {}
      });
    } catch {}

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentUser]);

  const isUserOnline = useCallback(
    (userId?: string): boolean => {
      if (!userId) return false;
      // If current user, check local device network status
      if (currentUser && userId === currentUser.id) {
        return isDeviceOnline;
      }
      return onlineUserIds.has(userId);
    },
    [currentUser, isDeviceOnline, onlineUserIds]
  );

  return (
    <PresenceContext.Provider value={{ onlineUserIds, isUserOnline, isDeviceOnline }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};
