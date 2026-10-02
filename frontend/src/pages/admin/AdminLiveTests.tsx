import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Dialog } from "@/components/ui/Dialog";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useAdminStore } from "@/context/AdminStoreContext";
import {
  Play,
  Pause,
  StopCircle,
  Clock,
  Radio,
  Users,
  Send,
  UserX,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// TODO: Replace mock real-time simulation interval with real WebSocket connection
// Example: const socket = new WebSocket("ws://localhost:8080/ws/live-test-monitor");

export interface LiveParticipant {
  id: string;
  name: string;
  role: "STUDENT" | "ADMIN";
  college: string;
  rollNumber: string;
  progress: number; // 0 - 100%
  timeLeftSeconds: number;
  tabSwitchCount: number;
  status: "Active" | "Idle" | "Warning" | "Submitted" | "Removed";
  lastPing: string;
}

export const AdminLiveTests: React.FC = () => {
  const { students } = useAdminStore();

  const [testStatus, setTestStatus] = useState<"Scheduled" | "Live" | "Paused" | "Completed" | "Cancelled">("Live");
  const [testTitle, setTestTitle] = useState("Java & DSA National Placement Arena #42");
  const [timerSeconds, setTimerSeconds] = useState(2700); // 45 mins
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [extendTimeModalOpen, setExtendTimeModalOpen] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Single participant removal modal
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<LiveParticipant | null>(null);

  // Participants State initialized from shared store
  const [participants, setParticipants] = useState<LiveParticipant[]>(() => {
    return students.slice(0, 8).map((s, idx) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      college: s.college,
      rollNumber: s.rollNumber,
      progress: Math.min(100, (idx + 1) * 12 + 15),
      timeLeftSeconds: 2700 - idx * 120,
      tabSwitchCount: idx === 2 ? 3 : idx === 4 ? 2 : 0,
      status: idx === 2 ? "Warning" : idx === 6 ? "Submitted" : "Active",
      lastPing: "Just now",
    }));
  });

  // Simulated Real-Time WebSocket Polling Interval
  useEffect(() => {
    let interval: any = null;

    if (testStatus === "Live") {
      interval = setInterval(() => {
        // Countdown main timer
        setTimerSeconds((prev) => Math.max(0, prev - 1));

        // Simulate real-time student progress & tab switch events
        setParticipants((prev) =>
          prev.map((p) => {
            if (p.status === "Removed" || p.status === "Submitted") return p;

            const newTimeLeft = Math.max(0, p.timeLeftSeconds - 1);
            const progressIncrement = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
            const newProgress = Math.min(100, p.progress + progressIncrement);
            const isSubmitted = newProgress >= 100;

            // Random tab switch detection (1 in 50 chance per interval)
            const randomTabSwitch = Math.random() > 0.98;
            const newTabCount = randomTabSwitch ? p.tabSwitchCount + 1 : p.tabSwitchCount;

            let newStatus: LiveParticipant["status"] = p.status;
            if (isSubmitted) newStatus = "Submitted";
            else if (newTabCount >= 3) newStatus = "Warning";
            else if (newTimeLeft === 0) newStatus = "Submitted";

            return {
              ...p,
              progress: newProgress,
              timeLeftSeconds: newTimeLeft,
              tabSwitchCount: newTabCount,
              status: newStatus,
              lastPing: "Just now",
            };
          })
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testStatus]);

  // Format seconds into HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h.toString().padStart(2, "0")}:` : ""}${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // Actions
  const handleStartLive = () => {
    setTestStatus("Live");
    toast.success("Live test monitoring started!");
  };

  const handlePause = () => {
    setTestStatus("Paused");
    toast.warning("Test paused for all active participants.");
  };

  const handleResume = () => {
    setTestStatus("Live");
    toast.success("Test resumed for all participants.");
  };

  const handleEndTest = () => {
    if (window.confirm("Are you sure you want to end this live test session now for all participants?")) {
      setTestStatus("Completed");
      toast.info("Live test ended. Results generated.");
    }
  };

  const handleExtendTime = () => {
    setTimerSeconds((prev) => prev + extendMinutes * 60);
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, timeLeftSeconds: p.timeLeftSeconds + extendMinutes * 60 }))
    );
    setExtendTimeModalOpen(false);
    toast.success(`Extended test duration by +${extendMinutes} minutes for all participants.`);
  };

  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return;
    setBroadcastModalOpen(false);
    setBroadcastText("");
    toast.success("Broadcast message sent to all active student screens!");
  };

  const handleConfirmRemove = () => {
    if (!participantToRemove) return;
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantToRemove.id ? { ...p, status: "Removed" } : p))
    );
    setRemoveModalOpen(false);
    toast.error(`Removed participant "${participantToRemove.name}" from the test session.`);
  };

  const handleBulkRemove = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to remove ${selectedIds.length} selected participants?`)) {
      setParticipants((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: "Removed" } : p))
      );
      setSelectedIds([]);
      toast.error(`Bulk removed ${selectedIds.length} participants.`);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.college.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || p.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const onlineCount = participants.filter((p) => p.status !== "Removed").length;
  const warningCount = participants.filter((p) => p.tabSwitchCount >= 3 && p.status !== "Removed").length;
  const avgProgress = Math.round(
    participants.reduce((acc, p) => acc + p.progress, 0) / (participants.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Controls */}
      <Card className="p-6 bg-surface border border-border space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Test Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Radio className="w-4 h-4 animate-pulse text-cyan-400" /> Real-Time Live Test Panel
              </span>
              <Badge
                variant={
                  testStatus === "Live"
                    ? "live"
                    : testStatus === "Paused"
                    ? "accent"
                    : testStatus === "Completed"
                    ? "active"
                    : "outline"
                }
                className="font-mono"
              >
                {testStatus.toUpperCase()}
              </Badge>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
              {testTitle}
            </h1>
            <p className="text-xs text-text-muted font-mono">
              // TODO: Connected to WebSocket (ws://localhost:8080/ws/live-test-monitor)
            </p>
          </div>

          {/* Countdown & Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Clock Timer Display */}
            <div className="px-4 py-2.5 bg-surface-raised border border-border rounded-xl flex items-center gap-3 font-mono">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-[10px] text-text-muted block uppercase">Time Remaining</span>
                <span className="text-lg font-bold text-text-primary tracking-wider">
                  {formatTime(timerSeconds)}
                </span>
              </div>
            </div>

            {/* Start / Pause / Resume Controls */}
            {testStatus === "Scheduled" && (
              <Button variant="primary" size="sm" onClick={handleStartLive} className="bg-live text-black">
                <Play className="w-4 h-4" /> Start Live Test
              </Button>
            )}
            {testStatus === "Live" && (
              <Button variant="outline" size="sm" onClick={handlePause} className="border-amber-400/40 text-amber-300">
                <Pause className="w-4 h-4" /> Pause Test
              </Button>
            )}
            {testStatus === "Paused" && (
              <Button variant="primary" size="sm" onClick={handleResume}>
                <Play className="w-4 h-4" /> Resume Test
              </Button>
            )}

            {/* Broadcast Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBroadcastModalOpen(true)}
              className="border-cyan-400/40 text-cyan-300"
            >
              <MessageSquare className="w-4 h-4" /> Broadcast Msg
            </Button>

            {/* Extend Time */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExtendTimeModalOpen(true)}
            >
              <Clock className="w-4 h-4" /> Extend Time
            </Button>

            {/* End Test */}
            {testStatus !== "Completed" && testStatus !== "Cancelled" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndTest}
                className="text-danger hover:bg-danger-bg/50"
              >
                <StopCircle className="w-4 h-4" /> End Test
              </Button>
            )}
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-1">
            <span className="text-xs text-text-muted font-mono block">Participants Online</span>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-bold font-mono text-text-primary">
                {onlineCount} / {participants.length}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-1">
            <span className="text-xs text-text-muted font-mono block">Avg Completion</span>
            <div className="flex items-center gap-2">
              <Progress value={avgProgress} color="accent" className="w-16 h-2" />
              <span className="text-xl font-bold font-mono text-cyan-400">{avgProgress}%</span>
            </div>
          </div>

          <div className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-1">
            <span className="text-xs text-text-muted font-mono block">Tab Switch Warnings</span>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span className="text-xl font-bold font-mono text-amber-400">{warningCount} Flagged</span>
            </div>
          </div>

          <div className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-1">
            <span className="text-xs text-text-muted font-mono block">System Sync Status</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-live" />
              <span className="text-sm font-semibold font-mono text-live">100% Operational</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Participant Monitor Table Header & Search */}
      <Card className="p-4 bg-surface border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search participant name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-surface-raised border border-border rounded-lg text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400 w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-raised border border-border rounded-lg p-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="WARNING">WARNING (Tab Switches)</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="REMOVED">REMOVED</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleBulkRemove} className="text-xs text-danger border-danger/40">
              <UserX className="w-3.5 h-3.5" /> Remove Selected ({selectedIds.length})
            </Button>
          )}
        </div>

        {/* Real-time Participant Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px]">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredParticipants.length && filteredParticipants.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filteredParticipants.map((p) => p.id));
                      else setSelectedIds([]);
                    }}
                    className="rounded border-border text-cyan-400"
                  />
                </th>
                <th className="p-3.5">Participant</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">College & Roll No</th>
                <th className="p-3.5">Progress %</th>
                <th className="p-3.5">Time Left</th>
                <th className="p-3.5">Tab Switches</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredParticipants.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} className={`hover:bg-surface-raised/40 transition-colors ${isSelected ? "bg-cyan-400/5" : ""}`}>
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds((prev) => [...prev, p.id]);
                          else setSelectedIds((prev) => prev.filter((id) => id !== p.id));
                        }}
                        className="rounded border-border text-cyan-400"
                      />
                    </td>

                    <td className="p-3.5 font-semibold text-text-primary">
                      {p.name}
                    </td>

                    <td className="p-3.5">
                      <RoleBadge role={p.role} size="xs" />
                    </td>

                    <td className="p-3.5 text-text-secondary font-mono text-[11px]">
                      <span className="block text-text-primary font-sans">{p.college}</span>
                      <span className="text-text-muted">{p.rollNumber}</span>
                    </td>

                    <td className="p-3.5 w-44">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-text-muted">{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} color={p.progress >= 100 ? "live" : "accent"} className="h-1.5" />
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-cyan-400 font-semibold">
                      {formatTime(p.timeLeftSeconds)}
                    </td>

                    <td className="p-3.5 font-mono">
                      {p.tabSwitchCount > 0 ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${p.tabSwitchCount >= 3 ? "bg-danger-bg text-danger border border-danger/40 animate-pulse" : "bg-amber-500/10 text-amber-300"}`}>
                          ⚠️ {p.tabSwitchCount} switches
                        </span>
                      ) : (
                        <span className="text-text-muted text-[11px]">0 (Clean)</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant={
                          p.status === "Submitted"
                            ? "live"
                            : p.status === "Warning"
                            ? "danger"
                            : p.status === "Removed"
                            ? "outline"
                            : "active"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right">
                      {p.status !== "Removed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setParticipantToRemove(p);
                            setRemoveModalOpen(true);
                          }}
                          className="text-xs text-danger hover:bg-danger-bg/50 p-1.5"
                          title="Remove from test session"
                        >
                          <UserX className="w-3.5 h-3.5" /> Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* BROADCAST MESSAGE MODAL */}
      {broadcastModalOpen && (
        <Dialog
          isOpen={broadcastModalOpen}
          onClose={() => setBroadcastModalOpen(false)}
          title="Broadcast Message to All Live Participants"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setBroadcastModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSendBroadcast}>
                <Send className="w-3.5 h-3.5" /> Send Broadcast
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              This notice will immediately appear as a banner overlay on the screens of all active participants in this test.
            </p>
            <Input
              label="Broadcast Message"
              placeholder="e.g. Attention: 10 minutes remaining! Ensure all code solutions are compiled before submit."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
            />
          </div>
        </Dialog>
      )}

      {/* EXTEND TIME MODAL */}
      {extendTimeModalOpen && (
        <Dialog
          isOpen={extendTimeModalOpen}
          onClose={() => setExtendTimeModalOpen(false)}
          title="Extend Live Test Duration"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setExtendTimeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleExtendTime}>
                Apply +{extendMinutes} Mins
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <label className="text-xs font-medium text-text-secondary block">Select Extension Minutes</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setExtendMinutes(mins)}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                    extendMinutes === mins
                      ? "bg-cyan-400/20 border-cyan-400 text-cyan-300"
                      : "bg-surface-raised border-border text-text-secondary"
                  }`}
                >
                  +{mins} Mins
                </button>
              ))}
            </div>
          </div>
        </Dialog>
      )}

      {/* REMOVE PARTICIPANT CONFIRMATION MODAL */}
      {removeModalOpen && participantToRemove && (
        <Dialog
          isOpen={removeModalOpen}
          onClose={() => setRemoveModalOpen(false)}
          title={`Remove Participant: ${participantToRemove.name}`}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setRemoveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmRemove} className="bg-danger hover:bg-danger/80">
                Confirm Removal
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-danger-bg border border-danger/40 rounded-xl text-danger space-y-1">
              <span className="font-semibold block">⚠️ Confirm Participant Disqualification</span>
              <p className="text-[11px] leading-relaxed">
                This will immediately terminate the test session for <strong>{participantToRemove.name}</strong> ({participantToRemove.rollNumber}).
              </p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
