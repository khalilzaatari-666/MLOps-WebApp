import React, {useState} from "react";
import { HyperparameterConfig, TrainModelRequest } from "@/services/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TrainingFormProps {
    datasetId: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ datasetId, onSubmit, onCancel }) => {
    const [useGpu, setUseGpu] = useState(false);
    const [paramSets, setParamSets] = useState<HyperparameterConfig[]>([{}]);
    const [splitRatios, setSplitRatios] = useState({
        train: 0.7,
        val: 0.2,
        test: 0.1,
    });

    const splitSum = splitRatios.train + splitRatios.val + splitRatios.test;
    const isValidSplit = Math.abs(splitSum - 1.0) < 0.001;

    const defaultParams = {
        lr0: 0.01,
        lrf: 0.1,
        batch: 16,
        imgsz: 320,
        epochs: 100,
        momentum: 0.937,
        weight_decay: 0.0005,
        warmup_epochs: 3.0,
        warmup_momentum: 0.8,
        box: 7.5,
        cls: 0.5
    };

    const handleParamChange = (setIndex: number, key: keyof HyperparameterConfig, value: string) => {
        setParamSets(prev => prev.map((paramSet, index) => 
            index == setIndex
                ? { ...paramSet, [key]: value === '' ? undefined : parseFloat(value)}
                : paramSet
        ));
    };

    const handleSplitRatioChange = (key: string, value: string) => {
        setSplitRatios(prev => ({
        ...prev,
        [key]: value === '' ? 0 : parseFloat(value)
        }));
    };

    const addParameterSet = () => {
        setParamSets(prev => [...prev, {}]);
    }

    const removeParameterSet = (index: number) => {
        if (paramSets.length > 1) {
            setParamSets(prev => prev.filter((_, i) => i !== index));
        }
    }

    const handleSubmit = () => {
        if (!isValidSplit) {
            return;
        }
        const finalParamsList = paramSets.map(params => {
            const finalParams = { ...defaultParams};
            Object.keys(params).forEach(key => {
                if (params[key as keyof HyperparameterConfig] !== undefined) {
                    finalParams[key as keyof typeof finalParams] = params[key as keyof HyperparameterConfig]!;
                }
            });
            return finalParams;
        });

        const trainingData: TrainModelRequest =  {
            dataset_id: parseInt(datasetId),
            params_list: finalParamsList,
            split_ratios: {
                train: splitRatios.train,
                val: splitRatios.val,
                test: splitRatios.test,
            },
            use_gpu: useGpu 
        };

        onSubmit(trainingData);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Training Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* GPU Setting */}
                <div className="flex items-center space-x-2">
                    <Checkbox 
                    id="use_gpu" 
                    checked={useGpu}
                    onCheckedChange={(checked) => {
                        if (checked !== "indeterminate") {
                            setUseGpu(checked);
                        }
                    }}
                    />
                    <Label htmlFor="use_gpu">Use GPU for training</Label>
                </div>

                <Separator />

                {/* Split Ratios */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dataset Split Ratios</h3>
                    <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="train_ratio">Train Ratio</Label>
                        <Input
                        id="train_ratio"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={splitRatios.train}
                        onChange={(e) => handleSplitRatioChange('train', e.target.value)}
                        className={!isValidSplit ? "border-red-500" : ""}
                        />
                    </div>
                    <div>
                        <Label htmlFor="val_ratio">Validation Ratio</Label>
                        <Input
                        id="val_ratio"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={splitRatios.val}
                        onChange={(e) => handleSplitRatioChange('val', e.target.value)}
                        className={!isValidSplit ? "border-red-500" : ""}
                        />
                    </div>
                    <div>
                        <Label htmlFor="test_ratio">Test Ratio</Label>
                        <Input
                        id="test_ratio"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={splitRatios.test}
                        onChange={(e) => handleSplitRatioChange('test', e.target.value)}
                        className={!isValidSplit ? "border-red-500" : ""}
                        />
                    </div>
                    </div>

                    {/* Split validation feedback */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${isValidSplit ? 'text-green-600' : 'text-red-600'}`}>
                            Sum: {splitSum.toFixed(3)}
                        </span>
                        {!isValidSplit && (
                            <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>Split ratios must sum to 1.0</span>
                            </div>
                        )}
                        {isValidSplit && (
                            <span className="text-green-600">✓ Valid split ratios</span>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Parameter Sets */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Training Parameter Sets</h3>
                    <Button 
                        onClick={addParameterSet}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Parameter Set
                    </Button>
                    </div>
                    <p className="text-sm text-gray-600">Leave fields empty to use default values. Each parameter set will create a separate training job.</p>
                    
                    {paramSets.map((params, setIndex) => (
                    <Card key={setIndex} className="border-dashed">
                        <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Parameter Set {setIndex + 1}</CardTitle>
                            {paramSets.length > 1 && (
                            <Button
                                onClick={() => removeParameterSet(setIndex)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            )}
                        </div>
                        </CardHeader>
                        <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <Label htmlFor={`lr0_${setIndex}`}>Learning Rate (lr0)</Label>
                            <Input
                                id={`lr0_${setIndex}`}
                                type="number"
                                step="0.001"
                                placeholder={`Default: ${defaultParams.lr0}`}
                                value={params.lr0 || ''}
                                onChange={(e) => handleParamChange(setIndex, 'lr0', e.target.value)}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`lrf_${setIndex}`}>Learning Rate Final (lrf)</Label>
                            <Input
                                id={`lrf_${setIndex}`}
                                type="number"
                                step="0.01"
                                placeholder={`Default: ${defaultParams.lrf}`}
                                value={params.lrf || ''}
                                onChange={(e) => handleParamChange(setIndex, 'lrf', e.target.value)}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`epochs_${setIndex}`}>Epochs</Label>
                            <Input
                                id={`epochs_${setIndex}`}
                                type="number"
                                min="1"
                                placeholder={`Default: ${defaultParams.epochs}`}
                                value={params.epochs || ''}
                                onChange={(e) => handleParamChange(setIndex, 'epochs', e.target.value)}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`imgsz_${setIndex}`}>Image Size</Label>
                            <Input
                                id={`imgsz_${setIndex}`}
                                type="number"
                                step="32"
                                min='32'
                                placeholder={`Default: ${defaultParams.imgsz}`}
                                value={params.imgsz || ''}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (isNaN(value)) {
                                        handleParamChange(setIndex, 'imgsz', '');
                                    } else if (value % 32 !== 0) {
                                        toast.error('Image size must be divisible by 32!');
                                        handleParamChange(setIndex, 'imgsz', value.toString())
                                    } else {
                                        handleParamChange(setIndex, 'imgsz', value.toString())
                                    }
                                }}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`weight_decay_${setIndex}`}>Weight Decay</Label>
                            <Input
                                id={`weight_decay_${setIndex}`}
                                type="number"
                                step="0.0001"
                                placeholder={`Default: ${defaultParams.weight_decay}`}
                                value={params.weight_decay || ''}
                                onChange={(e) => handleParamChange(setIndex, 'weight_decay', e.target.value)}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`warmup_epochs_${setIndex}`}>Warmup Epochs</Label>
                            <Input
                                id={`warmup_epochs_${setIndex}`}
                                type="number"
                                step="0.1"
                                placeholder={`Default: ${defaultParams.warmup_epochs}`}
                                value={params.warmup_epochs || ''}
                                onChange={(e) => handleParamChange(setIndex, 'warmup_epochs', e.target.value)}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`warmup_momentum_${setIndex}`}>Warmup Momentum</Label>
                            <Input
                                id={`warmup_momentum_${setIndex}`}
                                type="number"
                                step="0.01"
                                placeholder={`Default: ${defaultParams.warmup_momentum}`}
                                value={params.warmup_momentum || ''}
                                onChange={(e) => handleParamChange(setIndex, 'warmup_momentum', e.target.value)}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`box_${setIndex}`}>Box Loss Weight</Label>
                            <Input
                                id={`box_${setIndex}`}
                                type="number"
                                step="0.1"
                                placeholder={`Default: ${defaultParams.box}`}
                                value={params.box || ''}
                                onChange={(e) => handleParamChange(setIndex, 'box', e.target.value)}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`cls_${setIndex}`}>Class Loss Weight</Label>
                            <Input
                                id={`cls_${setIndex}`}
                                type="number"
                                step="0.1"
                                placeholder={`Default: ${defaultParams.cls}`}
                                value={params.cls || ''}
                                onChange={(e) => handleParamChange(setIndex, 'cls', e.target.value)}
                            />
                            </div>
                            <div>
                            <Label htmlFor={`dfl_${setIndex}`}>Batch Size</Label>
                            <Input
                                id={`batch_${setIndex}`}
                                type="number"
                                step="1"
                                placeholder={`Default: ${defaultParams.batch}`}
                                value={params.batch || ''}
                                onChange={(e) => handleParamChange(setIndex, 'batch', e.target.value)}
                            />
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>

                <div className="flex gap-4 pt-6">
                    <Button onClick={handleSubmit} className="flex-1" disabled={!isValidSplit}>
                    Start Training ({paramSets.length} job{paramSets.length > 1 ? 's' : ''})
                    </Button>
                    <Button onClick={onCancel} variant="outline" className="flex-1">
                    Cancel
                    </Button>
                </div>
                </CardContent>
            </Card>
            </div>
    );
};

export default TrainingForm;