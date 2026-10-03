import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { RoleBadge } from "@/components/common/RoleBadge";
import { RowActions } from "@/components/common/RowActions";
import { useAdminStore, MasterStudent, isRegistrationNew } from "@/context/AdminStoreContext";
import { useAuth } from "@/context/AuthContext";
import { DeleteAccountDialog, isAccountProtected } from "@/components/admin/DeleteAccountDialog";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import {
  Search,
  Ban,
  CheckCircle2,
  Trash2,
  UserX,
  Eye,
  X,
  GraduationCap,
  Users,
  Filter,
  ArrowUpDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    students,
    toggleBlockUser,
    deleteStudent,
    bulkDeleteStudents,
    restoreStudent,
    restoreStudents,
    deactivateStudent,
  } = useAdminStore();

  const currentAdminEmail = user?.email || "admin@aiprep.com";

  // Search, Filters & Sorting
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"name" | "registeredAt" | "role">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination (5 or 10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection & Dialogs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUserDetail, setSelectedUserDetail] = useState<MasterStudent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<MasterStudent | null>(null);
  const [bulkStudentsToDelete, setBulkStudentsToDelete] = useState<MasterStudent[]>([]);
  const [skippedProtectedCount, setSkippedProtectedCount] = useState(0);

  // Filtered and Sorted Users list
  const filteredUsers = students
    .filter((u) => {
      const query = search.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.rollNumber.toLowerCase().includes(query) ||
        u.college.toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || u.role.toUpperCase() === roleFilter.toUpperCase();
      const matchesStatus = statusFilter === "ALL" || u.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  // Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const eligiblePaginatedUsers = paginatedUsers.filter((u) => !isAccountProtected(u, currentAdminEmail));
  const allEligibleSelected =
    eligiblePaginatedUsers.length > 0 &&
    eligiblePaginatedUsers.every((u) => selectedIds.includes(u.id));

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const eligibleIds = eligiblePaginatedUsers.map((u) => u.id);
      const skipped = paginatedUsers.length - eligiblePaginatedUsers.length;
      setSkippedProtectedCount(skipped);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...eligibleIds])));
      if (skipped > 0) {
        toast.info(`${skipped} protected account${skipped > 1 ? "s were" : " was"} skipped from selection.`);
      }
    } else {
      const pageIds = paginatedUsers.map((u) => u.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      setSkippedProtectedCount(0);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Single User Remove Trigger
  const handleOpenDeleteSingle = (usr: MasterStudent) => {
    if (isAccountProtected(usr, currentAdminEmail)) {
      toast.error("Admin and demo accounts cannot be deleted.");
      return;
    }
    setStudentToDelete(usr);
    setBulkStudentsToDelete([]);
    setDeleteDialogOpen(true);
  };

  // Bulk Remove Trigger
  const handleOpenBulkDelete = () => {
    const targets = students.filter((u) => selectedIds.includes(u.id) && !isAccountProtected(u, currentAdminEmail));
    if (targets.length === 0) {
      toast.error("No eligible non-protected accounts selected for deletion.");
      return;
    }
    setStudentToDelete(null);
    setBulkStudentsToDelete(targets);
    setDeleteDialogOpen(true);
  };

  const handleDeactivateSelected = () => {
    const targetIds = selectedIds.filter((id) => {
      const s = students.find((item) => item.id === id);
      return s && !isAccountProtected(s, currentAdminEmail);
    });
    if (targetIds.length === 0) return;

    targetIds.forEach((id) => deactivateStudent(id));
    toast.success(`Deactivated ${targetIds.length} user account(s).`);
    setSelectedIds([]);
  };

  const handleDeleteSuccess = (deletedList: MasterStudent[]) => {
    const count = deletedList.length;
    setSelectedIds((prev) => prev.filter((id) => !deletedList.some((d) => d.id === id)));

    toast.custom(
      (t) => (
        <div className="flex items-center justify-between gap-4 p-4 bg-surface-raised border border-cyan-500/40 rounded-xl shadow-2xl text-text-primary text-xs font-mono max-w-md w-full">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {count === 1
                ? `Removed account "${deletedList[0].name}".`
                : `Removed ${count} user accounts.`}
            </span>
          </div>
          <button
            onClick={() => {
              if (count === 1) {
                restoreStudent(deletedList[0]);
              } else {
                restoreStudents(deletedList);
              }
              toast.dismiss(t);
              toast.success(
                `Restored ${count === 1 ? deletedList[0].name : `${count} accounts`} successfully.`
              );
            }}
            className="px-3 py-1.5 bg-cyan-400 text-slate-950 font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        </div>
      ),
      { duration: 8000 }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-semibold">
              Admin Governance
            </span>
            <Badge variant="accent" className="text-[10px] font-mono">
              Unified User Store
            </Badge>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
            Manage Users & Participants
          </h2>
          <p className="text-xs text-text-secondary">
            View, filter, role-tag, block, or remove registered platform students and administrators.
          </p>
        </div>
      </div>

      {/* FILTER & TOOLBAR CARD */}
      <Card className="p-4 bg-surface border border-border shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search candidate name, email, college..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Roles (Student / Admin)</option>
              <option value="STUDENT">STUDENT Only</option>
              <option value="ADMIN">ADMIN Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          {/* Sort Control */}
          <div>
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-") as [any, any];
                setSortField(field);
                setSortOrder(order);
              }}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="registeredAt-desc">Sort: Newest Registration</option>
              <option value="role-asc">Sort: Role (Admin First)</option>
            </select>
          </div>
        </div>

        {/* BULK SELECTION ACTIONS BAR */}
        {selectedIds.length > 0 && (
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClearSelection={() => {
              setSelectedIds([]);
              setSkippedProtectedCount(0);
            }}
            onDeleteSelected={handleOpenBulkDelete}
            onDeactivateSelected={handleDeactivateSelected}
            skippedProtectedCount={skippedProtectedCount}
            entityName="users"
          />
        )}
      </Card>

      {/* PARTICIPANTS LIST TABLE */}
      <Card className="p-0 overflow-hidden bg-surface border-border shadow-soft">
        {paginatedUsers.length === 0 ? (
          /* EMPTY STATE ILLUSTRATION */
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-surface-raised border border-border rounded-full flex items-center justify-center mx-auto text-text-muted">
              <Users className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-semibold text-text-primary">No User Participants Found</h3>
              <p className="text-xs text-text-muted font-mono">No registered users match your search or filter options.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={allEligibleSelected}
                      onChange={handleToggleSelectAll}
                      title={
                        skippedProtectedCount > 0
                          ? `${skippedProtectedCount} protected accounts skipped`
                          : "Select all eligible rows"
                      }
                      className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                    />
                  </th>
                  <th className="p-4">Candidate & College</th>
                  <th className="p-4">Role Badge</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 whitespace-nowrap">Registration Date</th>
                  <th className="p-4 whitespace-nowrap">Profile Completion</th>
                  <th className="p-4 text-right w-[200px] min-w-[200px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.map((usr) => {
                  const isNew = isRegistrationNew(usr.registeredAt);
                  const isSelected = selectedIds.includes(usr.id);
                  const isProtected = isAccountProtected(usr, currentAdminEmail);

                  return (
                    <tr
                      key={usr.id}
                      onClick={() => setSelectedUserDetail(usr)}
                      className={`hover:bg-surface-raised/60 transition-colors cursor-pointer ${
                        isSelected ? "bg-cyan-400/5" : ""
                      }`}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isProtected}
                          onChange={() => handleToggleSelectOne(usr.id)}
                          title={isProtected ? "Admin and demo accounts cannot be selected" : "Select row"}
                          className={`rounded border-border text-cyan-400 focus:ring-cyan-400 ${
                            isProtected ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text-primary">{usr.name}</span>
                          {isNew && (
                            <Badge variant="accent" className="text-[9px] font-mono px-1.5 py-0.2 animate-pulse">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted font-mono">{usr.email}</div>
                        <div className="text-[10px] text-text-muted">{usr.college}</div>
                      </td>

                      {/* Role Badge Column */}
                      <td className="p-4">
                        <RoleBadge role={usr.role} size="sm" />
                      </td>

                      <td className="p-4">
                        <Badge variant={usr.status === "ACTIVE" ? "active" : usr.status === "BLOCKED" ? "blocked" : "medium"}>
                          {usr.status}
                        </Badge>
                      </td>

                      <td className="p-4 font-mono text-text-muted">
                        {new Date(usr.registeredAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 font-mono">
                        <span className="text-cyan-400 font-bold">{usr.profileCompletion || 85}%</span>
                      </td>

                      <td className="p-4 text-right w-[200px] min-w-[200px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <RowActions>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/students/${usr.id}`)}
                            title="View Student Progress Details"
                            aria-label={`View Student Progress Details for ${usr.name}`}
                            className="h-9 px-2.5 inline-flex items-center gap-1.5 text-cyan-400 hover:bg-cyan-500/10 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors shrink-0"
                          >
                            <GraduationCap className="w-4 h-4 shrink-0" />
                            <span className="hidden xl:inline text-xs">Progress</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isProtected}
                            onClick={() => toggleBlockUser(usr.id)}
                            title={isProtected ? "Admin cannot be blocked" : usr.status === "ACTIVE" ? "Block Candidate" : "Unblock Candidate"}
                            aria-label={usr.status === "ACTIVE" ? "Block Candidate" : "Unblock Candidate"}
                            className="h-9 px-2.5 inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {usr.status === "ACTIVE" ? (
                              <>
                                <Ban className="w-4 h-4 text-danger shrink-0" />
                                <span className="hidden xl:inline text-xs text-danger">Block</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-live shrink-0" />
                                <span className="hidden xl:inline text-xs text-live">Unblock</span>
                              </>
                            )}
                          </Button>

                          {isProtected ? (
                            <span title="Admin accounts cannot be deleted.">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                className="h-9 px-2.5 inline-flex items-center gap-1.5 opacity-40 cursor-not-allowed text-text-muted shrink-0"
                                aria-label="Admin accounts cannot be deleted"
                              >
                                <Trash2 className="w-4 h-4 shrink-0" />
                                <span className="hidden xl:inline text-xs">Delete</span>
                              </Button>
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeleteSingle(usr)}
                              title={`Delete account for ${usr.name}`}
                              aria-label={`Delete account for ${usr.name}`}
                              className="h-9 px-2.5 inline-flex items-center gap-1.5 text-danger hover:bg-danger-bg/50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4 shrink-0" />
                              <span className="hidden xl:inline text-xs">Delete</span>
                            </Button>
                          )}
                        </RowActions>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">
              Page {currentPage} of {totalPages} ({filteredUsers.length} total candidates)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="text-xs py-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="text-xs py-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* USER DETAIL DIALOG */}
      {selectedUserDetail && (
        <Dialog
          isOpen={!!selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
          title={`Candidate Profile: ${selectedUserDetail.name}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-2">
              <div className="flex justify-between items-center border-b border-border pb-1.5">
                <span className="text-text-muted">Full Name:</span>
                <span className="text-text-primary font-bold">{selectedUserDetail.name}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-1.5">
                <span className="text-text-muted">Assigned Role:</span>
                <RoleBadge role={selectedUserDetail.role} size="sm" />
              </div>

              <div className="flex justify-between items-center border-b border-border pb-1.5">
                <span className="text-text-muted">Email Address:</span>
                <span className="text-cyan-400">{selectedUserDetail.email}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-1.5">
                <span className="text-text-muted">College / Institution:</span>
                <span className="text-text-primary font-sans">{selectedUserDetail.college}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-1.5">
                <span className="text-text-muted">Roll / Reg Number:</span>
                <span className="text-text-primary">{selectedUserDetail.rollNumber}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-muted">Verification Status:</span>
                <Badge variant={selectedUserDetail.verificationStatus === "Verified" ? "active" : "medium"}>
                  {selectedUserDetail.verificationStatus}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={selectedUserDetail.status === "ACTIVE" ? "danger" : "teal-cyan"}
                size="sm"
                className="flex-1"
                disabled={isAccountProtected(selectedUserDetail, currentAdminEmail)}
                onClick={() => {
                  toggleBlockUser(selectedUserDetail.id);
                  setSelectedUserDetail(null);
                }}
              >
                {selectedUserDetail.status === "ACTIVE" ? "Block Candidate" : "Unblock Candidate"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* SHARED DELETE ACCOUNT CONFIRMATION DIALOG */}
      <DeleteAccountDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setStudentToDelete(null);
          setBulkStudentsToDelete([]);
        }}
        studentToDelete={studentToDelete}
        bulkStudentsToDelete={bulkStudentsToDelete}
        onSuccess={handleDeleteSuccess}
        currentAdminEmail={currentAdminEmail}
      />
    </div>
  );
};
