import { getTrainingStatus, getTrainingTaskStatus } from "@/services/fastApi";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import Chart from 'chart.js/auto';
import type { ChartOptions } from 'chart.js';

interface TrainingChartProps {
    datasetId: string;
}

const TrainingChart: React.FC<TrainingChartProps> = ({ datasetId }) => {
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const chartRef = useRef<Chart | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { data: statusData, isLoading: isLoadingStatus } = useQuery({
        queryKey: ['training-status', datasetId],
        queryFn: async () => {
            const trainingInstance = await getTrainingStatus(datasetId);
            console.log('Training Instance:', trainingInstance);
            return trainingInstance;
        },
        refetchInterval: 5000,
    });

    const { data: currentTaskData, isLoading: isLoadingTask } = useQuery({
        queryKey: ['training-task', currentTaskId],
        queryFn: async () => {
            const task = await getTrainingTaskStatus(currentTaskId);
            console.log('Received task data', task);
            return task;
        },
        enabled: !!currentTaskId,
        refetchInterval: currentTaskId ? 3000 : false,
    });

    useEffect(() => {
        if (statusData?.subtasks) {
            console.log('Available subtasks:', statusData.subtasks); 
            const runningTask = Object.entries(statusData.subtasks).find(
                ([, task]) => task.status === 'IN_PROGRESS'
            );
            console.log('Found running task:', runningTask); 
            if (runningTask) {
                setCurrentTaskId(runningTask[0]);
            }
        }
    }, [statusData]);

    // Initialize and Update Chart
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const metrics = currentTaskData?.metrics_history || [];
        
        const chartOptions: ChartOptions<'line'> = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: 'bold',
                        },
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: (context) => `Epoch ${context[0].label}`,
                        label: (context) => {
                            const value = context.parsed.y;
                            return `${context.dataset.label}: ${value?.toFixed(4) || 'N/A'}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Epoch',
                        font: {
                            size: 14,
                            weight: 'bold',
                        },
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Score',
                        font: {
                            size: 14,
                            weight: 'bold',
                        },
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                    beginAtZero: true,
                    max: 1,
                },
            },
            elements: {
                point: {
                    hoverRadius: 8,
                },
            },
            animation: {
                duration: 500,
                easing: 'easeOutQuart',
            },
        };

        // Prepare chart data
        const chartData = {
            labels: metrics.map(m => `${m.epoch}`),
            datasets: [
                {
                    label: 'mAP50',
                    data: metrics.map(m => m['metrics/mAP50(B)'] ?? null),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.4,
                    fill: false,
                },
                {
                    label: 'Precision',
                    data: metrics.map(m => m['metrics/precision(B)'] ?? null),
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#F59E0B',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.4,
                    fill: false,
                },
                {
                    label: 'Recall',
                    data: metrics.map(m => m['metrics/recall(B)'] ?? null),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#EF4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.4,
                    fill: false,
                }
            ],
        };

        // Create chart with data
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions,
        });

        console.log('Chart created/updated with', metrics.length, 'data points');

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [currentTaskData?.metrics_history]);



    const chartConfig = {
        "metrics/mAP50(B)": {
            label: "mAP50",
            color: "#2563EB",
        },
        "metrics/precision(B)": {
            label: "Precision",
            color: "#EA580C",
        },
        "metrics/recall(B)": {
            label: "Recall",
            color: "#DC2626",
        }
    };

    if (isLoadingStatus) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-60">
                    <p className="text-gray-500">Loading training status...</p>
                </CardContent>
            </Card>
        );
    }

    if (!statusData) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-60">
                    <p className="text-gray-500">No training data available</p>
                </CardContent>
            </Card>
        );
    }

    // Categorize tasks
    const tasks = statusData.subtasks ? Object.entries(statusData.subtasks) : [];
    const completedTasks = tasks.filter(([, task]) => task.status === 'COMPLETED');
    const inProgressTasks = tasks.filter(([, task]) => task.status === 'IN_PROGRESS');
    const pendingTasks = tasks.filter(([, task]) => task.status === 'QUEUED');

    const getStatusBadge = (status: string) => {
        const variants = {
            'COMPLETED': 'bg-green-100 text-green-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'QUEUED': 'bg-yellow-100 text-yellow-800',
            'FAILED': 'bg-red-100 text-red-800'
        };
        return variants[status] || 'bg-gray-100 text-gray-800';
    };

    const TaskList = ({ title, tasks, showProgress = false }) => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    {title}
                    <Badge variant="secondary">{tasks.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {tasks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tasks</p>
                ) : (
                    <div className="space-y-3">
                        {tasks.map(([taskId, task]) => (
                            <div key={taskId} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{taskId}</span>
                                        <Badge className={getStatusBadge(task.status)}>
                                            {task.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Queue position: {task.queue_position + 1}
                                    </p>
                                    {showProgress && task.progress && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Progress</span>
                                                <span>{task.progress}%</span>
                                            </div>
                                            <Progress value={task.progress} className="h-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Overall Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Training Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Overall Progress</span>
                            <span>{statusData.progress * 100}%</span>
                        </div>
                        <Progress value={statusData.progress * 100} className="w-full" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</p>
                            <p className="text-sm text-gray-600">In Progress</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</p>
                            <p className="text-sm text-gray-600">Queued</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Current Task Progress and Metrics */}
            {currentTaskData && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Current Task Progress
                                <Badge variant={isLoadingTask ? 'secondary' : 'default'}>
                                    {isLoadingTask ? 'Updating...' : 'Live'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                                {[
                                    { key: 'current_epoch', label: 'Current Epoch', color: 'text-blue-600' },
                                    { key: 'total_epochs', label: 'Total Epochs', color: 'text-green-600' },
                                    { 
                                        key: 'metrics/mAP50(B)', 
                                        label: 'mAP50', 
                                        color: 'text-blue-600',
                                        format: (val: number) => val?.toFixed(3) ?? '0.000'
                                    },
                                    { 
                                        key: 'metrics/precision(B)', 
                                        label: 'Precision', 
                                        color: 'text-orange-600',
                                        format: (val: number) => val?.toFixed(3) ?? '0.000'
                                    },
                                    { 
                                        key: 'metrics/recall(B)', 
                                        label: 'Recall', 
                                        color: 'text-red-600',
                                        format: (val: number) => val?.toFixed(3) ?? '0.000'
                                    },
                                    { 
                                        key: 'train/box_loss', 
                                        label: 'Train Box Loss', 
                                        color: 'text-yellow-600',
                                        format: (val: number) => val?.toFixed(3) ?? '0.000'
                                    },
                                    { 
                                        key: 'val/box_loss', 
                                        label: 'Validation Box Loss', 
                                        color: 'text-purple-600',
                                        format: (val: number) => val?.toFixed(3) ?? '0.000'
                                    },
                                ].map(({ key, label, color, format = (val) => val ?? 'N/A' }) => (
                                    <div key={key} className="text-center">
                                        <p className={`text-2xl font-bold ${color}`}>
                                            {format(currentTaskData[key] ?? currentTaskData.current_metrics?.[key])}
                                        </p>
                                        <p className="text-sm text-gray-600">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Training Metrics Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Training Metrics Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative h-[500px] w-full">
                                {currentTaskData?.metrics_history?.length ? (
                                    <canvas 
                                        ref={canvasRef} 
                                        className="w-full h-full"
                                        style={{ display: 'block' }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-gray-500 text-lg">
                                            {currentTaskData?.current_epoch === 0
                                                ? "⌛ Waiting for first epoch to complete..."
                                                : "No metrics data available"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Task Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TaskList title="Completed Tasks" tasks={completedTasks} />
                <TaskList title="In Progress Tasks" tasks={inProgressTasks} showProgress={true} />
                <TaskList title="Pending Tasks" tasks={pendingTasks} />
            </div>
        </div>
    );
};

export default TrainingChart;