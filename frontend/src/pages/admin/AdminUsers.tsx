import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { AdminUser } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { Search, ShieldAlert, Trash2, Ban, CheckCircle2, UserX, Eye, X, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    adminService.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleToggleBlock = async (usr: AdminUser) => {
    setActionLoading(true);
    try {
      const updated = await adminService.toggleBlockUser(usr.id);
      setUsers((prev) => prev.map((u) => (u.id === usr.id ? updated : u)));
      toast.success(`User ${updated.email} is now ${updated.status}.`);
      if (selectedUserDetail?.id === usr.id) {
        setSelectedUserDetail(updated);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminService.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`Deleted user account ${deleteTarget.email}`);
      setDeleteTarget(null);
      if (selectedUserDetail?.id === deleteTarget.id) {
        setSelectedUserDetail(null);
      }
    } catch (e: any) {
      toast.error("Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">User Management</h2>
          <p className="text-xs text-text-secondary">View registered students and administrators, modify statuses, or inspect user details.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 bg-surface-raised">Candidate</th>
                <th className="p-4 bg-surface-raised">Assigned Role</th>
                <th className="p-4 bg-surface-raised">Status</th>
                <th className="p-4 bg-surface-raised">Joined Date</th>
                <th className="p-4 bg-surface-raised">Completed Mocks</th>
                <th className="p-4 bg-surface-raised text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((usr) => (
                <tr
                  key={usr.id}
                  onClick={() => setSelectedUserDetail(usr)}
                  className="hover:bg-surface-raised/60 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <div className="font-semibold text-text-primary">{usr.name}</div>
                    <div className="text-[11px] text-text-muted font-mono">{usr.email}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={usr.role === "ADMIN" ? "admin" : "student"}>
                      {usr.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={usr.status === "ACTIVE" ? "active" : "blocked"}>
                      {usr.status}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono text-text-muted">{usr.joinedDate}</td>
                  <td className="p-4 font-mono text-text-secondary">{usr.interviewsCompleted} Mocks</td>
                  <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/students/${usr.id}`)}
                      title="View Student Progress Details"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUserDetail(usr)}
                      title="Inspect User Details"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    </Button>
                    <Button
                      variant={usr.status === "ACTIVE" ? "ghost" : "teal-cyan"}
                      size="sm"
                      onClick={() => handleToggleBlock(usr)}
                      disabled={actionLoading}
                    >
                      {usr.status === "ACTIVE" ? <Ban className="w-3.5 h-3.5 text-danger" /> : <CheckCircle2 className="w-3.5 h-3.5 text-live" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(usr)}
                      disabled={actionLoading}
                      className="text-danger hover:bg-danger-bg/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-over Side Panel for User Details */}
      {selectedUserDetail && (
        <Dialog
          isOpen={!!selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
          title={`Candidate Details: ${selectedUserDetail.name}`}
          description={`Registered user ID: ${selectedUserDetail.id}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Email Address:</span>
                <span className="text-text-primary font-bold">{selectedUserDetail.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Account Role:</span>
                <Badge variant={selectedUserDetail.role === "ADMIN" ? "admin" : "student"}>{selectedUserDetail.role}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <Badge variant={selectedUserDetail.status === "ACTIVE" ? "active" : "blocked"}>{selectedUserDetail.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Last Active:</span>
                <span className="text-cyan-400">{selectedUserDetail.lastActive}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant={selectedUserDetail.status === "ACTIVE" ? "danger" : "teal-cyan"}
                size="sm"
                className="w-full"
                onClick={() => handleToggleBlock(selectedUserDetail)}
              >
                {selectedUserDetail.status === "ACTIVE" ? "Block Candidate" : "Unblock Candidate"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete User Account?"
          message={`Are you sure you want to permanently delete ${deleteTarget.name} (${deleteTarget.email})?`}
          confirmText="Delete Account"
          isDanger={true}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};
