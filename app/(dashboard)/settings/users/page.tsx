"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDags } from "@/hooks/useDags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Shield, Check, X, ShieldAlert, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function UserManagementPage() {
  const { data: session } = useSession();
  const { data: dagsData } = useDags({ limit: 1000 }); // Get all DAGs for selection
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedDags, setSelectedDags] = useState<string[]>([]);
  const [dagSearch, setDagSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  if ((session?.user as any)?.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Only superadmins can manage users.</p>
      </div>
    );
  }

  // Extract unique tags from DAGs
  const availableTags = Array.from(
    new Set(dagsData?.dags.flatMap(dag => dag.tags?.map(t => t.name) || []) || [])
  ).sort();

  const filteredDagsForSelection = dagsData?.dags.filter(dag => {
    const matchesSearch = dag.dag_id.toLowerCase().includes(dagSearch.toLowerCase());
    const matchesTag = !selectedTag || dag.tags?.some(t => t.name === selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAddUser = async () => {
    if (!newUsername || !newPassword || selectedDags.length === 0) {
      toast.error("Please fill all fields and select at least one DAG");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: "user",
          allowedDags: selectedDags,
        }),
      });

      if (response.ok) {
        toast.success("User added successfully");
        setIsAddOpen(false);
        fetchUsers();
        setNewUsername("");
        setNewPassword("");
        setSelectedDags([]);
        setDagSearch("");
        setSelectedTag(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add user");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const toggleDagSelection = (dagId: string) => {
    setSelectedDags(prev => 
      prev.includes(dagId) ? prev.filter(id => id !== dagId) : [...prev, dagId]
    );
  };

  const selectAllFiltered = () => {
    if (!filteredDagsForSelection) return;
    const filteredIds = filteredDagsForSelection.map(d => d.dag_id);
    setSelectedDags(prev => Array.from(new Set([...prev, ...filteredIds])));
  };

  const deselectAllFiltered = () => {
    if (!filteredDagsForSelection) return;
    const filteredIds = filteredDagsForSelection.map(d => d.dag_id);
    setSelectedDags(prev => prev.filter(id => !filteredIds.includes(id)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users and their DAG permissions.</p>
        </div>
        <Button render={<Link href="/settings/users/new" />}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All registered users and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Allowed DAGs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center">No users found.</TableCell></TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {user.role === 'superadmin' ? (
                          <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                            <Shield className="h-3 w-3" /> SUPERADMIN
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            USER
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.allowedDags.includes('*') ? (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded italic">ALL DAGS</span>
                        ) : (
                          user.allowedDags.slice(0, 3).map((dag: string) => (
                            <span key={dag} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]">
                              {dag}
                            </span>
                          ))
                        )}
                        {user.allowedDags.length > 3 && !user.allowedDags.includes('*') && (
                          <span className="text-[10px] text-muted-foreground">+{user.allowedDags.length - 3} more</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
