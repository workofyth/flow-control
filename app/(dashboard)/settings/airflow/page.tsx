"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, User, Lock, Save, RefreshCw, Server } from "lucide-react";

export default function AirflowSettingsPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/airflow");
      const data = await res.json();
      setBaseUrl(data.baseUrl || "");
      setUsername(data.username || "");
      // Password is not returned for security
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = { baseUrl, username };
      if (password) payload.password = password;

      const res = await fetch("/api/settings/airflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Airflow settings updated successfully");
        setPassword(""); // Clear password field after save
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Server className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Airflow Configuration</h1>
          <p className="text-muted-foreground">Manage your connection to the Airflow instance</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
          <CardDescription>
            These credentials are used by the dashboard to fetch DAG and Run data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="baseUrl" className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Airflow Base URL
            </label>
            <Input
              id="baseUrl"
              placeholder="https://your-airflow.domain.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              disabled={isLoading}
              className="bg-background"
            />
            <p className="text-[10px] text-muted-foreground italic">
              Example: http://localhost:8080 or https://airflow.company.com
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Username
              </label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-background"
              />
              <p className="text-[10px] text-muted-foreground italic">
                Leave blank to keep existing password
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
          <Button variant="outline" onClick={fetchSettings} disabled={isLoading || isSaving}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Reload
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving} className="min-w-[120px]">
            {isSaving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Configuration
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-500">
            Security Note
          </CardTitle>
          <CardDescription className="text-rose-600/80 dark:text-rose-400">
            Connection settings are stored locally in the application data folder. Ensure your Airflow instance is accessible from this server and uses a secure connection (HTTPS) if possible.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
