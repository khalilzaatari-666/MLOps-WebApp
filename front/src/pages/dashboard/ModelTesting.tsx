import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getLatestInstanceInfo, listDatasets, getLatestInstanceTasks, getTestingResults, startTesting } from "@/services/fastApi";
import { BestModelInfo, InstanceInfo, TrainingTask, TestModelRequest, TestingResults } from "@/services/types";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TestTube, Cpu, Clock, Play } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ModelTesting: React.FC = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();
    const [useGpu, setUseGpu] = useState<boolean>(true);
    const navigate = useNavigate()

    const { data: instanceInfo, isLoading: instanceLoading, error: instanceError} = useQuery<InstanceInfo>({
        queryKey: ['latest-instance-info'],
        queryFn: getLatestInstanceInfo,
    });

    const { data: trainedModels = [], isLoading: modelsLoading } = useQuery<TrainingTask[]>({
        queryKey: ['latest-instance-tasks'],
        queryFn: getLatestInstanceTasks,
    });

    const { data: testingResults, isLoading: testingLoading } = useQuery<TestingResults>({
        queryKey: ['testing-results', instanceInfo?.dataset_id],
        queryFn: () => getTestingResults(instanceInfo!.dataset_id),
        enabled: !!instanceInfo?.dataset_id,
        refetchInterval: 3000,
    });

    const startTestingMutation = useMutation({
        mutationFn: startTesting,
        onSuccess: (data) => {
        toast({
            title: "Success",
            description: `Testing started successfully! ${data.test_task_ids.length} tasks queued.`,
        });
        // Refetch testing results
        queryClient.invalidateQueries({ queryKey: ['testing-results'] });
        },
        onError: (error: any) => {
        toast({
            title: "Error",
            description: error.message || "Failed to start testing",
            variant: "destructive",
        });
        },
    });

    const handleStartTesting = () => {
        if (!instanceInfo?.dataset_id) {
        toast({
            title: "Error",
            description: "No dataset information available",
            variant: "destructive",
        });
        return;
        }

        const request: TestModelRequest = {
        dataset_id: instanceInfo.dataset_id,
        useGpu: useGpu,
        };

        startTestingMutation.mutate(request);
    };

    const formatMetricValue = (value: number | undefined | null | string) => {
        const num = Number(value);
        return isFinite(num) ? num.toFixed(4) : 'N/A';
    };

    const handleNavigateToTraining = () => {
        try {
            navigate('/dashboard/model-training')
        } catch (err) {
            console.error('Navigation error:', err)
        }
    };   

    const handleNavigateToSelection = () => {
        try {
            navigate('/dashboard/best-model-selection')
        } catch (err) {
            console.error('Navigation error:', err)
        }
    };   

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
        }
    };

    const formatMetric = (value: number | null | undefined) => {
        return value ? value.toFixed(4) : 'N/A';
    };

    if (instanceLoading || modelsLoading) {
        return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold">Model Testing</h1>
            <p className="text-gray-500">Test all trained models from the last training instance</p>
            </div>
            <Card>
            <CardContent className="flex items-center justify-center h-60">
                <p className="text-gray-500">Loading...</p>
            </CardContent>
            </Card>
        </div>
        );
    }

    if (!instanceInfo) {
        return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold">Model Testing</h1>
            <p className="text-gray-500">Test all trained models from the latest training instance</p>
            </div>
            <Card>
            <CardContent className="flex items-center justify-center h-60">
                <p className="text-red-500">No training instance information available</p>
            </CardContent>
            </Card>
        </div>
        );
    }

    const completedModels = trainedModels.filter(model => model.status === 'COMPLETED');
    const hasTestingResults = testingResults && testingResults.progress.total_tasks > 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Model Testing</h1>
                <p className="text-gray-500">Test all trained models from the latest training instance</p>
            </div>

            {/* Instance Information */}
            <Card>
                <CardHeader>
                <CardTitle>Training Instance Information</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                    <Label className="text-sm font-medium text-gray-600">Dataset</Label>
                    <p className="text-lg font-semibold">{instanceInfo.dataset_name}</p>
                    </div>
                    <div>
                    <Label className="text-sm font-medium text-gray-600">Dataset Group</Label>
                    <p className="text-lg font-semibold">{instanceInfo.dataset_group}</p>
                    </div>
                    <div>
                    <Label className="text-sm font-medium text-gray-600">Training Jobs</Label>
                    <p className="text-lg font-semibold">{completedModels.length}</p>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Testing Configuration */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Testing Configuration
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch
                    id="use-gpu"
                    checked={useGpu}
                    onCheckedChange={setUseGpu}
                    />
                    <Label htmlFor="use-gpu" className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Use GPU for testing
                    </Label>
                </div>
                
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                    This will test all {completedModels.length} completed models on the test dataset
                    </p>
                    <Button 
                    onClick={handleStartTesting}
                    disabled={startTestingMutation.isPending || completedModels.length === 0}
                    className="flex items-center gap-2"
                    >
                    {startTestingMutation.isPending ? (
                        <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Starting...
                        </>
                    ) : (
                        <>
                        <Play className="h-4 w-4" />
                        Start Testing All Models
                        </>
                    )}
                    </Button>
                </div>
                </CardContent>
            </Card>

            {/* Testing Progress */}
            {hasTestingResults && (
                <Card>
                <CardHeader>
                    <CardTitle>Testing Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{testingResults.progress.total_tasks}</p>
                        <p className="text-sm text-gray-600">Total Tasks</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-600">{testingResults.progress.pending}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{testingResults.progress.in_progress}</p>
                        <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">{testingResults.progress.completed}</p>
                        <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-600">{testingResults.progress.failed}</p>
                        <p className="text-sm text-gray-600">Failed</p>
                    </div>
                    </div>
                    
                    <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{testingResults.progress.progress_percentage}%</span>
                    </div>
                    <Progress value={testingResults.progress.progress_percentage} className="w-full" />
                    </div>
                </CardContent>
                </Card>
            )}

            {/* Testing Results Table */}
            {hasTestingResults && (
                <Card>
                <CardHeader>
                    <CardTitle>Testing Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Queue Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hyperparameters</TableHead>
                        <TableHead>mAP50</TableHead>
                        <TableHead>mAP50-95</TableHead>
                        <TableHead>Precision</TableHead>
                        <TableHead>Recall</TableHead>
                        <TableHead>Duration</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testingResults.tasks
                        .sort((a, b) => a.queue_position - b.queue_position)
                        .map((task) => (
                        <TableRow key={task.test_task_id}>
                            <TableCell>{task.queue_position + 1}</TableCell>
                            <TableCell>
                            <Badge className={getStatusColor(task.status)}>
                                {task.status}
                            </Badge>
                            </TableCell>
                            <TableCell>
                            <div className="text-xs">
                                {task.hyperparameters ? (
                                <>
                                    <div>Epochs: {task.hyperparameters.epochs}</div>
                                    <div>LR: {task.hyperparameters.lr0}</div>
                                    <div>Batch: {task.hyperparameters.batch}</div>
                                    <div>Image Size: {task.hyperparameters.imgsz}</div>
                                </>
                                ) : 'N/A'}
                            </div>
                            </TableCell>
                            <TableCell>{formatMetric(task.map50)}</TableCell>
                            <TableCell>{formatMetric(task.map50_95)}</TableCell>
                            <TableCell>{formatMetric(task.precision)}</TableCell>
                            <TableCell>{formatMetric(task.recall)}</TableCell>
                            <TableCell>
                            {task.started_at && task.completed_at ? (
                                `${Math.round((new Date(task.completed_at).getTime() - new Date(task.started_at).getTime()) / 1000)}s`
                            ) : 'N/A'}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
            )}

            <div className='flex justify-between items-center pt-6 border-t'>
                <Button
                    onClick={handleNavigateToTraining}
                    size='lg'
                    className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
                    Model Training
                </Button>      
                <Button
                    onClick={handleNavigateToSelection}
                    size='lg'
                    className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
                    Best Model Selection
                </Button>
            </div>
        </div>
    );
};

export default ModelTesting;