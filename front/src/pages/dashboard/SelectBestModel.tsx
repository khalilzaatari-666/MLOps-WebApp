import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getLatestInstanceInfo, getLatestInstanceTasks, getTestingResults, selectBestModel } from "@/services/fastApi";
import { ModelSelectConfig, SelectionMetric, TrainingTask } from "@/services/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SelectBestModel: React.FC = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();
    const [selectedMetric, setSelectedMetric] = useState<SelectionMetric>('map50');
    const navigate = useNavigate();

    const { data: instanceInfo, isLoading: instanceLoading, error: instanceError} = useQuery({
        queryKey: ['latest-instance-info'],
        queryFn: getLatestInstanceInfo,
    });

    const { data: testingResults, isLoading: testingLoading, error: testingError} = useQuery({
        queryKey: ['testing-results', instanceInfo?.dataset_id],
        queryFn: () => getTestingResults(instanceInfo!.dataset_id),
        enabled: !!instanceInfo?.dataset_id,
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

    const completedTasks = testingResults?.tasks?.filter(task => 
        task.status?.toLowerCase() === 'completed'
    ) || [];

    const isLoading = testingLoading || instanceLoading;
    const error = testingError ||  instanceError;

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

    const handleNavigateToDeployment = () => {
        try {
            navigate('/dashboard/model-deployment')
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
                        <SelectItem value="map50">mAP50</SelectItem>
                        <SelectItem value="map5_95">mAP50-95</SelectItem>
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
                <CardTitle>Testing Results</CardTitle>
                <p className="text-sm text-gray-600">
                    Showing {testingResults?.tasks?.length || 0} test tasks 
                </p>
                </CardHeader>
                <CardContent>
                {!testingResults?.tasks?.length ? (
                    <div className="text-center py-8">
                    <p className="text-gray-500">No testing results found</p>
                    </div>
                ) : (
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/3">Test Task ID</TableHead>
                            <TableHead>Queue Position</TableHead>
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
                        .sort((a,b) => a.queue_position - b.queue_position)
                        .map((task) => (
                        <TableRow key={task.test_task_id}>
                            <TableCell className="font-mono text-sm">
                                {task.test_task_id}
                            </TableCell>
                            <TableCell>{task.queue_position + 1}</TableCell>
                            <TableCell className="max-w-xs">
                            <div className="text-sm">
                                {task.hyperparameters ? (
                                <>
                                    <div>Epochs: {task.hyperparameters.epochs || 'N/A'}</div>
                                    <div>LR: {task.hyperparameters.lr0 || 'N/A'}</div>
                                    <div>Batch: {task.hyperparameters.batch || 'N/A'}</div>
                                    <div>Image Size: {task.hyperparameters.imgsz || 'N/A'}</div>
                                </>
                                ) : 'N/A'}
                            </div>
                            </TableCell>
                            <TableCell className="font-mono">
                            {formatMetricValue(task.map50)}
                            </TableCell>
                            <TableCell className="font-mono">
                            {formatMetricValue(task.map50_95)}
                            </TableCell>
                            <TableCell className="font-mono">
                            {formatMetricValue(task.precision)}
                            </TableCell>
                            <TableCell className="font-mono">
                            {formatMetricValue(task.recall)}
                            </TableCell>
                            <TableCell>
                            {task.started_at && task.completed_at ? (
                                <span className="text-sm">
                                {Math.round((new Date(task.completed_at).getTime() - new Date(task.started_at).getTime()) / 1000)}s
                                </span>
                            ) : (
                                'N/A'
                            )}
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
                    onClick={handleNavigateToTesting}
                    size='lg'
                    className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
                    Model Testing
                </Button>
            </div>
            <div className='fixed bottom-6 right-6'>
                <Button
                    onClick={handleNavigateToDeployment}
                    size='lg'
                    className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
                    Model Deployment
                </Button>
            </div>
        </div>
    );
}

export default SelectBestModel;