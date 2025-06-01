import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { listDatasets, trainModel } from '@/services/fastApi';
import TrainingForm from '@/components/TrainingForm'
import TrainingChart from '@/components/TrainingChart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const ModelTraining: React.FC = () => {
  const navigate = useNavigate()
  const {toast} = useToast()
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [trainingStarted , setTrainingStarted] = useState(false);

  const { data: datasets = [], isLoading: isLoadingDatasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: listDatasets,
  });

  const handleStartTraining = (datasetId: number) => {
    setSelectedDatasetId(datasetId.toString());
    setShowForm(true);
  };

  const handleTrainingSubmit = async (trainingData: any) => {
    try {
      console.log("Starting training with data:", trainingData);
      await trainModel(trainingData);
      toast({
        title: "Success",
        description: "Training started successfully",
      });
      setShowForm(false);
      setTrainingStarted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start training",
        variant: "destructive"
      });
    }
  };

  const handleNavigateToAugmentation = () => {
    try {
      navigate('/dashboard/new-model')
    } catch (err) {
      console.error('Navigation error:', err)
    }
  }

  const handleNavigateToSelection = () => {
    try {
      navigate('/dashboard/best-model-selection')
    } catch (err) {
      console.error('Navigation error:', err)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (isLoadingDatasets) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Model Training</h1>
          <p className='text-gray-500'>Train models on your datasets</p>
        </div>
        <Card>
          <CardContent className='flex items-center justify-center h-60'>
            <p className='text-gray-500'>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm && selectedDatasetId) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className="text-2xl font-bold">Create Training Job</h1>
          <p className="text-gray-500">Configure training parameters for your model</p>
        </div>
        <TrainingForm
          datasetId={selectedDatasetId}
          onSubmit={handleTrainingSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  if (trainingStarted && selectedDatasetId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Training Progress</h1>
          <p className="text-gray-500">Monitor your model training progress</p>
        </div>
        <div className="flex gap-4 mb-4">
          <Button 
            onClick={() => {
              setTrainingStarted(false);
              setSelectedDatasetId(null);
            }}
            variant="outline"
          >
            Back to Datasets
          </Button>
        </div>
        <TrainingChart datasetId={selectedDatasetId} />
      </div>
    )
  }
  
  return (
<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Model Training</h1>
        <p className="text-gray-500">Select a dataset to start training</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {datasets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No datasets available for training</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dataset Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets
                  .filter(dataset => dataset.status === "AUGMENTED" || dataset.status === 'VALIDATED')
                  .map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell className="font-medium">
                      {dataset.name}
                    </TableCell>
                    <TableCell>{formatDate(dataset.created_at)}</TableCell>
                    <TableCell>
                      {formatDate(dataset.start_date)} - {formatDate(dataset.end_date)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => handleStartTraining(dataset.id)}
                        size="sm"
                      >
                        Start Training
                      </Button>
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
          onClick={handleNavigateToAugmentation}
          size='lg'
          className='inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
            Dataset Augmentation
        </Button>
      </div>
            <div className='fixed bottom-6 right-6'>
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

export default ModelTraining;