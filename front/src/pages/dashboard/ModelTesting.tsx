import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getLatestInstanceInfo, listDatasets, getBestModelInfo, testModel } from "@/services/fastApi";
import { BestModelInfo, InstanceInfo, TestModelConfig, TestResults } from "@/services/types";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, TestTube, Cpu, Clock, Database, CheckCircle, Zap } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

const ModelTesting: React.FC = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();
    const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
    const [useGpu, setUseGpu] = useState<boolean>(true);
    const [testResults, setTestResults] = useState<TestResults | null>(null);
    const navigate = useNavigate()

    const { data: instanceInfo, isLoading: instanceLoading, error: instanceError} = useQuery<InstanceInfo>({
        queryKey: ['latest-instance-info'],
        queryFn: getLatestInstanceInfo,
    });

    const { data: bestModelInfo, isLoading: modelLoading } = useQuery<BestModelInfo>({
        queryKey: ['best-model-info', instanceInfo?.dataset_id],
        queryFn: () => getBestModelInfo(instanceInfo!.dataset_id),
        enabled: !!instanceInfo?.dataset_id,
    });

    const { data: datasets = [], isLoading: datasetsLoading } = useQuery({
        queryKey: ['datasets'],
        queryFn: listDatasets,
    });

    const testModelMutation = useMutation({
        mutationFn: testModel,
        onSuccess: (data: TestResults) => {
            setTestResults(data);
            toast({
                title: "Success",
                description: "Model testing completed successfully!",
            });
        },
    });

    const handleTestModel = () => {
        if (!selectedDatasetId) {
            toast({
                title: "Error",
                description: "Please select a dataset to test on",
                variant: "destructive",
            });
            return;
        }

        const config: TestModelConfig = {
            dataset_id: selectedDatasetId,
            use_gpu: useGpu,
        };

        testModelMutation.mutate(config);
    };

    const formatMetricValue = (value: number | undefined | null | string) => {
        const num = Number(value);
        return isFinite(num) ? num.toFixed(4) : 'N/A';
    };

    const isLoading = instanceLoading || modelLoading || datasetsLoading;

    const handleNavigateToSelection = () => {
        try {
            navigate('/dashboard/best-model-selection')
        } catch (err) {
            console.error('Navigation error:', err)
        }
    };   

    const handleNavigateToDeployment = () => {
        try {
            navigate('/dashboard/model-deployment')
        } catch (err) {
            console.error('Navigation error:', err)
        }
    };   

    if (isLoading) {
        return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold">Model Testing</h1>
            <p className="text-gray-500">Test your best model on different datasets</p>
            </div>
            <Card>
            <CardContent className="flex items-center justify-center h-60">
                <p className="text-gray-500">Loading model and dataset information...</p>
            </CardContent>
            </Card>
        </div>
        );
    }

    if (instanceError || !instanceInfo) {
        return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold">Model Testing</h1>
            <p className="text-gray-500">Test your best model on different datasets</p>
            </div>
            <Card>
            <CardContent className="flex items-center justify-center h-60">
                <p className="text-red-500">Error loading instance information</p>
            </CardContent>
            </Card>
        </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Model Testing</h1>
                <p className="text-gray-500">Test your best model on different datasets</p>
            </div>

            {/* Best Model Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Best Model Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-600">Trained Dataset</Label>
                        <p className="text-lg font-semibold break-words">{instanceInfo.dataset_name}</p>
                        </div>
                        <div>
                        <Label className="text-sm font-medium text-gray-600">Model Score</Label>
                        <p className="text-lg font-semibold">{formatMetricValue(bestModelInfo?.score)}</p>
                        </div>
                        <div>
                        <Label className="text-sm font-medium text-gray-600">Scoring Metric</Label>
                        <p className="text-lg font-semibold">{bestModelInfo?.model_info.metric}</p>
                        </div>
                        <div className="md:col-span-4">
                        <Label className="text-sm font-medium text-gray-600">Training Parameters</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="flex justify-between text-sm border-b py-1">
                            <span className="font-medium text-gray-700">Total Epochs</span>
                            <span className="text-gray-800">{bestModelInfo?.model_info.params?.epochs}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b py-1">
                            <span className="font-medium text-gray-700">Batch Size</span>
                            <span className="text-gray-800">{bestModelInfo?.model_info.params?.batch}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b py-1">
                            <span className="font-medium text-gray-700">Image Size</span>
                            <span className="text-gray-800">{bestModelInfo?.model_info.params?.imgsz}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b py-1">
                            <span className="font-medium text-gray-700">Learning Rate</span>
                            <span className="text-gray-800">{bestModelInfo?.model_info.params?.lr0}</span>
                            </div>
                        </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Available Datasets */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Available Test Datasets
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Datasets in the same group: {instanceInfo.dataset_group}
                </p>
                </CardHeader>
                <CardContent>
                {datasets.length === 0 ? (
                    <div className="text-center py-8">
                    <p className="text-gray-500">No datasets available for testing</p>
                    </div>
                ) : (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="text-center">Select</TableHead>
                        <TableHead className="text-center">Name</TableHead>
                        <TableHead className="text-center">Created</TableHead>
                        <TableHead className="text-center">Date Range</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {datasets
                            .filter(
                                (dataset) =>
                                dataset.model === instanceInfo?.dataset_group &&
                                dataset.id !== instanceInfo?.dataset_id &&
                                dataset.status == 'AUGMENTED'
                            )
                            .map((dataset) => (
                        <TableRow 
                            key={dataset.id}
                            className={selectedDatasetId === dataset.id ? 'bg-blue-50' : ''}
                        >
                            <TableCell className="text-center">
                                <div className="flex justify-center">
                                    <Button
                                        variant={selectedDatasetId === dataset.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedDatasetId(dataset.id)}
                                        className="mx-auto"
                                    >
                                        {selectedDatasetId === dataset.id ? 'Selected' : 'Select'}
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">{dataset.name}</TableCell>
                            <TableCell className="text-center">
                            {new Date(dataset.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                                {new Date(dataset.start_date).toLocaleDateString()} - {new Date(dataset.end_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center gap-3">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                        id={`use-gpu-${dataset.id}`}
                                        checked={useGpu}
                                        onCheckedChange={setUseGpu}
                                        />
                                        <Label htmlFor={`use-gpu-${dataset.id}`} className="text-xs whitespace-nowrap">
                                        GPU
                                        </Label>
                                    </div>
                                    <Button
                                        onClick={() => handleTestModel()}
                                        disabled={testModelMutation.isPending || selectedDatasetId !== dataset.id}
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        {testModelMutation.isPending && selectedDatasetId === dataset.id ? (
                                        <>
                                            <Clock className="h-3 w-3 animate-spin" />
                                            Testing...
                                        </>
                                        ) : (
                                        <>Run Test</>
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                )}
                </CardContent>
            </Card>

            {/* Test Results */}
            {testResults && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Test Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Precision</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatMetricValue(testResults.precision)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">Recall</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatMetricValue(testResults.recall)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600">mAP50</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatMetricValue(testResults.map50)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-gray-600">mAP50-95</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {formatMetricValue(testResults.map)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><strong>Test Duration:</strong> {testResults.duration_seconds.toFixed(2)} seconds</p>
                                <p><strong>Inference Speed:</strong> {testResults.inference_speed} ms</p>
                            </div>
                            <div>
                                <p><strong>Test Task ID:</strong> {testResults.test_task_id}</p>
                                <p><strong>Completed:</strong> {new Date(testResults.test_timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {testModelMutation.isPending && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-lg max-w-sm w-full">
                    <h3 className="text-lg font-medium mb-2 text-center">Model testing in progress</h3>
                    <div className="flex justify-center my-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Please wait while the model is being tested on the selected dataset. This may take a few minutes depending on the dataset size and hardware.
                    </p>
                    </div>
                </div>
            )};
            <div className='fixed bottom-6 left-[calc(250px+24px)]'>
                <Button
                    onClick={handleNavigateToSelection}
                    size='lg'
                    className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
                    Best Model Selection
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
};

export default ModelTesting;