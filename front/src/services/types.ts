export enum TrainingStatus {
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

export type SelectionMetric = 'map50' | 'map50_95' | 'precision' | 'recall'

export enum DatasetStatus {
  RAW = "RAW",  
  AUTO_ANNOTATED = "AUTO_ANNOTATED",
  VALIDATED = "VALIDATED",
  AUGMENTED = "AUGMENTED"
}

export interface Dataset {
  id: number;
  name: string;
  model: string;
  start_date: string;
  end_date: string;
  created_at: string;
  status: DatasetStatus;
  count: number;
}

export interface DatasetResponse {
  id: number;
  name: string;
  model: string;
  start_date: string;
  end_date: string;
  user_ids: number[];
  status: DatasetStatus;
  created_at: string;
  count: number;
}

export interface CreateDatasetRequest {
  model: string;
  start_date: string;
  end_date: string;
  user_ids: number[];
}

export interface ClientResponse {
  id: number;
  full_name: string;
  company_name: string;
}

export interface ImageResponse {
  id: number;
}

export interface ModelResponse {
  id: number;
  name: string;
  model_type: string;
  model_path: string;
  input_size: number;
  class_names: string[];
  device: string;
  is_active: boolean;
  last_used: string;
}

interface SplitRatios {
  train?: number;
  val?: number;
  test?: number;
}
export interface HyperparameterConfig {
  epochs?: number;
  lr0?: number;
  lrf?: number;
  momentum?: number;
  weight_decay?: number;
  warmup_epochs?: number;
  warmup_momentum?: number;
  box?: number;
  cls?: number;
  batch?: number;
  imgsz?: number;
}

export interface TrainingResponse {
  training_instance_id: number;
  task_ids: string[];
  status: string;
  message?: string;
  error?: string;
}

export interface TrainModelRequest {
  dataset_id: number;
  params_list: HyperparameterConfig[];
  split_ratios?: {
    train: number;
    val: number;
    test: number;
  };
  use_gpu: boolean;
}

export interface TrainingTask {
  id: string;
  dataset_id: number;
  status: string;
  params: Record<string, any>;
  results: Record<string, number> | null;
  model_path: string | null;
  queue_position: number | null;
  start_date: string | null;
  end_date: string | null;
  error: string | null;
}

export interface TrainingTaskStatus {
  status: "success" | "error";
  task: {
    id: string;
    dataset_id: number;
    status: string;
    params: HyperparameterConfig;
    start_date: string;
    end_date: string | null;
    error: string | null;
    queue_position: number;
    current_metrics?: {
      epoch?: number;
      "metrics/mAP50(B)"?: number;
      "metrics/mAP50-95(B)"?: number;
      "metrics/precision(B)"?: number;
      "metrics/recall(B)"?: number;
      "train/box_loss"?: number;
      "val/box_loss"?: number;
    };
    metrics_history?: Array<{
      epoch: number;
      "metrics/mAP50(B)"?: number;
      "metrics/mAP50-95(B)"?: number;
      "metrics/precision(B)"?: number;
      "metrics/recall(B)"?: number;
      "train/box_loss"?: number;
      "val/box_loss"?: number;
    }>;
    progress: number;
    current_epoch: number;
    total_epochs: number;
  };
}

export interface TrainingStatusResponse {
  dataset_id: number;
  status: string; 
  start_date: string;
  end_date: string | null;
  progress: number;
  subtasks: Record<string, {
    status: string;
    params: {
      box: number;
      cls: number;
      dfl: number;
      lr0: number;
      lrf: number;
      epochs: number;
      batch: number;
      imgsz: number;
      use_gpu: boolean;
      momentum: number;
      weight_decay: number;
      warmup_epochs: number;
      warmup_momentum: number;
    };
    results: any | null;
    error: string | null;
    queue_position: number;
    progress: number;
    start_date: string;
    end_date: string | null;
  }>;
  best_model: any | null;
  error: string | null;
  message: string | null;
}

export interface InstanceInfo {
  id: number;
  created_at: string;
  dataset_id: number;
  dataset_name: string;
  dataset_group: string;
}


export interface ModelSelectConfig {
  dataset_id: number;
  selection_metric: SelectionMetric;
  instance_id?: number;
}

export interface ModelSelectionResponse {
  status: 'success' | 'error';
  best_model: {
    training_task_id: string;
    test_task_id: string;
    dataset_id: number;
    model_path: string;
    params: HyperparameterConfig;
    score: number;
    metric: SelectionMetric;
    test_metrics: {
      map50: number | null;
      map50_95: number | null;
      precision: number | null;
      recall: number | null;
    };
  }
  error?: string;
  message?: string;
}

export interface BestModelInfo {
  status: 'SUCCESS' | 'NOT_FOUND';
  dataset_id: number;
  best_model_id?: number;
  best_model_task_id?: string;
  model_path?: string;
  score?: number;
  model_info?: any;
  created_at?: string;
}

export interface ListModelsResponse {
  models: PretrainedModelResponse[];
}

export interface PretrainedModelResponse {
  id: number;
  name: string;
  group: string;
  model_type: string;
  model_path: string;
  input_size: number[];
  class_names: string[];
  device: string;
  is_active: boolean;
  last_used: string | null;
  file_exists: boolean;
  file_size: number;
}

export interface DeployedModel {
  id: number;
  dataset_id: number;
  dataset_name: string;
  dataset_group: string;
  model_id: number;
  path: string;
  deployment_date: string;
  score: number;
  status: string;
}

export interface DeployModelResponse {
  status: string;
  message?: string;
  destination_file?: string;
  deployed_model_id?: number;
  error?: string;
}

export interface DatasetAugmentationRequest {
  dataset_id: number;
  transformers: string[];
}

export interface TestModelRequest {
  dataset_id: number;
  useGpu: boolean;
}

export interface TestingResponse {
  test_task_ids: string[];
  status: 'success' | 'error';
  message: string;
}

export interface TestingProgress {
  total_tasks: number;
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
  progress_percentage: number;
}

export interface TestTaskResult {
  test_task_id: string;
  training_task_id: string;
  queue_position: number;
  status: string;
  hyperparameters: Record<string, any> | null;
  model_path: string | null;
  map50: number | null;
  map50_95: number | null;
  precision: number | null;
  recall: number | null;
  created_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface TestingResults {
  dataset_id: number;
  testing_instance_id: number | null;
  testing_instance_created_at: string | null;
  progress: TestingProgress;
  tasks: TestTaskResult[];
  message?: string;
}

export interface TestTaskDetails extends TestTaskResult {
  duration_seconds: number | null;
  metrics: {
    map50: number | null;
    map50_95: number | null;
    precision: number | null;
    recall: number | null;
  };
}