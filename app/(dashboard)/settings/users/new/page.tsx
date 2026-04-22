"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDags } from "@/hooks/useDags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Search, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewUserPage() {
  const router = useRouter();
  const { data: dagsData } = useDags({ limit: -1 });
  
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDags, setSelectedDags] = useState<string[]>([]);
  const [dagSearch, setDagSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique tags
  const availableTags = Array.from(
    new Set(dagsData?.dags.flatMap(dag => dag.tags?.map(t => t.name.trim()) || []) || [])
  ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const filteredDags = dagsData?.dags.filter(dag => {
    const searchLower = dagSearch.toLowerCase();
    const matchesSearch = 
      dag.dag_id.toLowerCase().includes(searchLower) || 
      dag.tags?.some(t => t.name.toLowerCase().includes(searchLower));
    
    const matchesTag = !selectedTag || dag.tags?.some(t => t.name.trim() === selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || selectedDags.length === 0) {
      toast.error("Please fill all fields and select at least one DAG");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role: "user",
          allowedDags: selectedDags,
        }),
      });

      if (response.ok) {
        toast.success("User created successfully");
        router.push("/settings/users");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create user");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDagSelection = (dagId: string) => {
    setSelectedDags(prev => 
      prev.includes(dagId) ? prev.filter(id => id !== dagId) : [...prev, dagId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/settings/users" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
          <p className="text-muted-foreground">Define credentials and assign accessible workflows.</p>
        </div>
      </div>

      <form onSubmit={handleCreateUser}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Primary identification for the new user.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="e.g. operators_team"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Workflow Permissions</CardTitle>
                <CardDescription>Select which DAGs this user is allowed to monitor.</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{selectedDags.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Selected</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Filter by DAG ID..." 
                      className="pl-9 bg-white dark:bg-slate-950"
                      value={dagSearch}
                      onChange={e => setDagSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Filter by Tag</label>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 border rounded bg-white dark:bg-slate-950 no-scrollbar">
                    <Button 
                      type="button"
                      variant={selectedTag === null ? "default" : "outline"} 
                      size="sm"
                      className="h-7 px-2 text-[10px]"
                      onClick={() => setSelectedTag(null)}
                    >
                      All
                    </Button>
                    {availableTags.map(tag => (
                      <Button 
                        key={tag}
                        type="button"
                        variant={selectedTag === tag ? "default" : "outline"} 
                        size="sm"
                        className="h-7 px-2 text-[10px]"
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDags?.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p>No DAGs match your current filter</p>
                  </div>
                ) : (
                  filteredDags?.map(dag => (
                    <div 
                      key={dag.dag_id}
                      onClick={() => toggleDagSelection(dag.dag_id)}
                      className={`group relative flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedDags.includes(dag.dag_id) 
                          ? 'bg-primary/5 border-primary shadow-sm' 
                          : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold font-mono truncate mr-2 ${selectedDags.includes(dag.dag_id) ? 'text-primary' : ''}`}>
                          {dag.dag_id}
                        </span>
                        {selectedDags.includes(dag.dag_id) ? (
                          <div className="h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-primary/50" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {dag.tags?.map(t => (
                          <span key={t.name} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1 rounded">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t justify-between py-4">
              <div className="text-sm text-muted-foreground italic">
                Showing {filteredDags?.length || 0} worklows
              </div>
              <div className="flex gap-3">
                <Button variant="outline" render={<Link href="/settings/users" />}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User Account"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
