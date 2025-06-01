import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getLatestInstanceInfo, getLatestInstanceTasks, selectBestModel } from "@/services/fastApi";
import { ModelSelectConfig, SelectionMetric, TrainingTask } from "@/services/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SelectBestModel: React.FC = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();
    const [selectedMetric, setSelectedMetric] = useState<SelectionMetric>('accuracy');
    const navigate = useNavigate();

    const { data: tasks = [], isLoading: tasksLoading, error: tasksError} = useQuery({
        queryKey: ['latest-instance-tasks'],
        queryFn: getLatestInstanceTasks,
    });

    const { data: instanceInfo, isLoading: instanceLoading, error: instanceError} = useQuery({
        queryKey: ['latest-instance-info'],
        queryFn: getLatestInstanceInfo,
    });

    const selectBestModelMutation = useMutation({
        mutationFn: selectBestModel,
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: `Best model selected based on ${selectedMetric}`,
            });
            queryClient.invalidateQueries({queryKey: ['latest-instance-tasks']});
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || "Failed to select best model",
                variant: "destructive",
            })
        }
    });

    const handleSelectBestModel = () => {
        if (!instanceInfo?.dataset_id) {
                toast({
                title: "Error",
                description: "Dataset ID not available",
                variant: "destructive",
            });
            return;
        }

        const config: ModelSelectConfig = {
            dataset_id: instanceInfo.dataset_id,
            selection_metric: selectedMetric,
        };

        selectBestModelMutation.mutate(config);
    };

    const formatMetricValue = (value: number  | undefined) => {
        return value ? value.toFixed(4) : 'N/A'
    };

    const getMetricValue = (task: TrainingTask, metric: SelectionMetric) => {
        if (!task.results) return undefined;
        const metricsMapping: Record<SelectionMetric, string> = {
            'accuracy': 'metrics/mAP50(B)',
            'precision': 'metrics/precision(B)',
            'recall': 'metrics/recall(B)',
        };

        return task.results[metricsMapping[metric]]
    };

    const completedTasks = tasks.filter((task: TrainingTask) => 
        task.status?.toLowerCase() === 'completed'
    );

    const isLoading = tasksLoading || instanceLoading;
    const error = tasksError ||  instanceError;

    if (isLoading) {
        return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold">Select Best Model</h1>
            <p className="text-gray-500">Choose the best performing model from recent training tasks</p>
            </div>
            <Card>
            <CardContent className="flex items-center justify-center h-60">
                <p className="text-gray-500">Loading training tasks...</p>
            </CardContent>
            </Card>
        </div>
        ); 
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                <h1 className="text-2xl font-bold">Select Best Model</h1>
                <p className="text-gray-500">Choose the best performing model from recent training tasks</p>
                </div>
                <Card>
                <CardContent className="flex items-center justify-center h-60">
                    <p className="text-red-500">Error loading training tasks</p>
                </CardContent>
                </Card>
            </div>
            );
    }

    const handleNavigateToTraining = () => {
        try {
            navigate('/dashboard/model-training')
        } catch (err) {
            console.error('Navigation error:', err)
        }
    }

    const handleNavigateToTesting = () => {
        try {
            navigate('/dashboard/model-testing')
        } catch (err) {
            console.error('Navigation error:', err)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Select Best Model</h1>
                <p className="text-gray-500">Choose the best performing model from recent training tasks</p>
            </div>

            {/* Model Selection Controls */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Model Selection Criteria
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="dataset">Dataset</Label>
                    <div className="p-2 bg-gray-100 rounded border">
                        {instanceInfo?.dataset_name || 'Loading...'}
                    </div>
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="metric">Selection Metric</Label>
                    <Select
                        value={selectedMetric}
                        onValueChange={(value: SelectionMetric) => setSelectedMetric(value)}
                    >
                        <SelectTrigger>
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="accuracy">Accuracy (mAP50)</SelectItem>
                        <SelectItem value="precision">Precision</SelectItem>
                        <SelectItem value="recall">Recall</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="flex items-end">
                    <Button 
                        onClick={handleSelectBestModel}
                        disabled={selectBestModelMutation.isPending || !instanceInfo?.dataset_id || completedTasks.length === 0}
                        className="w-full"
                    >
                        {selectBestModelMutation.isPending ? 'Selecting...' : 'Select Best Model'}
                    </Button>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Training Tasks Overview */}
            <Card>
                <CardHeader>
                <CardTitle>Training Jobs</CardTitle>
                <p className="text-sm text-gray-600">
                    Showing {tasks.length} tasks
                </p>
                </CardHeader>
                <CardContent>
                {tasks.length === 0 ? (
                    <div className="text-center py-8">
                    <p className="text-gray-500">No training tasks found</p>
                    </div>
                ) : (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Dataset</TableHead>
                        <TableHead>Parameters</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Precision</TableHead>
                        <TableHead>Recall</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task: TrainingTask) => (
                        <TableRow key={task.id}>
                            <TableCell>{instanceInfo.dataset_name}</TableCell>
                            <TableCell className="max-w-xs">
                            <div className="text-sm">
                                <div>Epochs: {task.params?.epochs || 'N/A'}</div>
                                <div>LR: {task.params?.lr0 || 'N/A'}</div>
                                <div>Batch: {task.params?.batch || 'N/A'}</div>
                                <div>Image Size: {task.params?.imgsz || 'N/A'}</div>
                                <div>Momentum: {task.params?.momentum || 'N/A'}</div>
                            </div>
                            </TableCell>
                            <TableCell className="font-mono">
                            {formatMetricValue(getMetricValue(task, 'accuracy'))}
                            </TableCell>
                            <TableCell className="font-mono">
                            {formatMetricValue(getMetricValue(task, 'precision'))}
                            </TableCell>
                            <TableCell className="font-mono">
                            {formatMetricValue(getMetricValue(task, 'recall'))}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                )}
                </CardContent>
            </Card>
            <div className='fixed bottom-6 left-[calc(250px+24px)]'>
                <Button
                    onClick={handleNavigateToTraining}
                    size='lg'
                    className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
                    Model Training
                </Button>
            </div>
            <div className='fixed bottom-6 right-6'>
                <Button
                    onClick={handleNavigateToTesting}
                    size='lg'
                    className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
                    Best Model Testing
                </Button>
            </div>
        </div>
    );
}

export default SelectBestModel;