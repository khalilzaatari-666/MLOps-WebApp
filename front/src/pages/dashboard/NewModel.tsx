import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { augmentDataset, listDatasets } from '@/services/fastApi';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

const TRANSFORMERS = [
  { value: "vertical_flip", label: "Vertical Flip" },
  { value: "horizontal_flip", label: "Horizontal Flip" },
  { value: "transpose", label: "Transpose" },
  { value: "center_crop", label: "Center Crop" },
];

const NewModel: React.FC = () => {
  const { toast } = useToast();
  const [selectedTransformers, setSelectedTransformers] = useState<Record<number, string>>({});
  const [augmenting, setAugmenting] = useState(false);
  const navigate = useNavigate();

  const { data: datasets = [], isLoading: isLoadingDatasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: listDatasets,
  });

  const handleTransformerChange = (datasetId: number, transformer: string) => {
    setSelectedTransformers(prev => ({ ...prev, [datasetId]: transformer }));
  };

  const handleAugmentDataset = async (datasetId: number) => {
    const selectedTransformer = selectedTransformers[datasetId];
    if (!selectedTransformer) {
      toast({
        title: "Error",
        description: "Please select a transformer first",
        variant: "destructive"
      });
      return;
    }

    try {
      setAugmenting(true);
      await augmentDataset(datasetId, selectedTransformer);
      toast({
        title: "Success",
        description: "Dataset augmentation started successfully",
        variant: "default" // Changed from destructive to default
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start dataset augmentation",
        variant: "destructive"
      });
    } finally {
      setAugmenting(false);
    }
  };

  const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "MMM d, yyyy");
      } catch (error) {
        return "Invalid Date";
      }
    };
  
  const handleNavigateToTraining = () => {
    try {
      navigate('/dashboard/model-training')
    } catch (err) {
      console.error('Navigation error:', err)
    }
  }

  if (isLoadingDatasets) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Available validated datasets</h1>
          <p className="text-gray-500">Augment your datasets using available transformers</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-60">
            <p className="text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RAW':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'AUTO_ANNOTATED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'AUGMENTED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Dataset Augmentation</h1>
        <p className="text-gray-500">Augment your validated dataset using one of the available transformers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Validated Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {datasets.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-500'>No datasets available for augmentation</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dataset Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Select Transformer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets
                  .filter(dataset => dataset.status === "VALIDATED" || "AUGMENTED")
                  .map((dataset) => (
                    <TableRow key={dataset.id}>
                      <TableCell className='font-medium'>
                        {dataset.name}
                      </TableCell>
                      <TableCell>{formatDate(dataset.created_at)}</TableCell>
                      <TableCell>
                        {formatDate(dataset.start_date)} - {formatDate(dataset.end_date)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-normal capitalize", getStatusColor(dataset.status))}>
                            {dataset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={selectedTransformers[dataset.id] || ""}
                          onValueChange={(value) => handleTransformerChange(dataset.id, value)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select transformer" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSFORMERS.map((transformer) => (
                              <SelectItem 
                                key={transformer.value} 
                                value={transformer.value}
                              >
                                {transformer.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleAugmentDataset(dataset.id)}
                          disabled={!selectedTransformers[dataset.id]}
                          size='sm'
                        >
                          Augment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {augmenting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-2 text-center">Dataset augmentation in progress</h3>
            <div className="flex justify-center my-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please wait while the new images are being created  
            </p>
          </div>
        </div>
      )}
      <div className='fixed bottom-6 right-6'>
        <Button
          onClick={handleNavigateToTraining}
          size='lg'
          className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
            Proceed to Model Training
        </Button>
      </div>
    </div>
  );
};

export default NewModel;