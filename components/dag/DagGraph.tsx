
"use client";

import { useEffect, useState, useRef } from "react";
import { DagStatusBadge } from "./DagStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface Task {
  task_id: string;
  downstream_task_ids: string[];
  operator: string;
}

interface TaskInstance {
  task_id: string;
  state: string;
}

interface DagGraphProps {
  dagId: string;
  runId: string;
  taskInstances: TaskInstance[];
}

export function DagGraph({ dagId, runId, taskInstances }: DagGraphProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [connections, setConnections] = useState<any[]>([]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/dags/${dagId}/tasks`);
      const data = await resp.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [dagId]);

  // Handle centering and connection line calculation
  useEffect(() => {
    if (tasks.length > 0 && !isLoading && containerRef.current) {
      const timer = setTimeout(() => {
        // 1. Calculate connections
        const newConnections: any[] = [];
        tasks.forEach(task => {
          task.downstream_task_ids.forEach(childId => {
            newConnections.push({ fromId: task.task_id, toId: childId });
          });
        });
        setConnections(newConnections);

        // 2. Initial Center Position
        const graphEl = containerRef.current;
        const viewportEl = graphEl?.parentElement?.parentElement;
        
        if (graphEl && viewportEl) {
          const cardWidth = viewportEl.clientWidth;
          const cardHeight = viewportEl.clientHeight;
          const graphWidth = graphEl.offsetWidth * scale;
          const graphHeight = graphEl.offsetHeight * scale;

          setPosition({
            x: (cardWidth - graphWidth) / 2,
            y: (cardHeight - graphHeight) / 2
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tasks, isLoading, scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(s => Math.max(0.1, Math.min(2, s * delta)));
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  // Simple layout logic
  const levels: { [key: string]: number } = {};
  const tasksById: { [key: string]: Task } = {};
  tasks.forEach(t => tasksById[t.task_id] = t);

  function calculateLevels(taskId: string, depth: number) {
    levels[taskId] = Math.max(levels[taskId] || 0, depth);
    tasksById[taskId]?.downstream_task_ids.forEach(childId => {
      calculateLevels(childId, depth + 1);
    });
  }

  const allChildren = new Set(tasks.flatMap(t => t.downstream_task_ids));
  const roots = tasks.filter(t => !allChildren.has(t.task_id));
  roots.forEach(root => calculateLevels(root.task_id, 0));

  const maxLevel = Math.max(...Object.values(levels), 0);
  const tasksByLevel: Task[][] = Array.from({ length: maxLevel + 1 }, () => []);
  tasks.forEach(task => {
    const level = levels[task.task_id] || 0;
    tasksByLevel[level].push(task);
  });

  return (
    <Card className="w-full overflow-hidden border-none shadow-2xl bg-slate-950/5 dark:bg-slate-900/10 backdrop-blur-md relative h-[650px] group cursor-grab active:cursor-grabbing">
      <CardHeader className="py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl z-30 relative mr-[-1px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2 rounded-lg">
              <RefreshCw className={`h-4 w-4 text-primary ${isLoading ? 'animate-spin' : ''}`} onClick={fetchTasks} />
            </div>
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Directed Acyclic Graph</CardTitle>
              <p className="text-[10px] text-slate-400">Zoom with Ctrl + Scroll • Drag to pan</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Success
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Failed
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)] animate-pulse" /> Running
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Zoom:</span>
              <span className="text-primary font-mono">{Math.round(scale * 100)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent 
        className="p-0 overflow-hidden relative h-[calc(650px-72px)] select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
          className="absolute inset-0 transition-transform duration-75 ease-out origin-center"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 text-slate-400">
                <RefreshCw className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">No system graph data</p>
              <p className="text-sm opacity-60">Try refreshing or verify the DAG configuration</p>
            </div>
          ) : (
            <div ref={containerRef} className="inline-flex gap-40 min-h-[400px] items-center p-40 relative">
              {/* SVG Link Layer */}
              <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-slate-300 dark:text-slate-700" />
                  </marker>
                </defs>
                {connections.map((conn, idx) => (
                  <ConnectionLine key={`${conn.fromId}-${conn.toId}`} fromId={conn.fromId} toId={conn.toId} />
                ))}
              </svg>

              {tasksByLevel.map((levelTasks, i) => (
                <div key={i} className="flex flex-col gap-16 relative z-10">
                  {levelTasks.map(task => {
                    const instance = taskInstances.find(ti => ti.task_id === task.task_id);
                    const state = instance?.state || 'none';
                    
                    return (
                      <div 
                        key={task.task_id} 
                        id={`task-${task.task_id}`}
                        className={`
                          relative flex flex-col p-5 rounded-2xl border-t border-white/20 shadow-2xl min-w-[220px] max-w-[280px]
                          transition-all duration-300 hover:z-50 ring-1 ring-black/5
                          ${state === 'success' ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 border-emerald-500/30' : 
                            state === 'failed' ? 'bg-gradient-to-br from-rose-500/10 to-rose-600/20 border-rose-500/30' :
                            state === 'running' ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/30' :
                            'bg-background border-border'}
                        `}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <DagStatusBadge status={state} />
                          <span className="text-[10px] font-mono text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                            {task.operator?.split('.').pop() || 'Task'}
                          </span>
                        </div>
                        <div className="text-sm font-bold truncate mb-6" title={task.task_id}>
                          {task.task_id}
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Type</span>
                          <span className="text-[11px] font-mono text-slate-500 truncate max-w-[120px]">{task.operator}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="gridLarge" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridLarge)" />
          </svg>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-white/10">
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500" title="Zoom In">
            <span className="text-lg font-bold">+</span>
          </button>
          <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500" title="Zoom Out">
            <span className="text-lg font-bold">−</span>
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
          <button 
            onClick={() => {
              const graphEl = containerRef.current;
              const viewportEl = graphEl?.parentElement?.parentElement;
              if (graphEl && viewportEl) {
                const cardWidth = viewportEl.clientWidth;
                const cardHeight = viewportEl.clientHeight;
                const graphWidth = graphEl.offsetWidth * scale;
                const graphHeight = graphEl.offsetHeight * scale;
                setPosition({
                  x: (cardWidth - graphWidth) / 2,
                  y: (cardHeight - graphHeight) / 2
                });
              }
            }} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 text-[10px] font-bold px-3 tracking-tighter"
          >
            CENTER
          </button>
          <button onClick={() => { setScale(0.8); setPosition({x:0, y:0}); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 text-[10px] font-bold px-3 tracking-tighter">RESET</button>
        </div>
      </CardContent>
    </Card>
  );
}

// Subcomponent to handle the relative path drawing
function ConnectionLine({ fromId, toId }: { fromId: string, toId: string }) {
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    const updatePath = () => {
      const fromEl = document.getElementById(`task-${fromId}`);
      const toEl = document.getElementById(`task-${toId}`);
      
      if (fromEl && toEl) {
        // Use offsetLeft/Top which are stable regardless of zoom/scale
        // fromEl is child of levelDiv, levelDiv is child of container
        const fromLevelEl = fromEl.parentElement;
        const toLevelEl = toEl.parentElement;

        if (fromLevelEl && toLevelEl) {
          const x1 = fromEl.offsetLeft + fromLevelEl.offsetLeft + fromEl.offsetWidth;
          const y1 = fromEl.offsetTop + fromLevelEl.offsetTop + (fromEl.offsetHeight / 2);
          
          const x2 = toEl.offsetLeft + toLevelEl.offsetLeft;
          const y2 = toEl.offsetTop + toLevelEl.offsetTop + (toEl.offsetHeight / 2);

          const dx = x2 - x1;
          const curve = Math.min(100, Math.max(40, dx / 2));
          
          setPath(`M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`);
        }
      }
    };

    updatePath();
    window.addEventListener('resize', updatePath);
    return () => window.removeEventListener('resize', updatePath);
  }, [fromId, toId]);

  return (
    <path 
      d={path} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      className="text-slate-300 dark:text-slate-700 transition-all duration-300"
      markerEnd="url(#arrowhead)"
    />
  );
}
