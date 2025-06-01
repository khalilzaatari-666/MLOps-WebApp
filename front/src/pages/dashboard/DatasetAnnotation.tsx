import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listDatasets, listModels, autoAnnotateDataset, validateAnnotations, downloadLabelsDataset, downloadRawDataset, listPretrainedModels } from '@/services/fastApi';
import { FileText, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const groupToModelMapping = {
  'Melon, Watermelon, Cucumber, Zucchini, Cucurbit, Artichoke': "melon, pasteque, concombre, courgette, pg_cucurbit, artichaut",
  'Tomato, Eggplant, Bell Pepper': "tomate, aubergine, poivron",
  'Leek': "poireau",
  'Radish, Brussels Sprouts': "radis, choux de bruxelles",
  'Bean': "haricot",
  'Salad': "salad"
};

const DatasetAnnotation: React.FC = () => {
  const { data: datasets = [], isLoading: isLoadingDatasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: listDatasets,
  });

  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['pretrained-models'],
    queryFn: listPretrainedModels,
  }); 

  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});
  const [selectedDevice, setSelectedDevice] = useState<Record<string, boolean>>({});
  const [uploadingFile, setUploadingFile] = useState<Record<string, File | null>>({});
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleModelChange = (datasetId: string, modelId: string) => {
    setSelectedModels(prev => ({ ...prev, [datasetId]: modelId }));
  };

  const handleDeviceChange = (datasetId: string, use_gpu: boolean) => {
    setSelectedDevice(prev => ({ ...prev, [datasetId]: use_gpu}));
  }

  const handleFileChange = (datasetId: string, e:React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingFile(prev => ({ ...prev, [datasetId]: e.target.files![0] }));
    }
  };

  const handleAutoAnnotate = async (datasetId: string) => {
    try {
      const modelId = selectedModels[datasetId];
      const use_gpu = selectedDevice[datasetId] || false
      
      if (!modelId) {
        toast ({
          title: "Error",
          description: "Please select a model frst",
          variant: "destructive",
        });
        return;
      }
      setIsAnnotating(true)
      try {
        await autoAnnotateDataset(datasetId, modelId, use_gpu);

        toast({
          title: "Success",
          description: "Auto-annotation completed successfully",
        });
      } finally {
        setIsAnnotating(false);
      }
    } catch (error) {
      console.error("Auto-annotation error: ", error);
      toast({
        title: "Error",
        description: "Failed to start auto-annotation",
        variant: "destructive",
      });
      setIsAnnotating(false);
    }
  };

  const handleValidate = async (datasetId: string) => {
    try {
      setIsValidating(true); // Set validating state to true when starting
      
      const file = uploadingFile[datasetId];
      if (!file) {
        toast({
          title: "Error",
          description: "Please upload a validation file first",
          variant: "destructive",
        });
        return;
      }
      
      await validateAnnotations(datasetId, file);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
  
      toast({
        title: "Success",
        description: "Dataset annotations updated successfully",
      });
  
      setUploadingFile(prev => ({ ...prev, [datasetId]: null }));
    } catch (error) {
      console.error("Validation error: ", error);
      toast({
        title: "Error",
        description: "Failed to validate dataset",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false); // Ensure validating state is always reset
    }
  };

  const handleDownloadRawImages = async (datasetId: string) => {
    try {
      setIsDownloading(true);
      
      await downloadRawDataset(datasetId);
  
      toast({
        title: "Download Complete",
        description: "Your dataset has been downloaded",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download dataset",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadLabels = async (datasetId: string) => {
    try {
      await downloadLabelsDataset(datasetId);
      toast({
        title: "Download Started",
        description: "Downloading labels...",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download labels",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RAW":
        return <Badge className='bg-red-500'>Raw</Badge>
      case "AUTO_ANNOTATED":
        return <Badge className="bg-yellow-500">Auto-annotated</Badge>;
      case "VALIDATED":
        return <Badge className="bg-blue-500">Validated</Badge>;
      case "AUGMENTED":
        return <Badge className="bg-green-500">Augmented</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  const getModelsForDataset = (dataset: any) => {
    // Get the dataset's model to determine the group
    const datasetModelName = dataset.model;
    
    // Find the group of the dataset's model
    const datasetModel = models.find(model => model.group === datasetModelName);
    if (!datasetModel) return [];
    
    // Return only active models from the same group
    return models.filter(model => 
      model.group === datasetModel.group && model.is_active
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dataset Annotation</h1>
          <p className="text-gray-500">Annotate your datasets for training purposes</p>
        </div>

        <div className="border-t px-6 py-4 flex justify-end bg-muted/50 rounded-b-lg">
          <a
            href="https://www.makesense.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
          >
            Go to makesense.ai
          </a>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="bg-muted border border-border rounded-lg px-6 py-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-primary">Instructions</h2>
        <ol className="list-decimal list-inside text-muted-foreground space-y-1 pl-2">
          <li>Select an available AI model in the Auto-Annotation column for the dataset you want to annotate, then click <span className="font-semibold">Auto-Annotate</span> to run automatic annotation.</li>
          <li>Validate your results by going to <span className='font-semibold'>MakeSense.ai</span> then manually validating the bounding boxes, then upload your labels file in the Validation column, then click <span className="font-semibold">Validate</span>.</li>
          <li>You can download raw images or labels using the Actions column once the dataset status is <span className="font-semibold">Auto Annotated</span> or <span className="font-semibold">Validated</span>.</li>
        </ol>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDatasets || isLoadingModels ? (
            <div className="flex justify-center py-8">
              <p>Loading datasets...</p>
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex items-center justify-center h-60">
              <p className="text-gray-500">No datasets available. Create datasets first.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="text-center">Created</TableHead>
                    <TableHead className="text-center">Date Range</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Auto-Annotation</TableHead>
                    <TableHead className="text-center">Validation</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((dataset: any) => {
                    const availableModels = getModelsForDataset(dataset);
                
                  return (
                    <TableRow key={dataset.id}>
                      <TableCell className="text-center align-middle font-medium">
                        {dataset.name}
                      </TableCell>

                      <TableCell className="text-center align-middle">
                        {formatDate(dataset.created_at)}
                      </TableCell>

                      <TableCell className="text-center align-middle">
                        {formatDate(dataset.start_date)} - {formatDate(dataset.end_date)}
                      </TableCell>

                      <TableCell className="text-center align-middle">
                        {getStatusBadge(dataset.status)}
                      </TableCell>

                      <TableCell className="text-center align-middle">
                        <div className="flex flex-col items-center space-y-2">
                          <Select 
                            value={selectedModels[dataset.id] || ""}
                            onValueChange={(value) => handleModelChange(dataset.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableModels.map((model: any) => (
                                <SelectItem key={model.id} value={model.id.toString()}>{model.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedDevice[dataset.id] ? "true" : "false"}
                            onValueChange={(value) => handleDeviceChange(dataset.id, value === "true")}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select Device" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">GPU</SelectItem>
                              <SelectItem value="false">CPU</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm"
                            onClick={() => handleAutoAnnotate(dataset.id)}
                            disabled={!selectedModels[dataset.id]}
                            className="w-[180px]"
                          >
                            Auto-Annotate
                          </Button>
                        </div>
                      </TableCell>

                      {/* File Upload/Validate */}
                      <TableCell className="text-center align-middle">
                        <div className="flex flex-col items-center space-y-2">
                          <input 
                            type="file" 
                            accept=".zip"
                            id={`validate-file-${dataset.id}`}
                            onChange={(e) => handleFileChange(dataset.id, e)}
                            className="text-sm w-[180px]"
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleValidate(dataset.id)}
                            disabled={!uploadingFile[dataset.id]}
                            className="w-[180px]"
                          >
                            Validate
                          </Button>
                        </div>
                      </TableCell>

                      {/* Actions Dropdown */}
                      <TableCell className="text-center align-middle">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">Actions</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleDownloadRawImages(dataset.id)}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download Raw Images
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDownloadLabels(dataset.id)}
                                disabled={['RAW'].includes(dataset.status)}
                                className="flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Download Labels
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {isAnnotating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-2 text-center">Auto-annotation in progress</h3>
            <div className="flex justify-center my-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please wait while we process your dataset...
            </p>
          </div>
        </div>
      )}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-2 text-center">Downloading Dataset</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Please wait while we download your dataset...</p>
          </div>
        </div>
      )}
      {isValidating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-2 text-center">Validating in progress</h3>
            <div className="flex justify-center my-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please wait while we prepare your dataset zip file...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default DatasetAnnotation;
