"use client";

import { getSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { issueKeys } from "./use-issues";

export function useRealtimeProject(
  orgId: string,
  projectId: string,
): { isConnected: boolean } {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!orgId || !projectId) return;

    const socket = getSocket();

    function join() {
      socket.emit("join_project", { orgId, projectId });
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    function invalidateIssues() {
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      });
    }

    function invalidateComments() {
      // Partial key match invalidates every issue's comment thread cache
      // under this project — slightly broad, but comment events are
      // infrequent enough that this is cheap.
      queryClient.invalidateQueries({
        queryKey: ["comments", orgId, projectId],
      });
    }

    if (!socket.connected) socket.connect();
    if (socket.connected) join();

    socket.on("connect", join);
    socket.on("disconnect", handleDisconnect);
    socket.on("issue:created", invalidateIssues);
    socket.on("issue:updated", invalidateIssues);
    socket.on("issue:reordered", invalidateIssues);
    socket.on("issue:deleted", invalidateIssues);
    socket.on("comment:created", invalidateComments);
    socket.on("comment:updated", invalidateComments);
    socket.on("comment:deleted", invalidateComments);

    return () => {
      socket.emit("leave_project", { projectId });
      socket.off("connect", join);
      socket.off("disconnect", handleDisconnect);
      socket.off("issue:created", invalidateIssues);
      socket.off("issue:updated", invalidateIssues);
      socket.off("issue:reordered", invalidateIssues);
      socket.off("issue:deleted", invalidateIssues);
      socket.off("comment:created", invalidateComments);
      socket.off("comment:updated", invalidateComments);
      socket.off("comment:deleted", invalidateComments);
    };
  }, [orgId, projectId, queryClient]);

  return { isConnected };
}
