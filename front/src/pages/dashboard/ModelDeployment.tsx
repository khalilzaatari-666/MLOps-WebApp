import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { deployModel, getBestModelInfo, getDeployedModels, getLatestInstanceInfo } from "@/services/fastApi";
import { BestModelInfo, DeployedModel, InstanceInfo } from "@/services/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Rocket, Clock, Cloud, Package, Badge } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ModelDeployment: React.FC = () => {
    const {toast} = useToast();
    const queryClient = useQuery;
    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);

    const { data: instanceInfo, isLoading: instanceLoading } = useQuery<InstanceInfo>({
        queryKey: ['latest-instance-info'],
        queryFn: getLatestInstanceInfo,
    });

    const { data: bestModelInfo, isLoading: modelLoading } = useQuery<BestModelInfo>({
        queryKey: ['best-model-info', instanceInfo?.dataset_id],
        queryFn: () => getBestModelInfo(instanceInfo!.dataset_id),
        enabled: !!instanceInfo?.dataset_id,
    });

    const { data: deployedModels = [], isLoading: deployedLoading, refetch: refetchDeployed } = useQuery<DeployedModel[]>({
        queryKey: ['deployed-models'],
        queryFn: getDeployedModels,
    });

    const deployModelMutation = useMutation({
        mutationFn: deployModel,
        onSuccess: (data) => {
            toast({
            title: 'Success',
            description: 'Model deployed successfully to MinIO Object Storage',
            variant: 'default', // Changed from 'destructive' since this is success
            });
        },
        onError: (error) => {
            toast({
            title: 'Error',
            description: 'Failed to deploy model',
            variant: 'destructive',
            });
        }
    });

    const handleDeployModel = () => {
    if (bestModelInfo?.status === 'NOT_FOUND') {
        toast({
        title: "Error",
        description: "No best model found to deploy",
        variant: "destructive",
        });
        return;
    }
    deployModelMutation.mutate();
    };

    const isLoading = instanceLoading || modelLoading || deployedLoading;

    if (isLoading) {
        return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold">Model Deployment</h1>
            <p className="text-gray-500">Deploy your best model to production environment</p>
            </div>
            <Card>
            <CardContent className="flex items-center justify-center h-60">
                <p className="text-gray-500">Loading deployment information...</p>
            </CardContent>
            </Card>
        </div>
        );
    };

    const handleNavigateToSelection = () => {
        try {
            navigate('/dashboard/best-model-selection')
        } catch (err) {
            console.error('Navigation error:', err)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                <h1 className="text-2xl font-bold">Model Deployment</h1>
                <p className="text-gray-500">Deploy your best model to production environment</p>
                </div>

                <div className="border-t px-6 py-4 flex justify-end bg-muted/50 rounded-b-lg">
                <a
                    href="https://obj.pcs-agri.site/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
                >
                    PCS AGRI's MinIO Object Storage
                </a>
                </div>
            </div>

            {/* Best Model Deployment */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Deploy Best Model
                </CardTitle>
                </CardHeader>
                <CardContent>
                {bestModelInfo?.status === 'NOT_FOUND' ? (
                    <div className="text-center py-8">
                    <p className="text-yellow-600 mb-4">No best model found. Please select a best model first.</p>
                    <p className="text-sm text-gray-500">Go to "Select Best Model" page to choose your best performing model.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-600">Dataset</p>
                                <p className="text-lg font-semibold">{instanceInfo?.dataset_name}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-600">Model Score</p>
                                <p className="text-lg font-semibold text-center">{bestModelInfo?.score || "N/A"} - {bestModelInfo?.model_info?.metric || ""}</p>
                            </div>
                            <div>
                                <div className="flex justify-center">
                                    <Label className="text-sm font-medium text-gray-600">Training Parameters</Label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {/* Parameter Rows */}
                                <div className="flex justify-between text-sm border-b py-1">
                                    <span className="font-medium text-gray-700">Total Epochs</span>
                                    <span className="text-gray-800">
                                    {bestModelInfo?.model_info?.params?.epochs || "N/A"}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between text-sm border-b py-1">
                                    <span className="font-medium text-gray-700">Batch Size</span>
                                    <span className="text-gray-800">
                                    {bestModelInfo?.model_info?.params?.batch || "N/A"}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between text-sm border-b py-1">
                                    <span className="font-medium text-gray-700">Image Size</span>
                                    <span className="text-gray-800">
                                    {bestModelInfo?.model_info?.params?.imgsz || "N/A"}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between text-sm border-b py-1">
                                    <span className="font-medium text-gray-700">Learning Rate</span>
                                    <span className="text-gray-800">
                                    {bestModelInfo?.model_info?.params?.lr0 || "N/A"}
                                    </span>
                                </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                        <Button
                            onClick={handleDeployModel}
                            disabled={deployModelMutation.isPending}
                            className="flex items-center gap-2"
                        >
                            {deployModelMutation.isPending ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Deploying...
                            </>
                            ) : (
                            <>
                                <Cloud className="h-4 w-4" />
                                Deploy to MinIO
                            </>
                            )}
                        </Button>
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>

            {/* Deployed Models Table */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Deployed Models
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Models currently deployed to production environment
                </p>
                </CardHeader>
                <CardContent>
                {deployedModels.length === 0 ? (
                    <div className="text-center py-8">
                    <p className="text-gray-500">No models deployed yet</p>
                    </div>
                ) : (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[300px]">Dataset Name</TableHead> {/* Wider */}
                        <TableHead className="w-[150px]">Dataset Group</TableHead>
                        <TableHead className="w-[200px]">Deployment Date</TableHead>
                        <TableHead className="w-[400px]">MinIO Path</TableHead> {/* Widest */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deployedModels.map((model) => (
                        <TableRow key={model.id}>
                            <TableCell className="font-mono w-[300px]">{model.dataset_name}</TableCell>
                            <TableCell className="font-mono w-[150px]">{model.dataset_group}</TableCell>
                            <TableCell className="w-[200px]">
                            {new Date(model.deployment_date).toLocaleString()}
                            </TableCell>
                            <TableCell className="w-[400px] truncate font-mono text-sm">
                            {model.path}
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
                onClick={handleNavigateToSelection}
                size='lg'
                className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
                Best Model Selection
            </Button>
            </div>
            {deployModelMutation.isPending && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-lg max-w-sm w-full">
                    <h3 className="text-lg font-medium mb-2 text-center">Model Deployment in Progress</h3>
                    <div className="flex justify-center my-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Please wait while we deploy your model to PCS AGRI MinIO Object Storage...
                    </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ModelDeployment;