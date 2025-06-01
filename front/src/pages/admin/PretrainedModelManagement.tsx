import React, { useState, useEffect } from 'react';
import { uploadPretrainedModel, listPretrainedModels, deactivateModel, activateModel } from '../../services/fastApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Label } from '@/components/ui/label'
import { PretrainedModelResponse } from '@/services/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload } from 'lucide-react';
import { format } from 'date-fns';

const modelGroups = [
    'Melon, Watermelon, Cucumber, Zucchini, Cucurbit, Artichoke',
    'Tomato, Eggplant, Bell Pepper',
    'Leek',
    'Radish, Brussels Sprouts',
    'Bean',
    'Salad'
];

const groupToModelMapping = {
  'Melon, Watermelon, Cucumber, Zucchini, Cucurbit, Artichoke': "melon, pasteque, concombre, courgette, pg_cucurbit, artichaut",
  'Tomato, Eggplant, Bell Pepper': "tomate, aubergine, poivron",
  'Leek': "poireau",
  'Radish, Brussels Sprouts': "radis, choux de bruxelles",
  'Bean': "haricot",
  'Salad': "salad"
};

const modelToGroupMap: Record<string, string> = {
  "melon, pasteque, concombre, courgette, pg_cucurbit, artichaut": 'Melon, Watermelon, Cucumber, Zucchini, Cucurbit, Artichoke',
  "tomate, aubergine, poivron": 'Tomato, Eggplant, Bell Pepper',
  "poireau": 'Leek',
  "radis, choux de bruxelles": 'Radish, Brussels Sprouts',
  "haricot": 'Bean',
  "salad": 'Salad'
};

const PretrainedModelManagement: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [models, setModels] = useState<PretrainedModelResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedGroup, setSelectedGroup] = useState('')
    const {toast} = useToast();

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const modelsData = await listPretrainedModels();
            setModels(modelsData);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch pretrained models',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith('.pt')) {
            setSelectedFile(file);
        } else {
            toast ({
                title: 'Invalid File',
                description: 'Please select a valid .pt file',
                variant: 'destructive'
            });
            event.target.value = '';
        }
    };
    
    const handleAddModel = async () => {
        if (!selectedGroup || !selectedFile) {
            toast ({
                title: 'Missing Information',
                description: 'Please select a group and a file!',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);
            const modelValue = groupToModelMapping[selectedGroup]
            await uploadPretrainedModel(selectedFile, modelValue);

            toast({
                title: 'Success',
                description: 'Model uploaded successfully',
            });

            
            setSelectedGroup('');
            setSelectedFile(null);
            setIsDialogOpen(false);
            
            await fetchModels();
        } catch (error) {
            toast ({
                title: 'Upload Failed',
                description: 'Failed to upload the model. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateModel = async (modelId: number) => {
        try {
            setLoading(true);
            await deactivateModel(modelId);

            toast({
                title: 'Success',
                description: 'Model deactivated successfully'
            });

            await fetchModels();
        } catch (error) {
            toast ({
                title: 'Deactivation Failed',
                description: 'Failed to deactivate the model. Please try again',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleActivateModel = async (modelId: number) => {
        try {
            setLoading(true);
            await activateModel(modelId);

            toast({
                title: 'Success',
                description: 'Model activated successfully'
            });

            await fetchModels();
        } catch (error) {
            toast ({
                title: 'Activation Failed',
                description: 'Failed to activate the model. Please try again',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-2xl font-bold'>Pretrained Models</h1>
                    <p className='text-gray-500'>Manage pretrained models available for users</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className='flex items-center gap-2' disabled={loading}>
                            <Plus className="h-4 w-4" />
                            Add New Model
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Pretrained Model</DialogTitle>
                            <DialogDescription> Upload a new pretrained model (.pt model) and pick its group</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="group-select">Group</Label>
                                <select 
                                    id="group-select"
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    <option value="">Select a group</option>
                                    {modelGroups.map((group) => (
                                        <option key={group} value={group}>
                                            {group}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file-upload">Model File (.pt)</Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept='.pt'
                                        onChange={handleFileChange}
                                        className='file:mr-2 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:hover:bg-primary/90'
                                    />
                                    <Upload className='h-4 w-4 text-gray-400' />
                                </div>
                                {selectedFile && (
                                    <p className='text-sm text-green-600'>
                                        Selected: {selectedFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleAddModel} disabled={loading}>
                                {loading ? "Uploading..." : "Add Model"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Models Library</CardTitle>
                </CardHeader>~
                <CardContent>
                    {loading ? (
                        <div className='flex justify-center py-8'>
                            <div className='text-gray-500'>Loading models...</div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Model Name</TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Model Type</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Used</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {models.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell className='font-medium'>{model.name}</TableCell>
                                        <TableCell> 
                                            <span className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800'>
                                                {modelToGroupMap[model.group] || model.group}
                                            </span>
                                        </TableCell>
                                        <TableCell>{model.model_type}</TableCell>
                                        <TableCell>{model.device}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                model.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                                {model.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{format(new Date(model.last_used), 'MMMM do yyyy, h:mm:ss a')}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {model.is_active ? (
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => handleDeactivateModel(model.id)}
                                                    disabled={loading}
                                                >
                                                    Deactivate
                                                </Button>
                                                ) : (
                                                <Button 
                                                    variant="default" 
                                                    size="sm"
                                                    onClick={() => handleActivateModel(model.id)}
                                                    disabled={loading}
                                                >
                                                    Activate
                                                </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {models.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className='text-center py-8 text-gray-500'>
                                            No models found. Upload your first model to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PretrainedModelManagement;