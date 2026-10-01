import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Users, Video, Calendar, Plus, Link as LinkIcon, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export interface PeerRequest {
  id: string;
  studentName: string;
  targetRole: string;
  slotTime: string;
  meetingLink?: string;
  status: "OPEN" | "MATCHED";
}

export interface PeerMockMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PeerMockMatchingModal: React.FC<PeerMockMatchingModalProps> = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState<PeerRequest[]>([
    { id: "pr-1", studentName: "Ananya Sharma", targetRole: "Frontend Engineer", slotTime: "Today at 5:00 PM", status: "OPEN" },
    { id: "pr-2", studentName: "Rohan Gupta", targetRole: "Full Stack Developer", slotTime: "Tomorrow at 2:00 PM", status: "OPEN" },
  ]);

  const [newRole, setNewRole] = useState("Frontend Engineer");
  const [newTime, setNewTime] = useState("Today at 7:00 PM");
  const [meetingUrlInput, setMeetingUrlInput] = useState("");
  const [matchingTargetId, setMatchingTargetId] = useState<string | null>(null);

  const handleCreateRequest = () => {
    const newReq: PeerRequest = {
      id: `pr-${Date.now()}`,
      studentName: "You",
      targetRole: newRole,
      slotTime: newTime,
      status: "OPEN",
    };
    setRequests([newReq, ...requests]);
    toast.success("Peer Mock Request created!");
  };

  const handleAcceptRequest = (id: string) => {
    if (!meetingUrlInput.trim()) {
      toast.error("Please enter a meeting link (Google Meet / Zoom).");
      return;
    }
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, status: "MATCHED", meetingLink: meetingUrlInput.trim() };
        }
        return r;
      })
    );
    toast.success("Peer Mock Matched! Meeting details shared.");
    setMatchingTargetId(null);
    setMeetingUrlInput("");
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Peer Mock Interview Matching" description="Opt in to practice 1-on-1 live mock interviews with fellow candidates.">
      <div className="space-y-6 text-xs max-h-[80vh] overflow-y-auto pr-1 font-sans">
        {/* Create Request Panel */}
        <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
          <span className="font-semibold text-text-primary block text-sm">Post a New Peer Mock Request</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Target Role (e.g. Frontend Engineer)"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="text-xs"
            />
            <Input
              placeholder="Time Slot (e.g. Today at 7:00 PM)"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="text-xs"
            />
          </div>
          <Button variant="teal-cyan" size="sm" onClick={handleCreateRequest} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Post Open Request
          </Button>
        </div>

        {/* Open Requests List */}
        <div className="space-y-3">
          <span className="font-mono text-cyan-400 uppercase text-[11px] font-bold block">Open Peer Partner Requests:</span>
          {requests.map((req) => (
            <Card key={req.id} className="p-4 bg-surface border-border space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{req.studentName}</span>
                  <Badge variant="accent" className="text-[10px]">{req.targetRole}</Badge>
                </div>
                <Badge variant={req.status === "MATCHED" ? "active" : "medium"}>{req.status}</Badge>
              </div>

              <div className="text-text-muted font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> {req.slotTime}
              </div>

              {req.status === "OPEN" ? (
                matchingTargetId === req.id ? (
                  <div className="pt-2 space-y-2 border-t border-border">
                    <Input
                      placeholder="Paste Google Meet / Zoom URL (e.g. https://meet.google.com/abc-defg-hij)"
                      value={meetingUrlInput}
                      onChange={(e) => setMeetingUrlInput(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <div className="flex gap-2">
                      <Button variant="teal-cyan" size="sm" onClick={() => handleAcceptRequest(req.id)}>
                        Confirm & Share Link
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setMatchingTargetId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setMatchingTargetId(req.id)} className="text-xs gap-1 mt-1">
                    <Video className="w-3.5 h-3.5 text-cyan-400" /> Accept & Schedule
                  </Button>
                )
              ) : (
                <div className="p-2.5 bg-live/10 border border-live/30 rounded-lg text-live font-mono text-[11px] flex items-center justify-between">
                  <span>Meeting Link: {req.meetingLink}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(req.meetingLink || "");
                      toast.success("Meeting link copied!");
                    }}
                    className="p-1 h-auto text-live"
                  >
                    Copy
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Dialog>
  );
};
